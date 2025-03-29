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
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  LayoutDashboard,
  Users,
  Building,
  Bell,
  UserPlus,
  MapPin,
} from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  type Timestamp,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import type { Project } from "@/lib/models"

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

interface Manager {
  id: string
  email: string
  displayName: string
  phone?: string
  role: string
  status: "active" | "inactive"
  assignedProjectId?: string
  assignedProjectName?: string
  createdAt: Timestamp | string
}

export default function ManagerManagementPage() {
  const [managers, setManagers] = useState<Manager[]>([])
  const [filteredManagers, setFilteredManagers] = useState<Manager[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")

  // Manager assignment
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [currentManager, setCurrentManager] = useState<Manager | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")

  // Add manager
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newManagerEmail, setNewManagerEmail] = useState("")
  const [newManagerName, setNewManagerName] = useState("")
  const [newManagerPhone, setNewManagerPhone] = useState("")
  const [processingManager, setProcessingManager] = useState<string | null>(null)

  useEffect(() => {
    // Set up real-time listener for managers
    const managersRef = collection(db, "users")
    const q = query(managersRef, where("role", "==", "manager"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const managersList: Manager[] = []
        snapshot.forEach((doc) => {
          managersList.push({ id: doc.id, ...doc.data() } as Manager)
        })
        setManagers(managersList)
        applyFilters(managersList, searchQuery, statusFilter)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching managers:", error)
        toast({
          title: "Error",
          description: "Failed to load managers. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
      },
    )

    // Fetch projects
    const fetchProjects = async () => {
      try {
        const projectsRef = collection(db, "projects")
        const q = query(projectsRef, where("status", "in", ["active", "upcoming"]))
        const snapshot = await getDocs(q)

        const projectsList: Project[] = []
        snapshot.forEach((doc) => {
          projectsList.push({ id: doc.id, ...doc.data() } as Project)
        })

        setProjects(projectsList)
      } catch (error) {
        console.error("Error fetching projects:", error)
      }
    }

    fetchProjects()

    return () => unsubscribe()
  }, [])

  const applyFilters = (managers: Manager[], search: string, status: string) => {
    let filtered = managers

    // Apply status filter
    if (status !== "all") {
      filtered = filtered.filter((manager) => manager.status === status)
    }

    // Apply search filter
    if (search.trim() !== "") {
      const query = search.toLowerCase()
      filtered = filtered.filter(
        (manager) =>
          (manager.displayName || "").toLowerCase().includes(query) ||
          manager.email.toLowerCase().includes(query) ||
          (manager.phone || "").toLowerCase().includes(query) ||
          (manager.assignedProjectName || "").toLowerCase().includes(query),
      )
    }

    setFilteredManagers(filtered)
  }

  useEffect(() => {
    applyFilters(managers, searchQuery, statusFilter)
  }, [searchQuery, statusFilter, managers])

  const handleOpenAssignDialog = (manager: Manager) => {
    setCurrentManager(manager)
    setSelectedProjectId(manager.assignedProjectId || "")
    setAssignDialogOpen(true)
  }

  const handleAssignProject = async () => {
    if (!currentManager) return

    try {
      setProcessingManager(currentManager.id)

      // Get project name
      let projectName = ""
      if (selectedProjectId) {
        const project = projects.find((p) => p.id === selectedProjectId)
        projectName = project?.name || ""
      }

      // Update manager with assigned project
      const managerRef = doc(db, "users", currentManager.id)
      await updateDoc(managerRef, {
        assignedProjectId: selectedProjectId || null,
        assignedProjectName: projectName || null,
        updatedAt: serverTimestamp(),
      })

      toast({
        title: "Project Assigned",
        description: selectedProjectId
          ? `Manager has been assigned to ${projectName}.`
          : "Manager has been unassigned from project.",
      })

      setAssignDialogOpen(false)
    } catch (error) {
      console.error("Error assigning project:", error)
      toast({
        title: "Error",
        description: "Failed to assign project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingManager(null)
    }
  }

  const handleAddManager = async () => {
    if (!newManagerEmail || !newManagerName) {
      toast({
        title: "Missing Information",
        description: "Please provide email and name for the new manager.",
        variant: "destructive",
      })
      return
    }

    try {
      setProcessingManager("new")

      // Check if email already exists
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("email", "==", newManagerEmail))
      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        toast({
          title: "Email Already Exists",
          description: "A user with this email already exists.",
          variant: "destructive",
        })
        return
      }

      // Create new manager
      await addDoc(usersRef, {
        email: newManagerEmail,
        displayName: newManagerName,
        phone: newManagerPhone || null,
        role: "manager",
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      toast({
        title: "Manager Added",
        description: "New manager has been added successfully.",
      })

      // Reset form
      setNewManagerEmail("")
      setNewManagerName("")
      setNewManagerPhone("")
      setAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding manager:", error)
      toast({
        title: "Error",
        description: "Failed to add manager. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingManager(null)
    }
  }

  const handleToggleManagerStatus = async (manager: Manager) => {
    try {
      setProcessingManager(manager.id)

      const newStatus = manager.status === "active" ? "inactive" : "active"

      // Update manager status
      const managerRef = doc(db, "users", manager.id)
      await updateDoc(managerRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      })

      toast({
        title: "Status Updated",
        description: `Manager status has been set to ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating manager status:", error)
      toast({
        title: "Error",
        description: "Failed to update manager status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingManager(null)
    }
  }

  return (
    <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
      <AppShell navItems={navItems} title="Admin Dashboard">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manager Management</h1>
            <p className="text-muted-foreground">Manage and assign managers to projects</p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4" />
            <span>Add New Manager</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Managers</CardTitle>
                <CardDescription>View and manage project managers</CardDescription>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search managers..."
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
                    <SelectItem value="all">All Managers</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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
            ) : filteredManagers.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">No managers found</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Assigned Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredManagers.map((manager) => (
                      <TableRow key={manager.id}>
                        <TableCell>
                          <div className="font-medium">{manager.displayName || "No Name"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{manager.email}</div>
                          {manager.phone && <div className="text-sm text-muted-foreground">{manager.phone}</div>}
                        </TableCell>
                        <TableCell>
                          {manager.assignedProjectName ? (
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span>{manager.assignedProjectName}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={manager.status === "active" ? "bg-green-500" : "bg-red-500"}>
                            {manager.status.charAt(0).toUpperCase() + manager.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenAssignDialog(manager)}
                              disabled={processingManager === manager.id}
                            >
                              <Building className="mr-1 h-4 w-4" />
                              Assign
                            </Button>
                            <Button
                              size="sm"
                              variant={manager.status === "active" ? "destructive" : "outline"}
                              onClick={() => handleToggleManagerStatus(manager)}
                              disabled={processingManager === manager.id}
                            >
                              {manager.status === "active" ? (
                                <>
                                  <XCircle className="mr-1 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Assignment Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Project to Manager</DialogTitle>
              <DialogDescription>Select a project to assign to this manager.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Manager</h3>
                <div className="rounded-md bg-muted p-3">
                  <div className="font-medium">{currentManager?.displayName}</div>
                  <div className="mt-1 text-sm">{currentManager?.email}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Assign Project</h3>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project assigned</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProjectId && (
                  <div className="mt-2 rounded-md bg-muted p-2 text-sm">
                    <div className="font-medium">{projects.find((p) => p.id === selectedProjectId)?.name}</div>
                    <div className="mt-1 flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{projects.find((p) => p.id === selectedProjectId)?.location}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignProject} disabled={processingManager === currentManager?.id}>
                {processingManager === currentManager?.id ? "Processing..." : "Assign Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Manager Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Manager</DialogTitle>
              <DialogDescription>Enter the details for the new manager.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Email</h3>
                <Input
                  placeholder="manager@example.com"
                  value={newManagerEmail}
                  onChange={(e) => setNewManagerEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Name</h3>
                <Input
                  placeholder="John Doe"
                  value={newManagerName}
                  onChange={(e) => setNewManagerName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Phone (Optional)</h3>
                <Input
                  placeholder="+1 (555) 123-4567"
                  value={newManagerPhone}
                  onChange={(e) => setNewManagerPhone(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddManager} disabled={processingManager === "new"}>
                {processingManager === "new" ? "Processing..." : "Add Manager"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />
      </AppShell>
    </ProtectedRoute>
  )
}

