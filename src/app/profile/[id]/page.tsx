"use client"

import Link from "next/link"
import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { MapPin, Star, ShieldCheck, CheckCircle2, Calendar, Clock, Award, MessageCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Caregiver } from "@/types";
import { caregivers as mockCaregivers, reviews as mockReviews } from "@/lib/data";
import { useAuth } from "@/context/AuthContext";

interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  text: string;
}

export default function CaregiverProfile({ params }: { params: Promise<{ id: string }> }) {
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDemoMode } = useAuth();

  useEffect(() => {
    const fetchCaregiverAndReviews = async () => {
      const { id } = await params;
<<<<<<< HEAD

      // Fetch Caregiver
      const docRef = doc(db, "users", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setCaregiver({ ...(snap.data() as Caregiver), id: snap.id });
      }

      // Fetch Reviews
      const reviewsQuery = query(collection(db, "reviews"), where("caregiverId", "==", id));
      const reviewsSnap = await getDocs(reviewsQuery);
      const reviewsList = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(Array.isArray(reviewsList) ? reviewsList : []);

      setLoading(false);
=======
      let fetchedCaregiver: Caregiver | null = null;
      let fetchedReviews: Review[] = [];
      
      try {
        if (isDemoMode) {
          throw new Error("Demo mode active");
        }
        // Fetch Caregiver
        const docRef = doc(db, "users", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          fetchedCaregiver = { id: snap.id, ...snap.data() } as Caregiver;
        } else {
          // If Firestore is running but this specific mock ID is queried (e.g. from homepage)
          const mockCg = mockCaregivers.find(c => c.id === id);
          if (mockCg) {
            fetchedCaregiver = mockCg as unknown as Caregiver;
          }
        }

        // Fetch Reviews
        const reviewsQuery = query(collection(db, "reviews"), where("caregiverId", "==", id));
        const reviewsSnap = await getDocs(reviewsQuery);
        fetchedReviews = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      } catch (err) {
        console.warn("Profile page Firestore query failed, falling back to mock details:", err);
        const mockCg = mockCaregivers.find(c => c.id === id);
        if (mockCg) {
          fetchedCaregiver = mockCg as unknown as Caregiver;
        }
      } finally {
        // Merge with local reviews from localStorage
        try {
          const localBookingsRaw = localStorage.getItem("carebridge_bookings");
          if (localBookingsRaw) {
            const localBookings = JSON.parse(localBookingsRaw);
            const localReviews = localBookings
              .filter((b: any) => b.caregiverId === id && b.status === "completed" && b.rating && b.feedbackText)
              .map((b: any) => ({
                id: `local-rev-${b.id}`,
                caregiverId: b.caregiverId,
                author: "Family Member (Local)",
                date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
                rating: b.rating,
                text: b.feedbackText,
                createdAt: new Date()
              }));
            
            // Add local reviews, avoiding duplicates if any somehow leaked
            for (const lr of localReviews) {
              if (!fetchedReviews.some(r => r.text === lr.text && r.rating === lr.rating)) {
                fetchedReviews.unshift(lr);
              }
            }
          }
        } catch (e) {
          console.warn("Failed to parse local reviews", e);
        }

        const finalReviews = fetchedReviews.length > 0 ? fetchedReviews : mockReviews.slice(0, 2);
        setReviews(finalReviews);

        if (fetchedCaregiver) {
          // Dynamically update stats if we have actual reviews
          if (fetchedReviews.length > 0) {
            const sum = fetchedReviews.reduce((acc, r) => acc + r.rating, 0);
            fetchedCaregiver.rating = Number((sum / fetchedReviews.length).toFixed(1));
            fetchedCaregiver.reviews = fetchedReviews.length;
          }
          setCaregiver(fetchedCaregiver);
        }

        setLoading(false);
      }
>>>>>>> 6186fde8f90523c8470bb9e3f21f5dbf43b97bf8
    };
    fetchCaregiverAndReviews();
  }, [params, isDemoMode]);

  const ensureArray = (val: unknown): string[] => {
    if (Array.isArray(val)) return val as string[];
    if (typeof val === "string") return val.split(",").map(s => s.trim()).filter(Boolean);
    return [];
  };

  if (loading) {
    return <div className="text-center py-20">Loading caregiver...</div>;
  }

  if (!caregiver) {
    notFound();
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="h-32 bg-primary-100 w-full" />
          <div className="px-6 sm:px-10 pb-8 relative">
            <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-16 mb-6">
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-slate-100 flex items-center justify-center shrink-0">
                {caregiver.photo ? (
                  <img
                    src={caregiver.photo}
                    alt={caregiver.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-slate-300" />
                )}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                      {caregiver.name}
                      {caregiver.verified && <ShieldCheck className="w-6 h-6 text-accent-500" />}
                    </h1>
                    <div className="flex items-center gap-4 text-slate-500 mt-2">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {caregiver.location}</span>
                      <span className="flex items-center gap-1 text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {caregiver.rating} ({caregiver.reviews} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" className="shrink-0 gap-2">
                      <MessageCircle className="w-4 h-4" /> Message
                    </Button>
                    <Button size="lg" className="shrink-0" asChild>
                      <Link href={`/book/${caregiver.id}`}>Book Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {ensureArray(caregiver.type).map((t: string) => (
                <Badge key={t} variant="secondary" className="bg-primary-50 text-primary-700">{t}</Badge>
              ))}
            </div>

            <p className="text-slate-600 text-lg leading-relaxed">
              {caregiver.bio}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-500" /> Skills & Expertise
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                  {ensureArray(caregiver.skills).map((skill: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      {skill}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-500" /> Certifications
                </h2>
                <div className="space-y-4">
                  {ensureArray(caregiver.certifications).map((cert: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <Award className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-900">{cert}</div>
                        <div className="text-sm text-slate-500">Verified by CareBridge</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary-500" /> Reviews ({caregiver.reviews})
              </h2>
              {Array.isArray(reviews) && reviews.map(review => (
                <div key={review.id} className="bg-white p-6 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                        {review.author.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{review.author}</div>
                        <div className="text-sm text-slate-500">{review.date}</div>
                      </div>
                    </div>
                    <div className="flex text-amber-400">
<<<<<<< HEAD
                      {[...Array(Number(review.rating) || 0)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}                    </div>
=======
                      {[...Array(Math.max(0, Math.min(5, Math.floor(Number(review.rating) || 5))))].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
>>>>>>> 6186fde8f90523c8470bb9e3f21f5dbf43b97bf8
                  </div>
                  <p className="text-slate-600">{review.text}</p>
                </div>
              ))}
              <Button variant="outline" className="w-full">Load More Reviews</Button>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="text-center pb-6 border-b border-slate-100 mb-6">
                  <div className="text-3xl font-bold text-slate-900">₪{caregiver.hourlyRate}</div>
                  <div className="text-slate-500">per hour</div>
                </div>

                <div className="space-y-4 mb-6 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> Experience</span>
                    <span className="font-semibold">{caregiver.experienceYears} years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-slate-400" /> Speaks</span>
                    <span className="font-semibold">{ensureArray(caregiver.languages).join(", ")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-slate-400" /> Visa Status</span>
                    <span className="font-semibold">{caregiver.visaStatus}</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
                    <Calendar className="w-4 h-4 text-primary-500" /> Availability
                  </div>
                  {caregiver.availableNow ? (
                    <div className="text-sm text-green-700 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Available to start immediately
                    </div>
                  ) : (
                    <div className="text-sm text-amber-700 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      Available from next week
                    </div>
                  )}
                </div>

                <Button size="lg" className="w-full mb-3" asChild>
                  <Link href={`/book/${caregiver.id}`}>Book Now</Link>
                </Button>
                <p className="text-xs text-center text-slate-500">
                  You won&apos;t be charged yet
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  )
}
