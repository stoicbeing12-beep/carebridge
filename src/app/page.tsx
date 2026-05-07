"use client"

import Link from "next/link"
import { Search, Heart, Shield, Clock, Star, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { collection, query, limit, getDocs, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { type Caregiver } from "@/types"
import { CaregiverCard } from "@/components/shared/CaregiverCard"
import { useAuth } from "@/context/AuthContext"

export default function Home() {
  const { user, userData } = useAuth()
  const [featuredCaregivers, setFeaturedCaregivers] = useState<Caregiver[]>([])
  const [liveReviews, setLiveReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Featured Caregivers
        const cgQuery = query(collection(db, "users"), where("role", "==", "caregiver"), limit(3));
        const cgSnap = await getDocs(cgQuery);
        setFeaturedCaregivers(cgSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Caregiver)));

        // Fetch Featured Reviews
        const revQuery = query(collection(db, "reviews"), limit(2));
        const revSnap = await getDocs(revQuery);
        setLiveReviews(revSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 bg-primary-50 -z-10" />
        {/* Subtle decorative shapes */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-primary-100 rounded-full blur-3xl opacity-50 -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-accent-100 rounded-full blur-3xl opacity-50 -z-10" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-primary-100 text-primary-700 text-sm font-medium mb-8 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Over 1,000 verified caregivers available now
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 text-balance leading-tight">
              {userData?.role === "caregiver" 
                ? "Manage Your Caregiving Career with Ease" 
                : "Find Trusted Caregivers Without the Chaos"}
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 text-balance max-w-2xl mx-auto">
              {userData?.role === "caregiver"
                ? "Track your shifts, manage your earnings, and connect with families who need your expertise."
                : "Trust, verification, and instant booking for your family's elder care, post-hospital recovery, and childcare needs."}
            </p>

            {userData?.role === "caregiver" ? (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="h-12 px-8 text-base font-semibold rounded-xl" asChild>
                  <Link href="/caregiver-dashboard">Go to My Dashboard</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold rounded-xl bg-white" asChild>
                  <Link href="/caregiver-dashboard?tab=schedule">View My Schedule</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="bg-white p-2 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto border border-slate-100 mb-8">
                  <div className="flex-1 flex items-center px-4 py-2 border-b sm:border-b-0 sm:border-r border-slate-100">
                    <Search className="w-5 h-5 text-slate-400 mr-2" />
                    <input 
                      type="text" 
                      placeholder="What type of care?" 
                      className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex-1 flex items-center px-4 py-2">
                    <input 
                      type="text" 
                      placeholder="Location (e.g., Tel Aviv)" 
                      className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  <Button size="lg" className="sm:w-auto w-full rounded-xl">
                    Find Care
                  </Button>
                </div>
                
                <div className="flex items-center justify-center gap-4 text-sm font-medium text-slate-500">
                  <Link href="/signup" className="hover:text-primary-600 transition-colors flex items-center gap-1">
                    Looking for work? Become a Caregiver <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How CareBridge Works</h2>
            <p className="text-slate-600">Three simple steps to finding the perfect care for your loved ones, designed to minimize stress during critical times.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-100 -z-10" />

            {[
              {
                icon: Search,
                title: "1. Search & Filter",
                desc: "Tell us what you need. Browse profiles of verified caregivers matching your specific requirements.",
                color: "bg-blue-50 text-blue-600"
              },
              {
                icon: Shield,
                title: "2. Verify & Review",
                desc: "Check background verifications, read family reviews, and review certifications before deciding.",
                color: "bg-green-50 text-green-600"
              },
              {
                icon: Heart,
                title: "3. Book instantly",
                desc: "Select dates, confirm pricing upfront, and secure your caregiver with our safe payment system.",
                color: "bg-primary-50 text-primary-600"
              }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-50/50 ${step.color}`}>
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why CareBridge */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Why families trust CareBridge</h2>
              <p className="text-lg text-slate-600 mb-8">
                We understand that inviting someone into your home to care for a loved one is a huge decision. We've built CareBridge to provide absolute peace of mind.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "Rigorous 5-Step Verification", desc: "Every caregiver undergoes background, identity, and reference checks." },
                  { title: "Transparent Ratings", desc: "Read honest reviews from other families who have hired the caregiver." },
                  { title: "Emergency Backup Support", desc: "If a caregiver cancels, we guarantee a replacement within 4 hours." },
                  { title: "Secure Payments", desc: "Pay safely through the platform with no hidden cash requests." }
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-1 bg-accent-100 rounded-full p-1">
                      <CheckCircle2 className="w-5 h-5 text-accent-600" />
                    </div>
                    <div>
                      <h4 className="text-slate-900 font-semibold">{feature.title}</h4>
                      <p className="text-slate-600 text-sm mt-1">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1600&auto=format&fit=crop" 
                  alt="Caregiver helping an elderly person"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-100">
                <div className="bg-green-100 p-3 rounded-full">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">100%</div>
                  <div className="text-sm font-medium text-slate-500">Verified Staff</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Caregivers */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Featured Caregivers</h2>
              <p className="text-slate-600">Highly rated professionals ready to help.</p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link href="/search">View All Profiles</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCaregivers.map(cg => (
              <CaregiverCard key={cg.id} caregiver={cg} />
            ))}
          </div>
          
          <div className="mt-8 sm:hidden">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/search">View All Profiles</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-primary-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Stories from Families</h2>
            <p className="text-primary-200">Hear from those who found the right care when they needed it most.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {liveReviews.length > 0 ? (
              liveReviews.map(review => (
                <div key={review.id} className="bg-primary-800/50 p-8 rounded-2xl border border-primary-700 backdrop-blur-sm">
                  <div className="flex text-amber-400 mb-4">
                    {[...Array(Math.floor(review.rating || 5))].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                  </div>
                  <p className="text-lg leading-relaxed text-primary-50 mb-6">"{review.text}"</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{review.author}</span>
                    <span className="text-primary-300">{review.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-primary-300">
                {loading ? "Loading stories..." : "No stories yet. Be the first to share your experience!"}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-primary-50 rounded-3xl p-12 text-center max-w-4xl mx-auto border border-primary-100 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to find the right caregiver?</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Browse our network of verified professionals and ensure your loved ones get the care they deserve.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="rounded-xl" asChild>
                <Link href="/search">Find a Caregiver Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl bg-white" asChild>
                <Link href="/support">Talk to an Advisor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
