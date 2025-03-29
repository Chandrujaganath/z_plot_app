"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  CheckSquare,
  Clock,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  Home,
} from "lucide-react"
import { getManagerTasks, updateManagerTaskStatus, getManagerTask } from "@/lib/firebase-service"
import type { ManagerTask } from "@/lib/models"
import { useAuth } from "@/lib/auth-context"
import type { DocumentSnapshot, Timestamp } from "firebase/firestore"

export default function TaskListPage() {
  const [tasks, setTasks] = useState<ManagerTask[]>([])
  const [filteredTasks, setFilteredTasks] = useState<ManagerTask[]>([])
  const [selectedTask, setSelectedTask] = useState<ManagerTask | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false)
  const [completionNotes, setCompletionNotes] = useState("")
  const [taskToComplete, setTaskToComplete] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchTasks = useCallback(
    async (status?: string, reset = false) => {
      if (!user) return

      try {
        if (reset) {
          setLoading(true)
          setLastVisible(null)
        } else {
          setLoadingMore(true)
        }

        const result = await getManagerTasks(user.uid, status, 10, reset ? undefined : lastVisible)

        if (reset) {
          setTasks(result.tasks)
          setFilteredTasks(result.tasks)
        } else {
          setTasks((prev) => [...prev, ...result.tasks])
          setFilteredTasks((prev) => [...prev, ...result.tasks])
        }

        setLastVisible(result.lastVisible)
        setHasMore(result.tasks.length === 10)
      } catch (error) {
        console.error("Error fetching tasks:", error)
        toast({
          title: "Error",
          description: "Failed to load tasks. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [user, lastVisible],
  )

  useEffect(() => {
    fetchTasks(activeTab !== "all" ? activeTab : undefined, true)
  }, [fetchTasks, activeTab])

  useEffect(() => {
    // Apply filters
    let result = tasks

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          (task.projectName && task.projectName.toLowerCase().includes(query)) ||
          (task.clientName && task.clientName.toLowerCase().includes(query)),
      )
    }

    if (statusFilter !== "all") {
      result = result.filter((task) => task.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      result = result.filter((task) => task.priority === priorityFilter)
    }

    setFilteredTasks(result)
  }, [tasks, searchQuery, statusFilter, priorityFilter])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setStatusFilter("all")
    setPriorityFilter("all")
    setSearchQuery("")
  }

  const handleViewTask = async (taskId: string) => {
    try {
      const task = await getManagerTask(taskId)
      if (task) {
        setSelectedTask(task)
      }
    } catch (error) {
      console.error("Error fetching task details:", error)
      toast({
        title: "Error",
        description: "Failed to load task details. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (taskId: string, status: string) => {
    if (status === "completed") {
      setTaskToComplete(taskId)
      setCompletionDialogOpen(true)
      return
    }

    try {
      await updateManagerTaskStatus(taskId, status)

      // Update local state
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status, updatedAt: new Date().toISOString() as any } : task,
        ),
      )

      toast({
        title: "Task Updated",
        description: `Task status updated to ${status}.`,
      })
    } catch (error) {
      console.error("Error updating task status:", error)
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCompleteTask = async () => {
    if (!taskToComplete) return

    try {
      await updateManagerTaskStatus(taskToComplete, "completed", completionNotes)

      // Update local state
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskToComplete
            ? {
                ...task,
                status: "completed",
                updatedAt: new Date().toISOString() as any,
                completedAt: new Date().toISOString() as any,
              }
            : task,
        ),
      )

      toast({
        title: "Task Completed",
        description: "Task has been marked as completed.",
      })

      // Reset state
      setCompletionDialogOpen(false)
      setCompletionNotes("")
      setTaskToComplete(null)
    } catch (error) {
      console.error("Error completing task:", error)
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string | Timestamp) => {
    if (!dateString) return "N/A"

    const date = typeof dateString === "string" ? new Date(dateString) : dateString.toDate?.() || new Date()

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "in_progress":
        return "In Progress"
      case "cancelled":
        return "Cancelled"
      default:
        return "Pending"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Task Management</h1>
        <p className="text-muted-foreground">View and manage your assigned tasks</p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <span>Priority</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="mt-6">
          <TaskList
            tasks={filteredTasks}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={() => fetchTasks(undefined)}
            onViewTask={handleViewTask}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <TaskList
            tasks={filteredTasks}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={() => fetchTasks("pending")}
            onViewTask={handleViewTask}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>

        <TabsContent value="in_progress" className="mt-6">
          <TaskList
            tasks={filteredTasks}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={() => fetchTasks("in_progress")}
            onViewTask={handleViewTask}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <TaskList
            tasks={filteredTasks}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={() => fetchTasks("completed")}
            onViewTask={handleViewTask}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>
      </Tabs>

      {/* Task Details Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-3xl">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{selectedTask.title}</DialogTitle>
                  <div className={`rounded-full px-2 py-1 text-xs ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)} Priority
                  </div>
                </div>
                <DialogDescription>Task ID: {selectedTask.id}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p className="mt-1 text-sm">{selectedTask.description}</p>
                  </div>

                  {selectedTask.projectName && (
                    <div>
                      <h3 className="font-medium">Project Details</h3>
                      <div className="mt-1 space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedTask.projectName}</span>
                        </div>
                        {selectedTask.plotNumber && (
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <span>Plot #{selectedTask.plotNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedTask.clientName && (
                    <div>
                      <h3 className="font-medium">Client Information</h3>
                      <div className="mt-1 space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedTask.clientName}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium">Task Timeline</h3>
                    <div className="mt-1 space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Due Date: {formatDate(selectedTask.dueDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Created: {formatDate(selectedTask.createdAt)}</span>
                      </div>
                      {selectedTask.completedAt && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Completed: {formatDate(selectedTask.completedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Status</h3>
                    <div className="mt-2 flex items-center gap-2">
                      {getStatusIcon(selectedTask.status)}
                      <span>{getStatusText(selectedTask.status)}</span>
                    </div>
                  </div>

                  {selectedTask.status !== "completed" && selectedTask.status !== "cancelled" && (
                    <div>
                      <h3 className="font-medium">Actions</h3>
                      <div className="mt-2 space-y-2">
                        {selectedTask.status === "pending" && (
                          <Button className="w-full" onClick={() => handleStatusChange(selectedTask.id, "in_progress")}>
                            Start Task
                          </Button>
                        )}

                        {selectedTask.status === "in_progress" && (
                          <Button className="w-full" onClick={() => handleStatusChange(selectedTask.id, "completed")}>
                            Mark as Completed
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleStatusChange(selectedTask.id, "cancelled")}
                        >
                          Cancel Task
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedTask.status === "completed" && !selectedTask.feedbackSubmitted && (
                    <div>
                      <h3 className="font-medium">Feedback</h3>
                      <div className="mt-2">
                        <Button
                          className="w-full"
                          onClick={() => (window.location.href = `/manager/feedback?taskId=${selectedTask.id}`)}
                        >
                          Submit Feedback
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedTask.status === "completed" && selectedTask.feedbackSubmitted && (
                    <div className="rounded-md bg-green-50 p-3 text-green-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Feedback Submitted</span>
                      </div>
                      <p className="mt-1 text-sm">You have already submitted feedback for this task.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Task Completion Dialog */}
      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription>Add any notes or comments about the completed task.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Completion Notes (Optional)</h3>
              <Textarea
                placeholder="Add any details about how the task was completed..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCompletionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteTask}>Complete Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}

interface TaskListProps {
  tasks: ManagerTask[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  onViewTask: (taskId: string) => void
  onStatusChange: (taskId: string, status: string) => void
}

function TaskList({ tasks, loading, loadingMore, hasMore, onLoadMore, onViewTask, onStatusChange }: TaskListProps) {
  const formatDate = (dateString: string | Timestamp) => {
    if (!dateString) return "N/A"

    const date = typeof dateString === "string" ? new Date(dateString) : dateString.toDate?.() || new Date()

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
            <CheckCircle className="h-3 w-3" /> Completed
          </span>
        )
      case "in_progress":
        return (
          <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
            <Clock className="h-3 w-3" /> In Progress
          </span>
        )
      case "cancelled":
        return (
          <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
            <AlertCircle className="h-3 w-3" /> Pending
          </span>
        )
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center text-center">
        <CheckSquare className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground">No tasks found</p>
        <p className="mt-1 text-sm text-muted-foreground">Tasks assigned to you will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id}>
          <div className="flex flex-col md:flex-row">
            <div className="p-4 md:w-2/3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{task.title}</h3>
                <div className="flex items-center gap-2">
                  {getStatusBadge(task.status)}
                  <span className={`rounded-full px-2 py-1 text-xs ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{task.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {task.projectName && (
                  <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs">
                    <MapPin className="h-3 w-3 text-muted-foreground" /> {task.projectName}
                  </span>
                )}
                {task.clientName && (
                  <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs">
                    <User className="h-3 w-3 text-muted-foreground" /> {task.clientName}
                  </span>
                )}
                <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs">
                  <Calendar className="h-3 w-3 text-muted-foreground" /> Due: {formatDate(task.dueDate)}
                </span>
              </div>
            </div>
            <div className="border-t md:border-l md:border-t-0 p-4 md:w-1/3 flex flex-col justify-center space-y-2">
              <Button variant="outline" className="w-full" onClick={() => onViewTask(task.id)}>
                View Details
              </Button>

              {task.status === "pending" && (
                <Button className="w-full" onClick={() => onStatusChange(task.id, "in_progress")}>
                  Start Task
                </Button>
              )}

              {task.status === "in_progress" && (
                <Button className="w-full" onClick={() => onStatusChange(task.id, "completed")}>
                  Mark as Completed
                </Button>
              )}

              {task.status === "completed" && !task.feedbackSubmitted && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => (window.location.href = `/manager/feedback?taskId=${task.id}`)}
                >
                  Submit Feedback
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

