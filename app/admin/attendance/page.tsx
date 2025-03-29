"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  LayoutDashboard,
  Users,
  Building,
  Bell,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { collection, query, where, orderBy, getDocs, type Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import type { Attendance } from "@/lib/models"

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
  displayName: string
  email: string
}

export default function AttendanceMonitoringPage() {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [selectedManager, setSelectedManager] = useState<string>("all")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch managers
    const fetchManagers = async () => {
      try {
        const managersRef = collection(db, "users")
        const q = query(managersRef, where("role", "==", "manager"), where("status", "==", "active"))
        const snapshot = await getDocs(q)

        const managersList: Manager[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          managersList.push({
            id: doc.id,
            displayName: data.displayName || "Unknown Manager",
            email: data.email,
          })
        })

        setManagers(managersList)
      } catch (error) {
        console.error("Error fetching managers:", error)
        toast({
          title: "Error",
          description: "Failed to load managers. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchManagers()
  }, [])

  useEffect(() => {
    // Fetch attendance records for the selected date and manager
    const fetchAttendanceRecords = async () => {
      try {
        setLoading(true)

        // Set date range for the selected date (start of day to end of day)
        const startDate = new Date(currentDate)
        startDate.setHours(0, 0, 0, 0)

        const endDate = new Date(currentDate)
        endDate.setHours(23, 59, 59, 999)

        // Create query
        const attendanceRef = collection(db, "attendance")
        let q

        if (selectedManager === "all") {
          q = query(
            attendanceRef,
            where("timestamp", ">=", startDate),
            where("timestamp", "<=", endDate),
            orderBy("timestamp", "asc"),
          )
        } else {
          q = query(
            attendanceRef,
            where("managerId", "==", selectedManager),
            where("timestamp", ">=", startDate),
            where("timestamp", "<=", endDate),
            orderBy("timestamp", "asc"),
          )
        }

        const snapshot = await getDocs(q)

        const records: Attendance[] = []
        snapshot.forEach((doc) => {
          records.push({ id: doc.id, ...doc.data() } as Attendance)
        })

        setAttendanceRecords(records)
      } catch (error) {
        console.error("Error fetching attendance records:", error)
        toast({
          title: "Error",
          description: "Failed to load attendance records. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (managers.length > 0) {
      fetchAttendanceRecords()
    }
  }, [currentDate, selectedManager, managers])

  const changeDate = (increment: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + increment)
    setCurrentDate(newDate)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string | Timestamp) => {
    if (!dateString) return "N/A"

    let date: Date

    if (typeof dateString === "string") {
      date = new Date(dateString)
    } else {
      try {
        date = dateString.toDate()
      } catch (error) {
        console.error("Error converting timestamp:", error)
        return "Invalid Time"
      }
    }

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Group attendance records by manager
  const getManagerAttendance = () => {
    const managerAttendance: Record<string, { checkIn?: Attendance; checkOut?: Attendance }> = {}

    attendanceRecords.forEach((record) => {
      if (!managerAttendance[record.managerId]) {
        managerAttendance[record.managerId] = {}
      }

      if (record.type === "check_in") {
        managerAttendance[record.managerId].checkIn = record
      } else if (record.type === "check_out") {
        managerAttendance[record.managerId].checkOut = record
      }
    })

    return managerAttendance
  }

  const managerAttendance = getManagerAttendance()

  return (
    <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
      <AppShell navItems={navItems} title="Admin Dashboard">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Attendance Monitoring</h1>
            <p className="text-muted-foreground">Monitor manager attendance and check-in/out times</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>View manager attendance for a specific date</CardDescription>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{formatDate(currentDate)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => changeDate(1)}
                    disabled={currentDate.toDateString() === new Date().toDateString()}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Select value={selectedManager} onValueChange={setSelectedManager}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Managers</SelectItem>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.displayName}
                      </SelectItem>
                    ))}
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
            ) : selectedManager === "all" ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Manager</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Check-In</TableHead>
                      <TableHead>Check-Out</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {managers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No managers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      managers.map((manager) => {
                        const attendance = managerAttendance[manager.id] || {}
                        const checkIn = attendance.checkIn
                        const checkOut = attendance.checkOut

                        // Calculate duration if both check-in and check-out exist
                        let duration = "N/A"
                        if (checkIn && checkOut) {
                          const checkInTime =
                            typeof checkIn.timestamp === "string"
                              ? new Date(checkIn.timestamp)
                              : checkIn.timestamp.toDate()

                          const checkOutTime =
                            typeof checkOut.timestamp === "string"
                              ? new Date(checkOut.timestamp)
                              : checkOut.timestamp.toDate()

                          const durationMs = checkOutTime.getTime() - checkInTime.getTime()
                          const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
                          const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

                          duration = `${durationHours}h ${durationMinutes}m`
                        }

                        return (
                          <TableRow key={manager.id}>
                            <TableCell>
                              <div className="font-medium">{manager.displayName}</div>
                              <div className="text-sm text-muted-foreground">{manager.email}</div>
                            </TableCell>
                            <TableCell>{checkIn?.projectName || "N/A"}</TableCell>
                            <TableCell>
                              {checkIn ? (
                                <div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{formatTime(checkIn.timestamp)}</span>
                                  </div>
                                  <div className="mt-1 flex items-center gap-1 text-xs">
                                    {checkIn.isWithinGeofence ? (
                                      <Badge className="bg-green-500">Within Area</Badge>
                                    ) : (
                                      <Badge className="bg-red-500">Outside Area</Badge>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Not checked in</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {checkOut ? (
                                <div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{formatTime(checkOut.timestamp)}</span>
                                  </div>
                                  <div className="mt-1 flex items-center gap-1 text-xs">
                                    {checkOut.isWithinGeofence ? (
                                      <Badge className="bg-green-500">Within Area</Badge>
                                    ) : (
                                      <Badge className="bg-red-500">Outside Area</Badge>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Not checked out</span>
                              )}
                            </TableCell>
                            <TableCell>{duration}</TableCell>
                            <TableCell>
                              {!checkIn && !checkOut ? (
                                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                  Absent
                                </Badge>
                              ) : checkIn && !checkOut ? (
                                <Badge className="bg-yellow-500">Working</Badge>
                              ) : (
                                <Badge className="bg-green-500">Completed</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-md bg-muted p-4">
                  <h3 className="text-lg font-medium">
                    {managers.find((m) => m.id === selectedManager)?.displayName || "Manager"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {managers.find((m) => m.id === selectedManager)?.email || ""}
                  </p>
                </div>

                {attendanceRecords.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed">
                    <Calendar className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No attendance records found for this date</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attendanceRecords.map((record) => (
                      <div key={record.id} className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-medium capitalize">
                            {record.type === "check_in" ? "Check In" : "Check Out"}
                          </div>
                          <div
                            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                              record.isWithinGeofence ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {record.isWithinGeofence ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                <span>Within Area</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" />
                                <span>Outside Area</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Time:</span> {formatTime(record.timestamp)}
                        </div>
                        {record.projectName && (
                          <div className="mt-1 text-sm">
                            <span className="font-medium">Project:</span> {record.projectName}
                          </div>
                        )}
                        {record.location && (
                          <div className="mt-1 text-sm">
                            <span className="font-medium">Location:</span>{" "}
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {record.location.latitude.toFixed(6)}, {record.location.longitude.toFixed(6)}
                            </span>
                          </div>
                        )}
                        {record.notes && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Notes:</span> {record.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Toaster />
      </AppShell>
    </ProtectedRoute>
  )
}

