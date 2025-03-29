"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Home, DollarSign, ArrowRight, LayoutGrid, List, Clock, Calendar } from "lucide-react"
import { getProjects } from "@/lib/firebase-service"
import type { Project } from "@/lib/models"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

export default function ExploreProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    const fetchProjects = async () => {
      try {
        const projectsData = await getProjects()
        if (isMounted) {
          setProjects(projectsData)
          setFilteredProjects(projectsData)
          setLoading(false)
        }
      } catch (error) {
        console.error("Error fetching projects:", error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchProjects()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProjects(projects)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = projects.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.location.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query),
      )
      setFilteredProjects(filtered)
    }
  }, [searchQuery, projects])

  const handleViewLayout = (projectId: string) => {
    router.push(`/guest/explore/${projectId}`)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-6">
      {/* Header with search and view toggle */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Explore Projects</h1>
        <p className="text-muted-foreground text-sm">Discover premium real estate opportunities</p>
        
        <div className="flex items-center space-x-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-10 rounded-full border-blue-100 bg-blue-50/50 focus-visible:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex rounded-lg overflow-hidden border">
            <Button 
              variant={viewMode === "grid" ? "default" : "outline"} 
              size="icon" 
              className="rounded-none h-10 w-10"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "default" : "outline"} 
              size="icon" 
              className="rounded-none h-10 w-10"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={viewMode === "grid" 
          ? "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3" 
          : "space-y-4"
        }>
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden border-blue-100">
              <CardHeader className="p-0">
                <Skeleton className="h-48 w-full rounded-none" />
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex h-60 items-center justify-center rounded-lg border border-dashed bg-muted/30">
          <div className="text-center px-6">
            <Home className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No projects found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search criteria</p>
          </div>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className={viewMode === "grid" 
            ? "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3" 
            : "space-y-4"
          }
        >
          {filteredProjects.map((project) => (
            <motion.div key={project.id} variants={item}>
              {viewMode === "grid" ? (
                <Card className="overflow-hidden border-blue-100 h-full hover:shadow-md transition-shadow">
                  <div className="aspect-video overflow-hidden">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl || "/placeholder.svg"}
                        alt={project.name}
                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-blue-50">
                        <Home className="h-10 w-10 text-blue-300" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <Badge className="mb-2 bg-blue-100 text-blue-700 hover:bg-blue-200">{project.status || "Open"}</Badge>
                    <h3 className="font-bold text-lg line-clamp-1">{project.name}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-1 mb-3">{project.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span className="text-slate-600">{project.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-blue-500" />
                        <span className="text-slate-600">Plot Sizes: {project.plotSizes}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-500" />
                        <span className="text-slate-600">Starting at ₹{project.startingPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <div className="text-sm font-medium">
                      <span className="text-green-600">{project.availablePlots}</span>
                      <span className="text-slate-600"> of {project.totalPlots} plots available</span>
                    </div>
                    <Button 
                      onClick={() => handleViewLayout(project.id)}
                      size="sm"
                      className="rounded-full"
                    >
                      View
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card className="overflow-hidden hover:shadow-md transition-shadow border-blue-100">
                  <div className="sm:flex">
                    <div className="sm:w-1/3 h-48 sm:h-auto">
                      {project.imageUrl ? (
                        <img
                          src={project.imageUrl || "/placeholder.svg"}
                          alt={project.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-blue-50">
                          <Home className="h-10 w-10 text-blue-300" />
                        </div>
                      )}
                    </div>
                    <div className="sm:w-2/3 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className="mb-2 bg-blue-100 text-blue-700 hover:bg-blue-200">{project.status || "Open"}</Badge>
                          <h3 className="font-bold text-lg">{project.name}</h3>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">₹{project.startingPrice.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Starting price</div>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm my-2">{project.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span className="text-slate-600">{project.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-blue-500" />
                          <span className="text-slate-600">{project.availablePlots} of {project.totalPlots} available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="text-slate-600">{project.launchDate || "Available now"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-slate-600">{project.completionDate || "Open for booking"}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button 
                          onClick={() => handleViewLayout(project.id)}
                          className="rounded-full"
                        >
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

