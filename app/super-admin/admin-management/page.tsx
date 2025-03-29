"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { Users, UserPlus, Settings, BarChart } from "lucide-react"
import {
  createAdminUser,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  type AdminUserData,
} from "@/app/actions/admin-users"
import { collection, onSnapshot } from "firebase/firestore"
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

export default function AdminManagementPage() {
  const [adminUsers, setAdminUsers] = useState<AdminUserData[]>([])
  const [loading, setLoading] = useState(true)
  const [newUserOpen, setNewUserOpen] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    role: "admin",
  })
  const [selectedUser, setSelectedUser] = useState<AdminUserData | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  // Load admin users initially
  useEffect(() => {
    const loadAdminUsers = async () => {
      const result = await getAdminUsers()
      if (result.success) {
        setAdminUsers(result.users)
      } else {
        toast({
          title: "Error loading admin users",
          description: result.error,
          variant: "destructive",
        })
      }
      setLoading(false)
    }

    loadAdminUsers()

    // Set up real-time listener for user changes
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const updatedUsers: AdminUserData[] = []
        snapshot.forEach((doc) => {
          const userData = doc.data() as Omit<AdminUserData, "uid">
          if (userData.role === "admin" || userData.role === "superadmin") {
            updatedUsers.push({
              uid: doc.id,
              ...userData,
            } as AdminUserData)
          }
        })
        setAdminUsers(updatedUsers)
      },
      (error) => {
        console.error("Error in real-time listener:", error)
        toast({
          title: "Real-time update error",
          description: "Failed to get real-time updates",
          variant: "destructive",
        })
      },
    )

    return () => unsubscribe()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleCreateUser = async () => {
    setLoading(true)
    const result = await createAdminUser(
      formData.email,
      formData.password,
      formData.displayName,
      formData.role as "admin" | "superadmin",
    )

    if (result.success) {
      toast({
        title: "Admin user created",
        description: `${formData.displayName} has been added as ${formData.role}`,
      })
      setFormData({
        email: "",
        password: "",
        displayName: "",
        role: "admin",
      })
      setNewUserOpen(false)
    } else {
      toast({
        title: "Error creating admin user",
        description: result.error,
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleEditUser = (user: AdminUserData) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    setLoading(true)
    const result = await updateAdminUser(selectedUser.uid, {
      displayName: selectedUser.displayName,
      role: selectedUser.role,
      disabled: selectedUser.disabled,
    })

    if (result.success) {
      toast({
        title: "Admin user updated",
        description: `${selectedUser.displayName} has been updated`,
      })
      setEditDialogOpen(false)
    } else {
      toast({
        title: "Error updating admin user",
        description: result.error,
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setLoading(true)
    const result = await deleteAdminUser(selectedUser.uid)

    if (result.success) {
      toast({
        title: "Admin user deleted",
        description: `${selectedUser.displayName} has been removed`,
      })
      setDeleteDialogOpen(false)
    } else {
      toast({
        title: "Error deleting admin user",
        description: result.error,
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  return (
    <ProtectedRoute requiredRoles={["superadmin"]}>
      <AppShell navItems={navItems} title="Super Admin Dashboard">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Management</h1>
            <p className="text-muted-foreground">Manage admin users and their permissions</p>
          </div>
          <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span>Add New Admin</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Admin User</DialogTitle>
                <DialogDescription>
                  Add a new administrator to the system. They will have access based on their role.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="displayName">Full Name</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewUserOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser} disabled={loading}>
                  Create Admin
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Users</CardTitle>
            <CardDescription>Manage administrators and their access levels</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && adminUsers.length === 0 ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">{user.displayName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            user.role === "superadmin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          }`}
                        >
                          {user.role === "superadmin" ? "Super Admin" : "Admin"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            user.disabled
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          }`}
                        >
                          {user.disabled ? "Disabled" : "Active"}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                          Edit
                        </Button>
                        <AlertDialog
                          open={deleteDialogOpen && selectedUser?.uid === user.uid}
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
                                setSelectedUser(user)
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
                                This will permanently delete the admin user {selectedUser?.displayName}. This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 hover:bg-red-700">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {adminUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No admin users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Admin User</DialogTitle>
              <DialogDescription>Update the admin user's information and permissions.</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-displayName">Full Name</Label>
                  <Input
                    id="edit-displayName"
                    value={selectedUser.displayName || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, displayName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" type="email" value={selectedUser.email} disabled />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value) =>
                      setSelectedUser({ ...selectedUser, role: value as "admin" | "superadmin" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="user-status"
                    checked={!selectedUser.disabled}
                    onCheckedChange={(checked) => setSelectedUser({ ...selectedUser, disabled: !checked })}
                  />
                  <Label htmlFor="user-status">User is active</Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} disabled={loading}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />
      </AppShell>
    </ProtectedRoute>
  )
}

