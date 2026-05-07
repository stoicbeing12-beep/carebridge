import { ShieldCheck, Lock, UserCheck, PhoneCall, AlertTriangle } from "lucide-react"

export default function SafetyPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Trust & Safety at CareBridge</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Your safety and the well-being of your loved ones are our highest priorities. Here's how we ensure a secure environment for every family.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {[
            { 
              icon: UserCheck, 
              title: "Vetted Caregivers", 
              desc: "Every caregiver undergoes a multi-step background check, including criminal record verification and employment history reviews." 
            },
            { 
              icon: Lock, 
              title: "Secure Payments", 
              desc: "Payments are held in escrow and only released after the care is delivered. We use bank-grade encryption for all transactions." 
            },
            { 
              icon: ShieldCheck, 
              title: "Insurance Coverage", 
              desc: "Bookings made through CareBridge are covered by our partner insurance policy for added peace of mind." 
            },
            { 
              icon: PhoneCall, 
              title: "24/7 Incident Support", 
              desc: "Our safety team is available around the clock to handle any emergencies or concerns you may have during a shift." 
            }
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-6">
              <div className="p-3 bg-primary-100 rounded-xl text-primary-600 shrink-0">
                <item.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xl mb-2">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm">
          <div className="bg-amber-100 p-4 rounded-full">
            <AlertTriangle className="w-12 h-12 text-amber-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Our Zero-Tolerance Policy</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              CareBridge maintains a strict zero-tolerance policy for any form of harassment, discrimination, or unsafe behavior. We immediately investigate any reported incidents and remove non-compliant users from our platform.
            </p>
            <p className="font-bold text-amber-700">Report an Incident: balubaladithya@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
