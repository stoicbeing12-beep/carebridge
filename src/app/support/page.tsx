"use client"

import { Phone, Mail, MessageSquare, Plus, Minus, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

const faqs = [
  {
    q: "How are CareBridge caregivers verified?",
    a: "Every caregiver undergoes a rigorous 5-step background check which includes identity verification, criminal background check, reference checks from previous employers, certification validation, and an in-person interview."
  },
  {
    q: "What if the caregiver cancels or doesn't show up?",
    a: "We guarantee a replacement caregiver within 4 hours. You can request emergency backup care directly from your dashboard."
  },
  {
    q: "How are payments handled?",
    a: "All payments are processed securely through the CareBridge platform. You will never be asked to pay cash directly to the caregiver. The payment is held in escrow and released to the caregiver based on their logged hours."
  },
  {
    q: "Can I interview the caregiver before booking?",
    a: "Yes! You can request a free 15-minute introductory video call with any caregiver before confirming a booking."
  }
]

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How can we help you?</h1>
          <p className="text-slate-600 text-lg">Our support team is available 24/7 to assist you.</p>
        </div>

        {/* Emergency Banner */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-full shrink-0">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900">Urgent Assistance Needed?</h3>
              <p className="text-red-700 mt-1">For medical emergencies, please call ambulance services immediately (Dial 101 or 112).</p>
            </div>
          </div>
          <Button variant="outline" className="bg-white border-red-200 text-red-700 hover:bg-red-50 shrink-0">
            Emergency Support
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Methods */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Us</h2>
            
            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary-500 shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900">Call Us</h3>
                  <p className="text-slate-500 mb-2">Available 24/7 for urgent queries</p>
                  <p className="text-primary-600 font-semibold">1800-123-4567</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary-500 shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900">Email Support</h3>
                  <p className="text-slate-500 mb-2">We typically reply within 2 hours</p>
                  <p className="text-primary-600 font-semibold text-lg">balubaladithya@gmail.com</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card className="mt-8 border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">Send a Message</h3>
                <form className="space-y-4">
                  <Input placeholder="Your Name" />
                  <Input type="email" placeholder="Email Address" />
                  <textarea 
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px]"
                    placeholder="How can we help you?"
                  />
                  <Button className="w-full">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* FAQs */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-semibold text-slate-900">{faq.q}</span>
                    {openFaq === index ? (
                      <Minus className="w-5 h-5 text-primary-500 shrink-0 ml-4" />
                    ) : (
                      <Plus className="w-5 h-5 text-slate-400 shrink-0 ml-4" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4 pt-0">
                      <p className="text-slate-600">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 bg-primary-50 rounded-xl p-6 text-center border border-primary-100">
              <h3 className="font-bold text-slate-900 mb-2">Still have questions?</h3>
              <p className="text-slate-600 mb-4">Can't find the answer you're looking for? Please chat to our friendly team.</p>
              <Button variant="outline" className="bg-white">Chat with us</Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
