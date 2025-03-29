"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Grid, Trash2, Building, Users, Calendar, Bell } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { createProject } from "@/lib/firebase-service"
import { useAuth } from "@/lib/auth-context"
import ProjectLayoutEditor from "@/components/admin/project-layout-editor"
import type { GridCell } from "@/lib/models"

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
  {
    title: "Announcements",
    href: "/admin/announcements",
    icon: <Bell className="h-5 w-5" />,
  },
]

export default function CreateProjectPage() {
  const [activeTab, setActiveTab] = useState("details")
  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [plotSizes, setPlotSizes] = useState("")
  const [startingPrice, setStartingPrice] = useState("")
  const [status, setStatus] = useState("upcoming")
  const [gridSize, setGridSize] = useState({ rows: 10, cols: 10 })
  const [gridCells, setGridCells] = useState<GridCell[][]>([])
  const [submitting, setSubmitting] = useState(false)

  const router = useRouter()
  const { user } = useAuth()

  // Initialize grid when grid size changes
  const initializeGrid = (rows: number, cols: number) => {
    const newGrid: GridCell[][] = []

    for (let row = 0; row < rows; row++) {
      const newRow: GridCell[] = []
      for (let col = 0; col < cols; col++) {
        newRow.push({
          row,
          col,
          type: "empty",
          status: "available",
        })
      }
      newGrid.push(newRow)
    }

    setGridCells(newGrid)
  }

  // Handle grid size change
  const handleGridSizeChange = (dimension: "rows" | "cols", value: string) => {
    const numValue = Number.parseInt(value, 10)
    if (isNaN(numValue) || numValue < 1 || numValue > 50) return

    const newSize = { ...gridSize, [dimension]: numValue }
    setGridSize(newSize)
    initializeGrid(newSize.rows, newSize.cols)
  }

  // Update a cell in the grid
  const updateCell = (row: number, col: number, updates: Partial<GridCell>) => {
    const newGrid = [...gridCells]
    newGrid[row][col] = { ...newGrid[row][col], ...updates }
    setGridCells(newGrid)
  }

  // Count plots and roads
  const countGridElements = () => {
    let plots = 0
    let roads = 0

    gridCells.forEach((row) => {
      row.forEach((cell) => {
        if (cell.type === "plot") plots++
        if (cell.type === "road") roads++
      })
    })

    return { plots, roads }
  }

  // Validate project data
  const validateProject = () => {
    if (!projectName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a project name.",
        variant: "destructive",
      })
      setActiveTab("details")
      return false
    }

    if (!location.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a project location.",
        variant: "destructive",
      })
      setActiveTab("details")
      return false
    }

    if (!startingPrice.trim() || isNaN(Number.parseFloat(startingPrice))) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid starting price.",
        variant: "destructive",
      })
      setActiveTab("details")
      return false
    }

    const { plots, roads } = countGridElements()

    if (plots === 0) {
      toast({
        title: "Invalid Layout",
        description: "Your project must have at least one plot.",
        variant: "destructive",
      })
      setActiveTab("layout")
      return false
    }

    if (roads === 0) {
      toast({
        title: "Invalid Layout",
        description: "Your project must have at least one road for access.",
        variant: "destructive",
      })
      setActiveTab("layout")
      return false
    }

    return true
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateProject()) return

    try {
      setSubmitting(true)

      // Prepare plot data
      const plotsData: any[] = []
      gridCells.forEach((row) => {
        row.forEach((cell) => {
          if (cell.type === "plot") {
            plotsData.push({
              row: cell.row,
              col: cell.col,
              plotNumber: cell.plotNumber || plotsData.length + 1,
              size: cell.size || 0,
              price: cell.price || Number.parseFloat(startingPrice),
              status: "available",
              type: "plot",
            })
          }
        })
      })

      // Create project
      const projectData = {
        name: projectName,
        description: description,
        location: location,
        totalPlots: plotsData.length,
        availablePlots: plotsData.length,
        plotSizes: plotSizes,
        startingPrice: Number.parseFloat(startingPrice),
        status: status,
        gridSize: gridSize,
        gridCells: gridCells,
        createdBy: user?.uid || "",
      }

      const projectId = await createProject(projectData, plotsData)

      toast({
        title: "Project Created",
        description: "Your project has been created successfully.",
      })

      // Redirect to project details page
      router.push(`/admin/projects/${projectId}`)
    } catch (error) {
      console.error("Error creating project:", error)
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
      <AppShell navItems={navItems} title="Admin Dashboard">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create New Project</h1>
            <p className="text-muted-foreground">Design your real estate project and plot layout</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="layout">Layout Editor</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>Enter the basic details of your real estate project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Green Valley Residences"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the project"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. North Suburb, City"
                    required
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="plotSizes">Plot Sizes</Label>
                    <Input
                      id="plotSizes"
                      value={plotSizes}
                      onChange={(e) => setPlotSizes(e.target.value)}
                      placeholder="e.g. 1000-1500 sq ft"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startingPrice">Starting Price ($)</Label>
                    <Input
                      id="startingPrice"
                      type="number"
                      value={startingPrice}
                      onChange={(e) => setStartingPrice(e.target.value)}
                      placeholder="e.g. 100000"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Project Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button onClick={() => setActiveTab("layout")}>Continue to Layout Editor</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="layout">
            <Card>
              <CardHeader>
                <CardTitle>Project Layout Editor</CardTitle>
                <CardDescription>Design the plot layout for your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="space-y-2">
                    <Label htmlFor="rows">Grid Rows</Label>
                    <Input
                      id="rows"
                      type="number"
                      value={gridSize.rows}
                      onChange={(e) => handleGridSizeChange("rows", e.target.value)}
                      min={1}
                      max={50}
                      className="w-24"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cols">Grid Columns</Label>
                    <Input
                      id="cols"
                      type="number"
                      value={gridSize.cols}
                      onChange={(e) => handleGridSizeChange("cols", e.target.value)}
                      min={1}
                      max={50}
                      className="w-24"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => initializeGrid(gridSize.rows, gridSize.cols)}
                  >
                    <Grid className="h-4 w-4" />
                    <span>Initialize Grid</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-destructive"
                    onClick={() => {
                      if (confirm("Are you sure you want to clear the grid? This will reset all cells.")) {
                        initializeGrid(gridSize.rows, gridSize.cols)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear Grid</span>
                  </Button>
                </div>

                <ProjectLayoutEditor gridCells={gridCells} updateCell={updateCell} />

                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-medium mb-2">Layout Statistics</h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cells</p>
                      <p className="text-lg font-medium">{gridSize.rows * gridSize.cols}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Plots</p>
                      <p className="text-lg font-medium">{countGridElements().plots}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Roads</p>
                      <p className="text-lg font-medium">{countGridElements().roads}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Empty Cells</p>
                      <p className="text-lg font-medium">
                        {gridSize.rows * gridSize.cols - countGridElements().plots - countGridElements().roads}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("details")}>
                  Back to Details
                </Button>
                <Button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2">
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Creating Project...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Project</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        <Toaster />
      </AppShell>
    </ProtectedRoute>
  )
}

