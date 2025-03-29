"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Edit, Info, MapPin, Home, Grid, Building, Calendar, Calendar as CalendarIcon, Users, BarChart } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { getProjectWithPlots } from "@/lib/firebase-service"
import type { Project, Plot } from "@/lib/models"
import { Badge } from "@/components/ui/badge"
import PlotGrid from "@/components/plot-grid"
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
]

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const [project, setProject] = useState<(Project & { plots?: Plot[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const projectData = await getProjectWithPlots(params.projectId)
        setProject(projectData)
      } catch (error) {
        console.error("Error fetching project:", error)
        toast({
          title: "Error",
          description: "Failed to load project details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [params.projectId])

  const handleEditProject = () => {
    router.push(`/admin/projects/${params.projectId}/edit`)
  }

  const handlePlotClick = (plot: Plot) => {
    setSelectedPlot(plot)
  }

  const closePlotDetails = () => {
    setSelectedPlot(null)
  }

  // Helper to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case "active": return "bg-emerald-500 text-white";
      case "completed": return "bg-blue-500 text-white";
      case "upcoming": return "bg-amber-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  }

  // Stats card component
  const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
    <div className="flex flex-col items-center bg-white rounded-xl shadow-sm p-3 border border-gray-100">
      <div className="bg-blue-50 p-2 rounded-full mb-2">
        {icon}
      </div>
      <span className="text-xs text-gray-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
        <AppShell navItems={navItems} title="Admin Dashboard">
          <div className="flex h-[calc(100vh-200px)] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        </AppShell>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
      <AppShell navItems={navItems} title="Admin Dashboard">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative px-2 sm:px-4 pb-6"
        >
          {/* Header with gradient and image */}
          <div className="relative">
            <div className="h-40 rounded-b-3xl overflow-hidden">
              {project?.imageUrl ? (
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-blue-900/60 z-10" />
                  <img 
                    src={project.imageUrl} 
                    alt={project.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-600 to-blue-500" />
              )}
              
              {/* Back button */}
              <motion.button
                className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm text-blue-600 p-2 rounded-full shadow-lg"
                onClick={() => router.back()}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-4 w-4" />
              </motion.button>
              
              {/* Edit button */}
              <motion.button
                className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm text-blue-600 p-2 rounded-full shadow-lg"
                onClick={handleEditProject}
                whileTap={{ scale: 0.95 }}
              >
                <Edit className="h-4 w-4" />
              </motion.button>
              
              {/* Project title */}
              <div className="absolute bottom-4 left-4 z-20 text-white">
                <h1 className="text-2xl font-bold">{project?.name}</h1>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{project?.location}</span>
                </div>
              </div>
              
              {/* Status badge */}
              {project?.status && (
                <Badge className={`absolute right-4 bottom-4 z-20 rounded-full px-3 py-1 ${getStatusBadgeColor(project.status)}`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 -mt-5 px-2 mb-5">
            <StatCard 
              icon={<Home className="h-4 w-4 text-blue-600" />}
              label="Plots"
              value={`${project?.availablePlots || 0} / ${project?.totalPlots || 0}`}
            />
            <StatCard 
              icon={<BarChart className="h-4 w-4 text-blue-600" />}
              label="Starting Price"
              value={formatIndianCurrency(project?.startingPrice || 0)}
            />
            <StatCard 
              icon={<CalendarIcon className="h-4 w-4 text-blue-600" />}
              label="Created"
              value={typeof project?.createdAt === 'string' 
                ? new Date(project.createdAt).toLocaleDateString() 
                : project?.createdAt ? new Date(project.createdAt.toDate()).toLocaleDateString() : 'N/A'}
            />
          </div>
          
          {/* Tabs for different sections */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="bg-blue-50 p-1 rounded-xl grid grid-cols-2 mb-4">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-white rounded-lg data-[state=active]:shadow-sm">
                <Info className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="plots" 
                className="data-[state=active]:bg-white rounded-lg data-[state=active]:shadow-sm">
                <Grid className="h-4 w-4 mr-2" />
                Plots
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-0">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
                  <h3 className="font-semibold mb-3 text-gray-800">About Project</h3>
                  <p className="text-gray-600 text-sm">{project?.description}</p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm p-4">
                  <h3 className="font-semibold mb-3 text-gray-800">Project Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Location</span>
                      <span className="font-medium text-gray-800">{project?.location || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Total Plots</span>
                      <span className="font-medium text-gray-800">{project?.totalPlots || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Available Plots</span>
                      <span className="font-medium text-gray-800">{project?.availablePlots || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Starting Price</span>
                      <span className="font-medium text-gray-800">{formatIndianCurrency(project?.startingPrice || 0)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Plot Sizes</span>
                      <span className="font-medium text-gray-800">{project?.plotSizes || 'N/A'}</span>
                    </div>
                    {project?.latitude && project?.longitude && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Coordinates</span>
                        <span className="font-medium text-gray-800">
                          {`${project.latitude.toFixed(6)}, ${project.longitude.toFixed(6)}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="plots" className="mt-0">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-sm p-4"
              >
                <h3 className="font-semibold mb-3 text-gray-800">Plot Layout</h3>
                {project?.plots && project.plots.length > 0 ? (
                  <PlotGrid 
                    plots={project.plots} 
                    onPlotClick={handlePlotClick} 
                    selectedPlotId={selectedPlot?.id}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl">
                    <Grid className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-center text-sm">
                      No plots have been added to this project yet. 
                      <br />Edit the project to add plots.
                    </p>
                    <Button 
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                      onClick={handleEditProject}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Project Layout
                    </Button>
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
          
          {/* Plot details modal */}
          <AnimatePresence>
            {selectedPlot && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed inset-x-0 bottom-0 z-50 p-4"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 max-w-md mx-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">
                      Plot #{selectedPlot.plotNumber}
                    </h3>
                    <button 
                      onClick={closePlotDetails}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Size</span>
                      <span className="font-medium">{selectedPlot.size} sq ft</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Price</span>
                      <span className="font-medium">{formatIndianCurrency(selectedPlot.price)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Status</span>
                      <span 
                        className={`capitalize font-medium px-2 py-1 rounded-full text-xs ${
                          selectedPlot.status === "available" 
                            ? "bg-green-100 text-green-700"
                            : selectedPlot.status === "reserved"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {selectedPlot.status}
                      </span>
                    </div>
                    {selectedPlot.ownerId && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Owner ID</span>
                        <span className="font-medium">{selectedPlot.ownerId}</span>
                      </div>
                    )}
                    {selectedPlot.address && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Address</span>
                        <span className="font-medium">{selectedPlot.address}</span>
                      </div>
                    )}
                    {selectedPlot.purchaseDate && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Purchase Date</span>
                        <span className="font-medium">
                          {typeof selectedPlot.purchaseDate === 'string' 
                            ? new Date(selectedPlot.purchaseDate).toLocaleDateString() 
                            : selectedPlot.purchaseDate 
                              ? new Date(selectedPlot.purchaseDate.toDate()).toLocaleDateString() 
                              : 'N/A'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={closePlotDetails}
                    >
                      Close
                    </Button>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                      onClick={() => {
                        closePlotDetails();
                        router.push(`/admin/projects/${params.projectId}/plots/${selectedPlot.id}/edit`);
                      }}
                    >
                      Edit Plot
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AppShell>
      <Toaster />
    </ProtectedRoute>
  )
}

