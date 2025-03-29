"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Star, StarIcon, Calendar, ChevronDown, CheckCircle, Building, User } from "lucide-react"
import { getUserVisitRequests, getVisitRequest, submitFeedback } from "@/lib/firebase-service"
import type { VisitRequest } from "@/lib/models"
import { useAuth } from "@/lib/auth-context"
import { motion, AnimatePresence } from "framer-motion"

export default function FeedbackPage() {
  const [visits, setVisits] = useState<VisitRequest[]>([])
  const [selectedVisit, setSelectedVisit] = useState<VisitRequest | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
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
          <h1 className="text-2xl font-bold tracking-tight mb-1">Share Feedback</h1>
          <p className="text-blue-100 text-sm">Help us improve with your valuable insights</p>
        </div>
      </motion.div>

      {/* Mobile visit selector */}
      <div className="md:hidden">
        <Button 
          variant="outline" 
          className="w-full justify-between border-blue-100 shadow-sm rounded-lg"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="flex items-center">
            <Building className="mr-2 h-4 w-4 text-blue-500" />
            <span>{selectedVisit ? selectedVisit.projectName : "Select a Visit"}</span>
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
                  <p className="text-muted-foreground text-sm">No completed visits found</p>
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
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(visit.timeSlot.date)}</span>
                          </div>
                        </div>
                        <div className="text-xs capitalize text-muted-foreground">
                          {visit.status}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="hidden md:block md:col-span-1">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle>Your Visits</CardTitle>
              <CardDescription>Select a visit to provide feedback</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>
              ) : visits.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <Star className="mb-2 h-8 w-8 text-blue-300" />
                  <p className="text-muted-foreground">No completed visits found</p>
                  <Button 
                    variant="link" 
                    className="mt-2 text-blue-600" 
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
                        ${selectedVisit?.id === visit.id ? "border-blue-500 bg-blue-50" : "hover:border-blue-200"}
                      `}
                      onClick={() => setSelectedVisit(visit)}
                    >
                      <div className="font-medium">{visit.projectName}</div>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(visit.timeSlot.date)}</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground capitalize">Status: {visit.status}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle>Share Your Experience</CardTitle>
              <CardDescription>Your feedback helps us improve our services</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedVisit ? (
                <motion.form 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                >
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 font-medium flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-500" />
                        Visit Details
                      </h3>
                      <div className="rounded-lg bg-blue-50 p-4">
                        <div className="font-medium">{selectedVisit.projectName}</div>
                        {selectedVisit.plotNumber && (
                          <div className="mt-1 text-sm">Plot #{selectedVisit.plotNumber}</div>
                        )}
                        <div className="mt-2 flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                          <span>{formatDate(selectedVisit.timeSlot.date)}</span>
                          <span className="mx-2">•</span>
                          <span>{selectedVisit.timeSlot.startTime} - {selectedVisit.timeSlot.endTime}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-4 font-medium flex items-center gap-2">
                        <Star className="h-4 w-4 text-blue-500" />
                        Rating
                      </h3>
                      <motion.div 
                        className="flex items-center justify-center gap-2 mb-2"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            className="rounded-full p-1 focus:outline-none transition-transform"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {star <= (hoverRating || rating) ? (
                              <StarIcon className="h-12 w-12 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <Star className="h-12 w-12 text-slate-200" />
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                      <div className="text-center text-sm text-muted-foreground">
                        {rating === 1 && "Poor"}
                        {rating === 2 && "Fair"}
                        {rating === 3 && "Good"}
                        {rating === 4 && "Very Good"}
                        {rating === 5 && "Excellent"}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        Comments
                      </h3>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with us..."
                        className="min-h-[150px] resize-none border-blue-100 focus-visible:ring-blue-500"
                      />
                    </div>
                  </div>
                </motion.form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex h-[300px] flex-col items-center justify-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <Star className="h-8 w-8 text-blue-300" />
                  </div>
                  <h3 className="text-lg font-medium">No Visit Selected</h3>
                  <p className="mt-2 text-muted-foreground">Select a visit from the list to provide feedback</p>
                  {visits.length === 0 && (
                    <Button 
                      variant="outline"
                      className="mt-6 rounded-full border-blue-100"
                      onClick={() => (window.location.href = "/guest/book-visit")}
                    >
                      Book a Visit First
                    </Button>
                  )}
                </motion.div>
              )}
            </CardContent>
            {selectedVisit && (
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 rounded-full" 
                  disabled={submitting || rating === 0} 
                  onClick={handleSubmit}
                >
                  {submitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Submit Feedback
                    </>
                  )}
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

