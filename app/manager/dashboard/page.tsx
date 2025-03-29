"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { 
  Briefcase, 
  Users, 
  Map, 
  MessageSquare, 
  FileText, 
  CheckSquare, 
  QrCode, 
  Clipboard, 
  Clock, 
  CalendarCheck, 
  TrendingUp,
  ChevronRight,
  Calendar,
  AlertCircle,
  Building
} from "lucide-react"
import { MiniProfileCard } from "@/components/ui/mini-profile-card"
import { DashboardTile } from "@/components/ui/dashboard-tile"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const navItems = [
  {
    title: "Dashboard",
    href: "/manager/dashboard",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    title: "Tasks",
    href: "/manager/tasks",
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    title: "Attendance",
    href: "/manager/attendance",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Scan QR",
    href: "/manager/scan-qr",
    icon: <QrCode className="h-5 w-5" />,
  },
  {
    title: "Reports",
    href: "/manager/reports",
    icon: <Clipboard className="h-5 w-5" />,
  },
]

export default function ManagerDashboard() {
  const { user } = useAuth()
  const displayName = user?.displayName || "Manager"

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const modules = [
    {
      title: "Tasks",
      icon: <Briefcase className="h-6 w-6" />,
      href: "/manager/tasks",
      color: "blue" as const,
    },
    {
      title: "Attendance",
      icon: <CheckSquare className="h-6 w-6" />,
      href: "/manager/attendance",
      color: "green" as const,
    },
    {
      title: "Visit Verification",
      icon: <QrCode className="h-6 w-6" />,
      href: "/manager/scan-qr",
      color: "purple" as const,
    },
    {
      title: "Site Reports",
      icon: <Clipboard className="h-6 w-6" />,
      href: "/manager/reports",
      color: "orange" as const,
    },
    {
      title: "CCTV",
      icon: <Map className="h-6 w-6" />,
      href: "/manager/cctv",
      color: "teal" as const,
    },
    {
      title: "Feedback",
      icon: <MessageSquare className="h-6 w-6" />,
      href: "/manager/feedback",
      color: "red" as const,
    },
  ]

  // Mock data for tasks
  const todayTasks = [
    {
      id: 1,
      title: "Site Visit with Client",
      projectName: "Sunset View Villa",
      time: "10:00 AM",
      priority: "high",
      status: "pending"
    },
    {
      id: 2,
      title: "Property Inspection",
      projectName: "Mountain Retreat",
      time: "2:00 PM",
      priority: "medium",
      status: "in_progress"
    },
    {
      id: 3,
      title: "Submit Weekly Report",
      projectName: "All Projects",
      time: "5:00 PM",
      priority: "medium",
      status: "pending"
    }
  ]

  // Mock data for metrics
  const metrics = {
    completedTasks: 15,
    pendingTasks: 8,
    todayVisits: 3,
    thisWeekAttendance: 4,
    totalProjects: 5,
    progress: 75
  }

  // Recently approved leaves
  const recentLeaves = [
    {
      id: 1,
      name: "Raj Patel",
      role: "Security Guard",
      dates: "Oct 20 - Oct 25",
      status: "approved",
      approvedOn: "2 hours ago"
    },
    {
      id: 2,
      name: "Priya Shah",
      role: "Site Supervisor",
      dates: "Oct 22 - Oct 23",
      status: "pending",
      approvedOn: "pending"
    }
  ]

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "in_progress": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-green-100 text-green-700";
      case "approved": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <ProtectedRoute requiredRoles={["manager"]}>
      <AppShell navItems={navItems} title="Manager Dashboard">
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
          
          <div className="mt-6 mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">{getGreeting()}, {displayName}!</h1>
            <p className="text-blue-100 text-sm">Welcome to your management dashboard</p>
          </div>
          
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 grid grid-cols-2 gap-4"
          >
            <div className="bg-white rounded-2xl shadow-md p-4 col-span-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">This Week's Progress</h3>
                <span className="text-sm font-bold text-blue-600">{metrics.progress}%</span>
              </div>
              <Progress value={metrics.progress} className="h-2 mb-1" />
              <p className="text-xs text-gray-500">
                {metrics.completedTasks} tasks completed, {metrics.pendingTasks} pending
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Today's Visits</span>
                <div className="bg-purple-100 p-1.5 rounded-full">
                  <CalendarCheck className="h-3 w-3 text-purple-600" />
                </div>
              </div>
              <span className="text-xl font-bold text-gray-800">{metrics.todayVisits}</span>
              <div className="mt-1 text-xs text-green-600 flex items-center">
                <span>Scheduled for today</span>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Projects Assigned</span>
                <div className="bg-blue-100 p-1.5 rounded-full">
                  <Building className="h-3 w-3 text-blue-600" />
                </div>
              </div>
              <span className="text-xl font-bold text-gray-800">{metrics.totalProjects}</span>
              <div className="mt-1 text-xs text-green-600 flex items-center">
                <span>All active sites</span>
              </div>
            </div>
          </motion.div>
          
          {/* Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {modules.map((module, index) => (
                <motion.div
                  key={module.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                >
                  <DashboardTile {...module} />
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Today's Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md p-4 mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Today's Tasks</h2>
              <Link 
                href="/manager/tasks" 
                className="text-xs text-blue-600 flex items-center"
              >
                View all <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {todayTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="flex items-start p-3 border-b border-gray-100 last:border-0"
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1
                    ${task.priority === 'high' ? 'bg-red-100' : task.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'}
                  `}>
                    <Briefcase className={`
                      h-5 w-5
                      ${task.priority === 'high' ? 'text-red-600' : task.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'}
                    `} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-sm">{task.title}</h3>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status === 'in_progress' ? 'In Progress' : 
                         task.status === 'completed' ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{task.projectName}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center text-xs text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {task.time}
                      </div>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {todayTasks.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <CheckSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No tasks scheduled for today</p>
                </div>
              )}
            </div>
            
            {todayTasks.length > 0 && (
              <div className="mt-4">
                <Button 
                  className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  Mark Next Task Complete
                </Button>
              </div>
            )}
          </motion.div>
          
          {/* Leaves & Approvals */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-md p-4 mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Leave Requests</h2>
              <Badge className="bg-yellow-100 text-yellow-700">
                1 Pending
              </Badge>
            </div>
            
            <div className="space-y-3">
              {recentLeaves.map((leave, index) => (
                <motion.div
                  key={leave.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="flex items-start p-3 border-b border-gray-100 last:border-0"
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1
                    ${leave.status === 'approved' ? 'bg-green-100' : 'bg-yellow-100'}
                  `}>
                    <Calendar className={`
                      h-5 w-5
                      ${leave.status === 'approved' ? 'text-green-600' : 'text-yellow-600'}
                    `} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-sm">{leave.name}</h3>
                      <Badge className={getStatusColor(leave.status)}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{leave.role}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center text-xs text-gray-600">
                        <Calendar className="h-3 w-3 mr-1" />
                        {leave.dates}
                      </div>
                      <span className="text-xs text-gray-500">
                        {leave.status === 'approved' ? leave.approvedOn : leave.approvedOn}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {recentLeaves.some(leave => leave.status === 'pending') && (
              <div className="mt-4">
                <Button 
                  className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  Review Pending Requests
                </Button>
              </div>
            )}
          </motion.div>
          
          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-yellow-50 rounded-2xl shadow-md p-4 mb-8 border border-yellow-200"
          >
            <div className="flex items-start">
              <div className="bg-yellow-100 p-2 rounded-full mr-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-yellow-800">Site Visit Alert</h3>
                <p className="text-xs text-yellow-700 mt-1">
                  Don't forget to complete today's site visits and submit your reports before 6:00 PM.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AppShell>
    </ProtectedRoute>
  )
}

