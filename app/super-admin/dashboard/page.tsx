"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { 
  LayoutDashboard, 
  UserCog, 
  Building, 
  Map, 
  Settings, 
  ServerCog, 
  Shield,
  Bell,
  ChevronRight,
  Users,
  User,
  ArrowUpRight,
  BarChart3,
  Activity,
  Award,
  FileText,
  TrendingUp,
  Clock,
  AlertTriangle
} from "lucide-react"
import { MiniProfileCard } from "@/components/ui/mini-profile-card"
import { DashboardTile } from "@/components/ui/dashboard-tile"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// Navigation items for the dashboard
const navItems = [
  {
    title: "Dashboard",
    href: "/super-admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Admins",
    href: "/super-admin/admins",
    icon: <UserCog className="h-5 w-5" />,
  },
  {
    title: "Projects",
    href: "/super-admin/projects",
    icon: <Building className="h-5 w-5" />,
  },
  {
    title: "Maps",
    href: "/super-admin/maps",
    icon: <Map className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/super-admin/settings",
    icon: <Settings className="h-5 w-5" />,
  },
]

export default function SuperAdminDashboard() {
  const { user } = useAuth()
  const displayName = user?.displayName || "Super Admin"
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  // Quick access modules
  const modules = [
    {
      title: "User Management",
      icon: <UserCog className="h-6 w-6" />,
      href: "/super-admin/admins",
      color: "blue" as const,
    },
    {
      title: "Project Management",
      icon: <Building className="h-6 w-6" />,
      href: "/super-admin/projects",
      color: "green" as const,
    },
    {
      title: "System Settings",
      icon: <ServerCog className="h-6 w-6" />,
      href: "/super-admin/settings",
      color: "purple" as const,
    },
    {
      title: "Security",
      icon: <Shield className="h-6 w-6" />,
      href: "/super-admin/security",
      color: "red" as const,
    },
    {
      title: "Analytics",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/super-admin/analytics",
      color: "orange" as const,
    },
    {
      title: "Audit Logs",
      icon: <FileText className="h-6 w-6" />,
      href: "/super-admin/logs",
      color: "teal" as const,
    },
  ]

  // Mock data for system metrics
  const metrics = {
    totalUsers: 856,
    totalProjects: 42,
    activeUsers: 324,
    systemHealth: 98,
    serverLoad: 34,
    revenueGrowth: 12.5
  }

  // Mock data for recent activities
  const recentActivities = [
    {
      id: 1,
      action: "New admin added",
      user: "John Smith",
      timestamp: "2 hours ago",
      type: "user"
    },
    {
      id: 2,
      action: "System update deployed",
      user: "System",
      timestamp: "5 hours ago",
      type: "system"
    },
    {
      id: 3,
      action: "New project created",
      user: "Sarah Johnson",
      timestamp: "Yesterday",
      type: "project"
    },
    {
      id: 4,
      action: "Security alert resolved",
      user: "Security Team",
      timestamp: "Yesterday",
      type: "security"
    }
  ]

  // Mock data for alerts
  const systemAlerts = [
    {
      id: 1,
      title: "Low server storage",
      description: "Primary storage approaching 80% capacity",
      severity: "warning",
      timestamp: "1 hour ago"
    },
    {
      id: 2,
      title: "Database backup required",
      description: "Last backup performed 7 days ago",
      severity: "info",
      timestamp: "3 hours ago"
    }
  ]

  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch(type) {
      case "user": return <User className="h-5 w-5 text-blue-600" />;
      case "system": return <ServerCog className="h-5 w-5 text-purple-600" />;
      case "project": return <Building className="h-5 w-5 text-green-600" />;
      case "security": return <Shield className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  }

  // Get activity background based on type
  const getActivityBackground = (type: string) => {
    switch(type) {
      case "user": return "bg-blue-100";
      case "system": return "bg-purple-100";
      case "project": return "bg-green-100";
      case "security": return "bg-red-100";
      default: return "bg-gray-100";
    }
  }

  // Get severity based colors
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case "critical": return "bg-red-100 text-red-700";
      case "warning": return "bg-yellow-100 text-yellow-700";
      case "info": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <ProtectedRoute requiredRoles={["superadmin"]}>
      <AppShell navItems={navItems} title="Super Admin Dashboard">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative px-2 sm:px-4 pb-6"
        >
          {/* Header with gradient background */}
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-indigo-800 to-indigo-600 rounded-b-3xl -z-10" />
          
          {/* Profile Card - Fixed at top */}
          <div className="sticky top-0 z-10 pt-4 pb-3 bg-transparent">
            <MiniProfileCard className="max-w-md mx-auto md:mx-0 shadow-lg backdrop-blur-sm bg-white/90" />
          </div>
          
          <div className="mt-6 mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">{getGreeting()}, {displayName}!</h1>
            <p className="text-indigo-100 text-sm">Welcome to your system administration dashboard</p>
          </div>
          
          {/* System Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Total Users</span>
                <div className="bg-blue-100 p-1.5 rounded-full">
                  <Users className="h-3 w-3 text-blue-600" />
                </div>
              </div>
              <span className="text-xl font-bold text-gray-800">{metrics.totalUsers}</span>
              <div className="mt-1 text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+5% this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Total Projects</span>
                <div className="bg-green-100 p-1.5 rounded-full">
                  <Building className="h-3 w-3 text-green-600" />
                </div>
              </div>
              <span className="text-xl font-bold text-gray-800">{metrics.totalProjects}</span>
              <div className="mt-1 text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+2 this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">System Health</span>
                <div className="bg-purple-100 p-1.5 rounded-full">
                  <Activity className="h-3 w-3 text-purple-600" />
                </div>
              </div>
              <span className="text-xl font-bold text-gray-800">{metrics.systemHealth}%</span>
              <div className="mt-1 text-xs text-green-600 flex items-center">
                <span>Excellent</span>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col col-span-2 md:col-span-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">Server Load</h3>
                <span className="text-sm font-bold text-blue-600">{metrics.serverLoad}%</span>
              </div>
              <Progress value={metrics.serverLoad} className="h-2 mb-1" />
              <p className="text-xs text-gray-500">
                Stable, no action required
              </p>
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
          
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md p-4 mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Activities</h2>
              <Link 
                href="/super-admin/logs" 
                className="text-xs text-blue-600 flex items-center"
              >
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="flex items-start p-3 border-b border-gray-100 last:border-0"
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1
                    ${getActivityBackground(activity.type)}
                  `}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-sm">{activity.action}</h3>
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                    </div>
                    <p className="text-xs text-gray-500">{activity.user}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* System Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-md p-4 mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">System Alerts</h2>
              <Badge className="bg-yellow-100 text-yellow-700">
                {systemAlerts.length} Active
              </Badge>
            </div>
            
            <div className="space-y-3">
              {systemAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="flex items-start p-3 border-b border-gray-100 last:border-0"
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1
                    ${alert.severity === 'critical' ? 'bg-red-100' : 
                     alert.severity === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}
                  `}>
                    <AlertTriangle className={`
                      h-5 w-5
                      ${alert.severity === 'critical' ? 'text-red-600' : 
                       alert.severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'}
                    `} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-sm">{alert.title}</h3>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{alert.description}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {alert.timestamp}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {systemAlerts.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Shield className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No system alerts at this time</p>
                </div>
              )}
            </div>
            
            {systemAlerts.length > 0 && (
              <div className="mt-4">
                <Button 
                  className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  Resolve All Alerts
                </Button>
              </div>
            )}
          </motion.div>
          
          {/* Performance Report */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-indigo-800 to-indigo-700 rounded-2xl shadow-lg p-5 mb-8 text-white"
          >
            <div className="flex items-center mb-3">
              <Award className="h-6 w-6 mr-2 text-indigo-200" />
              <h3 className="text-lg font-semibold">System Performance</h3>
            </div>
            <p className="text-sm text-indigo-200 mb-4">
              Overall system performance is excellent. All metrics are within optimal ranges.
            </p>
            <div className="flex justify-between">
              <Button 
                className="bg-white/10 text-white border border-indigo-300/30 hover:bg-white/20"
                asChild
              >
                <Link href="/super-admin/analytics">
                  View Analytics
                </Link>
              </Button>
              <Button 
                className="bg-white text-indigo-700 hover:bg-indigo-50"
                asChild
              >
                <Link href="/super-admin/reports">
                  Generate Report
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </AppShell>
    </ProtectedRoute>
  )
}

