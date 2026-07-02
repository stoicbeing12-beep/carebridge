import { Briefcase, Heart, Award, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CareersPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Join the CareBridge Team</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Help us redefine the future of home care. We&apos;re looking for passionate individuals who want to make a real difference in families&apos; lives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: Heart, title: "Mission Driven", desc: "Every line of code and every caregiver match helps a family in need." },
            { icon: Globe, title: "Flexible First", desc: "We believe in working where you are most productive." },
            { icon: Award, title: "Growth Focused", desc: "We invest in your development and offer clear career paths." }
          ].map((v, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
              <v.icon className="w-10 h-10 text-primary-600 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">{v.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-primary-900 rounded-3xl p-12 text-white text-center shadow-xl">
          <Briefcase className="w-12 h-12 mx-auto mb-6 opacity-50" />
          <h2 className="text-3xl font-bold mb-4">Current Openings</h2>
          <p className="text-primary-100 mb-8 max-w-lg mx-auto">
            We are currently scaling our engineering and care operations teams. Check back soon for specific roles or send your CV to our support email.
          </p>
          <Button size="lg" className="bg-white text-primary-900 hover:bg-primary-50 rounded-xl font-bold">
            View Job Board
          </Button>
        </div>
      </div>
    </div>
  )
}
