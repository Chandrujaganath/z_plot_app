"use client"

import { motion, AnimatePresence } from "framer-motion"
import { 
  Building, 
  Users, 
  Calendar, 
  Bell, 
  BarChart, 
  FileText, 
  Briefcase, 
  MapPin, 
  Clock, 
  TrendingUp,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import { MiniProfileCard } from "@/components/ui/mini-profile-card"
import { useAuth } from "@/lib/auth-context"
import AppShell from "@/components/layout/app-shell"
import ProtectedRoute from "@/components/protected-route"
import { formatIndianCurrency } from "@/lib/utils"
import { DashboardTile } from "@/components/ui/dashboard-tile"

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

export default function AdminDashboard() {
  const { user } = useAuth()

  const modules = [
    {
      title: "Projects",
      icon: <Building className="h-6 w-6" />,
      href: "/admin/projects",
      color: "blue" as const,
    },
    {
      title: "Managers",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/managers",
      color: "purple" as const,
    },
    {
      title: "Leave Requests",
      icon: <Calendar className="h-6 w-6" />,
      href: "/admin/leaves",
      color: "green" as const,
    },
    {
      title: "Visit Requests",
      icon: <MapPin className="h-6 w-6" />,
      href: "/admin/visits",
      color: "orange" as const,
    },
    {
      title: "Announcements",
      icon: <Bell className="h-6 w-6" />,
      href: "/admin/announcements",
      color: "red" as const,
    },
    {
      title: "Reports",
      icon: <FileText className="h-6 w-6" />,
      href: "/admin/reports",
      color: "teal" as const,
    },
  ]

  // Mock data for dashboard metrics
  const metrics = {
    totalProjects: 12,
    totalManagers: 8,
    activeVisits: 24,
    pendingLeaves: 5,
    projectValue: 15000000,
    recentActivity: [
      { id: 1, type: "visit", title: "New visit request", time: "10 minutes ago", status: "pending" },
      { id: 2, type: "leave", title: "Leave approved", time: "1 hour ago", status: "approved" },
      { id: 3, type: "project", title: "New plot sold", time: "2 hours ago", status: "completed" },
      { id: 4, type: "visit", title: "Visit completed", time: "Yesterday", status: "completed" }
    ]
  }

  // Get status color for activity items
  const getStatusColor = (status: string) => {
    switch(status) {
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "approved": return "bg-green-100 text-green-700";
      case "completed": return "bg-blue-100 text-blue-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  // Get icon for activity items
  const getActivityIcon = (type: string) => {
    switch(type) {
      case "visit": return <MapPin className="h-4 w-4 text-blue-500" />;
      case "leave": return <Calendar className="h-4 w-4 text-purple-500" />;
      case "project": return <Building className="h-4 w-4 text-green-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  }

  return (
    <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
      <AppShell navItems={navItems} title="Admin Dashboard">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative px-2 sm:px-4"
        >
          {/* Header with gradient background */}
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-blue-600 to-blue-500 rounded-b-3xl -z-10" />
          
          {/* Profile Card - Fixed at top */}
          <div className="sticky top-0 z-10 pt-4 pb-3 bg-transparent">
            <MiniProfileCard className="max-w-md mx-auto md:mx-0 shadow-lg backdrop-blur-sm bg-white/90" />
          </div>
          
          <div className="mt-6 mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back!</h1>
            <p className="text-blue-100 text-sm">Here's what's happening with your projects today</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-md p-4 flex flex-col"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500 text-xs">Total Projects</span>
                <div className="bg-blue-100 p-2 rounded-full">
                  <Building className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-800">{metrics.totalProjects}</span>
              <div className="mt-2 flex items-center text-xs text-emerald-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+2 this month</span>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl shadow-md p-4 flex flex-col"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500 text-xs">Total Managers</span>
                <div className="bg-purple-100 p-2 rounded-full">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-800">{metrics.totalManagers}</span>
              <div className="mt-2 flex items-center text-xs text-emerald-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+1 this month</span>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-md p-4 flex flex-col"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500 text-xs">Active Visits</span>
                <div className="bg-orange-100 p-2 rounded-full">
                  <MapPin className="h-4 w-4 text-orange-600" />
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-800">{metrics.activeVisits}</span>
              <div className="mt-2 flex items-center text-xs text-emerald-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+5 this week</span>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl shadow-md p-4 flex flex-col"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500 text-xs">Total Value</span>
                <div className="bg-green-100 p-2 rounded-full">
                  <BarChart className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-800">{formatIndianCurrency(metrics.projectValue)}</span>
              <div className="mt-2 flex items-center text-xs text-emerald-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+10% this month</span>
              </div>
            </motion.div>
          </div>
          
          {/* Quick Access Modules */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Quick Access</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {modules.map((module, index) => (
                <motion.div
                  key={module.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.3 }}
                >
                  <DashboardTile {...module} />
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-md p-4 mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
              <Link 
                href="/admin/activity" 
                className="text-xs text-blue-600 flex items-center"
              >
                View all <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-3">
              <AnimatePresence>
                {metrics.recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 + 0.4 }}
                    className="flex items-center p-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="bg-gray-100 p-2 rounded-full mr-3">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">{activity.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
          
          {/* Pending Approvals */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          >
            <div className="bg-white rounded-2xl shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Pending Leave Requests</h2>
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                  {metrics.pendingLeaves} pending
                </span>
              </div>
              {metrics.pendingLeaves > 0 ? (
                <Link 
                  href="/admin/leaves"
                  className="block text-center bg-blue-50 text-blue-600 rounded-xl py-2 text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  Review Requests
                </Link>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No pending leave requests</p>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-2xl shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Today's Visits</h2>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  5 today
                </span>
              </div>
              <Link 
                href="/admin/visits"
                className="block text-center bg-blue-50 text-blue-600 rounded-xl py-2 text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                View Schedule
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </AppShell>
    </ProtectedRoute>
  )
}

