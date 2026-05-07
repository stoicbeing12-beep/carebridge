import { FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
          </div>
          
          <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
            <p className="text-lg leading-relaxed">
              Welcome to CareBridge. By using our platform, you agree to these terms. Please read them carefully.
            </p>
            
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 mt-8">1. Platform Service</h2>
              <p>CareBridge provides a marketplace to connect families with independent caregivers. We facilitate the matching and payment process but are not a care agency.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">2. Caregiver Verification</h2>
              <p>While we perform rigorous background checks, families are encouraged to interview and perform their own due diligence before hiring a caregiver.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">3. Payments & Escrow</h2>
              <p>All payments must be made through the CareBridge platform. Direct payments outside the platform are a violation of our terms and void all safety guarantees.</p>
            </section>
            
            <p className="pt-8 text-sm italic">Last updated: May 2026</p>
          </div>
        </div>
      </div>
    </div>
  )
}
