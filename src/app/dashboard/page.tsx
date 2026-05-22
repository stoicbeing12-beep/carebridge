"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, MessageCircle, AlertTriangle, FileText, Settings, CreditCard, ShieldAlert, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import { collection, query, where, getDocs, orderBy, doc, updateDoc, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Booking {
  id: string;
  caregiverId?: string;
  caregiverName?: string;
  userId?: string;
  clientName?: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  totalAmount?: number;
  hours?: number;
  startDate?: string;
  timeSlot?: string;
  serviceType?: string;
  declineReason?: string;
  rating?: number;
  feedbackText?: string;
}

interface CareLog {
  id: string;
  caregiverName?: string;
  submittedAt?: string;
  vitals?: string;
  meals?: string;
  activities?: string;
  notes?: string;
  createdAt?: unknown;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [careLogs, setCareLogs] = useState<CareLog[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  // Preserved state variables for editing and feedback modals
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editStartDate, setEditStartDate] = useState("");
  const [editTimeSlot, setEditTimeSlot] = useState("08:00 AM - 08:00 PM");
  const [feedbackBooking, setFeedbackBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!userData) {
        router.push("/onboarding");
      } else if (userData?.role === "caregiver") {
        router.push("/caregiver-dashboard");
      }
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    const fetchCareLogs = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "careLogs"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CareLog));
        setCareLogs(list);
      } catch (err) {
        console.error("Error fetching care logs:", err);
      }
    };
    if (user) fetchCareLogs();
  }, [user]);

  // Fetch bookings with content-based deduplication
  const fetchBookings = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "bookings"), 
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      
      // Also combine with any local bookings from localStorage
      const localBookingsRaw = localStorage.getItem("carebridge_bookings");
      const localBookings = localBookingsRaw ? JSON.parse(localBookingsRaw) : [];
      const filteredLocal = localBookings.filter((b: Booking) => b.userId === user.uid);
      
      // Deduplicate local bookings that are already in Firestore by matching attributes
      const filteredLocalNoDuplicates = filteredLocal.filter((lb: Booking) => {
        const isInFirestore = list.some((db: Booking) => 
          db.caregiverId === lb.caregiverId &&
          db.userId === lb.userId &&
          db.startDate === lb.startDate &&
          db.timeSlot === lb.timeSlot
        );
        return !isInFirestore;
      });

      const combined = [...filteredLocalNoDuplicates, ...list];
      const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      setBookings(unique);
    } catch (err) {
      console.warn("Family dashboard: fetchBookings failed or empty:", err);
      // Clean slate - load local storage only
      const localBookingsRaw = localStorage.getItem("carebridge_bookings");
      const localBookings = localBookingsRaw ? JSON.parse(localBookingsRaw) : [];
      const filteredLocal = localBookings.filter((b: Booking) => b.userId === user.uid);
      setBookings(filteredLocal);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchBookings();
    }
  }, [user, fetchBookings]);

  // Reactive dashboard state sync via storage event listener
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "carebridge_bookings") {
        fetchBookings();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchBookings]);

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    // Prevent double booking for the same timing
    const hasCollision = bookings.some((b: Booking) => 
      b.id !== editingBooking.id &&
      b.caregiverId === editingBooking.caregiverId &&
      b.startDate === editStartDate &&
      b.timeSlot === editTimeSlot &&
      (b.status === "accepted" || b.status === "pending")
    );

    if (hasCollision) {
      alert("This caregiver is already scheduled for this timing. Please choose a different date or time slot.");
      return;
    }

    try {
      const localBookingsRaw = localStorage.getItem("carebridge_bookings");
      if (localBookingsRaw) {
        const localBookings = JSON.parse(localBookingsRaw);
        const updatedLocal = localBookings.map((b: Booking) => 
          b.id === editingBooking.id 
            ? { ...b, startDate: editStartDate, timeSlot: editTimeSlot } 
            : b
        );
        localStorage.setItem("carebridge_bookings", JSON.stringify(updatedLocal));
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err) {
      console.warn("localStorage schedule update failed:", err);
    }

    try {
      if (editingBooking.id.startsWith("b-local-")) {
        setBookings(prev => 
          prev.map(b => 
            b.id === editingBooking.id 
              ? { ...b, startDate: editStartDate, timeSlot: editTimeSlot } 
              : b
          )
        );
        setEditingBooking(null);
        return;
      }

      const bookingRef = doc(db, "bookings", editingBooking.id);
      await updateDoc(bookingRef, {
        startDate: editStartDate,
        timeSlot: editTimeSlot
      });

      setBookings(prev => 
        prev.map(b => 
          b.id === editingBooking.id 
            ? { ...b, startDate: editStartDate, timeSlot: editTimeSlot } 
            : b
        )
      );
      setEditingBooking(null);
      fetchBookings();
    } catch (err) {
      console.error("Failed to update booking date/time:", err);
      setBookings(prev => 
        prev.map(b => 
          b.id === editingBooking.id 
            ? { ...b, startDate: editStartDate, timeSlot: editTimeSlot } 
            : b
        )
      );
      setEditingBooking(null);
    }
  };

  const handleCompleteAndSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackBooking || !user || !userData) return;
    setFeedbackLoading(true);

    try {
      const localBookingsRaw = localStorage.getItem("carebridge_bookings");
      if (localBookingsRaw) {
        const localBookings = JSON.parse(localBookingsRaw);
        const updatedLocal = localBookings.map((b: Booking) => 
          b.id === feedbackBooking.id 
            ? { ...b, status: "completed", rating, feedbackText } 
            : b
        );
        localStorage.setItem("carebridge_bookings", JSON.stringify(updatedLocal));
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err) {
      console.warn("localStorage complete & feedback update failed:", err);
    }

    try {
      const reviewPayload = {
        caregiverId: feedbackBooking.caregiverId,
        author: user.displayName || userData.name || "Family Member",
        date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        rating: rating,
        text: feedbackText,
        createdAt: new Date()
      };

      if (!feedbackBooking.id.startsWith("b-local-")) {
        await addDoc(collection(db, "reviews"), reviewPayload);
        
        const bookingRef = doc(db, "bookings", feedbackBooking.id);
        await updateDoc(bookingRef, {
          status: "completed",
          rating: rating,
          feedbackText: feedbackText
        });
      }

      setBookings(prev => 
        prev.map(b => 
          b.id === feedbackBooking.id 
            ? { ...b, status: "completed", rating, feedbackText } 
            : b
        )
      );
      
      setFeedbackBooking(null);
      setRating(5);
      setFeedbackText("");
      fetchBookings();
    } catch (err) {
      console.error("Failed to complete booking and submit feedback:", err);
      setBookings(prev => 
        prev.map(b => 
          b.id === feedbackBooking.id 
            ? { ...b, status: "completed", rating, feedbackText } 
            : b
        )
      );
      setFeedbackBooking(null);
      setRating(5);
      setFeedbackText("");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === "accepted" || b.status === "pending");
  const pastBookings = bookings.filter(b => b.status === "completed" || b.status === "rejected");

  if (loading || (user && !userData)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading your profile...</p>
      </div>
    );
  }

  if (!user || !userData) return null;

  if (userData.role !== "family") {
    return null; // Will redirect
  }

  const tabs = [
    { id: "upcoming", label: "Upcoming Care" },
    { id: "past", label: "Past Care" },
    { id: "logs", label: "Care Logs" },
    { id: "messages", label: "Messages" },
  ]

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xl uppercase">
                  {user?.displayName ? user.displayName.charAt(0) : user?.email?.charAt(0) || "U"}
                </div>
                <div className="overflow-hidden">
                  <h2 className="font-bold text-slate-900 truncate">{userData.name}</h2>
                  <p className="text-sm text-slate-500 truncate">{userData.email}</p>
                  {userData.phone && <p className="text-sm text-primary-600 font-medium truncate mt-1">{userData.phone}</p>}
                </div>
              </div>
              
              <nav className="space-y-1">
                <Button variant="ghost" className="w-full justify-start text-primary-600 bg-primary-50">
                  <Calendar className="w-4 h-4 mr-2" /> Bookings
                </Button>
                <Button variant="ghost" className="w-full justify-start text-slate-600">
                  <CreditCard className="w-4 h-4 mr-2" /> Payments
                </Button>
                <Button variant="ghost" className="w-full justify-start text-slate-600">
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </Button>
              </nav>
            </div>

            <div className="bg-red-50 rounded-xl border border-red-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-red-700 mb-2">
                <ShieldAlert className="w-5 h-5" /> Emergency
              </div>
              <p className="text-sm text-red-600 mb-4">Caregiver canceled or didn&apos;t show up? Request an immediate replacement.</p>
              <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800 bg-white">
                Request Backup Care
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Care Dashboard</h1>
            
            <div className="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex min-w-full">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors flex-1 text-center ${
                      activeTab === tab.id 
                        ? "border-primary-600 text-primary-600" 
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "upcoming" && (
              <div className="space-y-4">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map((b) => (
                    <Card key={b.id} className={b.status === "accepted" ? "border-primary-200 shadow-md relative overflow-hidden" : ""}>
                      {b.status === "accepted" && <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />}
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xl uppercase shrink-0">
                              {b.caregiverName?.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={b.status === "accepted" ? "bg-primary-100 text-primary-700" : "bg-slate-100 text-slate-700"}>
                                  {b.status === "accepted" ? "Active Today" : "Pending Approval"}
                                </Badge>
                                <span className="text-xs font-medium text-slate-500">{b.serviceType}</span>
                              </div>
                              <h3 className="text-xl font-bold text-slate-900">{b.caregiverName}</h3>
                            </div>
                          </div>
                          <div className="w-full sm:w-auto bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-slate-100 sm:border-none">
                            <div className="font-bold text-slate-900 text-sm sm:text-base">{b.startDate} • {b.timeSlot}</div>
                            <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5" /> Home (Verified)
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">
                                {b.status === "accepted" ? "Scheduled" : "Awaiting Confirmation"}
                              </div>
                              <div className="text-sm text-slate-500">
                                {b.status === "accepted" ? "Starts soon" : "Caregiver will respond within 4h"}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                              <MessageCircle className="w-4 h-4" /> Message
                            </Button>
                            {b.status === "pending" && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-amber-200 text-amber-700 hover:bg-amber-50"
                                onClick={() => {
                                  setEditingBooking(b);
                                  setEditStartDate(b.startDate || "");
                                  setEditTimeSlot(b.timeSlot || "08:00 AM - 08:00 PM");
                                }}
                              >
                                Edit Schedule
                              </Button>
                            )}
                            {b.status === "accepted" && (
                              <Button 
                                size="sm" 
                                className="bg-primary-600 hover:bg-primary-700 text-white"
                                onClick={() => {
                                  setFeedbackBooking(b);
                                }}
                              >
                                Complete & Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-500">No upcoming care scheduled.</p>
                    <Button variant="link" asChild>
                      <Link href="/search">Find a caregiver</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "logs" && (
              <div className="space-y-4">
                {careLogs.length > 0 ? (
                  careLogs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-primary-500" /> Daily Report
                            </h3>
                            <p className="text-sm text-slate-500">Submitted by {log.caregiverName} • {log.submittedAt}</p>
                          </div>
                        </div>
                        <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <p><span className="font-semibold">Vitals:</span> {log.vitals}</p>
                          <p><span className="font-semibold">Meals:</span> {log.meals}</p>
                          <p><span className="font-semibold">Activities:</span> {log.activities}</p>
                          <p><span className="font-semibold">Notes:</span> {log.notes}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <p>No care logs found.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "messages" && (
              <Card>
                <CardContent className="p-0 h-[400px] flex items-center justify-center flex-col text-slate-500">
                  <MessageCircle className="w-12 h-12 text-slate-300 mb-4" />
                  <p>Select a conversation to start messaging</p>
                </CardContent>
              </Card>
            )}

            {activeTab === "past" && (
              <div className="space-y-4">
                {pastBookings.length > 0 ? (
                  pastBookings.map((b) => (
                    <Card key={b.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-bold text-xl uppercase shrink-0">
                              {b.caregiverName?.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">{b.caregiverName}</h3>
                              <p className="text-sm text-slate-500">{b.serviceType}</p>
                              <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                                <Calendar className="w-4 h-4" /> {b.startDate}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col justify-between items-end">
                            <Badge variant="secondary">{b.status}</Badge>
                            <Button variant="link" asChild className="px-0">
                              <Link href={`/profile/${b.caregiverId}`}>Rebook</Link>
                            </Button>
                          </div>
                        </div>
                        
                        {b.status === "rejected" && b.declineReason && (
                          <div className="mt-4 p-3 bg-red-50/70 border border-red-100/50 rounded-lg text-sm text-red-700 flex items-start gap-2 animate-in fade-in duration-200">
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold">Reason for declining:</span> {b.declineReason}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <p>No past bookings found.</p>
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Edit Schedule Modal Overlay */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-amber-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" /> Edit Booking Schedule
              </h3>
              <button 
                onClick={() => setEditingBooking(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date</label>
                <input 
                  type="date"
                  required
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Time Slot</label>
                <select
                  value={editTimeSlot}
                  onChange={(e) => setEditTimeSlot(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-white"
                >
                  <option value="08:00 AM - 12:00 PM">Morning (08:00 AM - 12:00 PM)</option>
                  <option value="12:00 PM - 04:00 PM">Afternoon (12:00 PM - 04:00 PM)</option>
                  <option value="04:00 PM - 08:00 PM">Evening (04:00 PM - 08:00 PM)</option>
                  <option value="08:00 AM - 08:00 PM">Full Day (08:00 AM - 08:00 PM)</option>
                </select>
              </div>
              
              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setEditingBooking(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm px-5"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Feedback Modal Overlay */}
      {feedbackBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-primary-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary-500 fill-primary-500" /> Complete Care & Feedback
              </h3>
              <button 
                onClick={() => setFeedbackBooking(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCompleteAndSubmitFeedback} className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Please rate and share your experience with <span className="font-semibold text-slate-800">{feedbackBooking.caregiverName}</span> to complete this booking.
              </p>
              
              <div className="flex flex-col items-center justify-center py-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Rating</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transform hover:scale-110 active:scale-95 transition-all duration-150"
                    >
                      <Star 
                        className={`w-8 h-8 transition-colors ${
                          star <= rating 
                            ? "fill-amber-400 text-amber-400 animate-in zoom-in-75 duration-100" 
                            : "text-slate-300 hover:text-slate-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-700 mt-2">
                  {rating === 5 ? "Excellent!" : rating === 4 ? "Very Good" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Review Comments</label>
                <textarea
                  required
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Describe your care experience in detail..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
                />
              </div>
              
              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setFeedbackBooking(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={feedbackLoading}
                  className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-sm px-5"
                >
                  {feedbackLoading ? "Submitting..." : "Complete Booking"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
