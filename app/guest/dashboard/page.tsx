"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { 
  Home, 
  Building, 
  Calendar, 
  MessageSquare, 
  Phone, 
  MapPin,
  ChevronRight,
  Star,
  Clock,
  CalendarClock,
  ArrowRight,
  Briefcase,
  FileText,
  Map,
  QrCode,
  ThumbsUp,
  Search,
  Eye
} from "lucide-react"
import { MiniProfileCard } from "@/components/ui/mini-profile-card"
import { DashboardTile } from "@/components/ui/dashboard-tile"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { Progress } from "@/components/ui/progress"

// Navigation items for the guest dashboard
const navItems = [
  {
    title: "Dashboard",
    href: "/guest/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Explore",
    href: "/guest/explore",
    icon: <Search className="h-5 w-5" />,
  },
  {
    title: "Book Visit",
    href: "/guest/book-visit",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Feedback",
    href: "/guest/feedback",
    icon: <ThumbsUp className="h-5 w-5" />,
  },
]

export default function GuestDashboard() {
  const { user } = useAuth()
  const displayName = user?.displayName || "Guest"
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  // Quick access modules
  const modules = [
    {
      title: "Explore Properties",
      icon: <Search className="h-6 w-6" />,
      href: "/guest/explore",
      color: "blue" as const,
    },
    {
      title: "Book a Visit",
      icon: <Calendar className="h-6 w-6" />,
      href: "/guest/book-visit",
      color: "purple" as const,
    },
    {
      title: "QR Viewer",
      icon: <QrCode className="h-6 w-6" />,
      href: "/guest/qr-viewer",
      color: "green" as const,
    },
    {
      title: "Site Map",
      icon: <Map className="h-6 w-6" />,
      href: "/guest/site-map",
      color: "orange" as const,
    },
    {
      title: "Feedback",
      icon: <ThumbsUp className="h-6 w-6" />,
      href: "/guest/feedback",
      color: "red" as const,
    },
  ]

  // Mock data for featured properties
  const featuredProperties = [
    {
      id: 1,
      name: "Sunset View Villas",
      location: "Lake District, Mumbai",
      description: "Luxury villas with stunning lake views",
      image: "/images/property1.jpg",
      plotsAvailable: 12,
      startingPrice: "₹50 Lakhs"
    },
    {
      id: 2,
      name: "Mountain Retreat",
      location: "Highland Area, Shimla",
      description: "Serene plots nestled in the mountains",
      image: "/images/property2.jpg",
      plotsAvailable: 8,
      startingPrice: "₹75 Lakhs"
    },
    {
      id: 3,
      name: "Riverside Estates",
      location: "River Valley, Goa",
      description: "Prime plots with river access",
      image: "/images/property3.jpg",
      plotsAvailable: 5,
      startingPrice: "₹90 Lakhs"
    }
  ]

  // Mock data for upcoming visits
  const upcomingVisits = [
    {
      id: 1,
      propertyName: "Sunset View Villas",
      location: "Lake District, Mumbai",
      date: "Tomorrow, 10:00 AM",
      status: "confirmed",
      qrCode: "/qr-codes/visit-1.png"
    }
  ]

  // Get status color 
  const getStatusColor = (status: string) => {
    switch(status) {
      case "confirmed": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <ProtectedRoute requiredRoles={["guest"]}>
      <AppShell navItems={navItems} title="Guest Dashboard">
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
          
          <div className="mt-6 mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">{getGreeting()}, {displayName}!</h1>
            <p className="text-blue-100 text-sm">Welcome to your property explorer</p>
          </div>
          
          {/* Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {modules.map((module, index) => (
                <motion.div
                  key={module.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                >
                  <DashboardTile {...module} />
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Featured Properties */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-4 mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Featured Properties</h2>
              <Link 
                href="/guest/explore" 
                className="text-xs text-blue-600 flex items-center"
              >
                Explore All <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {featuredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="flex items-start p-3 border-b border-gray-100 last:border-0"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mr-3">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-sm">{property.name}</h3>
                      <span className="text-sm font-semibold text-blue-600">{property.startingPrice}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{property.location}</p>
                    <div className="mt-1.5 flex justify-between items-center">
                      <span className="text-xs text-green-600">{property.plotsAvailable} plots available</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-blue-600 p-0"
                        asChild
                      >
                        <Link href={`/guest/explore/${property.id}`}>
                          View Details <Eye className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Upcoming Visits / QR Viewer */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md p-4 mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Your Visit QR</h2>
              <Link 
                href="/guest/qr-viewer" 
                className="text-xs text-blue-600 flex items-center"
              >
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
            
            {upcomingVisits.length > 0 ? (
              <div className="p-3 border border-gray-100 rounded-xl mb-4">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mr-3">
                    <QrCode className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-sm">{upcomingVisits[0].propertyName}</h3>
                      <Badge className={getStatusColor(upcomingVisits[0].status)}>
                        {upcomingVisits[0].status.charAt(0).toUpperCase() + upcomingVisits[0].status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{upcomingVisits[0].location}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-600">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{upcomingVisits[0].date}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <Button 
                    className="w-full h-9 text-sm"
                    asChild
                  >
                    <Link href="/guest/qr-viewer">
                      View QR Code <QrCode className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <QrCode className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-700 mb-1">No upcoming visits</h3>
                <p className="text-sm text-gray-500 mb-4">Schedule a visit to view properties in person</p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  asChild
                >
                  <Link href="/guest/book-visit">
                    Book a Visit
                  </Link>
                </Button>
              </div>
            )}
          </motion.div>
          
          {/* Site Map Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-5 text-white mb-8"
          >
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mr-4">
                <Map className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Interactive Site Map</h3>
                <p className="text-sm text-blue-100 mb-3">
                  Explore our properties and their exact locations with our interactive map
                </p>
                <Button 
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  asChild
                >
                  <Link href="/guest/site-map">
                    View Map <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Feedback Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-md p-4 mb-6"
          >
            <div className="flex items-center mb-3">
              <ThumbsUp className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-800">Share Your Feedback</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              We value your opinion! Help us improve our services by sharing your feedback.
            </p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              asChild
            >
              <Link href="/guest/feedback">
                Submit Feedback
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </AppShell>
    </ProtectedRoute>
  )
}

