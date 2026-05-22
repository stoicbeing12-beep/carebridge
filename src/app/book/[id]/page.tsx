"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, ChevronLeft, Calendar as CalendarIcon, ShieldCheck, MapPin } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { type Caregiver } from "@/types"

interface Booking {
  id: string;
  status: "accepted" | "pending" | "completed" | "rejected";
  caregiverName: string;
  caregiverId: string;
  serviceType: string;
  startDate: string;
  timeSlot: string;
  totalAmount: number;
  userId: string;
  createdAt?: { seconds: number; nanoseconds: number } | null | unknown;
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { user, loading: authLoading } = useAuth()

  const [caregiver, setCaregiver] = useState<Caregiver | null>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [bookingDetails, setBookingDetails] = useState({
    startDate: new Date().toISOString().split('T')[0],
    timeSlot: "08:00 AM - 08:00 PM",
    serviceType: "Elder Care",
    hoursPerDay: 12,
    days: 5
  })

  useEffect(() => {
    const fetchCaregiver = async () => {
      const docRef = doc(db, "users", id)
      const snap = await getDoc(docRef)
      if (snap.exists()) {
        const data = snap.data()
        const rest = data ? { ...data } : {}
        delete (rest as Record<string, unknown>).id
        setCaregiver({ id: snap.id, ...rest } as Caregiver)
        setBookingDetails(prev => ({
          ...prev,
          serviceType: data.type?.[0] || "Elder Care"
        }))
      }
    }
    fetchCaregiver()
  }, [id])

  const handleCompleteBooking = async () => {
    if (!user || !caregiver) return;
    setLoading(true);

    // Double booking prevention check
    try {
      // 1. Check local storage first
      const localBookingsRaw = localStorage.getItem("carebridge_bookings");
      const localBookings = localBookingsRaw ? JSON.parse(localBookingsRaw) : [];
      const conflictLocal = localBookings.some((b: Booking) => 
        b.caregiverId === caregiver.id &&
        b.startDate === bookingDetails.startDate &&
        b.timeSlot === bookingDetails.timeSlot &&
        (b.status === "accepted" || b.status === "pending")
      );

      if (conflictLocal) {
        alert(`Sorry, ${caregiver.name} is already booked for ${bookingDetails.startDate} during ${bookingDetails.timeSlot}. Please choose a different date or time slot.`);
        setLoading(false);
        return;
      }

      // 2. Check Firestore bookings
      const q = query(
        collection(db, "bookings"),
        where("caregiverId", "==", caregiver.id),
        where("startDate", "==", bookingDetails.startDate),
        where("timeSlot", "==", bookingDetails.timeSlot)
      );
      const snap = await getDocs(q);
      const conflictFirestore = snap.docs.some(doc => {
        const data = doc.data();
        return data.status === "accepted" || data.status === "pending";
      });

      if (conflictFirestore) {
        alert(`Sorry, ${caregiver.name} is already booked for ${bookingDetails.startDate} during ${bookingDetails.timeSlot}. Please choose a different date or time slot.`);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Conflict check failed, proceeding with booking:", e);
    }
    
    const newBooking = {
      id: "b-local-" + Date.now(),
      caregiverId: caregiver.id,
      caregiverName: caregiver.name || "Caregiver",
      userId: user.uid,
      clientName: user.displayName || "User",
      status: "pending" as const,
      createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
      serviceType: bookingDetails.serviceType,
      totalAmount: (caregiver.hourlyRate || 50) * bookingDetails.hoursPerDay * bookingDetails.days,
      hours: bookingDetails.hoursPerDay * bookingDetails.days,
      startDate: bookingDetails.startDate,
      timeSlot: bookingDetails.timeSlot
    };

    // Save to localStorage for demo persistence
    try {
      const localBookingsRaw = localStorage.getItem("carebridge_bookings");
      const localBookings = localBookingsRaw ? JSON.parse(localBookingsRaw) : [];
      localBookings.unshift(newBooking);
      localStorage.setItem("carebridge_bookings", JSON.stringify(localBookings));
    } catch (e) {
      console.warn("Failed to save booking to local storage:", e);
    }

    try {
      const docRef = await addDoc(collection(db, "bookings"), {
        caregiverId: caregiver.id,
        caregiverName: caregiver.name || "Caregiver",
        userId: user.uid,
        clientName: user.displayName || "User",
        status: "pending",
        createdAt: new Date(),
        serviceType: bookingDetails.serviceType,
        totalAmount: (caregiver.hourlyRate || 50) * bookingDetails.hoursPerDay * bookingDetails.days,
        hours: bookingDetails.hoursPerDay * bookingDetails.days,
        startDate: bookingDetails.startDate,
        timeSlot: bookingDetails.timeSlot
      });
      
      // Update local storage booking ID to match the live Firestore ID
      try {
        const localBookingsRaw = localStorage.getItem("carebridge_bookings");
        if (localBookingsRaw) {
          const localBookings = JSON.parse(localBookingsRaw);
          const updatedLocal = localBookings.map((b: { id: string }) => 
            b.id === newBooking.id ? { ...b, id: docRef.id } : b
          );
          localStorage.setItem("carebridge_bookings", JSON.stringify(updatedLocal));
        }
      } catch (e) {
        console.warn("Failed to sync local booking ID with Firestore:", e);
      }
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Booking error:", error);
      // Even if Firestore fails, redirect since it's saved in local storage
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 3

  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to login, maybe pass a returnUrl in query params later
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading booking details...</div>
  if (!user) return null; // Will redirect

  if (!caregiver) return <div>Loading caregiver...</div>

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
    else handleCompleteBooking()
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
    else router.push(`/profile/${id}`)
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        
        {/* Header & Progress */}
        <div className="mb-8">
          <button 
            onClick={handleBack}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </button>

          <h1 className="text-3xl font-bold text-slate-900 mb-6">Book Caregiver</h1>
          
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full">
              <div 
                className="h-full bg-primary-500 rounded-full transition-all duration-300" 
                style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
              />
            </div>
            {[1, 2, 3].map(s => (
              <div 
                key={s} 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors ${
                  s < step ? "bg-primary-500 text-white" : 
                  s === step ? "bg-white border-2 border-primary-500 text-primary-600" : 
                  "bg-white border-2 border-slate-200 text-slate-400"
                }`}
              >
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs font-medium text-slate-500 mt-2 px-1">
            <span>Details</span>
            <span>Schedule</span>
            <span>Summary & Confirm</span>
          </div>
        </div>

        {/* Steps Content */}
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-8">
            
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-slate-900 mb-4">What type of care do you need?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {caregiver.type?.map((t: string) => (
                    <label 
                      key={t} 
                      className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none transition-all ${
                        bookingDetails.serviceType === t 
                          ? "border-primary-500 bg-primary-50/10 text-primary-700 font-semibold" 
                          : "border-slate-200 bg-white hover:border-primary-200 text-slate-900"
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="careType" 
                        value={t} 
                        className="peer sr-only" 
                        checked={bookingDetails.serviceType === t}
                        onChange={(e) => setBookingDetails(prev => ({ ...prev, serviceType: e.target.value }))}
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{t}</span>
                        <span className="mt-1 text-sm text-slate-500">Standard rate applies</span>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Patient Details</h3>
                  <textarea 
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                    placeholder="Briefly describe the patient's condition and any specific requirements..."
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-slate-900 mb-4">When do you need care?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Start Date</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                      <input 
                        type="date" 
                        className="pl-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                        value={bookingDetails.startDate}
                        onChange={(e) => setBookingDetails(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Days of Care</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        min="1"
                        max="30"
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                        value={bookingDetails.days}
                        onChange={(e) => setBookingDetails(prev => ({ ...prev, days: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Daily Schedule</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: "8 Hours (Day)", hours: 8, slot: "08:00 AM - 04:00 PM" },
                      { label: "12 Hours", hours: 12, slot: "08:00 AM - 08:00 PM" },
                      { label: "24 Hours (Live-in)", hours: 24, slot: "08:00 AM - 08:00 AM" }
                    ].map((shift) => (
                      <label 
                        key={shift.label} 
                        className={`relative flex cursor-pointer rounded-xl border p-3 shadow-sm transition-all text-center justify-center ${
                          bookingDetails.hoursPerDay === shift.hours 
                            ? "border-primary-500 bg-primary-50/10 text-primary-700 font-semibold" 
                            : "border-slate-200 bg-white hover:border-primary-200 text-slate-900"
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="shift" 
                          value={shift.hours} 
                          className="peer sr-only" 
                          checked={bookingDetails.hoursPerDay === shift.hours}
                          onChange={() => setBookingDetails(prev => ({ 
                            ...prev, 
                            hoursPerDay: shift.hours,
                            timeSlot: shift.slot
                          }))}
                        />
                        <span className="text-sm font-medium">{shift.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Booking Summary & Confirm</h2>
                
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                  <div className="flex items-center gap-4 border-b border-slate-200 pb-4 mb-4">
                    <img src={caregiver.photo} alt={caregiver.name} className="w-16 h-16 rounded-full object-cover" />
                    <div>
                      <h3 className="font-bold text-slate-900 flex items-center gap-1">{caregiver.name} <ShieldCheck className="w-4 h-4 text-accent-500" /></h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {caregiver.location}</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Service</span>
                      <span className="font-medium text-slate-900">{bookingDetails.serviceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Schedule</span>
                      <span className="font-medium text-slate-900">{bookingDetails.hoursPerDay} Hours / Day ({bookingDetails.startDate})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Duration</span>
                      <span className="font-medium text-slate-900">{bookingDetails.days} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rate</span>
                      <span className="font-medium text-slate-900">₪{caregiver.hourlyRate} / hr</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-slate-900">Estimated Total</span>
                      <span className="text-primary-600">₪{caregiver.hourlyRate * bookingDetails.hoursPerDay * bookingDetails.days}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 text-right">Includes all taxes and fees</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <p>Your booking is secure and covered by CareBridge Guarantee. Payment terms will be processed directly with the caregiver.</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Button size="lg" className="w-full sm:w-auto" onClick={handleNext} disabled={loading}>
                {loading ? "Processing..." : step === totalSteps ? "Confirm Booking" : "Continue"}
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
