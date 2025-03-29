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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Search, Calendar, Clock, CheckCircle, XCircle, LayoutDashboard, Users, Building, Bell } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import type { VisitRequest } from "@/lib/models"

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

export default function VisitApprovalsPage() {
  const [visits, setVisits] = useState<VisitRequest[]>([])
  const [filteredVisits, setFilteredVisits] = useState<VisitRequest[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [processingVisit, setProcessingVisit] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")

  // Manager assignment
  const [managers, setManagers] = useState<{ id: string; name: string }[]>([])
  const [selectedManager, setSelectedManager] = useState<string>("")
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [currentVisit, setCurrentVisit] = useState<VisitRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

  useEffect(() => {
    // Set up real-time listener for visit requests
    const visitsRef = collection(db, "visitRequests")
    const q = query(visitsRef, orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const visitsList: VisitRequest[] = []
        snapshot.forEach((doc) => {
          visitsList.push({ id: doc.id, ...doc.data() } as VisitRequest)
        })
        setVisits(visitsList)
        applyFilters(visitsList, searchQuery, statusFilter)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching visits:", error)
        toast({
          title: "Error",
          description: "Failed to load visit requests. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
      },
    )

    // Fetch managers
    const fetchManagers = async () => {
      try {
        const managersRef = collection(db, "users")
        const q = query(managersRef, where("role", "==", "manager"))
        const snapshot = await onSnapshot(q, (snapshot) => {
          const managersList: { id: string; name: string }[] = []
          snapshot.forEach((doc) => {
            const data = doc.data()
            managersList.push({
              id: doc.id,
              name: data.displayName || data.email || "Unknown Manager",
            })
          })
          setManagers(managersList)
        })
      } catch (error) {
        console.error("Error fetching managers:", error)
      }
    }

    fetchManagers()

    return () => unsubscribe()
  }, [])

  const applyFilters = (visits: VisitRequest[], search: string, status: string) => {
    let filtered = visits

    // Apply status filter
    if (status !== "all") {
      filtered = filtered.filter((visit) => visit.status === status)
    }

    // Apply search filter
    if (search.trim() !== "") {
      const query = search.toLowerCase()
      filtered = filtered.filter(
        (visit) =>
          visit.userName.toLowerCase().includes(query) ||
          visit.userEmail.toLowerCase().includes(query) ||
          visit.projectName.toLowerCase().includes(query) ||
          (visit.plotNumber?.toString() || "").includes(query),
      )
    }

    setFilteredVisits(filtered)
  }

  useEffect(() => {
    applyFilters(visits, searchQuery, statusFilter)
  }, [searchQuery, statusFilter, visits])

  const handleOpenAssignDialog = (visit: VisitRequest) => {
    setCurrentVisit(visit)
    setSelectedManager(visit.assignedTo || "")
    setAssignDialogOpen(true)
  }

  const handleOpenRejectDialog = (visit: VisitRequest) => {
    setCurrentVisit(visit)
    setRejectionReason("")
    setRejectDialogOpen(true)
  }

  const handleAssignManager = async () => {
    if (!currentVisit) return

    try {
      setProcessingVisit(currentVisit.id)

      // Get manager name
      let managerName = ""
      if (selectedManager) {
        const manager = managers.find((m) => m.id === selectedManager)
        managerName = manager?.name || ""
      }

      // Update visit with assigned manager
      const visitRef = doc(db, "visitRequests", currentVisit.id)
      await updateDoc(visitRef, {
        status: "approved",
        assignedTo: selectedManager || null,
        assignedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })

      // Call the API to generate QR code token
      const response = await fetch("/api/generate-qr-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ visitId: currentVisit.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve visit")
      }

      // Create a task for the assigned manager
      if (selectedManager) {
        await fetch("/api/assign-task", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            managerId: selectedManager,
            managerName,
            taskType: "site_visit",
            title: `Site Visit: ${currentVisit.projectName}`,
            description: `Guide ${currentVisit.userName} for a site visit at ${currentVisit.projectName}${
              currentVisit.plotNumber ? `, Plot #${currentVisit.plotNumber}` : ""
            } on ${currentVisit.timeSlot.date} at ${currentVisit.timeSlot.startTime}.`,
            priority: "medium",
            dueDate: new Date(currentVisit.timeSlot.date).toISOString(),
            projectId: currentVisit.projectId,
            projectName: currentVisit.projectName,
            plotId: currentVisit.plotId,
            plotNumber: currentVisit.plotNumber,
            clientId: currentVisit.userId,
            clientName: currentVisit.userName,
            visitId: currentVisit.id,
          }),
        })
      }

      toast({
        title: "Visit Approved",
        description: selectedManager
          ? `The visit has been approved and assigned to a manager.`
          : "The visit has been approved.",
      })

      setAssignDialogOpen(false)
    } catch (error) {
      console.error("Error approving visit:", error)
      toast({
        title: "Error",
        description: "Failed to approve visit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingVisit(null)
    }
  }

  const handleRejectVisit = async () => {
    if (!currentVisit) return

    try {
      setProcessingVisit(currentVisit.id)

      const visitRef = doc(db, "visitRequests", currentVisit.id)
      await updateDoc(visitRef, {
        status: "rejected",
        rejectionReason: rejectionReason,
        updatedAt: Timestamp.now(),
      })

      toast({
        title: "Visit Rejected",
        description: "The visit request has been rejected.",
      })

      setRejectDialogOpen(false)
    } catch (error) {
      console.error("Error rejecting visit:", error)
      toast({
        title: "Error",
        description: "Failed to reject visit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingVisit(null)
    }
  }

  return (
    <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
      <AppShell navItems={navItems} title="Admin Dashboard">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Visit Approvals</h1>
            <p className="text-muted-foreground">Manage and approve visit requests</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Visit Requests</CardTitle>
                <CardDescription>Review and approve visit requests from guests</CardDescription>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search visits..."
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
            ) : filteredVisits.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">No visit requests found</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visitor</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Plot</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisits.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell>
                          <div className="font-medium">{visit.userName}</div>
                          <div className="text-sm text-muted-foreground">{visit.userEmail}</div>
                          <div className="text-sm text-muted-foreground">{visit.userPhone}</div>
                        </TableCell>
                        <TableCell>{visit.projectName}</TableCell>
                        <TableCell>{visit.plotNumber ? `Plot #${visit.plotNumber}` : "Not specified"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{visit.timeSlot.date}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {visit.timeSlot.startTime} - {visit.timeSlot.endTime}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              visit.status === "approved"
                                ? "bg-green-500"
                                : visit.status === "pending"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }
                          >
                            {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {visit.assignedTo ? (
                            managers.find((m) => m.id === visit.assignedTo)?.name || "Unknown Manager"
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {visit.createdAt instanceof Timestamp
                            ? visit.createdAt.toDate().toLocaleDateString()
                            : new Date(visit.createdAt as string).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {visit.status === "pending" ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleOpenAssignDialog(visit)}
                                disabled={processingVisit === visit.id}
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleOpenRejectDialog(visit)}
                                disabled={processingVisit === visit.id}
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="outline" className="ml-auto">
                              {visit.status === "approved" ? "Approved" : "Rejected"}
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

        {/* Manager Assignment Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Visit Request</DialogTitle>
              <DialogDescription>
                Assign a manager to handle this visit or approve without assignment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Visit Details</h3>
                <div className="rounded-md bg-muted p-3">
                  <div className="font-medium">{currentVisit?.userName}</div>
                  <div className="mt-1 text-sm">
                    {currentVisit?.projectName}
                    {currentVisit?.plotNumber ? `, Plot #${currentVisit.plotNumber}` : ""}
                  </div>
                  <div className="mt-1 text-sm">
                    {currentVisit?.timeSlot.date} at {currentVisit?.timeSlot.startTime} -{" "}
                    {currentVisit?.timeSlot.endTime}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Assign Manager (Optional)</h3>
                <Select value={selectedManager} onValueChange={setSelectedManager}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No manager assigned</SelectItem>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  If you don't assign a manager, the visit will still be approved but no one will be assigned to handle
                  it.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignManager} disabled={processingVisit === currentVisit?.id}>
                {processingVisit === currentVisit?.id ? "Processing..." : "Approve Visit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rejection Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Visit Request</DialogTitle>
              <DialogDescription>Provide a reason for rejecting this visit request.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Visit Details</h3>
                <div className="rounded-md bg-muted p-3">
                  <div className="font-medium">{currentVisit?.userName}</div>
                  <div className="mt-1 text-sm">
                    {currentVisit?.projectName}
                    {currentVisit?.plotNumber ? `, Plot #${currentVisit.plotNumber}` : ""}
                  </div>
                  <div className="mt-1 text-sm">
                    {currentVisit?.timeSlot.date} at {currentVisit?.timeSlot.startTime} -{" "}
                    {currentVisit?.timeSlot.endTime}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Reason for Rejection (Optional)</h3>
                <Textarea
                  placeholder="Provide a reason for rejecting this visit request..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRejectVisit} disabled={processingVisit === currentVisit?.id}>
                {processingVisit === currentVisit?.id ? "Processing..." : "Reject Visit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />
      </AppShell>
    </ProtectedRoute>
  )
}

