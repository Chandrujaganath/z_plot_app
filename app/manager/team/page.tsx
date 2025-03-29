"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  department?: string
  status: "active" | "on-leave" | "inactive"
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        // Fetch team members (staff managed by the current manager)
        const staffQuery = query(
          collection(db, "users"),
          where("role", "==", "staff"),
          // In a real app, you would filter by the current manager's ID
        )
        const querySnapshot = await getDocs(staffQuery)
        const members: TeamMember[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          members.push({
            id: doc.id,
            name: data.name || "Unknown",
            role: data.staffRole || "Staff",
            email: data.email || "",
            department: data.department,
            status: data.status || "active",
          })
        })

        setTeamMembers(members)
      } catch (error) {
        console.error("Error fetching team members:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamMembers()
  }, [])

  // Placeholder data if no team members are found
  if (teamMembers.length === 0 && !loading) {
    setTeamMembers([
      {
        id: "1",
        name: "John Smith",
        role: "Security Staff",
        email: "john.smith@example.com",
        department: "Security",
        status: "active",
      },
      {
        id: "2",
        name: "Maria Garcia",
        role: "Maintenance",
        email: "maria.garcia@example.com",
        department: "Maintenance",
        status: "active",
      },
      {
        id: "3",
        name: "Alex Johnson",
        role: "Customer Service",
        email: "alex.johnson@example.com",
        department: "Customer Relations",
        status: "on-leave",
      },
    ])
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">My Team</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? // Loading placeholders
            Array(3)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="h-5 w-1/2 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))
          : teamMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <span className="text-sm">{member.email}</span>
                    </div>

                    {member.department && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Department:</span>
                        <span className="text-sm">{member.department}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge
                        variant={
                          member.status === "active"
                            ? "default"
                            : member.status === "on-leave"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {member.status === "active" ? "Active" : member.status === "on-leave" ? "On Leave" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  )
}

