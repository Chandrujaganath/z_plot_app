"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { 
  CalendarIcon, Clock, MapPin, QrCode, AlertCircle, CheckCircle2, Share2, Download, ChevronDown,
  ClipboardCheck, Building
} from "lucide-react"
import { getUserVisitRequests, getVisitRequest } from "@/lib/firebase-service"
import type { VisitRequest } from "@/lib/models"
import { useAuth } from "@/lib/auth-context"
import { QRCodeSVG } from "qrcode.react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function QRCodeViewerPage() {
  const [visits, setVisits] = useState<VisitRequest[]>([])
  const [selectedVisit, setSelectedVisit] = useState<VisitRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [showVisitList, setShowVisitList] = useState(false)
  const { user } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchVisits = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Check if visitId is in URL params
        const visitId = searchParams.get("visitId")
        if (visitId) {
          const visit = await getVisitRequest(visitId)
          if (visit && visit.userId === user.uid) {
            setSelectedVisit(visit)
          }
        }

        // Get all user's visits
        const visitsData = await getUserVisitRequests(user.uid)
        setVisits(visitsData)

        // If no visit is selected yet, select the most recent one
        if (!selectedVisit && visitsData.length > 0) {
          setSelectedVisit(visitsData[0])
        }
      } catch (error) {
        console.error("Error fetching visits:", error)
        toast({
          title: "Error",
          description: "Failed to load visit data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVisits()
  }, [user, searchParams, selectedVisit])

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "checked-in":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "checked-in":
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-purple-500" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const shareQRCode = async () => {
    if (!selectedVisit) return
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `QR Code for ${selectedVisit.projectName}`,
          text: `Visit Details: ${selectedVisit.projectName} on ${selectedVisit.timeSlot.date} at ${selectedVisit.timeSlot.startTime}`,
          url: window.location.href
        })
      } else {
        // Fallback if Web Share API is not available
        navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link Copied",
          description: "QR Code link copied to clipboard"
        })
      }
    } catch (error) {
      console.error("Error sharing QR code:", error)
      toast({
        title: "Error",
        description: "Failed to share QR code",
        variant: "destructive"
      })
    }
  }

  const downloadQRCode = () => {
    if (!selectedVisit) return
    
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return
    
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const image = new Image()
    
    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    
    image.onload = () => {
      canvas.width = image.width
      canvas.height = image.height
      context?.drawImage(image, 0, 0)
      URL.revokeObjectURL(url)
      
      const link = document.createElement('a')
      link.download = `qr-code-${selectedVisit.id}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    
    image.src = url
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">QR Code Viewer</h1>
          <p className="text-muted-foreground text-sm">Access your property visit passes</p>
        </div>
        
        {/* Visit selection dropdown for mobile */}
        {visits.length > 0 && (
          <div className="md:hidden">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 border-blue-100"
              onClick={() => setShowVisitList(!showVisitList)}
            >
              <span>Change</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Mobile visit selector dropdown */}
      <AnimatePresence>
        {showVisitList && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <Card className="border-blue-100 mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Select a Visit</CardTitle>
              </CardHeader>
              <CardContent className="pb-4 pt-0">
                <div className="space-y-2">
                  {visits.map((visit) => (
                    <div
                      key={visit.id}
                      className={`
                        cursor-pointer rounded-md border p-3 transition-colors
                        ${selectedVisit?.id === visit.id ? "border-blue-500 bg-blue-50" : "hover:border-blue-200"}
                      `}
                      onClick={() => {
                        setSelectedVisit(visit)
                        setShowVisitList(false)
                      }}
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Visit List (Hidden on mobile) */}
        <div className="hidden md:block md:col-span-1">
          <Card className="border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle>Your Visits</CardTitle>
              <CardDescription>Select a visit to view its QR code</CardDescription>
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
                    <div
                      key={visit.id}
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
                    </div>
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
          {selectedVisit ? (
            <Card className="border-blue-100">
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
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="qrcode">QR Code</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="qrcode" className="pt-4">
                    <div className="bg-white rounded-md p-8 flex justify-center items-center">
                      <div className="text-center">
                        <div 
                          className="mx-auto bg-white p-4 rounded-md border-4 border-blue-100 mb-4"
                          style={{ 
                            maxWidth: "250px", 
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
                        </div>
                        
                        <div className="text-xs text-center mb-4 text-muted-foreground">
                          Scan this QR code at the gate for contactless entry
                        </div>
                        
                        <div className="flex justify-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1 border-blue-100"
                            onClick={shareQRCode}
                          >
                            <Share2 className="h-4 w-4" />
                            <span>Share</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1 border-blue-100"
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
                      <div className="bg-blue-50 rounded-md p-4">
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
                      <div className={`rounded-md p-4 ${getStatusColor(selectedVisit.status)}`}>
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
                        <h3 className="text-sm font-medium mb-2">Guest Information</h3>
                        <div className="rounded-md border p-3 space-y-2 text-sm">
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
                          <div className="rounded-md border p-3">
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
                    className="border-blue-100" 
                    onClick={() => (window.location.href = "/guest/book-visit")}
                  >
                    Book Another Visit
                  </Button>
                  {(selectedVisit.status === "approved" || selectedVisit.status === "checked-in") && (
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Check In
                    </Button>
                  )}
                </CardFooter>
              </div>
            </Card>
          ) : loading ? (
            <Card className="border-blue-100">
              <CardContent className="flex h-80 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-blue-100">
              <CardContent className="flex h-80 flex-col items-center justify-center text-center p-6">
                <QrCode className="mb-4 h-12 w-12 text-blue-200" />
                <h3 className="text-xl font-semibold mb-2">No Visits Yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't booked any property visits yet. Book your first visit to explore our properties.
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700" 
                  onClick={() => (window.location.href = "/guest/book-visit")}
                >
                  Book Your First Visit
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Toaster />
    </div>
  )
}

