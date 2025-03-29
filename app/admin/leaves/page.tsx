"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Search, Calendar, CheckCircle, XCircle, LayoutDashboard, Users, Building, Bell } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { collection, query, orderBy, onSnapshot, type Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"
import type { LeaveRequest } from "@/lib/models"

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Project Management",
    href: "/admin/projects",
    icon: <Building className="h-5 w-5" />,
  },
  {
    title: "Manager Management",
    href: "/admin/managers",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Leave Approvals",
    href: "/admin/leaves",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Visit Approvals",
    href: "/admin/visits",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Announcements",
    href: "/admin/announcements",
    icon: <Bell className="h-5 w-5" />,
  },
]

export default function LeaveApprovalsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)

  // Approval/Rejection
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<LeaveRequest | null>(null)
  const [adminComment, setAdminComment] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    // Set up real-time listener for leave requests
    const leaveRequestsRef = collection(db, "leaveRequests")
    const q = query(leaveRequestsRef, orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requestsList: LeaveRequest[] = []
        snapshot.forEach((doc) => {
          requestsList.push({ id: doc.id, ...doc.data() } as LeaveRequest)
        })
        setLeaveRequests(requestsList)
        applyFilters(requestsList, searchQuery, statusFilter)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching leave requests:", error)
        toast({
          title: "Error",
          description: "Failed to load leave requests. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const applyFilters = (requests: LeaveRequest[], search: string, status: string) => {
    let filtered = requests

    // Apply status filter
    if (status !== "all") {
      filtered = filtered.filter((request) => request.status === status)
    }

    // Apply search filter
    if (search.trim() !== "") {
      const query = search.toLowerCase()
      filtered = filtered.filter(
        (request) =>
          (request.managerName || "").toLowerCase().includes(query) || request.reason.toLowerCase().includes(query),
      )
    }

    setFilteredRequests(filtered)
  }

  useEffect(() => {
    applyFilters(leaveRequests, searchQuery, statusFilter)
  }, [searchQuery, statusFilter, leaveRequests])

  const handleOpenApproveDialog = (request: LeaveRequest) => {
    setCurrentRequest(request)
    setAdminComment("")
    setApproveDialogOpen(true)
  }

  const handleOpenRejectDialog = (request: LeaveRequest) => {
    setCurrentRequest(request)
    setAdminComment("")
    setRejectDialogOpen(true)
  }

  const handleApproveLeave = async () => {
    if (!currentRequest || !user) return

    try {
      setProcessingRequest(currentRequest.id)

      // Call API to approve leave
      const response = await fetch("/api/approve-leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leaveId: currentRequest.id,
          approved: true,
          reason: adminComment,
          approvedBy: user.uid,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve leave request")
      }

      toast({
        title: "Leave Request Approved",
        description: "The leave request has been approved successfully.",
      })

      setApproveDialogOpen(false)
    } catch (error) {
      console.error("Error approving leave request:", error)
      toast({
        title: "Error",
        description: "Failed to approve leave request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingRequest(null)
    }
  }

  const handleRejectLeave = async () => {
    if (!currentRequest || !user) return

    try {
      setProcessingRequest(currentRequest.id)

      // Call API to reject leave
      const response = await fetch("/api/approve-leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leaveId: currentRequest.id,
          approved: false,
          reason: adminComment,
          approvedBy: user.uid,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject leave request")
      }

      toast({
        title: "Leave Request Rejected",
        description: "The leave request has been rejected.",
      })

      setRejectDialogOpen(false)
    } catch (error) {
      console.error("Error rejecting leave request:", error)
      toast({
        title: "Error",
        description: "Failed to reject leave request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingRequest(null)
    }
  }

  const formatDate = (dateString: string | Timestamp) => {
    if (!dateString) return "N/A"

    let date: Date

    if (typeof dateString === "string") {
      date = new Date(dateString)
    } else {
      try {
        date = dateString.toDate()
      } catch (error) {
        console.error("Error converting timestamp:", error)
        return "Invalid Date"
      }
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateDuration = (startDate: string | Timestamp, endDate: string | Timestamp) => {
    let start: Date
    let end: Date

    if (typeof startDate === "string") {
      start = new Date(startDate)
    } else {
      start = startDate.toDate()
    }

    if (typeof endDate === "string") {
      end = new Date(endDate)
    } else {
      end = endDate.toDate()
    }

    // Calculate difference in days
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays + (diffDays === 1 ? " day" : " days")
  }

  return (
    <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
      <AppShell navItems={navItems} title="Admin Dashboard">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leave Approvals</h1>
            <p className="text-muted-foreground">Manage and approve leave requests from managers</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Leave Requests</CardTitle>
                <CardDescription>Review and approve leave requests</CardDescription>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search requests..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">No leave requests found</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Manager</TableHead>
                      <TableHead>Leave Period</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="font-medium">{request.managerName || "Unknown Manager"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(request.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span>to</span> {formatDate(request.endDate)}
                          </div>
                        </TableCell>
                        <TableCell>{calculateDuration(request.startDate, request.endDate)}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">{request.reason}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              request.status === "approved"
                                ? "bg-green-500"
                                : request.status === "pending"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }
                          >
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(request.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          {request.status === "pending" ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleOpenApproveDialog(request)}
                                disabled={processingRequest === request.id}
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleOpenRejectDialog(request)}
                                disabled={processingRequest === request.id}
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="outline" className="ml-auto">
                              {request.status === "approved" ? "Approved" : "Rejected"}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approve Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Leave Request</DialogTitle>
              <DialogDescription>Review and approve this leave request.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Leave Request Details</h3>
                <div className="rounded-md bg-muted p-3">
                  <div className="font-medium">{currentRequest?.managerName}</div>
                  <div className="mt-1 text-sm">
                    {formatDate(currentRequest?.startDate || "")} to {formatDate(currentRequest?.endDate || "")}
                  </div>
                  <div className="mt-1 text-sm">
                    <span className="font-medium">Reason:</span> {currentRequest?.reason}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Admin Comment (Optional)</h3>
                <Textarea
                  placeholder="Add any comments or notes about this approval..."
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApproveLeave} disabled={processingRequest === currentRequest?.id}>
                {processingRequest === currentRequest?.id ? "Processing..." : "Approve Leave"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Leave Request</DialogTitle>
              <DialogDescription>Provide a reason for rejecting this leave request.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Leave Request Details</h3>
                <div className="rounded-md bg-muted p-3">
                  <div className="font-medium">{currentRequest?.managerName}</div>
                  <div className="mt-1 text-sm">
                    {formatDate(currentRequest?.startDate || "")} to {formatDate(currentRequest?.endDate || "")}
                  </div>
                  <div className="mt-1 text-sm">
                    <span className="font-medium">Reason:</span> {currentRequest?.reason}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Reason for Rejection</h3>
                <Textarea
                  placeholder="Provide a reason for rejecting this leave request..."
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectLeave}
                disabled={processingRequest === currentRequest?.id || !adminComment.trim()}
              >
                {processingRequest === currentRequest?.id ? "Processing..." : "Reject Leave"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />
      </AppShell>
    </ProtectedRoute>
  )
}

