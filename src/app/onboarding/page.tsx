"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user, userData, refreshUserData, createInitialProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    gender: "",
    location: "",
    visaStatus: "",
    type: [] as string[],
    experienceYears: "",
    languages: [] as string[],
    hourlyRate: "",
    certifications: "",
    phone: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    // If they have a role already, check if they should be here
    if (userData) {
      if (userData.onboardingComplete) {
        if (userData.role === "family") {
          router.push("/dashboard");
        } else {
          router.push("/caregiver-dashboard");
        }
      }
    }
  }, [user, userData, authLoading, router]);

  const handleRoleSelection = async (role: "family" | "caregiver") => {
    setLoading(true);
    try {
      await createInitialProfile(role);
      if (role === "family") {
        router.push("/dashboard");
      }
      // If caregiver, the userData update will trigger re-render and show step 1
    } catch (error) {
      console.error("Error creating profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const toggleArrayItem = (field: "type" | "languages", value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(i => i !== value)
        : [...prev[field], value]
    }));
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        ...formData,
        experienceYears: Number(formData.experienceYears) || 0,
        hourlyRate: Number(formData.hourlyRate) || 0,
        certifications: formData.certifications.split(",").map(s => s.trim()).filter(Boolean),
        onboardingComplete: true,
        rating: 5.0,
        reviews: 0,
        photo: userData?.photoURL || "https://i.pravatar.cc/150?u=" + user.uid,
        verified: true, // Auto-verify for now
        phone: formData.phone,
      });
      await refreshUserData(user.uid);
      if (userData?.role === "family") {
        router.push("/dashboard");
      } else {
        router.push("/caregiver-dashboard");
      }
    } catch (error) {
      console.error("Error updating profile", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (user && !userData && !loading)) {
    // We only show role selection if loading is false but userData is missing
    if (!authLoading && user && !userData) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
                <CardDescription>To get started, please select your role on CareBridge.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full h-16 text-lg justify-between px-6"
                  variant="outline"
                  onClick={() => handleRoleSelection("family")}
                >
                  Looking for care
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <Button
                  className="w-full h-16 text-lg justify-between px-6"
                  variant="outline"
                  onClick={() => handleRoleSelection("caregiver")}
                >
                  I want to provide care
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Preparing your workspace...</p>
      </div>
    );
  }

  if (!user || !userData) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">

        {/* Progress Bar */}
        <div className="mb-10 px-4 sm:px-0">
          <div className="flex justify-between items-center mb-4 relative">
            {/* Connecting line background */}
            <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-200 -z-0" />

            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center relative z-10">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                  step === i ? "bg-primary-600 text-white ring-4 ring-primary-100" :
                    step > i ? "bg-primary-600 text-white" : "bg-white border-2 border-slate-200 text-slate-400"
                )}>
                  {step > i ? <Check className="w-4 h-4" /> : i}
                </div>
                <span className={cn(
                  "absolute top-10 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider",
                  step === i ? "text-primary-600" : "text-slate-400"
                )}>
                  {i === 1 && "Start"}
                  {i === 2 && userData?.role === "caregiver" && "Details"}
                  {i === 3 && userData?.role === "caregiver" && "Final"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hide Steps 2 & 3 for Family */}
        {(userData?.role === "family" && step > 1) ? null : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {step === 1 && "Basic Information"}
                {step === 2 && "Professional Details"}
                {step === 3 && "Pricing & Verification"}
              </CardTitle>
              <CardDescription>
                {step === 1 && (userData?.role === "family" ? "Provide your contact details so caregivers can reach you." : "Let families know who you are and where you are located.")}
                {step === 2 && "Tell us about your experience and the type of care you provide."}
                {step === 3 && "Set your hourly rate and list your certifications."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                    <Input
                      type="tel"
                      placeholder="e.g., +91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Location (City)</label>
                    <Input
                      placeholder="e.g., Tel Aviv"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  {userData?.role === "caregiver" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Gender</label>
                        <select
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Visa Status</label>
                        <select
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                          value={formData.visaStatus}
                          onChange={(e) => setFormData({ ...formData, visaStatus: e.target.value })}
                        >
                          <option value="">Select Status</option>
                          <option value="Israeli Citizen">Israeli Citizen</option>
                          <option value="Permanent Resident">Permanent Resident</option>
                          <option value="Work Visa">Work Visa</option>
                          <option value="No Visa">No Visa</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Types of Care Provided</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {["Elder Care", "Post-Hospital", "Childcare", "Special Needs", "Dementia Care"].map(t => (
                        <label key={t} className={cn(
                          "flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all",
                          formData.type.includes(t) ? "border-primary-600 bg-primary-50 text-primary-700" : "border-slate-200 hover:bg-slate-50 text-slate-600"
                        )}>
                          <input
                            type="checkbox"
                            checked={formData.type.includes(t)}
                            onChange={() => toggleArrayItem("type", t)}
                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-5 h-5"
                          />
                          <span className="text-sm font-semibold">{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Years of Experience</label>
                    <Input
                      type="number"
                      placeholder="e.g., 5"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Languages Spoken</label>
                    <div className="flex flex-wrap gap-2">
                      {["Hebrew", "English", "Russian", "Arabic", "French"].map(lang => (
                        <Badge
                          key={lang}
                          variant={formData.languages.includes(lang) ? "default" : "outline"}
                          className="cursor-pointer text-sm py-1 px-3"
                          onClick={() => toggleArrayItem("languages", lang)}
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Hourly Rate (₪)</label>
                    <Input
                      type="number"
                      placeholder="e.g., 60"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Certifications & Training</label>
                    <p className="text-xs text-slate-500 mb-2">List your certifications separated by commas.</p>
                    <textarea
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                      placeholder="e.g., Certified Nursing Assistant (CNA), First Aid & CPR"
                      value={formData.certifications}
                      onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="pt-6 flex justify-between border-t border-slate-100">
                {userData?.role === "caregiver" && step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={loading}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                )}

                <div className="ml-auto">
                  {(userData?.role === "family" || (userData?.role === "caregiver" && step === 3)) ? (
                    <Button onClick={handleComplete} disabled={loading} className="gap-2">
                      {loading ? "Saving..." : "Complete Profile"}
                      {!loading && <Check className="w-4 h-4" />}
                    </Button>
                  ) : (
                    <Button onClick={() => setStep(step + 1)} className="gap-2">
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
