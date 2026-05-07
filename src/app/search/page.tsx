"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { CaregiverCard } from "@/components/shared/CaregiverCard"
import { Filter, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function SearchPage() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedGenders, setSelectedGenders] = useState<string[]>([])
  const [selectedVisas, setSelectedVisas] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [experience, setExperience] = useState("Any Experience")
  const [caregivers, setCaregivers] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("Recommended")
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  useEffect(() => {
    const fetchCaregivers = async () => {
      // Query users who are caregivers and have completed onboarding
      const q = query(
        collection(db, "users"),
        where("role", "==", "caregiver"),
        where("onboardingComplete", "==", true)
      );
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setCaregivers(list);
    };
    fetchCaregivers();
  }, []);

  const handleCheckboxChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setter(prev => 
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    )
  }

  // Filter and sort logic
  const filteredCaregivers = caregivers.filter(cg => {
    if (selectedTypes.length > 0 && !selectedTypes.some(type => cg.type?.includes(type))) return false
    if (selectedGenders.length > 0 && !selectedGenders.includes(cg.gender)) return false
    if (selectedVisas.length > 0 && !selectedVisas.includes(cg.visaStatus)) return false
    if (selectedLanguages.length > 0 && !selectedLanguages.some(lang => cg.languages?.includes(lang))) return false
    
    if (experience !== "Any Experience") {
      if (experience === "1-3 years" && (cg.experienceYears < 1 || cg.experienceYears > 3)) return false
      if (experience === "3-5 years" && (cg.experienceYears < 3 || cg.experienceYears > 5)) return false
      if (experience === "5+ years" && cg.experienceYears < 5) return false
      if (experience === "10+ years" && cg.experienceYears < 10) return false
    }
    
    return true
  }).sort((a, b) => {
    if (sortBy === "Highest Rated") return b.rating - a.rating
    if (sortBy === "Price: Low to High") return a.hourlyRate - b.hourlyRate
    if (sortBy === "Price: High to Low") return b.hourlyRate - a.hourlyRate
    if (sortBy === "Most Experienced") return b.experienceYears - a.experienceYears
    return 0 // Recommended
  })

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">
                <Filter className="w-5 h-5" />
                Filters
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Care Type</h4>
                  <div className="space-y-2">
                    {["Elder Care", "Post-Hospital", "Childcare", "Special Needs"].map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedTypes.includes(type)}
                          onChange={() => handleCheckboxChange(setSelectedTypes, type)}
                          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" 
                        />
                        <span className="text-sm text-slate-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Availability</h4>
                  <div className="space-y-2">
                    {["Live-in (24/7)", "Day Shift (8-12 hrs)", "Night Shift", "Hourly"].map(avail => (
                      <label key={avail} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                        <span className="text-sm text-slate-700">{avail}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Experience</h4>
                  <select 
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full text-sm rounded-md border border-slate-300 bg-white px-3 py-2"
                  >
                    <option>Any Experience</option>
                    <option>1-3 years</option>
                    <option>3-5 years</option>
                    <option>5+ years</option>
                    <option>10+ years</option>
                  </select>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Gender</h4>
                  <div className="space-y-2">
                    {["Male", "Female"].map(gender => (
                      <label key={gender} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedGenders.includes(gender)}
                          onChange={() => handleCheckboxChange(setSelectedGenders, gender)}
                          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" 
                        />
                        <span className="text-sm text-slate-700">{gender}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Visa Status</h4>
                  <div className="space-y-2">
                    {["Israeli Citizen", "Work Visa", "Permanent Resident", "No Visa"].map(status => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedVisas.includes(status)}
                          onChange={() => handleCheckboxChange(setSelectedVisas, status)}
                          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" 
                        />
                        <span className="text-sm text-slate-700">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Language</h4>
                  <div className="space-y-2">
                    {["Hebrew", "English", "Russian", "Arabic", "French"].map(lang => (
                      <label key={lang} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedLanguages.includes(lang)}
                          onChange={() => handleCheckboxChange(setSelectedLanguages, lang)}
                          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" 
                        />
                        <span className="text-sm text-slate-700">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                className="w-full mt-8"
                onClick={() => {
                  setSelectedTypes([])
                  setSelectedGenders([])
                  setSelectedVisas([])
                  setSelectedLanguages([])
                  setExperience("Any Experience")
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Find Caregivers</h1>
                <p className="text-sm text-slate-500 mt-1">Showing {filteredCaregivers.length} verified professionals</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="md:hidden"
                  onClick={() => setIsMobileFiltersOpen(true)}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm rounded-md border border-slate-300 bg-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option>Recommended</option>
                  <option>Highest Rated</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Most Experienced</option>
                </select>
              </div>
            </div>

            {filteredCaregivers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCaregivers.map(cg => (
                  <CaregiverCard key={cg.id} caregiver={cg} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">No caregivers found</h3>
                <p className="text-slate-500 mt-2">Try adjusting your filters to see more results.</p>
                <Button 
                  variant="outline" 
                  className="mt-6"
                  onClick={() => {
                    setSelectedTypes([])
                    setSelectedGenders([])
                    setSelectedVisas([])
                    setSelectedLanguages([])
                    setExperience("Any Experience")
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
            
            {filteredCaregivers.length > 0 && (
              <div className="mt-12 flex justify-center">
                <Button variant="outline" className="w-full max-w-xs">Load More</Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <div className={cn(
        "fixed inset-0 z-[60] md:hidden transition-transform duration-300 ease-in-out",
        isMobileFiltersOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
        <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filters
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setIsMobileFiltersOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Same filter content as desktop */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Care Type</h4>
              <div className="grid grid-cols-1 gap-3">
                {["Elder Care", "Post-Hospital", "Childcare", "Special Needs"].map(type => (
                  <label key={type} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleCheckboxChange(setSelectedTypes, type)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-5 h-5" 
                    />
                    <span className="text-sm font-medium text-slate-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Experience</h4>
              <select 
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full text-base rounded-xl border border-slate-200 bg-white px-4 py-3 focus:ring-2 focus:ring-primary-500"
              >
                <option>Any Experience</option>
                <option>1-3 years</option>
                <option>3-5 years</option>
                <option>5+ years</option>
                <option>10+ years</option>
              </select>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Gender</h4>
              <div className="flex flex-wrap gap-3">
                {["Male", "Female"].map(gender => (
                  <label key={gender} className={cn(
                    "flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all",
                    selectedGenders.includes(gender) ? "border-primary-600 bg-primary-50 text-primary-700" : "border-slate-100 hover:bg-slate-50 text-slate-600"
                  )}>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={selectedGenders.includes(gender)}
                      onChange={() => handleCheckboxChange(setSelectedGenders, gender)}
                    />
                    <span className="text-sm font-semibold">{gender}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Visa Status</h4>
              <div className="space-y-3">
                {["Israeli Citizen", "Work Visa", "Permanent Resident"].map(status => (
                  <label key={status} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      checked={selectedVisas.includes(status)}
                      onChange={() => handleCheckboxChange(setSelectedVisas, status)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-5 h-5" 
                    />
                    <span className="text-sm font-medium text-slate-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
            <Button 
              className="flex-1 rounded-xl" 
              variant="outline"
              onClick={() => {
                setSelectedTypes([])
                setSelectedGenders([])
                setSelectedVisas([])
                setSelectedLanguages([])
                setExperience("Any Experience")
              }}
            >
              Reset
            </Button>
            <Button 
              className="flex-[2] rounded-xl" 
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              Show {filteredCaregivers.length} results
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
