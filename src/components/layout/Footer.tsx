import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white mb-4">
              <img src="/favicon.ico" alt="CareBridge Logo" className="h-6 w-6" />
              <span className="text-xl font-bold tracking-tight">CareBridge</span>
            </Link>
            <p className="text-sm text-slate-400 mb-4">
              Trusted, verified caregivers for your loved ones. Bringing peace of mind to families across Israel.
            </p>
            <div className="text-sm text-slate-400">
              <p>Email: balubaladithya@gmail.com</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search?type=elder-care" className="hover:text-white transition-colors">Elder Care</Link></li>
              <li><Link href="/search?type=post-hospital" className="hover:text-white transition-colors">Post-Hospital Recovery</Link></li>
              <li><Link href="/search?type=childcare" className="hover:text-white transition-colors">Childcare</Link></li>
              <li><Link href="/search?type=special-needs" className="hover:text-white transition-colors">Special Needs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/support" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/safety" className="hover:text-white transition-colors">Trust & Safety</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-800 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} CareBridge Israel. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Made with care in Israel</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
