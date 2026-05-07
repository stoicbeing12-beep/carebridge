import { Heart, Shield, Users, CheckCircle2 } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-primary-50 py-20 border-b border-primary-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Our Mission</h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            To make reliable, high-quality caregiving simple and accessible for families across Israel, while empowering caregivers with fair wages and respect.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="prose prose-lg prose-slate mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">The CareBridge Story</h2>
            <p className="text-slate-600 mb-6">
              CareBridge was founded by a group of healthcare professionals and families who experienced the immense stress of finding trustworthy care for their aging parents. We realized that the existing process was chaotic, unregulated, and lacked transparency.
            </p>
            <p className="text-slate-600 mb-6">
              We decided to build a platform that prioritizes trust above all else. Every caregiver on CareBridge is not just a profile; they are verified professionals who we would trust with our own families.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-16">Our Core Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Uncompromising Safety</h3>
              <p className="text-slate-600">
                Our 5-step background verification ensures that only the most reliable professionals join our network.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Dignity in Care</h3>
              <p className="text-slate-600">
                We believe in providing compassionate care that respects the independence and dignity of every individual.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Empowering Caregivers</h3>
              <p className="text-slate-600">
                We ensure our caregivers receive fair compensation, continuous training, and the respect they deserve.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
