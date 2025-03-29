"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"
import { createLeaveRequest, getManagerLeaveRequests } from "@/lib/firebase-service"
import type { LeaveRequest } from "@/lib/models"
import { useAuth } from "@/lib/auth-context"
import type { Timestamp } from "firebase/firestore"

export default function LeaveRequestPage() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [activeTab, setActiveTab] = useState("new")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      if (!user) return

      try {
        setLoading(true)

        const requests = await getManagerLeaveRequests(user.uid)
        setLeaveRequests(requests)
      } catch (error) {
        console.error("Error fetching leave requests:", error)
        toast({
          title: "Error",
          description: "Failed to load leave requests. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLeaveRequests()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a leave request.",
        variant: "destructive",
      })
      return
    }

    if (!startDate || !endDate || !reason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start > end) {
      toast({
        title: "Error",
        description: "End date must be after start date.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const leaveData: Omit<LeaveRequest, "id" | "createdAt" | "updatedAt" | "status"> = {
        managerId: user.uid,
        managerName: user.displayName || "",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        reason,
      }

      const leaveId = await createLeaveRequest(leaveData)

      // Add to local state
      const newLeaveRequest: LeaveRequest = {
        id: leaveId,
        ...leaveData,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setLeaveRequests((prev) => [newLeaveRequest, ...prev])

      // Reset form
      setStartDate("")
      setEndDate("")
      setReason("")

      // Switch to history tab
      setActiveTab("history")

      toast({
        title: "Leave Request Submitted",
        description: "Your leave request has been submitted successfully.",
      })
    } catch (error) {
      console.error("Error submitting leave request:", error)
      toast({
        title: "Error",
        description: "Failed to submit leave request. Please try again.",
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
      month: "long",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leave Requests</h1>
        <p className="text-muted-foreground">Submit and manage your leave requests</p>
      </div>

      <Tabs defaultValue="new" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="new">New Request</TabsTrigger>
          <TabsTrigger value="history">Request History</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-6">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Submit Leave Request</CardTitle>
                <CardDescription>Fill out this form to request time off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Leave</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide a reason for your leave request..."
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <div className="rounded-md bg-blue-50 p-4 text-blue-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Important Information</span>
                  </div>
                  <p className="mt-1 text-sm">
                    Leave requests must be submitted at least 3 working days in advance for proper planning. Emergency
                    leave requests may be considered on a case-by-case basis.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Leave Request"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Leave Request History</CardTitle>
              <CardDescription>View the status of your previous leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              ) : leaveRequests.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <Calendar className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No leave requests found</p>
                  <p className="mt-1 text-sm text-muted-foreground">Your leave request history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaveRequests.map((leave) => (
                    <div key={leave.id} className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Leave Request</div>
                        <div
                          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs capitalize ${getStatusColor(leave.status)}`}
                        >
                          {getStatusIcon(leave.status)}
                          <span>{leave.status}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Period:</span> {formatDate(leave.startDate)} to{" "}
                        {formatDate(leave.endDate)}
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="font-medium">Reason:</span> {leave.reason}
                      </div>
                      {leave.status === "rejected" && leave.rejectionReason && (
                        <div className="mt-2 text-sm text-red-600">
                          <span className="font-medium">Rejection Reason:</span> {leave.rejectionReason}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-muted-foreground">
                        Submitted on {formatDate(leave.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  )
}

