"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QRCodeSVG } from "qrcode.react"
import { getUserVisitRequests } from "@/lib/firebase-service"
import { CalendarIcon, Clock, QrCode, ShareIcon, Download, ClipboardCheck, CheckCircle2, XCircle, Clock4, Building, Share2, ChevronDown, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { VisitRequest } from "@/lib/models"
import { toast, Toaster } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"

export default function QRCodeViewerPage() {
  const [visits, setVisits] = useState<VisitRequest[]>([])
  const [selectedVisit, setSelectedVisit] = useState<VisitRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    let isMounted = true

    const fetchVisits = async () => {
      if (!user) return

      try {
        setLoading(true)
        const visitsData = await getUserVisitRequests(user.uid)
        if (isMounted) {
          setVisits(visitsData)
          if (visitsData.length > 0) {
            setSelectedVisit(visitsData[0])
          }
          setLoading(false)
        }
      } catch (error) {
        console.error("Error fetching visits:", error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchVisits()

    return () => {
      isMounted = false
    }
  }, [user])

  const shareQRCode = async () => {
    if (!selectedVisit) return
    
    try {
      const svgElement = document.getElementById("qr-code-svg")
      if (!svgElement) {
        throw new Error("QR code element not found")
      }
      
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      
      if (!ctx) {
        throw new Error("Could not create canvas context")
      }
      
      const img = new Image()
      img.src = "data:image/svg+xml;base64," + btoa(svgData)
      
      await new Promise((resolve) => {
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          resolve(null)
        }
      })
      
      const dataUrl = canvas.toDataURL("image/png")
      const blob = await (await fetch(dataUrl)).blob()
      
      if (navigator.share) {
        await navigator.share({
          title: `QR Code for ${selectedVisit.projectName}`,
          text: `Here's my QR code for visiting ${selectedVisit.projectName}`,
          files: [new File([blob], "qr-code.png", { type: "image/png" })],
        })
      } else {
        // Fallback for browsers that don't support Web Share API
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "qr-code.png"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
      
      toast({
        title: "QR Code Shared",
        description: "Your QR code has been shared successfully.",
      })
    } catch (error) {
      console.error("Error sharing QR code:", error)
      toast({
        title: "Error",
        description: "Failed to share QR code. Please try again.",
        variant: "destructive",
      })
    }
  }

  const downloadQRCode = () => {
    if (!selectedVisit) return
    
    try {
      const svgElement = document.getElementById("qr-code-svg")
      if (!svgElement) {
        throw new Error("QR code element not found")
      }
      
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      
      if (!ctx) {
        throw new Error("Could not create canvas context")
      }
      
      const img = new Image()
      img.src = "data:image/svg+xml;base64," + btoa(svgData)
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        const dataUrl = canvas.toDataURL("image/png")
        const a = document.createElement("a")
        a.href = dataUrl
        a.download = `qr-code-${selectedVisit.projectName.replace(/\s+/g, "-").toLowerCase()}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        
        toast({
          title: "QR Code Downloaded",
          description: "Your QR code has been downloaded successfully.",
        })
      }
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        title: "Error",
        description: "Failed to download QR code. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-50 text-green-700 border-green-200"
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200"
      case "checked-in":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "completed":
        return "bg-purple-50 text-purple-700 border-purple-200"
      default:
        return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "checked-in":
        return <ClipboardCheck className="h-4 w-4 text-blue-500" />
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-purple-500" />
      default:
        return <Clock4 className="h-4 w-4 text-slate-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl overflow-hidden mb-2"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-500 opacity-90"></div>
        <div className="relative px-5 py-7 text-white">
          <h1 className="text-2xl font-bold tracking-tight mb-1">QR Codes</h1>
          <p className="text-blue-100 text-sm">View and manage your visit QR codes</p>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Mobile dropdown for visits */}
        <div className="md:hidden">
          <Button 
            variant="outline" 
            className="w-full justify-between border-blue-100 shadow-sm rounded-lg"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="flex items-center">
              <QrCode className="mr-2 h-4 w-4 text-blue-500" />
              <span>{selectedVisit ? selectedVisit.projectName : "Select Visit"}</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </Button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white border rounded-lg mt-2 overflow-hidden shadow-lg z-10"
              >
                {loading ? (
                  <div className="flex justify-center p-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  </div>
                ) : visits.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-muted-foreground text-sm">No visits found</p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto p-1">
                    {visits.map((visit) => (
                      <motion.div
                        key={visit.id}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          p-3 rounded-md mb-1 cursor-pointer
                          ${selectedVisit?.id === visit.id ? "bg-blue-50 border-blue-200" : "hover:bg-slate-50"}
                        `}
                        onClick={() => {
                          setSelectedVisit(visit)
                          setIsDropdownOpen(false)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{visit.projectName}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <CalendarIcon className="h-3 w-3" />
                              <span>{visit.timeSlot.date}</span>
                            </div>
                          </div>
                          <Badge 
                            className={`${getStatusColor(visit.status)} capitalize text-xs`}
                            variant="outline"
                          >
                            {visit.status}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Visits list on desktop */}
        <div className="hidden md:block md:col-span-1">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle>Your Visits</CardTitle>
              <CardDescription>Select a visit to view QR code</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>
              ) : visits.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <QrCode className="mb-2 h-8 w-8 text-blue-300" />
                  <p className="text-muted-foreground">No visits found</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 border-blue-100" 
                    onClick={() => (window.location.href = "/guest/book-visit")}
                  >
                    Book a Visit
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {visits.map((visit) => (
                    <motion.div
                      key={visit.id}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        cursor-pointer rounded-md border p-3 transition-colors
                        ${selectedVisit?.id === visit.id 
                          ? "border-blue-500 bg-blue-50" 
                          : "hover:border-blue-200"
                        }
                      `}
                      onClick={() => setSelectedVisit(visit)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{visit.projectName}</div>
                        <Badge 
                          className={`${getStatusColor(visit.status)} capitalize`}
                          variant="outline"
                        >
                          {visit.status}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{visit.timeSlot.date}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
            {visits.length > 0 && (
              <CardFooter className="pt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-blue-100" 
                  onClick={() => (window.location.href = "/guest/book-visit")}
                >
                  Book Another Visit
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* QR Code Display */}
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            {selectedVisit ? (
              <motion.div
                key={selectedVisit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-blue-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge 
                          className={`${getStatusColor(selectedVisit.status)} capitalize mb-2`}
                          variant="outline"
                        >
                          {getStatusIcon(selectedVisit.status)}
                          <span className="ml-1">{selectedVisit.status}</span>
                        </Badge>
                        <CardTitle>{selectedVisit.projectName}</CardTitle>
                        <CardDescription>Visit details and QR code</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="qrcode" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 rounded-lg">
                        <TabsTrigger className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700" value="qrcode">QR Code</TabsTrigger>
                        <TabsTrigger className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700" value="details">Details</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="qrcode" className="pt-4">
                        <div className="bg-white rounded-lg p-8 flex justify-center items-center shadow-sm">
                          <div className="text-center">
                            <motion.div 
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="mx-auto bg-white p-6 rounded-md border-4 border-blue-100 mb-4"
                              style={{ 
                                maxWidth: "260px", 
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" 
                              }}
                            >
                              <QRCodeSVG
                                id="qr-code-svg"
                                value={`https://zplot.com/verify/${selectedVisit.id}`}
                                size={200}
                                bgColor={"#ffffff"}
                                fgColor={"#000000"}
                                level={"L"}
                                includeMargin={false}
                              />
                            </motion.div>
                            
                            <div className="text-xs text-center mb-6 text-muted-foreground">
                              Scan this QR code at the gate for contactless entry
                            </div>
                            
                            <div className="flex justify-center space-x-3">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-1 border-blue-100 rounded-full px-4"
                                onClick={shareQRCode}
                              >
                                <Share2 className="h-4 w-4" />
                                <span>Share</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-1 border-blue-100 rounded-full px-4"
                                onClick={downloadQRCode}
                              >
                                <Download className="h-4 w-4" />
                                <span>Download</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="details" className="space-y-4 pt-4">
                        <div className="space-y-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <Building className="h-5 w-5 text-blue-500 mt-0.5" />
                              <div>
                                <div className="font-medium">{selectedVisit.projectName}</div>
                                {selectedVisit.plotNumber && (
                                  <div className="text-sm text-muted-foreground">
                                    Plot #{selectedVisit.plotNumber}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-start gap-2">
                                <CalendarIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                                <div>
                                  <div className="text-muted-foreground">Date</div>
                                  <div>{formatDate(selectedVisit.timeSlot.date)}</div>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                                <div>
                                  <div className="text-muted-foreground">Time</div>
                                  <div>
                                    {selectedVisit.timeSlot.startTime} - {selectedVisit.timeSlot.endTime}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Visit Status Message */}
                          <div className={`rounded-lg p-4 ${getStatusColor(selectedVisit.status)}`}>
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(selectedVisit.status)}
                              <span className="font-medium capitalize">
                                {selectedVisit.status === "approved" ? "Visit Approved" : 
                                selectedVisit.status === "pending" ? "Pending Approval" :
                                selectedVisit.status === "rejected" ? "Visit Rejected" :
                                selectedVisit.status === "checked-in" ? "Checked In" :
                                "Visit Completed"}
                              </span>
                            </div>
                            <p className="text-sm">
                              {selectedVisit.status === "approved" 
                                ? "Your visit has been approved. Please present the QR code at the entrance on the day of your visit."
                                : selectedVisit.status === "pending"
                                ? "Your visit request is pending approval. You will be notified once it's approved."
                                : selectedVisit.status === "rejected"
                                ? "Unfortunately, your visit request was rejected. Please contact support for more information."
                                : selectedVisit.status === "checked-in"
                                ? "You've successfully checked in for your visit. Enjoy your tour!"
                                : "Your visit has been completed. We hope you had a great experience!"
                              }
                            </p>
                          </div>

                          {/* Guest Information */}
                          <div>
                            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-500" />
                              Guest Information
                            </h3>
                            <div className="rounded-lg border p-3 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Name:</span>
                                <span>{selectedVisit.userName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span>{selectedVisit.userEmail}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone:</span>
                                <span>{selectedVisit.userPhone}</span>
                              </div>
                            </div>
                          </div>

                          {/* Notes */}
                          {selectedVisit.notes && (
                            <div>
                              <h3 className="text-sm font-medium mb-2">Notes</h3>
                              <div className="rounded-lg border p-3">
                                <p className="text-sm">{selectedVisit.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  
                  {/* Mobile-only footer */}
                  <div className="md:hidden">
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button 
                        variant="outline" 
                        className="border-blue-100 rounded-full" 
                        onClick={() => (window.location.href = "/guest/book-visit")}
                      >
                        Book Another
                      </Button>
                      {(selectedVisit.status === "approved" || selectedVisit.status === "checked-in") && (
                        <Button className="bg-blue-600 hover:bg-blue-700 rounded-full">
                          <ClipboardCheck className="mr-2 h-4 w-4" />
                          Check In
                        </Button>
                      )}
                    </CardFooter>
                  </div>
                </Card>
              </motion.div>
            ) : loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-blue-100 shadow-sm">
                  <CardContent className="flex h-80 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-blue-100 shadow-sm">
                  <CardContent className="flex h-80 flex-col items-center justify-center text-center p-6">
                    <QrCode className="mb-4 h-16 w-16 text-blue-200" />
                    <h3 className="text-xl font-semibold mb-2">No Visits Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't booked any property visits yet. Book your first visit to explore our properties.
                    </p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 rounded-full px-6" 
                      onClick={() => (window.location.href = "/guest/book-visit")}
                    >
                      Book Your First Visit
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <Toaster />
    </div>
  )
}

