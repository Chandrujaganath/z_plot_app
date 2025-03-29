"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { 
  ChevronLeft, Map, MapPin, Home, Search, Calendar, ThumbsUp, 
  Maximize, Minimize, ZoomIn, ZoomOut, Info, X, List
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SiteMapPage() {
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState<{ x: number; y: number; d?: number }>({ x: 0, y: 0 })
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [showProjectList, setShowProjectList] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  
  // Mock project data with location coordinates
  const projects = [
    {
      id: 1,
      name: "Sunset View Villas",
      location: "Lake District, Mumbai",
      coordinates: { x: 100, y: 100 },
      status: "available",
      plotsAvailable: 12,
      totalPlots: 20,
      description: "Luxurious villas with stunning sunset views, perfect for families seeking tranquility.",
      amenities: ["Swimming Pool", "Garden", "Clubhouse", "24/7 Security"]
    },
    {
      id: 2,
      name: "Mountain Retreat",
      location: "Highland Area, Shimla",
      coordinates: { x: 250, y: 150 },
      status: "selling-fast",
      plotsAvailable: 4,
      totalPlots: 16,
      description: "Exclusive mountain properties with panoramic views and premium finishes.",
      amenities: ["Hiking Trails", "Spa", "Fireplace", "Covered Parking"]
    },
    {
      id: 3, 
      name: "Riverside Estates",
      location: "River Valley, Goa",
      coordinates: { x: 180, y: 320 },
      status: "available",
      plotsAvailable: 8,
      totalPlots: 14,
      description: "Elegant properties along the riverside with private access to water activities.",
      amenities: ["Dock Access", "Riverside Deck", "Park", "Guest House"]
    },
    {
      id: 4,
      name: "Cityscape Heights",
      location: "Downtown, Delhi",
      coordinates: { x: 400, y: 200 },
      status: "coming-soon",
      plotsAvailable: 0,
      totalPlots: 30,
      description: "Modern urban living with proximity to business districts and entertainment.",
      amenities: ["Gym", "Rooftop Garden", "Conference Room", "Game Room"]
    },
    {
      id: 5,
      name: "Ocean View Residences",
      location: "Coastal Area, Chennai",
      coordinates: { x: 320, y: 400 },
      status: "available",
      plotsAvailable: 6,
      totalPlots: 12,
      description: "Premium beachfront properties with direct access to pristine beaches.",
      amenities: ["Beach Access", "Infinity Pool", "Tennis Court", "Yacht Club"]
    }
  ]

  // Handle map drag interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setStartPos({ 
        x: e.touches[0].clientX - position.x, 
        y: e.touches[0].clientY - position.y 
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    e.preventDefault()
    setPosition({
      x: e.touches[0].clientX - startPos.x,
      y: e.touches[0].clientY - startPos.y
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Pinch to zoom - detect multiple touch points
  const handleTouchStartZoom = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      setStartPos({ ...startPos, d: dist })
    }
  }

  const handleTouchMoveZoom = (e: React.TouchEvent) => {
    if (e.touches.length !== 2 || !startPos.d) return
    e.preventDefault()
    
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    
    const newZoom = Math.max(0.5, Math.min(2, zoom * (dist / startPos.d)))
    setZoom(newZoom)
    setStartPos({ ...startPos, d: dist })
  }

  // Zoom controls
  const zoomIn = () => {
    setZoom(Math.min(zoom + 0.2, 2))
  }

  const zoomOut = () => {
    setZoom(Math.max(zoom - 0.2, 0.5))
  }

  const resetView = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  const focusOnProject = (projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setSelectedProject(projectId)
      // Center the map on the project
      if (mapRef.current) {
        const mapWidth = mapRef.current.clientWidth
        const mapHeight = mapRef.current.clientHeight
        setPosition({
          x: -(project.coordinates.x * zoom - mapWidth/2),
          y: -(project.coordinates.y * zoom - mapHeight/2)
        })
      }
    }
  }

  // Get location marker color based on status
  const getMarkerColor = (status: string) => {
    switch(status) {
      case "available": return "bg-green-500 shadow-green-200";
      case "selling-fast": return "bg-orange-500 shadow-orange-200";
      case "coming-soon": return "bg-blue-500 shadow-blue-200";
      default: return "bg-gray-500 shadow-gray-200";
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "available": return "bg-green-100 text-green-700 border-green-200";
      case "selling-fast": return "bg-orange-100 text-orange-700 border-orange-200";
      case "coming-soon": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  }

  // Get status label
  const getStatusLabel = (status: string) => {
    switch(status) {
      case "available": return "Available";
      case "selling-fast": return "Selling Fast";
      case "coming-soon": return "Coming Soon";
      default: return "Unknown";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white pb-6 pt-4 px-4 rounded-b-xl shadow-lg">
        <div className="flex items-center mb-4">
          <Link href="/guest/dashboard" className="mr-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-blue-500">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Site Map</h1>
            <p className="text-sm text-blue-100">Explore property locations and availability</p>
          </div>
          
          <div className="ml-auto flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-blue-500"
              onClick={() => setShowProjectList(!showProjectList)}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* View toggle */}
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-blue-500">
            <TabsTrigger value="map" className="data-[state=active]:bg-blue-700">Map View</TabsTrigger>
            <TabsTrigger value="list" className="data-[state=active]:bg-blue-700">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="px-0 pt-4 pb-0">
            {/* Map overview */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-1.5"></div>
                Available
              </Badge>
              <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-orange-400 mr-1.5"></div>
                Selling Fast
              </Badge>
              <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-blue-400 mr-1.5"></div>
                Coming Soon
              </Badge>
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="px-0 pt-4 pb-0">
            <div className="space-y-2">
              {projects.map(project => (
                <Card key={project.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-start p-3 cursor-pointer" onClick={() => focusOnProject(project.id)}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${getMarkerColor(project.status)}`}>
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium truncate">{project.name}</h3>
                          <Badge className={getStatusBadge(project.status)}>
                            {getStatusLabel(project.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{project.location}</p>
                        <p className="text-xs mt-1">
                          {project.plotsAvailable > 0 
                            ? <span className="text-green-600">{project.plotsAvailable} of {project.totalPlots} plots available</span>
                            : <span className="text-gray-500">Coming soon</span>
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Map Container */}
      <div className="relative w-full h-[calc(100vh-12rem)] overflow-hidden mt-4 p-4">
        {/* Project List Overlay */}
        <AnimatePresence>
          {showProjectList && (
            <motion.div 
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              className="absolute top-0 right-0 bottom-0 w-80 bg-white z-10 shadow-lg rounded-l-xl overflow-y-auto"
            >
              <div className="p-4 sticky top-0 bg-white z-10 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">All Projects</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowProjectList(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-3 space-y-3">
                {projects.map(project => (
                  <Card key={project.id} className={`overflow-hidden transition-all ${selectedProject === project.id ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardContent className="p-0">
                      <div 
                        className="flex items-start p-3 cursor-pointer" 
                        onClick={() => {
                          focusOnProject(project.id);
                          setShowProjectList(false);
                        }}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${getMarkerColor(project.status)}`}>
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium truncate">{project.name}</h3>
                            <Badge className={getStatusBadge(project.status)}>
                              {getStatusLabel(project.status)}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">{project.location}</p>
                          <p className="text-xs mt-1">
                            {project.plotsAvailable > 0 
                              ? <span className="text-green-600">{project.plotsAvailable} of {project.totalPlots} plots available</span>
                              : <span className="text-gray-500">Coming soon</span>
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Interactive Map */}
        <div className="absolute inset-0 bg-gray-100 rounded-xl overflow-hidden">
          <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md">
            <div className="flex flex-col gap-1 p-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetView}>
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div 
            ref={mapRef}
            className={cn(
              "absolute inset-0 cursor-grab bg-blue-50",
              isDragging && "cursor-grabbing"
            )}
            style={{
              backgroundImage: "url('/images/map-background.png')",
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Project Markers */}
            {projects.map((project) => (
              <div
                key={project.id} 
                className={cn(
                  "absolute group transition-all duration-200 hover:z-10",
                  isDragging ? "pointer-events-none" : "pointer-events-auto"
                )}
                style={{
                  left: `${project.coordinates.x}px`,
                  top: `${project.coordinates.y}px`,
                  transform: `scale(${1/zoom})` // Counter the zoom effect for consistent sizes
                }}
              >
                <div 
                  className="relative cursor-pointer"
                  onClick={() => focusOnProject(project.id)}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    getMarkerColor(project.status),
                    "shadow-lg group-hover:scale-110 transition-transform",
                    selectedProject === project.id ? "ring-2 ring-white" : ""
                  )}>
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  
                  {/* Tooltip */}
                  <div className={cn(
                    "absolute top-full left-1/2 transform -translate-x-1/2 mt-1",
                    "bg-white rounded-lg py-2 px-3 shadow-lg border border-gray-200",
                    "transition-opacity duration-200 w-48",
                    "opacity-0 group-hover:opacity-100 pointer-events-none"
                  )}>
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm truncate max-w-[120px]">{project.name}</h3>
                      <Badge className={getStatusBadge(project.status)}>
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{project.location}</p>
                    {project.plotsAvailable > 0 && (
                      <p className="text-xs text-green-600 mt-1">{project.plotsAvailable} plots available</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 