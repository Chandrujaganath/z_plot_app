"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Home, DollarSign, ArrowRight, LayoutGrid, List, Clock, Calendar, Filter, X, Heart } from "lucide-react"
import { getProjects } from "@/lib/firebase-service"
import type { Project } from "@/lib/models"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { Separator } from "@/components/ui/separator"

export default function ExploreProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [loading, setLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
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
        staggerChildren: 0.05
      }
    }
  }
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
  }

  return (
    <div className="space-y-4">
      {/* Header with gradient background */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl overflow-hidden mb-2"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-500 opacity-90"></div>
        <div className="relative px-5 py-7 text-white">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Explore Projects</h1>
          <p className="text-blue-100 text-sm">Discover premium real estate opportunities</p>
        </div>
      </motion.div>
      
      {/* Search and view toggle */}
      <AnimatePresence mode="wait">
        {showSearch ? (
          <motion.div 
            key="search"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-12 pr-10 py-6 rounded-full border-blue-100 bg-white shadow-sm focus-visible:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute right-2 h-8 w-8 rounded-full p-0"
                onClick={() => {
                  setSearchQuery("")
                  setShowSearch(false)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="controls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between gap-2 mb-4"
          >
            <Button 
              variant="outline" 
              className="flex-1 justify-start rounded-full border-blue-100 shadow-sm"
              onClick={() => setShowSearch(true)}
            >
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Search projects...</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="flex rounded-full overflow-hidden border shadow-sm">
                <Button 
                  variant={viewMode === "grid" ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-l-full h-9 px-3"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === "list" ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-r-full h-9 px-3"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" className="rounded-full h-9 w-9 p-0 border-blue-100 shadow-sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results summary */}
      {(searchQuery || filteredProjects.length !== projects.length) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-between items-center mb-2 px-1"
        >
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filteredProjects.length}</span> projects found
          </p>
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-blue-600"
              onClick={() => setSearchQuery("")}
            >
              Clear
            </Button>
          )}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={viewMode === "grid" 
              ? "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3" 
              : "space-y-4"
            }
          >
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden border-blue-100 shadow-sm rounded-xl">
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
          </motion.div>
        ) : filteredProjects.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex h-60 items-center justify-center rounded-xl border border-dashed bg-muted/20"
          >
            <div className="text-center px-6">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold">No projects found</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search criteria</p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className={viewMode === "grid" 
              ? "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3" 
              : "space-y-4"
            }
          >
            {filteredProjects.map((project) => (
              <motion.div key={project.id} variants={item} layout whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                {viewMode === "grid" ? (
                  <Card className="overflow-hidden border-blue-100 h-full hover:shadow-lg transition-all duration-300 rounded-xl relative group">
                    <div className="aspect-video overflow-hidden relative">
                      {project.imageUrl ? (
                        <img
                          src={project.imageUrl || "/placeholder.svg"}
                          alt={project.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-blue-50">
                          <Home className="h-10 w-10 text-blue-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Badge className="absolute top-3 right-3 bg-black/60 text-white hover:bg-black/70 backdrop-blur-sm">
                        {project.status || "Open"}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg line-clamp-1">{project.name}</h3>
                        <div className="shrink-0 text-right text-blue-600 font-bold">
                          ₹{project.startingPrice.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center text-muted-foreground text-sm mb-3">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-blue-500 flex-shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </div>
                      
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{project.description}</p>
                      
                      <Separator className="my-3" />
                      
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                        <div className="flex items-center gap-2">
                          <Home className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-slate-600">Plot Sizes: {project.plotSizes}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-slate-600">{project.launchDate || "Available now"}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 py-3 bg-slate-50 flex justify-between items-center">
                      <div className="text-sm font-medium">
                        <span className="text-green-600">{project.availablePlots}</span>
                        <span className="text-slate-600"> of {project.totalPlots} plots</span>
                      </div>
                      <Button 
                        onClick={() => handleViewLayout(project.id)}
                        size="sm"
                        className="rounded-full h-8 bg-blue-600 hover:bg-blue-700"
                      >
                        View
                        <ArrowRight className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-blue-100 rounded-xl group">
                    <div className="sm:flex">
                      <div className="sm:w-1/3 h-44 sm:h-auto relative overflow-hidden">
                        {project.imageUrl ? (
                          <img
                            src={project.imageUrl || "/placeholder.svg"}
                            alt={project.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-blue-50">
                            <Home className="h-10 w-10 text-blue-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Badge className="absolute top-2 left-2 bg-black/60 text-white hover:bg-black/70 backdrop-blur-sm">
                          {project.status || "Open"}
                        </Badge>
                      </div>
                      <div className="sm:w-2/3 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">{project.name}</h3>
                            <div className="flex items-center text-muted-foreground text-sm mt-1">
                              <MapPin className="h-3.5 w-3.5 mr-1 text-blue-500" />
                              <span>{project.location}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">₹{project.startingPrice.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Starting price</div>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground text-sm my-2 line-clamp-2">{project.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs mt-4">
                          <div className="flex items-center gap-1.5">
                            <Home className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-slate-600">{project.availablePlots} of {project.totalPlots} available</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-slate-600">{project.launchDate || "Available now"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-slate-600">{project.completionDate || "Open for booking"}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end gap-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            className="rounded-full w-8 h-8 p-0 border-blue-100"
                          >
                            <Heart className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            onClick={() => handleViewLayout(project.id)}
                            size="sm"
                            className="rounded-full h-8 bg-blue-600 hover:bg-blue-700"
                          >
                            View Details
                            <ArrowRight className="ml-2 h-3.5 w-3.5" />
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
      </AnimatePresence>
    </div>
  )
}

