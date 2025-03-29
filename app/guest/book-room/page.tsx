"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar as CalendarIcon, Clock, ArrowRight, ChevronLeft, ChevronRight, BedDouble, User, CreditCard, Check } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MiniProfileCard } from "@/components/ui/mini-profile-card"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
    icon: <CalendarIcon className="h-5 w-5" />,
  },
  {
    title: "Support",
    href: "/guest/support",
    icon: <MessageSquare className="h-5 w-5" />,
  },
]

// Mock room data
const roomTypes = [
  {
    id: 1,
    name: "Standard Room",
    description: "Comfortable room with essential amenities",
    price: 1200,
    amenities: ["Free Wi-Fi", "TV", "Air Conditioning"],
    image: "/images/standard-room.jpg",
    available: true
  },
  {
    id: 2,
    name: "Deluxe Room",
    description: "Spacious room with premium amenities and city view",
    price: 2000,
    amenities: ["Free Wi-Fi", "TV", "Air Conditioning", "Mini Bar", "City View"],
    image: "/images/deluxe-room.jpg",
    available: true
  },
  {
    id: 3,
    name: "Executive Suite",
    description: "Luxury suite with separate living area and premium services",
    price: 3500,
    amenities: ["Free Wi-Fi", "Smart TV", "Air Conditioning", "Mini Bar", "Bathtub", "City View", "Lounge Access"],
    image: "/images/executive-suite.jpg",
    available: false
  },
]

// Time slots for booking
const timeSlots = [
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
  "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"
]

import { Home, MessageSquare } from "lucide-react"

export default function BookRoomPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [checkInDate, setCheckInDate] = useState<Date>()
  const [checkOutDate, setCheckOutDate] = useState<Date>()
  const [guests, setGuests] = useState(1)
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [checkInTime, setCheckInTime] = useState<string | null>(null)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would submit the booking to the backend
    router.push("/guest/my-bookings")
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <ProtectedRoute requiredRoles={["guest"]}>
      <AppShell navItems={navItems} title="Book Room">
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
              <h1 className="text-2xl font-bold tracking-tight text-white">Book Room</h1>
            </div>
            <p className="text-blue-100 text-sm">Find and book your perfect accommodation</p>
          </div>
          
          {/* Progress steps */}
          <div className="mb-6 px-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full mb-1", 
                  step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                )}>
                  <Calendar className="h-4 w-4" />
                </div>
                <span className="text-xs text-gray-600">Dates</span>
              </div>
              <div className="flex-1 h-0.5 mx-2 bg-gray-200">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: step >= 2 ? '100%' : '0%' }}
                />
              </div>
              <div className="flex flex-col items-center">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full mb-1", 
                  step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                )}>
                  <BedDouble className="h-4 w-4" />
                </div>
                <span className="text-xs text-gray-600">Room</span>
              </div>
              <div className="flex-1 h-0.5 mx-2 bg-gray-200">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: step >= 3 ? '100%' : '0%' }}
                />
              </div>
              <div className="flex flex-col items-center">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full mb-1", 
                  step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                )}>
                  <CreditCard className="h-4 w-4" />
                </div>
                <span className="text-xs text-gray-600">Payment</span>
              </div>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-5 mb-6"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Dates</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="check-in" className="text-sm font-medium">Check-in Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="check-in"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-12 rounded-xl",
                            !checkInDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkInDate ? format(checkInDate, "PPP") : <span>Select date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkInDate}
                          onSelect={setCheckInDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="check-out" className="text-sm font-medium">Check-out Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="check-out"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-12 rounded-xl",
                            !checkOutDate && "text-muted-foreground"
                          )}
                          disabled={!checkInDate}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOutDate ? format(checkOutDate, "PPP") : <span>Select date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkOutDate}
                          onSelect={setCheckOutDate}
                          initialFocus
                          disabled={(date) => !checkInDate || date <= checkInDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="check-in-time" className="text-sm font-medium">Check-in Time</Label>
                    <Select
                      value={checkInTime || ""}
                      onValueChange={setCheckInTime}
                    >
                      <SelectTrigger id="check-in-time" className="h-12 rounded-xl">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="guests" className="text-sm font-medium">Number of Guests</Label>
                    <div className="flex items-center h-12">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-l-xl"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex-grow h-full border-y flex items-center justify-center text-lg font-medium">
                        {guests}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-r-xl"
                        onClick={() => setGuests(Math.min(4, guests + 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
                    onClick={nextStep}
                    disabled={!checkInDate || !checkOutDate || !checkInTime}
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
            
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Room Type</h2>
                
                <div className="space-y-4">
                  <RadioGroup value={selectedRoom?.toString() || ""} onValueChange={(value) => setSelectedRoom(Number(value))}>
                    {roomTypes.map((room) => (
                      <div key={room.id} className="relative">
                        <RadioGroupItem
                          value={room.id.toString()}
                          id={`room-${room.id}`}
                          className="peer sr-only"
                          disabled={!room.available}
                        />
                        <Label
                          htmlFor={`room-${room.id}`}
                          className={cn(
                            "flex flex-col p-0 overflow-hidden rounded-2xl border border-gray-200 bg-white",
                            "peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-blue-600",
                            "transition-all hover:border-blue-200",
                            !room.available && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          <div className="relative h-32 bg-gray-200">
                            {/* This would display an actual image in production */}
                            <div className="absolute inset-0 flex items-center justify-center bg-blue-600/10">
                              <BedDouble className="h-12 w-12 text-blue-600/40" />
                            </div>
                            {!room.available && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                                <Badge className="bg-red-100 text-red-700">Not Available</Badge>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">{room.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{room.description}</p>
                              </div>
                              <div className="text-blue-600 font-semibold">₹{room.price}</div>
                            </div>
                            
                            <div className="mt-3 flex flex-wrap gap-1">
                              {room.amenities.slice(0, 3).map((amenity, i) => (
                                <Badge key={i} variant="outline" className="font-normal text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                              {room.amenities.length > 3 && (
                                <Badge variant="outline" className="font-normal text-xs">
                                  +{room.amenities.length - 3} more
                                </Badge>
                              )}
                            </div>
                            
                            <div className="mt-3 text-right">
                              <div className="text-xs text-gray-500">per night</div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <Button 
                    variant="outline"
                    className="flex-1 h-12 rounded-xl"
                    onClick={prevStep}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button 
                    className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
                    onClick={nextStep}
                    disabled={!selectedRoom}
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
            
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Booking Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Room Type</span>
                      <span className="font-medium">{roomTypes.find(r => r.id === selectedRoom)?.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Check-in</span>
                      <span className="font-medium">
                        {checkInDate ? format(checkInDate, "PP") : ""} at {checkInTime}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Check-out</span>
                      <span className="font-medium">
                        {checkOutDate ? format(checkOutDate, "PP") : ""}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Guests</span>
                      <span className="font-medium">{guests}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Price per night</span>
                      <span className="font-medium">₹{roomTypes.find(r => r.id === selectedRoom)?.price}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 text-lg">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-blue-600">
                        ₹{selectedRoom && checkInDate && checkOutDate
                          ? (roomTypes.find(r => r.id === selectedRoom)?.price || 0) *
                            Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)))
                          : 0
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h2>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-name" className="text-sm font-medium">Name on Card</Label>
                      <Input id="card-name" className="h-12 rounded-xl" placeholder="Enter name as on card" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="card-number" className="text-sm font-medium">Card Number</Label>
                      <Input id="card-number" className="h-12 rounded-xl" placeholder="1234 5678 9012 3456" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry" className="text-sm font-medium">Expiry Date</Label>
                        <Input id="expiry" className="h-12 rounded-xl" placeholder="MM/YY" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv" className="text-sm font-medium">CVV</Label>
                        <Input id="cvv" className="h-12 rounded-xl" placeholder="123" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <Button 
                    variant="outline"
                    className="flex-1 h-12 rounded-xl"
                    onClick={prevStep}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button 
                    className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
                    onClick={handleSubmit}
                  >
                    Complete Booking <Check className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </motion.div>
      </AppShell>
    </ProtectedRoute>
  )
} 