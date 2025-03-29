"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { MapPin, CheckCircle, XCircle, AlertTriangle, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import {
  checkAttendanceStatus,
  recordAttendance,
  getManagerAttendanceHistory,
  getProjects,
} from "@/lib/firebase-service"
import type { Attendance, Project } from "@/lib/models"
import { useAuth } from "@/lib/auth-context"
import type { Timestamp } from "firebase/firestore"

// Haversine formula to calculate distance between two coordinates
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000 // Radius of the earth in meters
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in meters
  return distance
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

export default function AttendancePage() {
  const [attendanceStatus, setAttendanceStatus] = useState<{
    isCheckedIn: boolean
    lastAttendance: Attendance | null
  } | null>(null)
  const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number
    longitude: number
    accuracy?: number
  } | null>(null)
  const [isWithinGeofence, setIsWithinGeofence] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [checkingLocation, setCheckingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [attendanceNotes, setAttendanceNotes] = useState("")
  const [attendanceType, setAttendanceType] = useState<"check_in" | "check_out">("check_in")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { user } = useAuth()

  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Check attendance status
        const status = await checkAttendanceStatus(user.uid)
        setAttendanceStatus(status)

        // Get projects
        const projectsData = await getProjects()
        setProjects(projectsData)

        // Get attendance history for current month
        const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59)

        const historyData = await getManagerAttendanceHistory(user.uid, startDate, endDate)
        setAttendanceHistory(historyData)
      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast({
          title: "Error",
          description: "Failed to load attendance data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()

    // Clean up location watcher
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [user, currentMonth])

  const checkLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      return
    }

    setCheckingLocation(true)
    setLocationError(null)

    // Clear previous watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords

        setCurrentLocation({
          latitude,
          longitude,
          accuracy,
        })

        // Check if within geofence of selected project
        if (
          selectedProject &&
          selectedProject.latitude &&
          selectedProject.longitude &&
          selectedProject.geofenceRadius
        ) {
          const distance = getDistanceFromLatLonInMeters(
            latitude,
            longitude,
            selectedProject.latitude,
            selectedProject.longitude,
          )

          setIsWithinGeofence(distance <= selectedProject.geofenceRadius)
        } else {
          // If no project selected or no geofence data, assume within geofence
          setIsWithinGeofence(true)
        }

        setCheckingLocation(false)
      },
      (error) => {
        console.error("Error getting location:", error)

        let errorMessage = "Failed to get your location"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location services."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out."
            break
        }

        setLocationError(errorMessage)
        setCheckingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  const handleProjectChange = async (projectId: string) => {
    setSelectedProjectId(projectId)

    const project = projects.find((p) => p.id === projectId) || null
    setSelectedProject(project)

    // Reset geofence check
    setIsWithinGeofence(false)

    // Check location again
    checkLocation()
  }

  const handleAttendance = (type: "check_in" | "check_out") => {
    if (!currentLocation) {
      toast({
        title: "Location Required",
        description: "Please allow location access to record attendance.",
        variant: "destructive",
      })
      return
    }

    setAttendanceType(type)
    setNotesDialogOpen(true)
  }

  const submitAttendance = async () => {
    if (!user || !currentLocation) return

    try {
      // Create a simple location object with primitive values
      const locationData = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy || 0,
      }

      const attendanceData: Omit<Attendance, "id" | "timestamp"> = {
        managerId: user.uid,
        managerName: user.displayName || "",
        type: attendanceType,
        location: locationData,
        isWithinGeofence,
        notes: attendanceNotes,
      }

      if (selectedProject) {
        attendanceData.projectId = selectedProject.id
        attendanceData.projectName = selectedProject.name
      }

      await recordAttendance(attendanceData)

      // Update local state
      const newAttendance = {
        id: "temp",
        ...attendanceData,
        timestamp: new Date().toISOString(),
      } as Attendance

      setAttendanceStatus({
        isCheckedIn: attendanceType === "check_in",
        lastAttendance: newAttendance,
      })

      // Add to history
      setAttendanceHistory((prev) => [newAttendance, ...prev])

      toast({
        title: `${attendanceType === "check_in" ? "Checked In" : "Checked Out"} Successfully`,
        description: `Your ${attendanceType === "check_in" ? "check-in" : "check-out"} has been recorded.`,
      })

      // Reset state
      setNotesDialogOpen(false)
      setAttendanceNotes("")
    } catch (error) {
      console.error("Error recording attendance:", error)
      toast({
        title: "Error",
        description: `Failed to record ${attendanceType === "check_in" ? "check-in" : "check-out"}. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const changeMonth = (increment: number) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + increment)
    setCurrentMonth(newMonth)
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
      month: "short",
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

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance Management</h1>
        <p className="text-muted-foreground">Record and track your attendance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Check-In/Out</CardTitle>
            <CardDescription>Record your attendance using geolocation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Current Status</h3>
              {loading ? (
                <div className="flex h-8 items-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
                  <span className="ml-2">Checking status...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {attendanceStatus?.isCheckedIn ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Checked In</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span>Checked Out</span>
                    </>
                  )}
                </div>
              )}

              {attendanceStatus?.lastAttendance && (
                <p className="text-sm text-muted-foreground">
                  Last {attendanceStatus.isCheckedIn ? "check-in" : "check-out"} at{" "}
                  {formatTime(attendanceStatus.lastAttendance.timestamp)} on{" "}
                  {formatDate(attendanceStatus.lastAttendance.timestamp)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Select Project Location</h3>
              <Select value={selectedProjectId} onValueChange={handleProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedProject && (
                <div className="rounded-md bg-muted p-3">
                  <div className="font-medium">{selectedProject.name}</div>
                  <div className="mt-1 text-sm">{selectedProject.location}</div>
                  {selectedProject.latitude && selectedProject.longitude && (
                    <div className="mt-1 flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>
                        {selectedProject.latitude.toFixed(6)}, {selectedProject.longitude.toFixed(6)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Your Location</h3>
              <Button variant="outline" className="w-full" onClick={checkLocation} disabled={checkingLocation}>
                {checkingLocation ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    {currentLocation ? "Update Location" : "Get Current Location"}
                  </>
                )}
              </Button>

              {locationError && (
                <div className="rounded-md bg-red-50 p-3 text-red-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Location Error</span>
                  </div>
                  <p className="mt-1 text-sm">{locationError}</p>
                </div>
              )}

              {currentLocation && (
                <div className="rounded-md bg-muted p-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                    </span>
                  </div>
                  {currentLocation.accuracy && (
                    <div className="mt-1 text-sm">Accuracy: ±{Math.round(currentLocation.accuracy)} meters</div>
                  )}

                  {selectedProject && selectedProject.latitude && selectedProject.longitude && (
                    <div className="mt-2 flex items-center gap-2">
                      {isWithinGeofence ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">You are within the allowed area</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-red-600">You are outside the allowed area</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              className="w-full"
              disabled={!currentLocation || loading || (attendanceStatus?.isCheckedIn ?? false)}
              onClick={() => handleAttendance("check_in")}
            >
              Check In
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={!currentLocation || loading || !(attendanceStatus?.isCheckedIn ?? false)}
              onClick={() => handleAttendance("check_out")}
            >
              Check Out
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Attendance History</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{formatMonthYear(currentMonth)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => changeMonth(1)}
                  disabled={
                    currentMonth.getMonth() === new Date().getMonth() &&
                    currentMonth.getFullYear() === new Date().getFullYear()
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>Your attendance records for {formatMonthYear(currentMonth)}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : attendanceHistory.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <Calendar className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No attendance records found</p>
                <p className="mt-1 text-sm text-muted-foreground">Your attendance history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {attendanceHistory.map((record) => (
                  <div key={record.id} className="rounded-md border p-3">
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
                    <div className="mt-1 text-sm">
                      <span className="font-medium">Time:</span> {formatTime(record.timestamp)}
                    </div>
                    <div className="mt-1 text-sm">
                      <span className="font-medium">Date:</span> {formatDate(record.timestamp)}
                    </div>
                    {record.projectName && (
                      <div className="mt-1 text-sm">
                        <span className="font-medium">Project:</span> {record.projectName}
                      </div>
                    )}
                    {record.notes && (
                      <div className="mt-1 text-sm">
                        <span className="font-medium">Notes:</span> {record.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendance Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{attendanceType === "check_in" ? "Check In" : "Check Out"} Notes</DialogTitle>
            <DialogDescription>
              Add any additional notes for your {attendanceType === "check_in" ? "check-in" : "check-out"} record.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Notes (Optional)</h3>
              <Textarea
                placeholder={`Add any details about your ${attendanceType === "check_in" ? "check-in" : "check-out"}...`}
                value={attendanceNotes}
                onChange={(e) => setAttendanceNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {!isWithinGeofence && (
              <div className="rounded-md bg-yellow-50 p-3 text-yellow-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Outside Geofence Area</span>
                </div>
                <p className="mt-1 text-sm">
                  You are currently outside the designated area for this project. Your{" "}
                  {attendanceType === "check_in" ? "check-in" : "check-out"} will still be recorded, but please provide
                  a reason in the notes.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitAttendance}>{attendanceType === "check_in" ? "Check In" : "Check Out"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}

