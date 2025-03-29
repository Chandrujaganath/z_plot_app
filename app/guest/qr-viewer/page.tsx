"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { CalendarIcon, Clock, MapPin, QrCode, AlertCircle, CheckCircle2 } from "lucide-react"
import { getUserVisitRequests, getVisitRequest } from "@/lib/firebase-service"
import type { VisitRequest } from "@/lib/models"
import { useAuth } from "@/lib/auth-context"
import { QRCodeSVG } from "qrcode.react" // Changed from default import to named import

export default function QRCodeViewerPage() {
  const [visits, setVisits] = useState<VisitRequest[]>([])
  const [selectedVisit, setSelectedVisit] = useState<VisitRequest | null>(null)
  const [loading, setLoading] = useState(true)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-500"
      case "pending":
        return "text-yellow-500"
      case "rejected":
        return "text-red-500"
      case "checked-in":
        return "text-blue-500"
      case "completed":
        return "text-purple-500"
      default:
        return ""
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">QR Code Viewer</h1>
        <p className="text-muted-foreground">View your visit QR codes and status</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Visits</CardTitle>
              <CardDescription>Select a visit to view its QR code</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              ) : visits.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <QrCode className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No visits found</p>
                  <Button variant="link" className="mt-2" onClick={() => (window.location.href = "/guest/book-visit")}>
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
                        ${selectedVisit?.id === visit.id ? "border-primary bg-primary/5" : "hover:bg-muted"}
                      `}
                      onClick={() => setSelectedVisit(visit)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{visit.projectName}</div>
                        <div className={`flex items-center gap-1 text-sm ${getStatusColor(visit.status)}`}>
                          {getStatusIcon(visit.status)}
                          <span className="capitalize">{visit.status}</span>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{visit.timeSlot.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedVisit ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedVisit.projectName}</CardTitle>
                    <CardDescription>Visit details and QR code</CardDescription>
                  </div>
                  <div
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm ${
                      selectedVisit.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : selectedVisit.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedVisit.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : selectedVisit.status === "checked-in"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {getStatusIcon(selectedVisit.status)}
                    <span className="capitalize">{selectedVisit.status}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Visit Information</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedVisit.projectName}</span>
                        </div>
                        {selectedVisit.plotNumber && (
                          <div className="flex items-center gap-2 text-sm">
                            <QrCode className="h-4 w-4 text-muted-foreground" />
                            <span>Plot #{selectedVisit.plotNumber}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(selectedVisit.timeSlot.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {selectedVisit.timeSlot.startTime} - {selectedVisit.timeSlot.endTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedVisit.notes && (
                      <div>
                        <h3 className="font-medium">Notes</h3>
                        <p className="mt-1 text-sm">{selectedVisit.notes}</p>
                      </div>
                    )}

                    {selectedVisit.status === "approved" ? (
                      <div className="rounded-md bg-green-50 p-4 text-green-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-medium">Visit Approved</span>
                        </div>
                        <p className="mt-1 text-sm">
                          Your visit has been approved. Please present the QR code at the entrance on the day of your
                          visit.
                        </p>
                      </div>
                    ) : selectedVisit.status === "pending" ? (
                      <div className="rounded-md bg-yellow-50 p-4 text-yellow-800">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          <span className="font-medium">Pending Approval</span>
                        </div>
                        <p className="mt-1 text-sm">
                          Your visit request is pending approval. You will be notified once it's approved.
                        </p>
                      </div>
                    ) : selectedVisit.status === "rejected" ? (
                      <div className="rounded-md bg-red-50 p-4 text-red-800">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          <span className="font-medium">Visit Rejected</span>
                        </div>
                        <p className="mt-1 text-sm">
                          Unfortunately, your visit request has been rejected. Please contact us for more information.
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    {selectedVisit.status === "approved" && selectedVisit.qrCodeToken ? (
                      <div className="text-center">
                        <div className="mb-4 inline-block rounded-lg bg-white p-4 shadow-md">
                          <QRCodeSVG value={selectedVisit.qrCodeToken} size={200} level="H" />
                        </div>
                        <p className="text-sm text-muted-foreground">Present this QR code at the entrance</p>
                      </div>
                    ) : selectedVisit.status === "pending" ? (
                      <div className="text-center">
                        <div className="mb-4 flex h-[200px] w-[200px] items-center justify-center rounded-lg bg-muted">
                          <QrCode className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">QR code will be generated after approval</p>
                      </div>
                    ) : selectedVisit.status === "rejected" ? (
                      <div className="text-center">
                        <div className="mb-4 flex h-[200px] w-[200px] items-center justify-center rounded-lg bg-red-50">
                          <AlertCircle className="h-16 w-16 text-red-400" />
                        </div>
                        <p className="text-sm text-muted-foreground">No QR code available for rejected visits</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="mb-4 flex h-[200px] w-[200px] items-center justify-center rounded-lg bg-muted">
                          <CheckCircle2 className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">Visit completed</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex h-[400px] flex-col items-center justify-center text-center">
                <QrCode className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="text-lg font-medium">No Visit Selected</h3>
                <p className="mt-2 text-muted-foreground">Select a visit from the list or book a new visit</p>
                <Button className="mt-4" onClick={() => (window.location.href = "/guest/book-visit")}>
                  Book a Visit
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

