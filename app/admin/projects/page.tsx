"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { motion, AnimatePresence } from "framer-motion"
import { Building, Plus, Search, Filter, MapPin, Calendar, DollarSign, CheckCircle, TrendingUp } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { getProjects } from "@/lib/firebase-service"
import type { Project } from "@/lib/models"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatIndianCurrency } from "@/lib/utils"

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
    icon: <Building className="h-5 w-5" />,
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
]

export default function ProjectManagementPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const projectsData = await getProjects()
        setProjects(projectsData)
        setFilteredProjects(projectsData)
      } catch (error) {
        console.error("Error fetching projects:", error)
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  useEffect(() => {
    // Apply filters
    let result = projects

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.location.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query),
      )
    }

    if (statusFilter !== "all") {
      result = result.filter((project) => project.status === statusFilter)
    }

    setFilteredProjects(result)
  }, [projects, searchQuery, statusFilter])

  const handleCreateProject = () => {
    router.push("/admin/projects/create")
  }

  const handleViewProject = (projectId: string) => {
    router.push(`/admin/projects/${projectId}`)
  }

  // Get badge color based on status
  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case "active": return "bg-emerald-500 text-white";
      case "completed": return "bg-blue-500 text-white";
      case "upcoming": return "bg-amber-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  }

  // Get icon for project card
  const getProjectIcon = (status: string) => {
    switch(status) {
      case "active": return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case "completed": return <Building className="h-5 w-5 text-blue-500" />;
      case "upcoming": return <TrendingUp className="h-5 w-5 text-amber-500" />;
      default: return <Building className="h-5 w-5 text-gray-500" />;
    }
  }

  return (
    <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
      <AppShell navItems={navItems} title="Admin Dashboard">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Header with gradient background */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-600 to-blue-500 rounded-b-3xl -z-10" />
          
          <div className="pt-4 px-2 sm:px-4">
            <div className="flex flex-col mb-8">
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">Projects</h1>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateProject}
                  className="bg-white text-blue-600 p-2 rounded-full shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                </motion.button>
              </div>
              <p className="text-blue-100 text-sm">Manage your real estate projects</p>
            </div>

            {/* Search and filters in a card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-4 mb-6"
            >
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search projects..."
                    className="pl-10 border-gray-200 rounded-xl focus:ring-blue-500 bg-gray-50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-500 flex items-center">
                    <Filter className="h-4 w-4 mr-1" />
                    <span>Filter:</span>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full border-gray-200 rounded-xl bg-gray-50 h-9">
                      <span className="capitalize">{statusFilter === "all" ? "All Projects" : statusFilter}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>

            {/* Projects grid with skeleton loading */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md">
                    <Skeleton className="h-40 w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex justify-between mt-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center text-center"
              >
                <div className="bg-blue-50 p-4 rounded-full mb-4">
                  <Building className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-800">No projects found</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter"
                    : "Create your first project to get started"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Button 
                    onClick={handleCreateProject}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Project
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all"
                      onClick={() => handleViewProject(project.id)}
                    >
                      <div className="aspect-video bg-gray-100 relative">
                        {project.imageUrl ? (
                          <img
                            src={project.imageUrl}
                            alt={project.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                            <Building className="h-12 w-12 text-blue-300" />
                          </div>
                        )}
                        <Badge
                          className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(project.status)}`}
                        >
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-1">{project.name}</h3>
                        <div className="flex items-center text-gray-500 text-sm mb-3">
                          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                          <span className="truncate">{project.location}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                          <div className="flex flex-col p-2 bg-gray-50 rounded-lg">
                            <span className="text-gray-500">Starting at</span>
                            <span className="font-semibold text-gray-800">{formatIndianCurrency(project.startingPrice)}</span>
                          </div>
                          <div className="flex flex-col p-2 bg-gray-50 rounded-lg">
                            <span className="text-gray-500">Plots</span>
                            <span className="font-semibold text-gray-800">{project.availablePlots} / {project.totalPlots}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </AppShell>
      <Toaster />
    </ProtectedRoute>
  )
}

