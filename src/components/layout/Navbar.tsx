"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, LogOut, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, userData, logOut } = useAuth()

  const handleLogout = async () => {
    try {
      await logOut()
      router.push("/")
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  const navLinks = [
    // 1. Dashboard (Primary for logged in users)
    ...(user ? [
      { 
        name: "Dashboard", 
        id: "nav-dashboard",
        href: userData?.role === "caregiver" ? "/caregiver-dashboard" : "/dashboard" 
      }
    ] : []),
    // 2. Find Caregivers (Primary for guests/families, hidden for caregivers)
    ...(user && userData?.role === "caregiver" ? [] : [
      { name: "Find Caregivers", id: "nav-find-care", href: "/search" }
    ]),
    { name: "About Us", id: "nav-about", href: "/about" },
    { name: "Support", id: "nav-support", href: "/support" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-primary-600">
              <img src="/favicon.ico" alt="CareBridge Logo" className="h-6 w-6" />
              <span className="text-xl font-bold tracking-tight text-slate-900">
                CareBridge
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary-600",
                    pathname === link.href ? "text-primary-600" : "text-slate-600"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <UserIcon className="w-4 h-4" />
                    {user.displayName || "User"}
                  </div>
                  <Button variant="ghost" onClick={handleLogout} className="gap-2 text-slate-600">
                    <LogOut className="w-4 h-4" /> Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-slate-900"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={cn(
        "md:hidden fixed inset-x-0 top-[65px] bg-white border-b border-slate-200 transition-all duration-300 ease-in-out z-40 overflow-hidden",
        isMobileMenuOpen ? "max-h-[calc(100vh-65px)] opacity-100 py-6" : "max-h-0 opacity-0 py-0"
      )}>
        <div className="container mx-auto px-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "block text-lg font-medium py-2 transition-colors",
                pathname === link.href ? "text-primary-600" : "text-slate-600 hover:text-slate-900"
              )}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
            {user ? (
              <>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-700 px-1 mb-2">
                  <UserIcon className="w-5 h-5 text-primary-500" />
                  {user.displayName || "My Profile"}
                </div>
                <Button variant="outline" onClick={handleLogout} className="w-full justify-center gap-2 h-12 rounded-xl">
                  <LogOut className="w-4 h-4" /> Log out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild className="w-full justify-center h-12 rounded-xl">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild className="w-full justify-center h-12 rounded-xl shadow-md">
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  )
}
