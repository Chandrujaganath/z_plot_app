"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { QrCode, Clock, User, Phone, FileText } from "lucide-react"
import {
  getClientOwnedPlots,
  getActiveVisitorQR,
  createVisitorQR,
  getClientVisitorQRHistory,
} from "@/lib/firebase-service"
import type { Plot, VisitorQR } from "@/lib/models"
import { useAuth } from "@/lib/auth-context"
import { QRCodeSVG } from "qrcode.react" // Changed from default import to named import

export default function GenerateVisitorQRPage() {
  const [plots, setPlots] = useState<Plot[]>([])
  const [selectedPlotId, setSelectedPlotId] = useState<string>("")
  const [visitorName, setVisitorName] = useState("")
  const [visitorPhone, setVisitorPhone] = useState("")
  const [purpose, setPurpose] = useState("")
  const [activeQR, setActiveQR] = useState<VisitorQR | null>(null)
  const [qrHistory, setQrHistory] = useState<VisitorQR[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Get client's owned plots
        const plotsData = await getClientOwnedPlots(user.uid)
        setPlots(plotsData)

        // Check if plotId is in URL params
        const plotId = searchParams.get("plotId")
        if (plotId && plotsData.some((plot) => plot.id === plotId)) {
          setSelectedPlotId(plotId)
        } else if (plotsData.length > 0) {
          setSelectedPlotId(plotsData[0].id)
        }

        // Check for active visitor QR
        const activeQRData = await getActiveVisitorQR(user.uid)
        setActiveQR(activeQRData)

        // Get QR history
        const historyData = await getClientVisitorQRHistory(user.uid)
        setQrHistory(historyData)
      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [user, searchParams])

  const handleGenerateQR = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to generate a visitor QR code.",
        variant: "destructive",
      })
      return
    }

    if (!selectedPlotId) {
      toast({
        title: "Error",
        description: "Please select a plot.",
        variant: "destructive",
      })
      return
    }

    if (!visitorName || !visitorPhone || !purpose) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      // Calculate expiry date (end of today)
      const today = new Date()
      const expiryDate = new Date(today)
      expiryDate.setHours(23, 59, 59, 999)

      const visitorData = {
        clientId: user.uid,
        plotId: selectedPlotId,
        visitorName,
        visitorPhone,
        purpose,
        expiryDate: expiryDate.toISOString(),
        status: "active" as const,
      }

      const { id, qrCodeToken } = await createVisitorQR(visitorData)

      // Update the active QR
      const newActiveQR: VisitorQR = {
        id,
        ...visitorData,
        qrCodeToken,
        createdAt: new Date().toISOString(),
      }

      setActiveQR(newActiveQR)

      // Update history
      setQrHistory([newActiveQR, ...qrHistory])

      // Reset form
      setVisitorName("")
      setVisitorPhone("")
      setPurpose("")

      toast({
        title: "QR Code Generated",
        description: "Visitor QR code has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating visitor QR:", error)
      toast({
        title: "Error",
        description: "Failed to generate visitor QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTimeRemaining = (expiryDate: string) => {
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diff = expiry.getTime() - now.getTime()

    if (diff <= 0) return "Expired"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m remaining`
  }

  const getSelectedPlot = () => {
    return plots.find((plot) => plot.id === selectedPlotId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Generate Visitor QR Code</h1>
        <p className="text-muted-foreground">Create temporary QR codes for your visitors</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Active Visitor QR</CardTitle>
              <CardDescription>
                {activeQR ? "Your current active visitor QR code" : "No active visitor QR code"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              ) : activeQR ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="inline-block rounded-lg bg-white p-4 shadow-md">
                      <QRCodeSVG value={activeQR.qrCodeToken} size={200} level="H" />
                    </div>
                  </div>

                  <div className="rounded-md bg-muted p-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Visitor: {activeQR.visitorName}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>Phone: {activeQR.visitorPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Purpose: {activeQR.purpose}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Expires: {formatDate(activeQR.expiryDate)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-md bg-blue-50 p-3 text-blue-800">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>{getTimeRemaining(activeQR.expiryDate)}</span>
                    </div>
                    <Button variant="outline" size="sm" className="bg-white" onClick={() => window.print()}>
                      Print QR Code
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <QrCode className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No active visitor QR code</p>
                  <p className="text-sm text-muted-foreground mt-1">Generate a new QR code using the form</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>QR Code History</CardTitle>
              <CardDescription>Previously generated visitor QR codes</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-20 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              ) : qrHistory.length === 0 ? (
                <div className="flex h-20 items-center justify-center">
                  <p className="text-muted-foreground">No history found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {qrHistory.map((qr) => {
                    const isExpired = new Date(qr.expiryDate) < new Date()

                    return (
                      <div key={qr.id} className={`rounded-md border p-3 ${isExpired ? "opacity-70" : ""}`}>
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{qr.visitorName}</div>
                          <div
                            className={`text-xs px-2 py-1 rounded-full ${
                              isExpired ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            {isExpired ? "Expired" : "Active"}
                          </div>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">Created: {formatDate(qr.createdAt)}</div>
                        <div className="mt-1 text-sm text-muted-foreground">Purpose: {qr.purpose}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate New Visitor QR</CardTitle>
            <CardDescription>Create a temporary QR code for your visitor</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateQR}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plot">Select Plot</Label>
                  <Select
                    value={selectedPlotId}
                    onValueChange={setSelectedPlotId}
                    disabled={loading || plots.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plot" />
                    </SelectTrigger>
                    <SelectContent>
                      {plots.map((plot) => (
                        <SelectItem key={plot.id} value={plot.id}>
                          Plot #{plot.plotNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPlotId && (
                  <div className="rounded-md bg-muted p-3">
                    <div className="font-medium">Selected Plot</div>
                    <div className="mt-1 text-sm">Plot #{getSelectedPlot()?.plotNumber}</div>
                    <div className="mt-1 text-sm">Size: {getSelectedPlot()?.size} sq ft</div>
                    <div className="mt-1 text-sm">Address: {getSelectedPlot()?.address || "Not specified"}</div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="visitorName">Visitor Name</Label>
                  <Input
                    id="visitorName"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitorPhone">Visitor Phone</Label>
                  <Input
                    id="visitorPhone"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Visit</Label>
                  <Textarea
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Why is this person visiting?"
                    required
                  />
                </div>

                <div className="rounded-md bg-blue-50 p-3 text-blue-800">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">QR Code Validity</span>
                  </div>
                  <p className="mt-1 text-sm">The generated QR code will be valid until the end of today.</p>
                  <p className="mt-1 text-sm">Generating a new QR code will invalidate any existing active QR code.</p>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || submitting || plots.length === 0}
              onClick={handleGenerateQR}
            >
              {submitting ? "Generating..." : "Generate Visitor QR Code"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Toaster />
    </div>
  )
}

