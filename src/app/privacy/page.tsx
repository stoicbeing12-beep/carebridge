import { Shield } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary-100 rounded-xl text-primary-600">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          </div>
          
          <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
            <p className="text-lg leading-relaxed">
              At CareBridge, your privacy is our top priority. We are committed to protecting the personal information of our families and caregivers.
            </p>
            
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 mt-8">1. Information We Collect</h2>
              <p>We collect information necessary to provide our services, including name, contact details, identification for verification, and care requirements.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">2. How We Use Information</h2>
              <p>Your data is used to match families with caregivers, process secure payments, and maintain the safety and security of our platform.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">3. Data Security</h2>
              <p>We use industry-standard encryption and security protocols to ensure your sensitive information is protected at all times.</p>
            </section>
            
            <p className="pt-8 text-sm italic">Last updated: May 2026</p>
          </div>
        </div>
      </div>
    </div>
  )
}
