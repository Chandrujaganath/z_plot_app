"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronLeft, BedDouble, Calendar, Clock, MapPin, Phone, Info, MessageSquare, Star, Home, ArrowRight, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { MiniProfileCard } from "@/components/ui/mini-profile-card"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

// Mock booking data
const upcomingBookings = [
  {
    id: 1,
    roomType: "Deluxe Room",
    checkIn: "Oct 25, 2023",
    checkOut: "Oct 28, 2023",
    checkInTime: "12:00 PM",
    guestCount: 2,
    price: 6000,
    status: "confirmed",
    bookingDate: "Oct 15, 2023",
    paymentMethod: "Credit Card",
    hotelName: "Sunset Grand Hotel",
    hotelLocation: "123 Beach Road, Mumbai",
    roomNumber: null, // Not assigned yet
    cancellationPolicy: "Free cancellation before Oct 23, 2023"
  },
  {
    id: 2,
    roomType: "Executive Suite",
    checkIn: "Nov 15, 2023",
    checkOut: "Nov 17, 2023",
    checkInTime: "2:00 PM",
    guestCount: 3,
    price: 7000,
    status: "pending",
    bookingDate: "Oct 10, 2023",
    paymentMethod: "Credit Card",
    hotelName: "Skyview Suites",
    hotelLocation: "456 Mountain View Road, Shimla",
    roomNumber: null, // Not assigned yet
    cancellationPolicy: "Free cancellation before Nov 13, 2023"
  }
]

const pastBookings = [
  {
    id: 3,
    roomType: "Standard Room",
    checkIn: "Sep 10, 2023",
    checkOut: "Sep 12, 2023",
    checkInTime: "1:00 PM",
    guestCount: 1,
    price: 2400,
    status: "completed",
    bookingDate: "Aug 28, 2023",
    paymentMethod: "Credit Card",
    hotelName: "City Central Hotel",
    hotelLocation: "789 Business District, Bangalore",
    roomNumber: "304",
    cancellationPolicy: "Non-refundable"
  },
  {
    id: 4,
    roomType: "Deluxe Room",
    checkIn: "Aug 5, 2023",
    checkOut: "Aug 7, 2023",
    checkInTime: "3:00 PM",
    guestCount: 2,
    price: 4000,
    status: "cancelled",
    bookingDate: "Jul 20, 2023",
    paymentMethod: "Credit Card",
    hotelName: "Riverside Inn",
    hotelLocation: "321 River Road, Goa",
    roomNumber: null,
    cancellationPolicy: "Non-refundable"
  }
]

export default function MyBookingsPage() {
  const { user } = useAuth()
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  
  // Helper function to get all bookings
  const getAllBookings = () => {
    return [...upcomingBookings, ...pastBookings]
  }
  
  // Find selected booking details
  const selectedBooking = getAllBookings().find(booking => booking.id === selectedBookingId)
  
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
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  }

  return (
    <ProtectedRoute requiredRoles={["guest"]}>
      <AppShell navItems={navItems} title="My Bookings">
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
              <h1 className="text-2xl font-bold tracking-tight text-white">My Bookings</h1>
            </div>
            <p className="text-blue-100 text-sm">View and manage your accommodation bookings</p>
          </div>
          
          {selectedBooking ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Button 
                variant="ghost" 
                className="mb-4 text-blue-100 hover:text-white hover:bg-blue-600/20 pl-2"
                onClick={() => setSelectedBookingId(null)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Back to all bookings
              </Button>
              
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <div className="relative h-32 bg-gray-200">
                  {/* This would display an actual image in production */}
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-600/10">
                    <BedDouble className="h-12 w-12 text-blue-600/40" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <Badge className={getStatusColor(selectedBooking.status)}>
                      {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedBooking.roomType}</h3>
                      <div className="flex items-center text-xs text-gray-500 mt-0.5">
                        <MapPin className="h-3 w-3 mr-1" />
                        {selectedBooking.hotelName}
                      </div>
                    </div>
                    <div className="text-blue-600 font-semibold">₹{selectedBooking.price}</div>
                  </div>
                </div>
                
                <div className="px-4 pb-5">
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                        Check-in
                      </div>
                      <div className="text-sm font-medium">{selectedBooking.checkIn} at {selectedBooking.checkInTime}</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                        Check-out
                      </div>
                      <div className="text-sm font-medium">{selectedBooking.checkOut}</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                        Location
                      </div>
                      <div className="text-sm font-medium">{selectedBooking.hotelLocation}</div>
                    </div>
                    
                    {selectedBooking.roomNumber && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-600">
                          <BedDouble className="h-4 w-4 mr-2 text-blue-500" />
                          Room Number
                        </div>
                        <div className="text-sm font-medium">{selectedBooking.roomNumber}</div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="h-4 w-4 mr-2 text-blue-500" />
                        Status
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(selectedBooking.status)}
                        <span className="text-sm font-medium ml-1">
                          {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <h4 className="font-medium text-gray-800 mb-3">Booking Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Booking Date:</span>
                        <span>{selectedBooking.bookingDate}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Payment Method:</span>
                        <span>{selectedBooking.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Number of Guests:</span>
                        <span>{selectedBooking.guestCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-semibold">₹{selectedBooking.price}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600 mb-2">Cancellation Policy:</div>
                    <div className="text-sm">{selectedBooking.cancellationPolicy}</div>
                  </div>
                  
                  {/* Action buttons based on booking status */}
                  <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-3">
                    {selectedBooking.status === "confirmed" && (
                      <>
                        <Button variant="outline" className="h-12 rounded-xl">Cancel Booking</Button>
                        <Button className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700">Modify Booking</Button>
                      </>
                    )}
                    
                    {selectedBooking.status === "pending" && (
                      <>
                        <Button variant="outline" className="h-12 rounded-xl">Cancel Booking</Button>
                        <Button className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700">Confirm Payment</Button>
                      </>
                    )}
                    
                    {selectedBooking.status === "completed" && (
                      <>
                        <Button variant="outline" className="h-12 rounded-xl">Get Invoice</Button>
                        <Button className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700">Write Review</Button>
                      </>
                    )}
                    
                    {selectedBooking.status === "cancelled" && (
                      <Button className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 col-span-2">Book Again</Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
                <div className="flex items-center text-gray-800 mb-4">
                  <Phone className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="font-semibold">Need Help?</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Contact the hotel directly for any queries related to your booking.
                </p>
                <Button variant="outline" className="w-full flex items-center justify-center">
                  <Phone className="h-4 w-4 mr-2" /> Call Hotel
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-md overflow-hidden mb-6"
            >
              <Tabs defaultValue="upcoming" className="w-full">
                <div className="px-4 pt-4">
                  <TabsList className="w-full grid grid-cols-2 h-10 rounded-lg bg-gray-100">
                    <TabsTrigger value="upcoming" className="rounded-md">Upcoming</TabsTrigger>
                    <TabsTrigger value="past" className="rounded-md">Past</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="upcoming" className="pb-2 px-2 mt-4">
                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingBookings.map((booking) => (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                          onClick={() => setSelectedBookingId(booking.id)}
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">{booking.roomType}</h3>
                                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {booking.hotelName}
                                </div>
                              </div>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>Check-in: {booking.checkIn}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>Check-out: {booking.checkOut}</span>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex justify-between items-center pt-3 border-t border-gray-100">
                              <div className="text-sm font-medium text-blue-600">₹{booking.price}</div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto"
                              >
                                View Details <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-800 mb-1">No upcoming bookings</h3>
                      <p className="text-sm text-gray-500 mb-4">You don't have any upcoming bookings at the moment.</p>
                      <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href="/guest/book-room">Book a Room</Link>
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="past" className="pb-2 px-2 mt-4">
                  {pastBookings.length > 0 ? (
                    <div className="space-y-3">
                      {pastBookings.map((booking) => (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                          onClick={() => setSelectedBookingId(booking.id)}
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">{booking.roomType}</h3>
                                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {booking.hotelName}
                                </div>
                              </div>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>Check-in: {booking.checkIn}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>Check-out: {booking.checkOut}</span>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex justify-between items-center pt-3 border-t border-gray-100">
                              <div className="text-sm font-medium text-blue-600">₹{booking.price}</div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto"
                              >
                                View Details <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-800 mb-1">No past bookings</h3>
                      <p className="text-sm text-gray-500 mb-4">You don't have any past bookings at the moment.</p>
                      <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href="/guest/book-room">Book a Room</Link>
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
          
          <div className="mt-4 bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800 text-sm">Booking Information</h4>
                <p className="mt-1 text-xs text-blue-700">
                  For any assistance with your bookings, please contact our customer support at +91 98765 43210 or email at support@plotapp.com
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </AppShell>
    </ProtectedRoute>
  )
} 