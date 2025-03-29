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
import {
  getManagerTask,
  getManagerTasks,
  submitManagerFeedback,
  getManagerFeedbackHistory,
} from "@/lib/firebase-service"
import type { ManagerTask, ManagerFeedback } from "@/lib/models"
import { useAuth } from "@/lib/auth-context"
import type { Timestamp } from "firebase/firestore"

export default function ManagerFeedbackPage() {
  const [tasks, setTasks] = useState<ManagerTask[]>([])
  const [selectedTask, setSelectedTask] = useState<ManagerTask | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [feedbackHistory, setFeedbackHistory] = useState<ManagerFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Check if taskId is in URL params
        const taskId = searchParams.get("taskId")
        if (taskId) {
          const task = await getManagerTask(taskId)
          if (task && task.managerId === user.uid && task.status === "completed" && !task.feedbackSubmitted) {
            setSelectedTask(task)
          }
        }

        // Get completed tasks without feedback
        const { tasks: completedTasks } = await getManagerTasks(user.uid, "completed", 100)

        const tasksWithoutFeedback = completedTasks.filter((task) => !task.feedbackSubmitted)
        setTasks(tasksWithoutFeedback)

        // If no task is selected yet and there are tasks without feedback, select the first one
        if (!selectedTask && tasksWithoutFeedback.length > 0 && !taskId) {
          setSelectedTask(tasksWithoutFeedback[0])
        }

        // Get feedback history
        const feedbackData = await getManagerFeedbackHistory(user.uid)
        setFeedbackHistory(feedbackData)
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
  }, [user, searchParams, selectedTask])

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

    if (!selectedTask) {
      toast({
        title: "Error",
        description: "Please select a task to provide feedback for.",
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

      const feedbackData: Omit<ManagerFeedback, "id" | "createdAt"> = {
        managerId: user.uid,
        managerName: user.displayName || "",
        taskId: selectedTask.id,
        taskType: selectedTask.taskType,
        rating,
        comment,
      }

      await submitManagerFeedback(feedbackData)

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      })

      // Reset form
      setRating(0)
      setComment("")

      // Remove the task from the list
      setTasks((prev) => prev.filter((task) => task.id !== selectedTask.id))
      setSelectedTask(null)

      // Add to feedback history
      const newFeedback: ManagerFeedback = {
        id: "temp",
        ...feedbackData,
        createdAt: new Date().toISOString(),
      }
      setFeedbackHistory((prev) => [newFeedback, ...prev])
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

  const formatDate = (dateString: string | Timestamp) => {
    if (!dateString) return "N/A"

    const date = typeof dateString === "string" ? new Date(dateString) : dateString.toDate?.() || new Date()

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Task Feedback</h1>
        <p className="text-muted-foreground">Provide feedback on completed tasks</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Submit Feedback</CardTitle>
            <CardDescription>Your feedback helps improve our processes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Select Task</h3>
                  <Select
                    value={selectedTask?.id || ""}
                    onValueChange={(value) => {
                      const task = tasks.find((t) => t.id === value)
                      setSelectedTask(task || null)
                    }}
                    disabled={loading || tasks.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a task" />
                    </SelectTrigger>
                    <SelectContent>
                      {tasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {tasks.length === 0 && !loading && (
                    <p className="text-sm text-muted-foreground">No completed tasks found that require feedback.</p>
                  )}
                </div>

                {selectedTask && (
                  <div className="rounded-md bg-muted p-4">
                    <div className="font-medium">{selectedTask.title}</div>
                    <div className="mt-1 text-sm">{selectedTask.description}</div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Completed:</span>{" "}
                      {formatDate(selectedTask.completedAt || selectedTask.updatedAt)}
                    </div>
                    {selectedTask.projectName && (
                      <div className="mt-1 text-sm">
                        <span className="font-medium">Project:</span> {selectedTask.projectName}
                        {selectedTask.plotNumber && ` - Plot #${selectedTask.plotNumber}`}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium">Rating</h3>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="rounded-full p-1 focus:outline-none"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        disabled={!selectedTask}
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
                  <h3 className="text-sm font-medium">Comments</h3>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this task..."
                    className="min-h-[150px]"
                    disabled={!selectedTask}
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
              disabled={submitting || !selectedTask || rating === 0 || !comment}
              onClick={handleSubmit}
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Feedback History</CardTitle>
            <CardDescription>Feedback you've submitted for completed tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : feedbackHistory.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No feedback history found</p>
                <p className="mt-1 text-sm text-muted-foreground">Your feedback history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {feedbackHistory.map((feedback) => (
                  <div key={feedback.id} className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium capitalize">{feedback.taskType.replace("_", " ")} Task</div>
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
                      Submitted on {formatDate(feedback.createdAt)}
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

