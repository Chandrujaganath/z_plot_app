"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Star, StarIcon, MessageSquare } from "lucide-react"
import { getUserVisitRequests, getVisitRequest, submitFeedback, getUserFeedback } from "@/lib/firebase-service"
import type { VisitRequest, Feedback } from "@/lib/models"
import { useAuth } from "@/lib/auth-context"
import { Label } from "@/components/ui/label"

export default function ClientFeedbackPage() {
  const [visits, setVisits] = useState<VisitRequest[]>([])
  const [selectedVisit, setSelectedVisit] = useState<VisitRequest | null>(null)
  const [feedbackType, setFeedbackType] = useState<"visit" | "service">("service")
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [previousFeedback, setPreviousFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Check if visitId is in URL params
        const visitId = searchParams.get("visitId")
        if (visitId) {
          const visit = await getVisitRequest(visitId)
          if (visit && visit.userId === user.uid) {
            setSelectedVisit(visit)
            setFeedbackType("visit")
          }
        }

        // Get all user's completed visits
        const visitsData = await getUserVisitRequests(user.uid)
        const completedVisits = visitsData.filter(
          (visit) => visit.status === "checked-in" || visit.status === "completed",
        )
        setVisits(completedVisits)

        // Get previous feedback
        const feedbackData = await getUserFeedback(user.uid)
        setPreviousFeedback(feedbackData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, searchParams])

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

    if (feedbackType === "visit" && !selectedVisit) {
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

    if (!comment) {
      toast({
        title: "Error",
        description: "Please provide a comment.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const feedbackDataToSubmit: Omit<Feedback, "id" | "createdAt"> = {
        userId: user.uid,
        rating,
        comment,
        type: feedbackType,
      }

      if (feedbackType === "visit" && selectedVisit) {
        feedbackDataToSubmit.visitId = selectedVisit.id
      }

      await submitFeedback(feedbackDataToSubmit)

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      })

      // Reset form
      setRating(0)
      setComment("")

      // Refresh feedback
      const updatedFeedbackData = await getUserFeedback(user.uid)
      setPreviousFeedback(updatedFeedbackData)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground">Share your experience with us</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Submit Feedback</CardTitle>
            <CardDescription>Your feedback helps us improve our services</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="feedbackType">Feedback Type</Label>
                  <Select value={feedbackType} onValueChange={(value) => setFeedbackType(value as "visit" | "service")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select feedback type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">General Service Feedback</SelectItem>
                      <SelectItem value="visit">Visit Experience Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {feedbackType === "visit" && (
                  <div className="space-y-2">
                    <Label htmlFor="visit">Select Visit</Label>
                    <Select
                      value={selectedVisit?.id || ""}
                      onValueChange={(value) => {
                        const visit = visits.find((v) => v.id === value)
                        setSelectedVisit(visit || null)
                      }}
                      disabled={visits.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a visit" />
                      </SelectTrigger>
                      <SelectContent>
                        {visits.map((visit) => (
                          <SelectItem key={visit.id} value={visit.id}>
                            {visit.projectName} - {formatDate(visit.timeSlot.date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {visits.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        You don't have any completed visits to provide feedback for.
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <div className="flex items-center gap-2 mt-2">
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

                <div className="space-y-2">
                  <Label htmlFor="comment">Comments</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with us..."
                    className="min-h-[150px]"
                    required
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={submitting || rating === 0 || !comment || (feedbackType === "visit" && !selectedVisit)}
              onClick={handleSubmit}
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Previous Feedback</CardTitle>
            <CardDescription>Feedback you've submitted in the past</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : previousFeedback.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No feedback history found</p>
                <p className="mt-1 text-sm text-muted-foreground">Your feedback history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {previousFeedback.map((feedback) => (
                  <div key={feedback.id} className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium capitalize">{feedback.type} Feedback</div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 text-sm">{feedback.comment}</div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Submitted on {formatDate(feedback.createdAt as string)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Toaster />
    </div>
  )
}

