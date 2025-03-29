"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { FileText, Home, MapPin, DollarSign, Calendar } from "lucide-react"
import {
  getClientOwnedPlots,
  getPlotDetails,
  getProject,
  createSellRequest,
  getClientSellRequests,
} from "@/lib/firebase-service"
import type { Plot, Project, SellRequest } from "@/lib/models"
import { useAuth } from "@/lib/auth-context"

export default function SellPlotRequestPage() {
  const [plots, setPlots] = useState<Plot[]>([])
  const [selectedPlotId, setSelectedPlotId] = useState<string>("")
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [reason, setReason] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const { user } = useAuth()
  const router = useRouter()
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

          // Get plot details
          const plotDetails = await getPlotDetails(plotId)
          setSelectedPlot(plotDetails)

          // Get project details
          if (plotDetails) {
            const projectDetails = await getProject(plotDetails.projectId)
            setProject(projectDetails)
          }
        }

        // Get existing sell requests
        const sellRequestsData = await getClientSellRequests(user.uid)
        setSellRequests(sellRequestsData)
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

  const handlePlotChange = async (plotId: string) => {
    try {
      setLoading(true)
      setSelectedPlotId(plotId)

      // Get plot details
      const plotDetails = await getPlotDetails(plotId)
      setSelectedPlot(plotDetails)

      // Get project details
      if (plotDetails) {
        const projectDetails = await getProject(plotDetails.projectId)
        setProject(projectDetails)
      }
    } catch (error) {
      console.error("Error fetching plot details:", error)
      toast({
        title: "Error",
        description: "Failed to load plot details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a sell request.",
        variant: "destructive",
      })
      return
    }

    if (!selectedPlot) {
      toast({
        title: "Error",
        description: "Please select a plot.",
        variant: "destructive",
      })
      return
    }

    if (!reason) {
      toast({
        title: "Error",
        description: "Please provide a reason for selling.",
        variant: "destructive",
      })
      return
    }

    // Check if there's already a pending sell request for this plot
    const existingRequest = sellRequests.find(
      (req) => req.plotId === selectedPlot.id && (req.status === "pending" || req.status === "in-process"),
    )

    if (existingRequest) {
      toast({
        title: "Request Already Exists",
        description: "You already have a pending sell request for this plot.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const sellRequestData: Omit<SellRequest, "id" | "createdAt" | "updatedAt"> = {
        clientId: user.uid,
        plotId: selectedPlot.id,
        projectId: selectedPlot.projectId,
        plotNumber: selectedPlot.plotNumber,
        reason,
        additionalNotes,
        status: "pending",
      }

      await createSellRequest(sellRequestData)

      toast({
        title: "Sell Request Submitted",
        description: "Your request to sell this plot has been submitted successfully.",
      })

      // Redirect to dashboard
      router.push("/client/dashboard")
    } catch (error) {
      console.error("Error submitting sell request:", error)
      toast({
        title: "Error",
        description: "Failed to submit sell request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString?: string | any) => {
    if (!dateString) return "N/A"

    const date = typeof dateString === "string" ? new Date(dateString) : dateString.toDate?.() || new Date()

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sell Plot Request</h1>
        <p className="text-muted-foreground">Submit a request to sell your property</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sell Request Form</CardTitle>
            <CardDescription>Fill out this form to request selling your plot</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plot">Select Plot to Sell</Label>
                  <Select
                    value={selectedPlotId}
                    onValueChange={handlePlotChange}
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

                {selectedPlot && project && (
                  <div className="rounded-md bg-muted p-4">
                    <h3 className="font-medium">Selected Plot Details</h3>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Plot #{selectedPlot.plotNumber} in {project.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedPlot.address || project.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>Value: ${selectedPlot.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Purchased: {formatDate(selectedPlot.purchaseDate)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Selling</Label>
                  <Select value={reason} onValueChange={setReason} disabled={loading || !selectedPlot}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Relocation">Relocation</SelectItem>
                      <SelectItem value="Financial Reasons">Financial Reasons</SelectItem>
                      <SelectItem value="Investment Opportunity">Investment Opportunity</SelectItem>
                      <SelectItem value="Property Exchange">Property Exchange</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="additionalNotes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Provide any additional information about your sell request"
                    className="min-h-[120px]"
                  />
                </div>

                <div className="rounded-md bg-amber-50 p-4 text-amber-800">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Important Information</span>
                  </div>
                  <p className="mt-1 text-sm">
                    Submitting a sell request does not guarantee approval. Your request will be reviewed by our team,
                    and you will be notified of the decision.
                  </p>
                  <p className="mt-1 text-sm">
                    If approved, our team will contact you to discuss the next steps in the selling process.
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || submitting || !selectedPlot || !reason}
              onClick={handleSubmit}
            >
              {submitting ? "Submitting..." : "Submit Sell Request"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Sell Requests</CardTitle>
            <CardDescription>Status of your previous sell requests</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : sellRequests.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No sell requests found</p>
                <p className="mt-1 text-sm text-muted-foreground">Your sell request history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sellRequests.map((request) => {
                  const statusColor =
                    request.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : request.status === "in-process"
                        ? "bg-blue-100 text-blue-800"
                        : request.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"

                  return (
                    <div key={request.id} className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Plot #{request.plotNumber}</div>
                        <div className={`rounded-full px-2 py-1 text-xs capitalize ${statusColor}`}>
                          {request.status}
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </div>
                      {request.additionalNotes && (
                        <div className="mt-1 text-sm">
                          <span className="font-medium">Notes:</span> {request.additionalNotes}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-muted-foreground">
                        Submitted on {formatDate(request.createdAt)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Toaster />
    </div>
  )
}

