"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Bell, Building, Calendar, Copy, Edit, Grid, Save, Trash2, Users } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { useAuth } from "@/lib/auth-context"
import { createTemplate, getTemplates, deleteTemplate, getTemplate } from "@/lib/firebase-service"
import TemplateLayoutEditor from "@/components/admin/template-layout-editor"
import type { ProjectTemplate, GridCell } from "@/lib/models"

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
  {
    title: "Templates",
    href: "/admin/templates",
    icon: <Copy className="h-5 w-5" />,
  },
]

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState("list")
  const [templateName, setTemplateName] = useState("")
  const [description, setDescription] = useState("")
  const [gridSize, setGridSize] = useState({ rows: 10, cols: 10 })
  const [gridCells, setGridCells] = useState<GridCell[][]>([])
  const [templates, setTemplates] = useState<ProjectTemplate[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)

  const router = useRouter()
  const { user } = useAuth()

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const fetchedTemplates = await getTemplates()
        setTemplates(fetchedTemplates)
      } catch (error) {
        console.error("Error fetching templates:", error)
        toast({
          title: "Error",
          description: "Failed to load templates. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [])

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

  // Validate template data
  const validateTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a template name.",
        variant: "destructive",
      })
      return false
    }

    const { plots, roads } = countGridElements()

    if (plots === 0) {
      toast({
        title: "Invalid Layout",
        description: "Your template must have at least one plot.",
        variant: "destructive",
      })
      return false
    }

    if (roads === 0) {
      toast({
        title: "Invalid Layout",
        description: "Your template must have at least one road for access.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateTemplate()) return

    try {
      setIsSubmitting(true)

      const templateData = {
        name: templateName,
        description: description,
        gridSize: gridSize,
        gridCells: gridCells,
        createdBy: user?.uid || "",
      }

      if (editingTemplateId) {
        // Update existing template
        await createTemplate(templateData, editingTemplateId)
        toast({
          title: "Template Updated",
          description: "Your template has been updated successfully.",
        })
      } else {
        // Create new template
        await createTemplate(templateData)
        toast({
          title: "Template Created",
          description: "Your template has been created successfully.",
        })
      }

      // Reset form
      setTemplateName("")
      setDescription("")
      setGridSize({ rows: 10, cols: 10 })
      initializeGrid(10, 10)
      setEditingTemplateId(null)

      // Refresh templates list
      const updatedTemplates = await getTemplates()
      setTemplates(updatedTemplates)

      // Switch to list tab
      setActiveTab("list")
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle template deletion
  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    try {
      await deleteTemplate(templateId)

      toast({
        title: "Template Deleted",
        description: "The template has been deleted successfully.",
      })

      // Update local state
      setTemplates((prev) => prev.filter((t) => t.id !== templateId))
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle template editing
  const handleEditTemplate = async (templateId: string) => {
    try {
      const template = await getTemplate(templateId)

      if (!template) {
        toast({
          title: "Error",
          description: "Template not found.",
          variant: "destructive",
        })
        return
      }

      // Set form data from template
      setTemplateName(template.name)
      setDescription(template.description || "")
      setGridSize(template.gridSize)
      setGridCells(template.gridCells)
      setEditingTemplateId(templateId)

      // Switch to create tab
      setActiveTab("create")
    } catch (error) {
      console.error("Error loading template:", error)
      toast({
        title: "Error",
        description: "Failed to load template. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Create new template
  const handleCreateNew = () => {
    // Reset form
    setTemplateName("")
    setDescription("")
    setGridSize({ rows: 10, cols: 10 })
    initializeGrid(10, 10)
    setEditingTemplateId(null)

    // Switch to create tab
    setActiveTab("create")
  }

  // Format date for display
  const formatDate = (dateString: string | any) => {
    if (!dateString) return "N/A"

    const date = typeof dateString === "string" ? new Date(dateString) : dateString.toDate()

    return format(date, "PPP")
  }

  return (
    <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
      <AppShell navItems={navItems} title="Admin Dashboard">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Project Templates</h1>
            <p className="text-muted-foreground">Create and manage reusable project templates</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="list">Templates List</TabsTrigger>
              <TabsTrigger value="create">{editingTemplateId ? "Edit Template" : "Create Template"}</TabsTrigger>
            </TabsList>
            {activeTab === "list" && <Button onClick={handleCreateNew}>Create New Template</Button>}
          </div>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Project Templates</CardTitle>
                <CardDescription>Reusable templates for creating new projects</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-md border p-4 animate-pulse">
                        <div className="h-5 w-1/3 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-1/4 bg-gray-200 rounded mb-4"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8">
                    <Copy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No templates yet</h3>
                    <p className="text-muted-foreground">Create your first template to speed up project creation</p>
                    <Button className="mt-4" onClick={handleCreateNew}>
                      Create Template
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {templates.map((template) => (
                      <div key={template.id} className="rounded-md border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{template.name}</h3>
                            <p className="text-sm text-muted-foreground">Created on {formatDate(template.createdAt)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEditTemplate(template.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTemplate(template.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-2 text-sm">{template.description || "No description provided"}</p>
                        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Grid className="h-3.5 w-3.5" />
                            <span>
                              {template.gridSize.rows} × {template.gridSize.cols} grid
                            </span>
                          </div>
                          <div>
                            {countGridElements().plots} plots, {countGridElements().roads} roads
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>{editingTemplateId ? "Edit Template" : "Create New Template"}</CardTitle>
                <CardDescription>
                  {editingTemplateId
                    ? "Update your project template details and layout"
                    : "Design a reusable template for future projects"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g. Standard Residential Layout"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the template"
                    className="min-h-[100px]"
                  />
                </div>

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

                <TemplateLayoutEditor gridCells={gridCells} updateCell={updateCell} />

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
                <Button variant="outline" onClick={() => setActiveTab("list")}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Saving Template...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{editingTemplateId ? "Update Template" : "Save Template"}</span>
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

