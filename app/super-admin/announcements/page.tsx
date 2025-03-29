"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Megaphone, Users, Settings, BarChart } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { createAnnouncement, getAnnouncements, deleteAnnouncement } from "@/lib/firebase-service"
import type { Announcement } from "@/lib/models"

const navItems = [
  {
    title: "Admin Management",
    href: "/super-admin/admin-management",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Global Configuration",
    href: "/super-admin/global-config",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    title: "Global Announcements",
    href: "/super-admin/announcements",
    icon: <BarChart className="h-5 w-5" />,
  },
]

const roleOptions = [
  { id: "superadmin", label: "Super Admins" },
  { id: "admin", label: "Admins" },
  { id: "manager", label: "Managers" },
  { id: "client", label: "Clients" },
  { id: "guest", label: "Guests" },
]

export default function GlobalAnnouncementsPage() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [newAnnouncementOpen, setNewAnnouncementOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetRoles: [] as string[],
    scheduleForLater: false,
  })

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const data = await getAnnouncements()
        setAnnouncements(data)
      } catch (error) {
        console.error("Error loading announcements:", error)
        toast({
          title: "Error loading announcements",
          description: "Failed to load announcements. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadAnnouncements()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      targetRoles: checked ? [...prev.targetRoles, roleId] : prev.targetRoles.filter((id) => id !== roleId),
    }))
  }

  const handleSelectAllRoles = () => {
    if (formData.targetRoles.length === roleOptions.length) {
      setFormData((prev) => ({ ...prev, targetRoles: [] }))
    } else {
      setFormData((prev) => ({ ...prev, targetRoles: roleOptions.map((role) => role.id) }))
    }
  }

  const handleCreateAnnouncement = async () => {
    if (!user) return

    if (!formData.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please provide a title for the announcement.",
        variant: "destructive",
      })
      return
    }

    if (!formData.message.trim()) {
      toast({
        title: "Missing message",
        description: "Please provide a message for the announcement.",
        variant: "destructive",
      })
      return
    }

    if (formData.targetRoles.length === 0) {
      toast({
        title: "No target roles selected",
        description: "Please select at least one role to target with this announcement.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const announcementData = {
        title: formData.title,
        message: formData.message,
        targetRoles: formData.targetRoles,
        createdBy: user.uid,
      }

      if (formData.scheduleForLater && date) {
        announcementData.publishAt = date.toISOString()
      }

      await createAnnouncement(announcementData)

      toast({
        title: "Announcement created",
        description: formData.scheduleForLater
          ? `Your announcement has been scheduled for ${format(date!, "PPP")}`
          : "Your announcement has been published",
      })

      // Reset form
      setFormData({
        title: "",
        message: "",
        targetRoles: [],
        scheduleForLater: false,
      })
      setDate(undefined)
      setNewAnnouncementOpen(false)

      // Refresh announcements
      const updatedAnnouncements = await getAnnouncements()
      setAnnouncements(updatedAnnouncements)
    } catch (error) {
      console.error("Error creating announcement:", error)
      toast({
        title: "Error creating announcement",
        description: "Failed to create announcement. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAnnouncement = async () => {
    if (!selectedAnnouncement) return

    setLoading(true)

    try {
      await deleteAnnouncement(selectedAnnouncement.id)

      toast({
        title: "Announcement deleted",
        description: "The announcement has been deleted successfully.",
      })

      // Refresh announcements
      const updatedAnnouncements = await getAnnouncements()
      setAnnouncements(updatedAnnouncements)
    } catch (error) {
      console.error("Error deleting announcement:", error)
      toast({
        title: "Error deleting announcement",
        description: "Failed to delete announcement. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  const isScheduled = (announcement: Announcement) => {
    if (!announcement.publishAt) return false

    const publishDate =
      typeof announcement.publishAt === "string" ? new Date(announcement.publishAt) : announcement.publishAt.toDate()

    return publishDate > new Date()
  }

  const getAnnouncementStatus = (announcement: Announcement) => {
    if (isScheduled(announcement)) {
      const publishDate =
        typeof announcement.publishAt === "string" ? new Date(announcement.publishAt) : announcement.publishAt.toDate()

      return (
        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          Scheduled for {format(publishDate, "PPP")}
        </span>
      )
    }

    return (
      <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-300">
        Published
      </span>
    )
  }

  return (
    <ProtectedRoute requiredRoles={["superadmin"]}>
      <AppShell navItems={navItems} title="Super Admin Dashboard">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Global Announcements</h1>
            <p className="text-muted-foreground">Create and manage system-wide announcements</p>
          </div>
          <Dialog open={newAnnouncementOpen} onOpenChange={setNewAnnouncementOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                <span>New Announcement</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create Global Announcement</DialogTitle>
                <DialogDescription>
                  Create an announcement that will be visible to selected user roles across the system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} maxLength={100} />
                  <p className="text-xs text-muted-foreground">{formData.title.length}/100 characters</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground">{formData.message.length}/2000 characters</p>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Target Audience</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAllRoles}
                      className="h-auto p-0 text-xs text-muted-foreground"
                    >
                      {formData.targetRoles.length === roleOptions.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {roleOptions.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={formData.targetRoles.includes(role.id)}
                          onCheckedChange={(checked) => handleRoleToggle(role.id, checked as boolean)}
                        />
                        <Label htmlFor={`role-${role.id}`} className="text-sm font-normal">
                          {role.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="schedule"
                      checked={formData.scheduleForLater}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, scheduleForLater: checked as boolean }))
                      }
                    />
                    <Label htmlFor="schedule" className="text-sm font-normal">
                      Schedule for later
                    </Label>
                  </div>
                  {formData.scheduleForLater && (
                    <div className="mt-2">
                      <Label htmlFor="date" className="mb-2 block">
                        Publication Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewAnnouncementOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAnnouncement} disabled={loading}>
                  {formData.scheduleForLater ? "Schedule Announcement" : "Publish Announcement"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Announcements</CardTitle>
            <CardDescription>View and manage global announcements</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Target Audience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">{announcement.title}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {announcement.targetRoles.map((role) => (
                            <span
                              key={role}
                              className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{getAnnouncementStatus(announcement)}</TableCell>
                      <TableCell>
                        {new Date(
                          typeof announcement.createdAt === "string"
                            ? announcement.createdAt
                            : announcement.createdAt.toDate(),
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog
                          open={deleteDialogOpen && selectedAnnouncement?.id === announcement.id}
                          onOpenChange={(open) => {
                            if (!open) setDeleteDialogOpen(false)
                          }}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => {
                                setSelectedAnnouncement(announcement)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the announcement "{selectedAnnouncement?.title}". This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteAnnouncement}
                                className="bg-red-500 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {announcements.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No announcements found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Toaster />
      </AppShell>
    </ProtectedRoute>
  )
}

