"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Bell, Building, Calendar, Clock, Trash2, Users } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { useAuth } from "@/lib/auth-context"
import { createAnnouncement, getAnnouncements, deleteAnnouncement } from "@/lib/firebase-service"
import type { Announcement } from "@/lib/models"

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: <Building className="h-5 w-5" />,
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

const userRoles = [
  { id: "client", label: "Clients" },
  { id: "manager", label: "Managers" },
  { id: "admin", label: "Admins" },
  { id: "guest", label: "Guests" },
]

export default function AnnouncementsPage() {
  const [activeTab, setActiveTab] = useState("create")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const { user } = useAuth()

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const fetchedAnnouncements = await getAnnouncements()
        setAnnouncements(fetchedAnnouncements)
      } catch (error) {
        console.error("Error fetching announcements:", error)
        toast({
          title: "Error",
          description: "Failed to load announcements. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  // Handle role selection
  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles((prev) => (prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]))
  }

  // Handle select all roles
  const handleSelectAllRoles = () => {
    if (selectedRoles.length === userRoles.length) {
      setSelectedRoles([])
    } else {
      setSelectedRoles(userRoles.map((role) => role.id))
    }
  }

  // Validate form
  const validateForm = () => {
    if (!title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter an announcement title.",
        variant: "destructive",
      })
      return false
    }

    if (!message.trim()) {
      toast({
        title: "Missing Message",
        description: "Please enter an announcement message.",
        variant: "destructive",
      })
      return false
    }

    if (selectedRoles.length === 0) {
      toast({
        title: "No Roles Selected",
        description: "Please select at least one role to receive this announcement.",
        variant: "destructive",
      })
      return false
    }

    if (isScheduled) {
      if (!scheduleDate) {
        toast({
          title: "Missing Date",
          description: "Please select a date for the scheduled announcement.",
          variant: "destructive",
        })
        return false
      }

      if (!scheduleTime) {
        toast({
          title: "Missing Time",
          description: "Please select a time for the scheduled announcement.",
          variant: "destructive",
        })
        return false
      }

      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`)
      if (scheduledDateTime <= new Date()) {
        toast({
          title: "Invalid Schedule",
          description: "Scheduled time must be in the future.",
          variant: "destructive",
        })
        return false
      }
    }

    return true
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setIsSubmitting(true)

      let publishAt = null
      if (isScheduled) {
        publishAt = new Date(`${scheduleDate}T${scheduleTime}`)
      }

      await createAnnouncement({
        title,
        message,
        targetRoles: selectedRoles,
        publishAt,
        createdBy: user?.uid || "",
      })

      toast({
        title: "Announcement Created",
        description: isScheduled
          ? `Your announcement has been scheduled for ${format(
              new Date(`${scheduleDate}T${scheduleTime}`),
              "PPP 'at' p",
            )}`
          : "Your announcement has been published.",
      })

      // Reset form
      setTitle("")
      setMessage("")
      setSelectedRoles([])
      setIsScheduled(false)
      setScheduleDate("")
      setScheduleTime("")

      // Refresh announcements list
      const updatedAnnouncements = await getAnnouncements()
      setAnnouncements(updatedAnnouncements)

      // Switch to list tab
      setActiveTab("list")
    } catch (error) {
      console.error("Error creating announcement:", error)
      toast({
        title: "Error",
        description: "Failed to create announcement. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle announcement deletion
  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return

    try {
      await deleteAnnouncement(announcementId)

      toast({
        title: "Announcement Deleted",
        description: "The announcement has been deleted successfully.",
      })

      // Update local state
      setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId))
    } catch (error) {
      console.error("Error deleting announcement:", error)
      toast({
        title: "Error",
        description: "Failed to delete announcement. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Check if an announcement is scheduled for the future
  const isAnnouncementScheduled = (announcement: Announcement) => {
    if (!announcement.publishAt) return false

    const publishDate =
      typeof announcement.publishAt === "string" ? new Date(announcement.publishAt) : announcement.publishAt.toDate()

    return publishDate > new Date()
  }

  // Format date for display
  const formatDate = (dateString: string | any) => {
    if (!dateString) return "N/A"

    const date = typeof dateString === "string" ? new Date(dateString) : dateString.toDate()

    return format(date, "PPP 'at' p")
  }

  return (
    <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
      <AppShell navItems={navItems} title="Admin Dashboard">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
            <p className="text-muted-foreground">Create and manage announcements for users</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="create">Create Announcement</TabsTrigger>
            <TabsTrigger value="list">Announcements List</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Announcement</CardTitle>
                <CardDescription>Create an announcement to broadcast to specific user roles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Announcement Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. New Project Launch"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground text-right">{title.length}/100 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Announcement Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your announcement message here..."
                    className="min-h-[150px]"
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground text-right">{message.length}/2000 characters</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Target Audience</Label>
                    <Button variant="outline" size="sm" onClick={handleSelectAllRoles} type="button">
                      {selectedRoles.length === userRoles.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {userRoles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={() => handleRoleToggle(role.id)}
                        />
                        <Label htmlFor={`role-${role.id}`} className="cursor-pointer">
                          {role.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedRoles.length === 0 && (
                    <p className="text-xs text-destructive">Please select at least one role</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="schedule"
                      checked={isScheduled}
                      onCheckedChange={(checked) => setIsScheduled(checked === true)}
                    />
                    <Label htmlFor="schedule" className="cursor-pointer">
                      Schedule for later
                    </Label>
                  </div>

                  {isScheduled && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="scheduleDate">Date</Label>
                        <Input
                          id="scheduleDate"
                          type="date"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="scheduleTime">Time</Label>
                        <Input
                          id="scheduleTime"
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      {isScheduled ? "Scheduling..." : "Publishing..."}
                    </>
                  ) : (
                    <>{isScheduled ? "Schedule Announcement" : "Publish Now"}</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Announcements List</CardTitle>
                <CardDescription>View and manage all announcements</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-md border p-4 animate-pulse">
                        <div className="h-5 w-1/3 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-1/4 bg-gray-200 rounded mb-4"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No announcements yet</h3>
                    <p className="text-muted-foreground">Create your first announcement to broadcast to users</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="rounded-md border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{announcement.title}</h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {isAnnouncementScheduled(announcement)
                                  ? `Scheduled for ${formatDate(announcement.publishAt)}`
                                  : announcement.publishAt
                                    ? `Published on ${formatDate(announcement.publishAt)}`
                                    : `Created on ${formatDate(announcement.createdAt)}`}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <p className="mt-2 whitespace-pre-line">{announcement.message}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {announcement.targetRoles.map((role) => (
                            <span
                              key={role}
                              className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                          ))}
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
      </AppShell>
    </ProtectedRoute>
  )
}

