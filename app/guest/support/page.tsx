"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ChevronLeft, MessageSquare, Phone, Mail, HelpCircle, ChevronDown, ChevronUp, Send, Home, BedDouble, Calendar, CheckCircle } from "lucide-react"
import { MiniProfileCard } from "@/components/ui/mini-profile-card"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// Navigation items for the guest dashboard
const navItems = [
  {
    title: "Dashboard",
    href: "/guest/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Book Room",
    href: "/guest/book-room",
    icon: <BedDouble className="h-5 w-5" />,
  },
  {
    title: "My Bookings",
    href: "/guest/my-bookings",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Support",
    href: "/guest/support",
    icon: <MessageSquare className="h-5 w-5" />,
  },
]

// Mock FAQ data
const faqs = [
  {
    question: "How do I cancel my booking?",
    answer: "You can cancel your booking by navigating to 'My Bookings', selecting the booking you wish to cancel, and clicking the 'Cancel Booking' button. Please note that cancellation policies vary and may result in fees depending on how close to check-in you cancel."
  },
  {
    question: "What is the check-in and check-out time?",
    answer: "Standard check-in time is 2:00 PM and check-out time is 12:00 PM. Early check-in and late check-out may be available upon request, subject to availability and possible additional charges."
  },
  {
    question: "Is breakfast included in my stay?",
    answer: "Breakfast inclusion depends on the room type and rate you've booked. You can check if breakfast is included in your booking details under 'My Bookings'."
  },
  {
    question: "Do you offer airport transfers?",
    answer: "Yes, we can arrange airport transfers at an additional cost. Please contact our support team at least 24 hours before your arrival to arrange this service."
  },
  {
    question: "Is there free Wi-Fi in the rooms?",
    answer: "Yes, all our rooms come with complimentary high-speed Wi-Fi access."
  },
  {
    question: "Can I request a late check-out?",
    answer: "Late check-out can be requested but is subject to availability. Please contact reception on the day of departure to confirm if this is possible. Additional charges may apply."
  },
  {
    question: "Is there parking available?",
    answer: "Yes, we offer both self-parking and valet parking options. Self-parking is complimentary for guests, while valet parking incurs an additional charge."
  }
]

export default function SupportPage() {
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      // Reset form
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
    }, 1500)
  }

  return (
    <ProtectedRoute requiredRoles={["guest"]}>
      <AppShell navItems={navItems} title="Support">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative px-2 sm:px-4 pb-6"
        >
          {/* Header with gradient background */}
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-blue-600 to-blue-500 rounded-b-3xl -z-10" />
          
          {/* Profile Card - Fixed at top */}
          <div className="sticky top-0 z-10 pt-4 pb-3 bg-transparent">
            <MiniProfileCard className="max-w-md mx-auto md:mx-0 shadow-lg backdrop-blur-sm bg-white/90" />
          </div>
          
          <div className="mt-6 mb-6">
            <div className="flex items-center">
              <Link href="/guest/dashboard" className="text-white mr-2">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold tracking-tight text-white">Support</h1>
            </div>
            <p className="text-blue-100 text-sm">Get help with your bookings and questions</p>
          </div>
          
          <Tabs defaultValue="contact" className="w-full">
            <div className="bg-white rounded-t-2xl shadow-md px-4 pt-4">
              <TabsList className="w-full grid grid-cols-2 h-10 rounded-lg bg-gray-100">
                <TabsTrigger value="contact" className="rounded-md">Contact Us</TabsTrigger>
                <TabsTrigger value="faq" className="rounded-md">FAQs</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="contact" className="bg-white rounded-b-2xl shadow-md px-4 pb-6">
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">Call Us</h3>
                  <p className="text-xs text-gray-600 mb-2">24/7 Customer Support</p>
                  <a href="tel:+919876543210" className="text-blue-600 font-medium text-sm">
                    +91 98765 43210
                  </a>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-4 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">Email Us</h3>
                  <p className="text-xs text-gray-600 mb-2">Get a response within 24h</p>
                  <a href="mailto:support@plotapp.com" className="text-purple-600 font-medium text-sm">
                    support@plotapp.com
                  </a>
                </div>
                
                <div className="bg-green-50 rounded-xl p-4 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">Live Chat</h3>
                  <p className="text-xs text-gray-600 mb-2">Available 9 AM - 8 PM</p>
                  <button className="text-green-600 font-medium text-sm">
                    Start Chat
                  </button>
                </div>
              </div>
              
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Send us a message</h2>
                
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-100 rounded-xl p-5 text-center"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-green-800 mb-2">Message Sent!</h3>
                    <p className="text-sm text-green-700 mb-4">
                      Thank you for contacting us. We'll get back to you as soon as possible.
                    </p>
                    <Button 
                      onClick={() => setIsSubmitted(false)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input 
                          id="name" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          className="h-12 rounded-xl"
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          className="h-12 rounded-xl"
                          placeholder="Your email"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input 
                        id="subject" 
                        value={subject} 
                        onChange={(e) => setSubject(e.target.value)} 
                        className="h-12 rounded-xl"
                        placeholder="How can we help you?"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        className="min-h-32 rounded-xl resize-none"
                        placeholder="Please provide details about your inquiry..."
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" /> Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="faq" className="bg-white rounded-b-2xl shadow-md px-4 pb-6">
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
                
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-sm font-medium text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Can't find what you're looking for? Contact our support team.
                  </p>
                  <Button 
                    onClick={() => document.querySelector('[data-value="contact"]')?.click()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Contact Support
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-5 text-white">
            <div className="flex items-center mb-3">
              <HelpCircle className="h-6 w-6 mr-2 text-blue-200" />
              <h3 className="text-lg font-semibold">Need Immediate Help?</h3>
            </div>
            <p className="text-sm text-blue-100 mb-4">
              Our concierge team is available 24/7 to assist with any urgent matters regarding your stay.
            </p>
            <Button 
              className="w-full bg-white text-blue-600 hover:bg-blue-50"
              asChild
            >
              <a href="tel:+919876543210">
                <Phone className="h-4 w-4 mr-2" /> Call Concierge
              </a>
            </Button>
          </div>
        </motion.div>
      </AppShell>
    </ProtectedRoute>
  )
} 