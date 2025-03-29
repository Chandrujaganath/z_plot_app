"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Users, Settings, BarChart, Save } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-config"

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

interface SystemConfig {
  attendanceGeofenceRadius: number
  workingHoursStart: string
  workingHoursEnd: string
  maxVisitsPerDay: number
  cctvEnabled: boolean
  maintenanceMode: boolean
  companyName: string
  supportEmail: string
  supportPhone: string
}

interface RoleConfig {
  client: {
    allowCCTV: boolean
    maxBookingsPerDay: number
    maxVisitorsPerQR: number
  }
  manager: {
    requireGeofence: boolean
    maxTasks: number
    maxLeaveRequestsPerMonth: number
  }
  admin: {
    canCreateProjects: boolean
    canManageManagers: boolean
    canApproveVisits: boolean
  }
}

const defaultSystemConfig: SystemConfig = {
  attendanceGeofenceRadius: 500,
  workingHoursStart: "09:00",
  workingHoursEnd: "18:00",
  maxVisitsPerDay: 10,
  cctvEnabled: true,
  maintenanceMode: false,
  companyName: "Real Estate Management",
  supportEmail: "support@realestate.com",
  supportPhone: "+1234567890",
}

const defaultRoleConfig: RoleConfig = {
  client: {
    allowCCTV: true,
    maxBookingsPerDay: 3,
    maxVisitorsPerQR: 5,
  },
  manager: {
    requireGeofence: true,
    maxTasks: 15,
    maxLeaveRequestsPerMonth: 3,
  },
  admin: {
    canCreateProjects: true,
    canManageManagers: true,
    canApproveVisits: true,
  },
}

export default function GlobalConfigPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(defaultSystemConfig)
  const [roleConfig, setRoleConfig] = useState<RoleConfig>(defaultRoleConfig)

  useEffect(() => {
    const loadConfigurations = async () => {
      try {
        // Load system config
        const systemConfigDoc = await getDoc(doc(db, "config", "system"))
        if (systemConfigDoc.exists()) {
          setSystemConfig({ ...defaultSystemConfig, ...(systemConfigDoc.data() as SystemConfig) })
        }

        // Load role config
        const roleConfigDoc = await getDoc(doc(db, "config", "roles"))
        if (roleConfigDoc.exists()) {
          setRoleConfig({ ...defaultRoleConfig, ...(roleConfigDoc.data() as RoleConfig) })
        }
      } catch (error) {
        console.error("Error loading configurations:", error)
        toast({
          title: "Error loading configurations",
          description: "Failed to load system configurations. Using defaults.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadConfigurations()
  }, [])

  const handleSystemConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

    setSystemConfig((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }))
  }

  const handleSystemToggleChange = (name: keyof SystemConfig, checked: boolean) => {
    setSystemConfig((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleRoleConfigChange = (role: keyof RoleConfig, setting: string, value: number | boolean) => {
    setRoleConfig((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [setting]: value,
      },
    }))
  }

  const saveConfigurations = async () => {
    if (!user) return

    setSaving(true)

    try {
      // Save system config
      await setDoc(doc(db, "config", "system"), systemConfig)

      // Save role config
      await setDoc(doc(db, "config", "roles"), roleConfig)

      toast({
        title: "Configurations saved",
        description: "System configurations have been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving configurations:", error)
      toast({
        title: "Error saving configurations",
        description: "Failed to save system configurations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={["superadmin"]}>
        <AppShell navItems={navItems} title="Super Admin Dashboard">
          <div className="flex h-[calc(100vh-200px)] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        </AppShell>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRoles={["superadmin"]}>
      <AppShell navItems={navItems} title="Super Admin Dashboard">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Global Configuration</h1>
            <p className="text-muted-foreground">Manage system-wide settings and role permissions</p>
          </div>
          <Button className="flex items-center gap-2" onClick={saveConfigurations} disabled={saving}>
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </Button>
        </div>

        <Tabs defaultValue="system">
          <TabsList className="mb-4">
            <TabsTrigger value="system">System Settings</TabsTrigger>
            <TabsTrigger value="roles">Role Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Configure global system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">General Settings</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={systemConfig.companyName}
                        onChange={handleSystemConfigChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input
                        id="supportEmail"
                        name="supportEmail"
                        type="email"
                        value={systemConfig.supportEmail}
                        onChange={handleSystemConfigChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="supportPhone">Support Phone</Label>
                      <Input
                        id="supportPhone"
                        name="supportPhone"
                        value={systemConfig.supportPhone}
                        onChange={handleSystemConfigChange}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Attendance & Geofencing</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="attendanceGeofenceRadius">Geofence Radius (meters)</Label>
                      <Input
                        id="attendanceGeofenceRadius"
                        name="attendanceGeofenceRadius"
                        type="number"
                        min="50"
                        max="5000"
                        value={systemConfig.attendanceGeofenceRadius}
                        onChange={handleSystemConfigChange}
                      />
                      <p className="text-xs text-muted-foreground">
                        Distance in meters that managers must be within to check in at a project
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="workingHoursStart">Working Hours Start</Label>
                      <Input
                        id="workingHoursStart"
                        name="workingHoursStart"
                        type="time"
                        value={systemConfig.workingHoursStart}
                        onChange={handleSystemConfigChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="workingHoursEnd">Working Hours End</Label>
                      <Input
                        id="workingHoursEnd"
                        name="workingHoursEnd"
                        type="time"
                        value={systemConfig.workingHoursEnd}
                        onChange={handleSystemConfigChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="maxVisitsPerDay">Max Visits Per Day</Label>
                      <Input
                        id="maxVisitsPerDay"
                        name="maxVisitsPerDay"
                        type="number"
                        min="1"
                        max="50"
                        value={systemConfig.maxVisitsPerDay}
                        onChange={handleSystemConfigChange}
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum number of visits that can be scheduled per day across all projects
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Feature Toggles</h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="cctvEnabled">CCTV System</Label>
                        <p className="text-xs text-muted-foreground">
                          Enable or disable the CCTV system across all projects
                        </p>
                      </div>
                      <Switch
                        id="cctvEnabled"
                        checked={systemConfig.cctvEnabled}
                        onCheckedChange={(checked) => handleSystemToggleChange("cctvEnabled", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="maintenanceMode" className="text-red-500 dark:text-red-400">
                          Maintenance Mode
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Put the entire system in maintenance mode (only super admins can access)
                        </p>
                      </div>
                      <Switch
                        id="maintenanceMode"
                        checked={systemConfig.maintenanceMode}
                        onCheckedChange={(checked) => handleSystemToggleChange("maintenanceMode", checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Client Role Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Client Settings</CardTitle>
                  <CardDescription>Configure permissions for client users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="client-cctv">CCTV Access</Label>
                      <p className="text-xs text-muted-foreground">Allow clients to view CCTV feeds</p>
                    </div>
                    <Switch
                      id="client-cctv"
                      checked={roleConfig.client.allowCCTV}
                      onCheckedChange={(checked) => handleRoleConfigChange("client", "allowCCTV", checked)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="client-max-bookings">Max Bookings Per Day</Label>
                    <Input
                      id="client-max-bookings"
                      type="number"
                      min="1"
                      max="10"
                      value={roleConfig.client.maxBookingsPerDay}
                      onChange={(e) => handleRoleConfigChange("client", "maxBookingsPerDay", Number(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="client-max-visitors">Max Visitors Per QR</Label>
                    <Input
                      id="client-max-visitors"
                      type="number"
                      min="1"
                      max="20"
                      value={roleConfig.client.maxVisitorsPerQR}
                      onChange={(e) => handleRoleConfigChange("client", "maxVisitorsPerQR", Number(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Manager Role Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Manager Settings</CardTitle>
                  <CardDescription>Configure permissions for manager users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="manager-geofence">Require Geofence</Label>
                      <p className="text-xs text-muted-foreground">Enforce location check for attendance</p>
                    </div>
                    <Switch
                      id="manager-geofence"
                      checked={roleConfig.manager.requireGeofence}
                      onCheckedChange={(checked) => handleRoleConfigChange("manager", "requireGeofence", checked)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="manager-max-tasks">Max Open Tasks</Label>
                    <Input
                      id="manager-max-tasks"
                      type="number"
                      min="5"
                      max="50"
                      value={roleConfig.manager.maxTasks}
                      onChange={(e) => handleRoleConfigChange("manager", "maxTasks", Number(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="manager-max-leave">Max Leave Requests Per Month</Label>
                    <Input
                      id="manager-max-leave"
                      type="number"
                      min="1"
                      max="10"
                      value={roleConfig.manager.maxLeaveRequestsPerMonth}
                      onChange={(e) =>
                        handleRoleConfigChange("manager", "maxLeaveRequestsPerMonth", Number(e.target.value))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Admin Role Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Admin Settings</CardTitle>
                  <CardDescription>Configure permissions for admin users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="admin-create-projects">Create Projects</Label>
                      <p className="text-xs text-muted-foreground">Allow admins to create new projects</p>
                    </div>
                    <Switch
                      id="admin-create-projects"
                      checked={roleConfig.admin.canCreateProjects}
                      onCheckedChange={(checked) => handleRoleConfigChange("admin", "canCreateProjects", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="admin-manage-managers">Manage Managers</Label>
                      <p className="text-xs text-muted-foreground">Allow admins to create and manage managers</p>
                    </div>
                    <Switch
                      id="admin-manage-managers"
                      checked={roleConfig.admin.canManageManagers}
                      onCheckedChange={(checked) => handleRoleConfigChange("admin", "canManageManagers", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="admin-approve-visits">Approve Visits</Label>
                      <p className="text-xs text-muted-foreground">Allow admins to approve visit requests</p>
                    </div>
                    <Switch
                      id="admin-approve-visits"
                      checked={roleConfig.admin.canApproveVisits}
                      onCheckedChange={(checked) => handleRoleConfigChange("admin", "canApproveVisits", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Toaster />
      </AppShell>
    </ProtectedRoute>
  )
}

