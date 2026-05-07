"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, MessageCircle, AlertTriangle, FileText, Settings, CreditCard, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [careLogs, setCareLogs] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const { user, userData, loading } = useAuth()
  const router = useRouter()

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
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCareLogs(list);
      } catch (err) {
        console.error("Error fetching care logs:", err);
      }
    };
    if (user) fetchCareLogs();
  }, [user]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "bookings"), 
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBookings(list);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };
    if (user) fetchBookings();
  }, [user]);

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
              <p className="text-sm text-red-600 mb-4">Caregiver canceled or didn't show up? Request an immediate replacement.</p>
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
                          <Button variant="outline" size="sm" className="gap-2">
                            <MessageCircle className="w-4 h-4" /> Message
                          </Button>
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
    </div>
  )
}
