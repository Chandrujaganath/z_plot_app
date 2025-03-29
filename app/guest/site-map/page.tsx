"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Map, MapPin, Home, Search, Calendar, ThumbsUp, Maximize, Minimize, ZoomIn, ZoomOut } from "lucide-react"
import { MiniProfileCard } from "@/components/ui/mini-profile-card"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect, useRef } from "react"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Navigation items for the guest dashboard
const navItems = [
  {
    title: "Dashboard",
    href: "/guest/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Explore",
    href: "/guest/explore",
    icon: <Search className="h-5 w-5" />,
  },
  {
    title: "Book Visit",
    href: "/guest/book-visit",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Feedback",
    href: "/guest/feedback",
    icon: <ThumbsUp className="h-5 w-5" />,
  },
]

export default function SiteMapPage() {
  const { user } = useAuth()
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const mapRef = useRef<HTMLDivElement>(null)
  
  // Mock project data with location coordinates
  const projects = [
    {
      id: 1,
      name: "Sunset View Villas",
      location: "Lake District, Mumbai",
      coordinates: { x: 100, y: 100 },
      status: "available",
      plotsAvailable: 12
    },
    {
      id: 2,
      name: "Mountain Retreat",
      location: "Highland Area, Shimla",
      coordinates: { x: 250, y: 150 },
      status: "selling-fast",
      plotsAvailable: 4
    },
    {
      id: 3, 
      name: "Riverside Estates",
      location: "River Valley, Goa",
      coordinates: { x: 180, y: 320 },
      status: "available",
      plotsAvailable: 8
    },
    {
      id: 4,
      name: "Cityscape Heights",
      location: "Downtown, Delhi",
      coordinates: { x: 400, y: 200 },
      status: "coming-soon",
      plotsAvailable: 0
    },
    {
      id: 5,
      name: "Ocean View Residences",
      location: "Coastal Area, Chennai",
      coordinates: { x: 320, y: 400 },
      status: "available",
      plotsAvailable: 6
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
    setIsDragging(true)
    setStartPos({ 
      x: e.touches[0].clientX - position.x, 
      y: e.touches[0].clientY - position.y 
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.touches[0].clientX - startPos.x,
      y: e.touches[0].clientY - startPos.y
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
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

  // Get location marker color based on status
  const getMarkerColor = (status: string) => {
    switch(status) {
      case "available": return "bg-green-500";
      case "selling-fast": return "bg-orange-500";
      case "coming-soon": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "available": return "bg-green-100 text-green-700";
      case "selling-fast": return "bg-orange-100 text-orange-700";
      case "coming-soon": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
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
    <ProtectedRoute requiredRoles={["guest"]}>
      <AppShell navItems={navItems} title="Site Map">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative px-2 sm:px-4 pb-6"
        >
          {/* Header with gradient background */}
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-blue-600 to-blue-500 rounded-b-3xl -z-10" />
          
          {/* Profile Card - Fixed at top */}
          <div className="sticky top-0 z-10 pt-4 pb-3 bg-transparent">
            <MiniProfileCard className="max-w-md mx-auto md:mx-0 shadow-lg backdrop-blur-sm bg-white/90" />
          </div>
          
          <div className="mt-6 mb-6">
            <div className="flex items-center">
              <Link href="/guest/dashboard" className="text-white mr-2">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold tracking-tight text-white">Site Map</h1>
            </div>
            <p className="text-blue-100 text-sm">Explore our properties and their locations</p>
          </div>
          
          {/* Map Controls */}
          <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Interactive Map</h2>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={zoomIn}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={zoomOut}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={resetView}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Map Legend */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span className="text-xs text-gray-600">Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
                <span className="text-xs text-gray-600">Selling Fast</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                <span className="text-xs text-gray-600">Coming Soon</span>
              </div>
            </div>
            
            {/* Interactive Map */}
            <div className="relative h-96 border border-gray-200 rounded-xl overflow-hidden mb-3">
              <div 
                ref={mapRef}
                className={cn(
                  "absolute inset-0 cursor-grab bg-gray-50",
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
                {/* Map Background Goes Here */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Map className="h-24 w-24 text-blue-200" />
                </div>
                
                {/* Project Markers */}
                {projects.map((project) => (
                  <Link
                    key={project.id} 
                    href={`/guest/explore/${project.id}`}
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
                    <div className="relative">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center",
                        getMarkerColor(project.status),
                        "shadow-lg group-hover:scale-110 transition-transform"
                      )}>
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      
                      {/* Tooltip */}
                      <div className={cn(
                        "absolute top-full left-1/2 transform -translate-x-1/2 mt-1",
                        "bg-white rounded-lg py-1.5 px-2 shadow-lg border border-gray-200",
                        "transition-opacity duration-200 w-48",
                        "opacity-0 group-hover:opacity-100 pointer-events-none"
                      )}>
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-xs truncate max-w-[100px]">{project.name}</h3>
                          <Badge className={cn("text-[8px] px-1.5 py-0.5", getStatusBadge(project.status))}>
                            {getStatusLabel(project.status)}
                          </Badge>
                        </div>
                        <p className="text-[9px] text-gray-500 truncate">{project.location}</p>
                        {project.plotsAvailable > 0 && (
                          <p className="text-[9px] text-green-600 mt-0.5">{project.plotsAvailable} plots available</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="text-xs text-center text-gray-500 mt-2">
                Drag to move around • Pinch or use buttons to zoom
              </div>
            </div>
          </div>
          
          {/* Project List */}
          <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">All Projects</h2>
            
            <div className="space-y-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/guest/explore/${project.id}`}
                  className="flex items-start p-3 border border-gray-100 rounded-xl hover:border-blue-200 transition-all"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3",
                    getMarkerColor(project.status) + '/20'
                  )}>
                    <MapPin className={cn("h-5 w-5", getMarkerColor(project.status).replace('bg-', 'text-'))} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-sm">{project.name}</h3>
                      <Badge className={getStatusBadge(project.status)}>
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{project.location}</p>
                    {project.plotsAvailable > 0 ? (
                      <p className="text-xs text-green-600 mt-1">{project.plotsAvailable} plots available</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Coming soon</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </AppShell>
    </ProtectedRoute>
  )
} 