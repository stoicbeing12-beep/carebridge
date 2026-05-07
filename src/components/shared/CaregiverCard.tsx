import Link from "next/link"
import { User, MapPin, Star, ShieldCheck, Heart, Award } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type Caregiver } from "@/types"

export function CaregiverCard({ caregiver }: { caregiver: Caregiver }) {
  const ensureArray = (val: any) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return val.split(",").map(s => s.trim()).filter(Boolean);
    return [];
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full bg-slate-100 flex items-center justify-center">
          {caregiver.photo ? (
            <img 
              src={caregiver.photo} 
              alt={caregiver.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-16 h-16 text-slate-300" />
          )}
          {caregiver.verified && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-accent-500" />
              <span className="text-xs font-semibold text-slate-700">Verified</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{caregiver.name}</h3>
            <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
              <MapPin className="w-4 h-4" />
              {caregiver.location}
            </div>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md text-amber-700 font-medium text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            {caregiver.rating} ({caregiver.reviews})
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3 mb-4">
          {ensureArray(caregiver.type).map(t => (
            <Badge key={t} variant="secondary" className="bg-primary-50 text-primary-700 hover:bg-primary-100">
              {t}
            </Badge>
          ))}
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-4 mt-2">
            <div className="text-slate-600">
              <span className="font-semibold text-slate-900">{caregiver.experienceYears} yrs</span> exp
            </div>
            <div className="text-slate-600">
              Starts at <span className="font-semibold text-slate-900">₪{caregiver.hourlyRate}/hr</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button asChild className="w-full">
          <Link href={`/profile/${caregiver.id}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
