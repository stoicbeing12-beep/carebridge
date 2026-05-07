"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  User,
  CheckCircle2,
  ClipboardList,
  PlusCircle,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Booking {
  id: string;
  clientName?: string;
  clientId?: string;
  serviceType?: string;
  status: "pending" | "accepted" | "rejected";
  totalAmount?: number;
  hours?: number;
  startDate?: string;
  timeSlot?: string;
  createdAt?: any;
  location?: string;
}

export default function CaregiverDashboardPage() {
  const { user, userData, loading, refreshUserData } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("schedule");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [earnings, setEarnings] = useState({ total: 0, pending: 0, hours: 0 });

  // Fetch bookings for caregiver
  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const q = query(
        collection(db, "bookings"),
        where("caregiverId", "==", user!.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      setBookings(data);
      // Simple earnings calculations
      const total = data.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      const pending = data.filter(b => b.status === "pending").reduce((s, b) => s + (b.totalAmount || 0), 0);
      const hours = data.reduce((h, b) => h + (b.hours || 0), 0);
      setEarnings({ total, pending, hours });
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Update booking status (accept/reject)
  const handleStatusChange = async (bookingId: string, newStatus: Booking["status"]) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, { status: newStatus });
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
      // Refresh to update earnings stats
      fetchBookings();
    } catch (err) {
      console.error("Failed to update booking status", err);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!userData) {
        console.warn("User logged in but profile data missing, sending to onboarding");
        router.push("/onboarding");
      } else if (userData?.role === "family") {
        router.push("/dashboard");
      } else if (userData?.role === "caregiver" && !userData?.onboardingComplete) {
        router.push("/onboarding");
      } else if (userData?.role === "caregiver") {
        fetchBookings();
      }
    }
  }, [user, userData, loading, router]);

  if (loading || (user && !userData)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading your profile...</p>
      </div>
    );
  }

  if (!user || !userData) return null;

  const tabs = [
    { id: "schedule", label: "My Schedule", icon: Calendar },
    { id: "earnings", label: "Earnings", icon: CreditCard },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "profile", label: "Public Profile", icon: User },
    { id: "bookings", label: "Bookings", icon: ClipboardList },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Nav */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xl uppercase">
                  {userData.name?.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h2 className="font-bold text-slate-900 truncate">{userData.name}</h2>
                  <p className="text-sm text-slate-500 truncate capitalize">{userData.role}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id 
                        ? "bg-primary-50 text-primary-600" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-primary-600 rounded-xl p-6 text-white shadow-lg">
              <h3 className="font-bold mb-2">Total Earnings</h3>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold">₪{earnings.total}</span>
                <span className="text-xs text-primary-100">₪5,000 goal</span>
              </div>
              <div className="w-full bg-primary-700 rounded-full h-1.5 mb-4">
                <div className="bg-white rounded-full h-full" style={{ width: `${Math.min((earnings.total / 5000) * 100, 100)}%` }} />
              </div>
              <p className="text-xs text-primary-100">
                {earnings.total >= 5000 ? "Goal reached!" : `₪${5000 - earnings.total} more to hit your goal!`}
              </p>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            
            {activeTab === "schedule" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-slate-900">Today's Shifts</h1>
                  <Button variant="outline" size="sm" className="gap-2">
                    <PlusCircle className="w-4 h-4" /> Add Availability
                  </Button>
                </div>

                {bookingsLoading ? (
                  <p className="text-slate-500">Loading schedule...</p>
                ) : bookings.filter(b => b.status === "accepted").length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="font-bold text-slate-900">No scheduled shifts</h3>
                      <p className="text-slate-500 max-w-xs mx-auto mt-2">
                        You don't have any accepted bookings scheduled yet. Check your "Bookings" tab to accept new requests.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Active/Next Shift (Taking the first accepted one as example) */}
                    {bookings.filter(b => b.status === "accepted").slice(0, 1).map((job) => (
                      <Card key={job.id} className="border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-slate-500">Upcoming Shift</CardTitle>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">Scheduled</Badge>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-6">
                            <div className="space-y-3">
                              <h3 className="text-xl font-bold text-slate-900">{job.clientName || "Client"} - {job.serviceType || "Care Service"}</h3>
                              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 text-sm text-slate-600">
                                <span className="flex items-center gap-2 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                                  <Clock className="w-4 h-4 text-primary-500" /> {job.timeSlot || "TBD"}
                                </span>
                                <span className="flex items-center gap-2 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                                  <MapPin className="w-4 h-4 text-primary-500" /> {job.location || "Location TBD"}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button variant="outline" className="flex-1 gap-2 h-11 rounded-xl">
                                <MessageSquare className="w-4 h-4" /> Message
                              </Button>
                              <Button className="flex-1 bg-green-600 hover:bg-green-700 gap-2 h-11 rounded-xl">
                                <CheckCircle2 className="w-4 h-4" /> Start Shift
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <h2 className="text-lg font-bold text-slate-900 pt-4">Other Scheduled Shifts</h2>
                    <div className="space-y-4">
                      {bookings.filter(b => b.status === "accepted").slice(1).map((job) => (
                        <div key={job.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                              {(job.clientName || "C").charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{job.clientName || "Client"} - {job.serviceType || "Care Service"}</p>
                              <p className="text-sm text-slate-500">{job.startDate || "Date TBD"} • {job.timeSlot || "Time TBD"}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-primary-600 font-medium">Details</Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

          {activeTab === "bookings" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Booking Requests</h1>
                <Badge variant="outline">{bookings.filter(b => b.status === "pending").length} New</Badge>
              </div>

              {bookingsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
              ) : bookings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-slate-500">
                    <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No booking requests found.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {bookings.map((b) => (
                    <Card key={b.id} className={b.status === "pending" ? "border-primary-100 bg-primary-50/10" : ""}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 shrink-0">
                              {(b.clientName || "C").charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-slate-900">{b.clientName || "Unknown Client"}</h3>
                                <Badge variant={b.status === "accepted" ? "success" : b.status === "pending" ? "outline" : "secondary"} className="capitalize">
                                  {b.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 font-medium">{b.serviceType || "Care Service"}</p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {b.startDate || "Date TBD"}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {b.timeSlot || "Time TBD"}</span>
                                <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> ₪{b.totalAmount || 0}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-row md:flex-col justify-end gap-2">
                            {b.status === "pending" && (
                              <>
                                <Button size="sm" className="bg-primary-600 hover:bg-primary-700" onClick={() => handleStatusChange(b.id, "accepted")}>
                                  Accept Request
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100" onClick={() => handleStatusChange(b.id, "rejected")}>
                                  Decline
                                </Button>
                              </>
                            )}
                            {b.status === "accepted" && (
                              <Button variant="outline" size="sm">View Details</Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
            {activeTab === "earnings" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <h1 className="text-2xl font-bold text-slate-900">Earnings & Payments</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-500">Total Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900">₪{earnings.total}</div>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Life-time total
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-500">Pending Payout</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary-600">₪{earnings.pending}</div>
                      <p className="text-xs text-slate-500 mt-1">Pending approval</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-500">Total Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900">{earnings.hours} hrs</div>
                      <p className="text-xs text-slate-500 mt-1">Logged across all shifts</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Bookings & Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y divide-slate-100">
                      {bookings.length === 0 ? (
                        <p className="text-slate-500 py-4">No transaction history found.</p>
                      ) : (
                        bookings.slice(0, 5).map((b, i) => (
                          <div key={i} className="py-4 flex justify-between items-center">
                            <div>
                              <p className="font-medium text-slate-900">{b.clientName || "Client"} - {b.serviceType || "Booking"}</p>
                              <p className="text-sm text-slate-500">{b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000).toLocaleDateString() : "Date unknown"}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-900">₪{b.totalAmount || 0}</p>
                              <p className={`text-xs capitalize ${b.status === "accepted" ? "text-green-600" : b.status === "pending" ? "text-amber-600" : "text-slate-400"}`}>
                                {b.status}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-slate-900">Edit Professional Profile</h1>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Profile Active
                  </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Avatar & Basic Status */}
                  <Card className="lg:col-span-1">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-3xl overflow-hidden border-2 border-slate-100">
                          {userData.photoURL ? (
                            <img src={userData.photoURL} alt={userData.name} className="w-full h-full object-cover" />
                          ) : (
                            userData.name?.charAt(0)
                          )}
                        </div>
                        <h3 className="font-bold text-lg text-slate-900">{userData.name}</h3>
                        <p className="text-sm text-slate-500 mb-2">{userData.email}</p>
                        {userData.phone && <p className="text-sm text-primary-600 font-medium mb-4">{userData.phone}</p>}
                        
                        <div className="space-y-3">
                          <Button className="w-full" variant="outline">Change Photo</Button>
                          <Button className="w-full text-primary-600" variant="ghost">Preview Public Profile</Button>
                        </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-slate-100">
                        <h4 className="text-sm font-semibold text-slate-900 mb-4">Account Status</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Member since</span>
                            <span className="text-slate-900 font-medium">
                              {userData.createdAt?.seconds 
                                ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Verification</span>
                            <span className={userData.verified ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
                              {userData.verified ? "Verified" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right Column: Edit Form */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Professional Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const updates = {
                          location: formData.get("location") as string,
                          hourlyRate: Number(formData.get("hourlyRate")),
                          experienceYears: Number(formData.get("experienceYears")),
                          certifications: (formData.get("certifications") as string).split(",").map(s => s.trim()).filter(Boolean),
                          phone: formData.get("phone") as string,
                          visaStatus: formData.get("visaStatus") as string,
                          verified: true, // Auto-verify on save for existing accounts
                        };
                        
                        try {
                          const { doc, updateDoc } = await import("firebase/firestore");
                          const { db } = await import("@/lib/firebase");
                          const userRef = doc(db, "users", user!.uid);
                          await updateDoc(userRef, updates);
                          await refreshUserData();
                          alert("Profile updated successfully!");
                        } catch (err) {
                          console.error(err);
                          alert("Failed to update profile.");
                        }
                      }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Location</label>
                            <input 
                              name="location"
                              defaultValue={(userData as any).location}
                              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Phone Number</label>
                            <input 
                              name="phone"
                              type="tel"
                              defaultValue={(userData as any).phone}
                              placeholder="+91 98765 43210"
                              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Hourly Rate (₪)</label>
                            <input 
                              name="hourlyRate"
                              type="number"
                              defaultValue={(userData as any).hourlyRate}
                              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Visa Status</label>
                            <select 
                              name="visaStatus"
                              defaultValue={(userData as any).visaStatus}
                              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500 bg-white"
                            >
                              <option value="Israeli Citizen">Israeli Citizen</option>
                              <option value="Permanent Resident">Permanent Resident</option>
                              <option value="Work Visa">Work Visa</option>
                              <option value="No Visa">No Visa</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Years of Experience</label>
                          <input 
                            name="experienceYears"
                            type="number"
                            defaultValue={(userData as any).experienceYears}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500" 
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Certifications & Experience Summary</label>
                          <textarea 
                            name="certifications"
                            rows={4}
                            defaultValue={(userData as any).certifications}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500" 
                          />
                        </div>

                        <div className="pt-4 flex justify-end">
                          <Button type="submit" className="px-8">Save Changes</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
