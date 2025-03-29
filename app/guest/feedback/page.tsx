"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Star, StarIcon } from "lucide-react"
import { getUserVisitRequests, getVisitRequest, submitFeedback } from "@/lib/firebase-service"
import type { VisitRequest } from "@/lib/models"
import { useAuth } from "@/lib/auth-context"

export default function FeedbackPage() {
  const [visits, setVisits] = useState<VisitRequest[]>([])
  const [selectedVisit, setSelectedVisit] = useState<VisitRequest | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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

        // Get all user's completed visits
        const visitsData = await getUserVisitRequests(user.uid)
        const completedVisits = visitsData.filter(
          (visit) => visit.status === "checked-in" || visit.status === "completed",
        )
        setVisits(completedVisits)

        // If no visit is selected yet, select the most recent one
        if (!selectedVisit && completedVisits.length > 0) {
          setSelectedVisit(completedVisits[0])
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit feedback.",
        variant: "destructive",
      })
      return
    }

    if (!selectedVisit) {
      toast({
        title: "Error",
        description: "Please select a visit to provide feedback for.",
        variant: "destructive",
      })
      return
    }

    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please provide a rating.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      await submitFeedback({
        visitId: selectedVisit.id,
        userId: user.uid,
        rating,
        comment,
      })

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      })

      // Reset form
      setRating(0)
      setComment("")

      // Refresh visits
      const visitsData = await getUserVisitRequests(user.uid)
      const completedVisits = visitsData.filter(
        (visit) => visit.status === "checked-in" || visit.status === "completed",
      )
      setVisits(completedVisits)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground">Share your experience with us</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Visits</CardTitle>
              <CardDescription>Select a visit to provide feedback</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              ) : visits.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <Star className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No completed visits found</p>
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
                      <div className="font-medium">{visit.projectName}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {new Date(visit.timeSlot.date).toLocaleDateString()}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground capitalize">Status: {visit.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Experience</CardTitle>
              <CardDescription>Your feedback helps us improve our services</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedVisit ? (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 font-medium">Visit Details</h3>
                      <div className="rounded-md bg-muted p-4">
                        <div className="font-medium">{selectedVisit.projectName}</div>
                        {selectedVisit.plotNumber && (
                          <div className="mt-1 text-sm">Plot #{selectedVisit.plotNumber}</div>
                        )}
                        <div className="mt-1 text-sm">
                          Date: {new Date(selectedVisit.timeSlot.date).toLocaleDateString()}
                        </div>
                        <div className="mt-1 text-sm">
                          Time: {selectedVisit.timeSlot.startTime} - {selectedVisit.timeSlot.endTime}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-4 font-medium">Rating</h3>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="rounded-full p-1 focus:outline-none"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                          >
                            {star <= (hoverRating || rating) ? (
                              <StarIcon className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <Star className="h-8 w-8 text-muted-foreground" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 font-medium">Comments</h3>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with us..."
                        className="min-h-[150px]"
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center text-center">
                  <Star className="mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No Visit Selected</h3>
                  <p className="mt-2 text-muted-foreground">Select a visit from the list to provide feedback</p>
                </div>
              )}
            </CardContent>
            {selectedVisit && (
              <CardFooter>
                <Button type="submit" className="w-full" disabled={submitting || rating === 0} onClick={handleSubmit}>
                  {submitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      <Toaster />
    </div>
  )
}

