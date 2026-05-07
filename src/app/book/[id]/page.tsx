"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, ChevronLeft, Calendar as CalendarIcon, Clock, ShieldCheck, MapPin } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { doc, getDoc, collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { user, loading: authLoading } = useAuth()

  const [caregiver, setCaregiver] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [bookingDetails, setBookingDetails] = useState({
    startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
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
        setCaregiver({ id: snap.id, ...snap.data() })
      }
    }
    fetchCaregiver()
  }, [id])

  const handleCompleteBooking = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "bookings"), {
        caregiverId: caregiver.id,
        caregiverName: caregiver.name || "Caregiver",
        userId: user.uid,
        clientName: user.displayName || "User",
        status: "pending",
        createdAt: new Date(),
        serviceType: bookingDetails.serviceType,
        totalAmount: (caregiver.hourlyRate || 50) * bookingDetails.hoursPerDay * bookingDetails.days,
        startDate: bookingDetails.startDate,
        timeSlot: bookingDetails.timeSlot
      })
      router.push("/dashboard");
    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setLoading(false);
    }
  }

  const totalSteps = 4

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
            {[1, 2, 3, 4].map(s => (
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
            <span>Summary</span>
            <span>Payment</span>
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
                    <label key={t} className="relative flex cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-primary-200 focus:outline-none">
                      <input type="radio" name="careType" value={t} className="peer sr-only" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 peer-checked:text-primary-700">{t}</span>
                        <span className="mt-1 text-sm text-slate-500">Standard rate applies</span>
                      </div>
                      <div className="absolute inset-0 rounded-xl border-2 border-transparent peer-checked:border-primary-500 pointer-events-none" />
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
                      <input type="date" className="pl-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">End Date (Optional)</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                      <input type="date" className="pl-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Daily Schedule</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {["8 Hours (Day)", "12 Hours", "24 Hours (Live-in)"].map((shift) => (
                      <label key={shift} className="relative flex cursor-pointer rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-primary-200 text-center justify-center">
                        <input type="radio" name="shift" value={shift} className="peer sr-only" />
                        <span className="text-sm font-medium text-slate-900 peer-checked:text-primary-700">{shift}</span>
                        <div className="absolute inset-0 rounded-xl border-2 border-transparent peer-checked:border-primary-500 pointer-events-none" />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Booking Summary</h2>
                
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
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Secure Payment</h2>
                  <p className="text-sm text-slate-500 mt-1">To confirm your booking, a deposit of ₪150 is required.</p>
                </div>
                
                <div className="space-y-3">
                  <label className="relative flex cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-primary-200 focus:outline-none items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" value="upi" className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500" defaultChecked />
                      <span className="font-semibold text-slate-900">UPI (GPay, PhonePe, Paytm)</span>
                    </div>
                    <div className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">POPULAR</div>
                  </label>
                  
                  <label className="relative flex cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-primary-200 focus:outline-none items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" value="card" className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500" />
                      <span className="font-semibold text-slate-900">Credit / Debit Card</span>
                    </div>
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <p>Your payment is held securely in escrow and only released to the caregiver after the service begins.</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Button size="lg" className="w-full sm:w-auto" onClick={handleNext}>
                {step === totalSteps ? "Pay & Confirm Booking" : "Continue"}
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
