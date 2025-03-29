"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Calendar, MapPin, Building, Clock, Filter, CheckCircle, XCircle, FileText, AlertCircle, Home, History, ArrowRight } from "lucide-react"
import { MiniProfileCard } from "@/components/ui/mini-profile-card"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// Navigation items for the client dashboard
const navItems = [
  {
    title: "Dashboard",
    href: "/client/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "My Plots",
    href: "/client/plots",
    icon: <Building className="h-5 w-5" />,
  },
  {
    title: "Visit History",
    href: "/client/visit-history",
    icon: <History className="h-5 w-5" />,
  },
  {
    title: "Documents",
    href: "/client/documents",
    icon: <FileText className="h-5 w-5" />,
  },
]

// Mock visit data
const upcomingVisits = [
  {
    id: 1,
    plotName: "Sunset View Villa",
    plotNumber: "24B",
    location: "Lake District, Mumbai",
    date: "Tomorrow, 10:00 AM",
    status: "confirmed",
    qrCode: "/qr-codes/visit-1.png"
  },
  {
    id: 2,
    plotName: "Mountain Retreat",
    plotNumber: "15A",
    location: "Highland Area, Shimla",
    date: "Oct 25, 2:30 PM",
    status: "pending",
    qrCode: "/qr-codes/visit-2.png"
  }
]

const pastVisits = [
  {
    id: 3,
    plotName: "Sunset View Villa",
    plotNumber: "24B",
    location: "Lake District, Mumbai",
    date: "Sep 15, 2023, 11:00 AM",
    status: "completed",
    notes: "Met with Mr. Sharma. Discussed construction timeline.",
    photos: ["/photos/visit-3-1.jpg", "/photos/visit-3-2.jpg"]
  },
  {
    id: 4,
    plotName: "Mountain Retreat",
    plotNumber: "15A",
    location: "Highland Area, Shimla",
    date: "Aug 20, 2023, 3:00 PM",
    status: "completed",
    notes: "Foundation work inspected. Progress on schedule.",
    photos: ["/photos/visit-4-1.jpg"]
  },
  {
    id: 5,
    plotName: "Sunset View Villa",
    plotNumber: "24B",
    location: "Lake District, Mumbai",
    date: "Jul 12, 2023, 10:30 AM",
    status: "completed",
    notes: "Initial site visit. Plot boundaries confirmed.",
    photos: []
  },
  {
    id: 6,
    plotName: "Riverside Estate",
    plotNumber: "33C",
    location: "River Valley, Goa",
    date: "Jun 05, 2023, 4:00 PM",
    status: "cancelled",
    notes: "Cancelled due to heavy rain.",
    photos: []
  }
]

export default function VisitHistoryPage() {
  const { user } = useAuth()
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null)
  
  // Helper function to get all visits
  const getAllVisits = () => {
    return [...upcomingVisits, ...pastVisits]
  }
  
  // Find selected visit details
  const selectedVisit = getAllVisits().find(visit => visit.id === selectedVisitId)
  
  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case "confirmed": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "completed": return "bg-blue-100 text-blue-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  }
  
  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch(status) {
      case "confirmed": return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending": return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "completed": return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case "cancelled": return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  }

  return (
    <ProtectedRoute requiredRoles={["client"]}>
      <AppShell navItems={navItems} title="Visit History">
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
              <Link href="/client/dashboard" className="text-white mr-2">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold tracking-tight text-white">Visit History</h1>
            </div>
            <p className="text-blue-100 text-sm">View your property visit history and upcoming visits</p>
          </div>
          
          {selectedVisit ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Button 
                variant="ghost" 
                className="mb-4 text-blue-100 hover:text-white hover:bg-blue-600/20 pl-2"
                onClick={() => setSelectedVisitId(null)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Back to all visits
              </Button>
              
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <div className="relative h-32 bg-gray-200">
                  {/* This would display an actual image in production */}
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-600/10">
                    <Building className="h-12 w-12 text-blue-600/40" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <Badge className={getStatusColor(selectedVisit.status)}>
                      {selectedVisit.status.charAt(0).toUpperCase() + selectedVisit.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedVisit.plotName}</h3>
                      <div className="flex items-center text-xs text-gray-500 mt-0.5">
                        <MapPin className="h-3 w-3 mr-1" />
                        Plot {selectedVisit.plotNumber}, {selectedVisit.location}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 pb-5">
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                        Visit Date & Time
                      </div>
                      <div className="text-sm font-medium">{selectedVisit.date}</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                        Location
                      </div>
                      <div className="text-sm font-medium">{selectedVisit.location}</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="h-4 w-4 mr-2 text-blue-500" />
                        Plot Number
                      </div>
                      <div className="text-sm font-medium">{selectedVisit.plotNumber}</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-600">
                        <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />
                        Status
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(selectedVisit.status)}
                        <span className="text-sm font-medium ml-1">
                          {selectedVisit.status.charAt(0).toUpperCase() + selectedVisit.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {'notes' in selectedVisit && selectedVisit.notes && (
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <h4 className="font-medium text-gray-800 mb-3">Visit Notes</h4>
                      <p className="text-sm text-gray-600">{selectedVisit.notes}</p>
                    </div>
                  )}
                  
                  {'photos' in selectedVisit && selectedVisit.photos && selectedVisit.photos.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <h4 className="font-medium text-gray-800 mb-3">Photos</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedVisit.photos.map((photo, index) => (
                          <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            {/* In production, you'd show actual images */}
                            <div className="w-full h-full flex items-center justify-center bg-blue-50">
                              <FileText className="h-6 w-6 text-blue-300" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Action buttons based on visit status */}
                  <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-3">
                    {selectedVisit.status === "confirmed" && (
                      <>
                        <Button variant="outline" className="h-12 rounded-xl">Cancel Visit</Button>
                        <Button 
                          className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
                          asChild
                        >
                          <Link href="/client/generate-qr">View QR Code</Link>
                        </Button>
                      </>
                    )}
                    
                    {selectedVisit.status === "pending" && (
                      <>
                        <Button variant="outline" className="h-12 rounded-xl">Cancel Request</Button>
                        <Button className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700">Confirm Visit</Button>
                      </>
                    )}
                    
                    {selectedVisit.status === "completed" && (
                      <>
                        <Button variant="outline" className="h-12 rounded-xl">Download Report</Button>
                        <Button 
                          className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
                          asChild
                        >
                          <Link href="/client/book-visit">Book Another Visit</Link>
                        </Button>
                      </>
                    )}
                    
                    {selectedVisit.status === "cancelled" && (
                      <Button 
                        className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 col-span-2"
                        asChild
                      >
                        <Link href="/client/book-visit">Reschedule Visit</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Tabs defaultValue="upcoming" className="w-full">
                <div className="bg-white rounded-t-2xl shadow-md px-4 pt-4">
                  <TabsList className="w-full grid grid-cols-2 h-10 rounded-lg bg-gray-100">
                    <TabsTrigger value="upcoming" className="rounded-md">Upcoming</TabsTrigger>
                    <TabsTrigger value="past" className="rounded-md">Past</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="upcoming" className="bg-white rounded-b-2xl shadow-md px-4 pb-4">
                  <div className="pt-4 mb-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Upcoming Visits</h2>
                    <Link
                      href="/client/book-visit"
                      className="text-sm text-blue-600 flex items-center"
                    >
                      Book New <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                  
                  {upcomingVisits.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingVisits.map((visit) => (
                        <motion.div
                          key={visit.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                          onClick={() => setSelectedVisitId(visit.id)}
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">{visit.plotName}</h3>
                                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  Plot {visit.plotNumber}, {visit.location}
                                </div>
                              </div>
                              <Badge className={getStatusColor(visit.status)}>
                                {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="mt-3 flex items-center text-xs text-gray-600">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{visit.date}</span>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                              {visit.status === "confirmed" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-8"
                                  asChild
                                >
                                  <Link href="/client/generate-qr">View QR</Link>
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-8"
                                >
                                  Confirm
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-blue-600 h-8"
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-800 mb-1">No upcoming visits</h3>
                      <p className="text-sm text-gray-500 mb-4">Schedule a visit to see your property</p>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        asChild
                      >
                        <Link href="/client/book-visit">Book a Visit</Link>
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="past" className="bg-white rounded-b-2xl shadow-md px-4 pb-4">
                  <div className="pt-4 mb-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Past Visits</h2>
                    <Button variant="outline" size="sm" className="h-8">
                      <Filter className="h-3 w-3 mr-1" /> Filter
                    </Button>
                  </div>
                  
                  {pastVisits.length > 0 ? (
                    <div className="space-y-3">
                      {pastVisits.map((visit) => (
                        <motion.div
                          key={visit.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                          onClick={() => setSelectedVisitId(visit.id)}
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">{visit.plotName}</h3>
                                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  Plot {visit.plotNumber}, {visit.location}
                                </div>
                              </div>
                              <Badge className={getStatusColor(visit.status)}>
                                {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="mt-3 flex items-center text-xs text-gray-600">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{visit.date}</span>
                            </div>
                            
                            {visit.notes && (
                              <div className="mt-2 text-xs text-gray-500 line-clamp-1">
                                {visit.notes}
                              </div>
                            )}
                            
                            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-blue-600 h-8"
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-800 mb-1">No past visits</h3>
                      <p className="text-sm text-gray-500 mb-4">Your visit history will appear here</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl shadow-lg p-5 text-white mt-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mr-4">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Schedule a Visit</h3>
                    <p className="text-sm text-blue-100 mb-3">
                      Book a site visit to see your property and check construction progress
                    </p>
                    <Button 
                      className="bg-white text-blue-600 hover:bg-blue-50"
                      asChild
                    >
                      <Link href="/client/book-visit">
                        Book Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AppShell>
    </ProtectedRoute>
  )
} 