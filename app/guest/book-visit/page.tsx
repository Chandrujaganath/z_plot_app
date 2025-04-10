"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { CalendarIcon, Clock, ChevronRight, Phone, User, PenLine, Building, MapPin, CheckCircle2, Calendar, Check } from "lucide-react"
import {
  getProject,
  getProjectPlots,
  getAvailableTimeSlots,
  createVisitRequest,
  getProjects,
} from "@/lib/firebase-service"
import type { Project, Plot, TimeSlot } from "@/lib/models"
import { useAuth } from "@/lib/auth-context"
import PlotGrid from "@/components/plot-grid"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function BookVisitPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [plots, setPlots] = useState<Plot[]>([])
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get projects
        const projectsData = await getProjects()
        setProjects(projectsData)

        // Check if projectId is in URL params
        const projectId = searchParams.get("projectId")
        if (projectId) {
          const project = await getProject(projectId)
          if (project) {
            setSelectedProject(project)
            setCurrentStep(2)

            // Fetch plots for this project
            const plotsData = await getProjectPlots(projectId)
            setPlots(plotsData)

            // Check if plotId is in URL params
            const plotId = searchParams.get("plotId")
            if (plotId) {
              const plot = plotsData.find((p) => p.id === plotId)
              if (plot) {
                setSelectedPlot(plot)
                setCurrentStep(3)
              }
            }
          }
        }

        // Get available time slots
        const timeSlotsData = await getAvailableTimeSlots()
        setTimeSlots(timeSlotsData)
      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [searchParams])

  useEffect(() => {
    if (user) {
      setName(user.displayName || "")
    }
  }, [user])

  const handleProjectChange = async (projectId: string) => {
    try {
      setLoading(true)
      const project = projects.find((p) => p.id === projectId)
      setSelectedProject(project || null)

      if (project) {
        const plotsData = await getProjectPlots(projectId)
        setPlots(plotsData)
        setCurrentStep(2)
      } else {
        setPlots([])
      }

      setSelectedPlot(null)
    } catch (error) {
      console.error("Error fetching project plots:", error)
      toast({
        title: "Error",
        description: "Failed to load plots for this project.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePlotClick = (plot: Plot) => {
    if (plot.type === "plot" && plot.status === "available") {
      setSelectedPlot(plot)
      setCurrentStep(3)
    }
  }

  const handleTimeSlotSelect = (timeSlotId: string) => {
    setSelectedTimeSlot(timeSlotId)
    setCurrentStep(4)
  }

  const formatTimeSlot = (timeSlot: TimeSlot) => {
    return `${timeSlot.date} • ${timeSlot.startTime} - ${timeSlot.endTime}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to book a visit.",
        variant: "destructive",
      })
      return
    }

    if (!selectedProject) {
      toast({
        title: "Error",
        description: "Please select a project.",
        variant: "destructive",
      })
      return
    }

    if (!selectedTimeSlot) {
      toast({
        title: "Error",
        description: "Please select a time slot for your visit.",
        variant: "destructive",
      })
      return
    }

    if (!name || !phone) {
      toast({
        title: "Error",
        description: "Please provide your name and phone number.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const timeSlot = timeSlots.find((ts) => ts.id === selectedTimeSlot)
      if (!timeSlot) {
        throw new Error("Selected time slot not found")
      }

      const visitData = {
        userId: user.uid,
        userName: name,
        userEmail: user.email || "",
        userPhone: phone,
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        plotId: selectedPlot?.id,
        plotNumber: selectedPlot?.plotNumber,
        timeSlotId: selectedTimeSlot,
        timeSlot: {
          date: timeSlot.date,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
        },
        status: "pending" as const,
        notes: notes,
      }

      const visitId = await createVisitRequest(visitData)

      toast({
        title: "Visit Request Submitted",
        description: "Your visit request has been submitted and is pending approval.",
      })

      // Redirect to QR code viewer page
      router.push(`/guest/qr-viewer?visitId=${visitId}`)
    } catch (error) {
      console.error("Error submitting visit request:", error)
      toast({
        title: "Error",
        description: "Failed to submit visit request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header with gradient background */}
      <div className="relative rounded-xl overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-90"></div>
        <div className="relative px-4 py-6 text-white">
          <h1 className="text-2xl font-bold tracking-tight">Book a Visit</h1>
          <p className="text-blue-100 text-sm mt-1">Schedule a site visit to explore your future property</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="w-full mb-6">
        <div className="flex justify-between items-center relative mb-6">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
          
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-col items-center z-10">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2
                  ${currentStep >= step 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'bg-white text-gray-400 border border-gray-200'
                  }
                  transition-all duration-200
                `}
              >
                {currentStep > step ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step}</span>
                )}
              </div>
              <span className={`text-xs font-medium ${currentStep >= step ? 'text-blue-600' : 'text-gray-500'}`}>
                {step === 1 && "Project"}
                {step === 2 && "Plot"}
                {step === 3 && "Time"}
                {step === 4 && "Details"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Project Selection */}
          {currentStep === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-blue-100 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-blue-50/50 pb-4">
                  <CardTitle className="text-lg flex items-center text-blue-800">
                    <Building className="h-5 w-5 mr-2 text-blue-500" />
                    Select a Project
                  </CardTitle>
                  <CardDescription>Choose the property development you'd like to visit</CardDescription>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    {projects.map((project) => (
                      <Card 
                        key={project.id} 
                        className={`cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden
                          ${selectedProject?.id === project.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100'}
                        `}
                        onClick={() => handleProjectChange(project.id)}
                      >
                        <div className="h-36 sm:h-32 bg-blue-50 relative">
                          {project.imageUrl ? (
                            <img
                              src={project.imageUrl}
                              alt={project.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Building className="h-10 w-10 text-blue-300" />
                            </div>
                          )}
                          <Badge className="absolute top-2 right-2 bg-black/60 text-white hover:bg-black/70 backdrop-blur-sm">
                            {project.status || "Available"}
                          </Badge>
                          {selectedProject?.id === project.id && (
                            <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                                <Check className="h-5 w-5" />
                              </div>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium">{project.name}</h3>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 mr-1 text-blue-500" />
                            <span className="truncate">{project.location}</span>
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <span className="text-xs text-blue-600 font-medium">
                              {project.availablePlots} plots available
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-4 bg-gray-50/50">
                  <Button 
                    type="button"
                    disabled={!selectedProject || loading}
                    onClick={() => setCurrentStep(2)}
                    className="rounded-full shadow-sm"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
          
          {/* Step 2: Plot Selection */}
          {currentStep === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-blue-100 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-blue-50/50 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center text-blue-800">
                      <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                      Select a Plot
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCurrentStep(1)}
                      className="h-8 px-2 text-blue-600 hover:bg-blue-50"
                    >
                      Back
                    </Button>
                  </div>
                  <CardDescription>
                    {selectedProject ? `Choose a plot in ${selectedProject.name}` : 'Select a plot for your visit'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-5">
                  {selectedProject && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-sm flex items-start border border-blue-100">
                        <Building className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-900">{selectedProject.name}</p>
                          <p className="text-muted-foreground">{selectedProject.location}</p>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-white shadow-sm">
                        {plots.length > 0 ? (
                          <div className="h-[300px] max-w-full overflow-auto">
                            <PlotGrid
                              plots={plots}
                              selectedPlotId={selectedPlot?.id}
                              onPlotClick={handlePlotClick}
                            />
                          </div>
                        ) : (
                          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            <p>No plots available for this project</p>
                          </div>
                        )}
                      </div>
                      
                      {selectedPlot && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                          <div className="flex items-center gap-2 text-green-800 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <p className="font-medium">Selected Plot: {selectedPlot.plotNumber}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="h-6 text-xs border-blue-200 bg-blue-50 text-blue-700 rounded-md px-2">Size</Badge>
                              <span>{selectedPlot.dimensions || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="h-6 text-xs border-blue-200 bg-blue-50 text-blue-700 rounded-md px-2">Price</Badge>
                              <span>₹{selectedPlot.price?.toLocaleString() || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-4 bg-gray-50/50">
                  <Button 
                    type="button"
                    disabled={!selectedPlot || loading}
                    onClick={() => setCurrentStep(3)}
                    className="rounded-full shadow-sm"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Time Slot Selection */}
          {currentStep === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-blue-100 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-blue-50/50 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center text-blue-800">
                      <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                      Select Time Slot
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCurrentStep(2)}
                      className="h-8 px-2 text-blue-600 hover:bg-blue-50"
                    >
                      Back
                    </Button>
                  </div>
                  <CardDescription>Choose when you'd like to visit the property</CardDescription>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="space-y-4">
                    {selectedProject && selectedPlot && (
                      <div className="bg-blue-50 p-4 rounded-lg text-sm flex items-start border border-blue-100 mb-4">
                        <div className="bg-white p-2 rounded-full mr-3 shadow-sm">
                          <Building className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium text-blue-900">{selectedProject.name} - Plot {selectedPlot.plotNumber}</p>
                          <p className="text-muted-foreground">{selectedProject.location}</p>
                        </div>
                      </div>
                    )}
                    
                    {timeSlots.length > 0 ? (
                      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                        {timeSlots.map((slot) => (
                          <div
                            key={slot.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200
                              ${selectedTimeSlot === slot.id 
                                ? 'border-blue-500 bg-blue-50 shadow-md' 
                                : 'hover:border-blue-200 hover:shadow-sm border-gray-100 bg-white'
                              }
                            `}
                            onClick={() => handleTimeSlotSelect(slot.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium flex items-center text-blue-800">
                                  <CalendarIcon className="h-4 w-4 mr-2 text-blue-500" />
                                  {slot.date}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center mt-2">
                                  <Clock className="h-4 w-4 mr-2 text-blue-400" />
                                  {slot.startTime} - {slot.endTime}
                                </p>
                              </div>
                              {selectedTimeSlot === slot.id && (
                                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                                  <Check className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
                              <Badge 
                                variant={slot.availability === "limited" ? "outline" : "secondary"} 
                                className={`text-xs ${slot.availability === "limited" 
                                  ? "border-amber-200 bg-amber-50 text-amber-700" 
                                  : "border-green-200 bg-green-50 text-green-700"
                                }`}
                              >
                                {slot.availability === "limited" ? "Limited Spots" : "Available"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[100px] flex items-center justify-center text-muted-foreground">
                        <p>No time slots available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-4 bg-gray-50/50">
                  <Button 
                    type="button"
                    disabled={!selectedTimeSlot || loading}
                    onClick={() => setCurrentStep(4)}
                    className="rounded-full shadow-sm"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Personal Details */}
          {currentStep === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-blue-100 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-blue-50/50 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center text-blue-800">
                      <User className="h-5 w-5 mr-2 text-blue-500" />
                      Your Details
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCurrentStep(3)}
                      className="h-8 px-2 text-blue-600 hover:bg-blue-50"
                    >
                      Back
                    </Button>
                  </div>
                  <CardDescription>Provide your contact information</CardDescription>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="space-y-5">
                    {/* Summary of selections */}
                    {selectedProject && selectedPlot && selectedTimeSlot && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg space-y-4 mb-5 border border-blue-100 shadow-sm">
                        <h3 className="font-semibold text-blue-800 flex items-center">
                          <CheckCircle2 className="h-5 w-5 mr-2 text-blue-500" /> 
                          Visit Summary
                        </h3>
                        <Separator className="bg-blue-100" />
                        <div className="grid gap-3 text-sm">
                          <div className="flex items-start">
                            <div className="bg-white p-1.5 rounded-full mr-2.5 shadow-sm">
                              <Building className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-medium text-blue-800">{selectedProject.name}</p>
                              <p className="text-blue-600/70 text-xs">{selectedProject.location}</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="bg-white p-1.5 rounded-full mr-2.5 shadow-sm">
                              <MapPin className="h-4 w-4 text-blue-500" />
                            </div>
                            <span className="text-blue-800">Plot {selectedPlot.plotNumber} ({selectedPlot.dimensions || "N/A"})</span>
                          </div>
                          <div className="flex items-start">
                            <div className="bg-white p-1.5 rounded-full mr-2.5 shadow-sm">
                              <CalendarIcon className="h-4 w-4 text-blue-500" />
                            </div>
                            <span className="text-blue-800">
                              {timeSlots.find(ts => ts.id === selectedTimeSlot)?.date} • {" "}
                              {timeSlots.find(ts => ts.id === selectedTimeSlot)?.startTime} - {" "}
                              {timeSlots.find(ts => ts.id === selectedTimeSlot)?.endTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center font-medium">
                          <User className="h-4 w-4 mr-2 text-blue-500" />
                          Full Name
                        </Label>
                        <Input 
                          id="name" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          className="border-gray-200 focus-visible:ring-blue-500 rounded-lg h-11 shadow-sm"
                          placeholder="Enter your full name"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center font-medium">
                          <Phone className="h-4 w-4 mr-2 text-blue-500" />
                          Phone Number
                        </Label>
                        <Input 
                          id="phone" 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                          className="border-gray-200 focus-visible:ring-blue-500 rounded-lg h-11 shadow-sm"
                          placeholder="Enter your phone number"
                          type="tel"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes" className="flex items-center font-medium">
                          <PenLine className="h-4 w-4 mr-2 text-blue-500" />
                          Notes (Optional)
                        </Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Any special requests or questions about your visit?"
                          className="min-h-[100px] border-gray-200 focus-visible:ring-blue-500 rounded-lg shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4 bg-gray-50/50">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCurrentStep(3)}
                    className="rounded-full"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={!selectedProject || !selectedPlot || !selectedTimeSlot || !name || !phone || submitting}
                    className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-md"
                  >
                    {submitting ? "Submitting..." : "Book Visit"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
      
      <Toaster />
    </div>
  )
}

