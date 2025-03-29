"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { 
  Building, 
  Home, 
  MapPin, 
  MessageSquare, 
  FileText, 
  Calendar, 
  Phone, 
  Bookmark, 
  Clock, 
  ArrowRight, 
  Star,
  ChevronRight,
  QrCode,
  Receipt,
  History,
  ThumbsUp,
  Clock8,
  CheckCircle,
  CreditCard
} from "lucide-react"
import { MiniProfileCard } from "@/components/ui/mini-profile-card"
import { DashboardTile } from "@/components/ui/dashboard-tile"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const navItems = [
  {
    title: "Dashboard",
    href: "/client/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "My Plots",
    href: "/client/plots",
    icon: <Building className="h-5 w-5" />,
  },
  {
    title: "Visit History",
    href: "/client/visit-history",
    icon: <History className="h-5 w-5" />,
  },
  {
    title: "Documents",
    href: "/client/documents",
    icon: <FileText className="h-5 w-5" />,
  },
]

export default function ClientDashboard() {
  const { user } = useAuth()
  const displayName = user?.displayName || "Client"

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const modules = [
    {
      title: "My Plots",
      icon: <Building className="h-6 w-6" />,
      href: "/client/plots",
      color: "blue" as const,
    },
    {
      title: "Generate QR",
      icon: <QrCode className="h-6 w-6" />,
      href: "/client/generate-qr",
      color: "green" as const,
    },
    {
      title: "Documents",
      icon: <FileText className="h-6 w-6" />,
      href: "/client/documents",
      color: "purple" as const,
    },
    {
      title: "Payments",
      icon: <Receipt className="h-6 w-6" />,
      href: "/client/payments",
      color: "orange" as const,
    },
    {
      title: "Visit History",
      icon: <History className="h-6 w-6" />,
      href: "/client/visit-history",
      color: "teal" as const,
    },
    {
      title: "Feedback",
      icon: <ThumbsUp className="h-6 w-6" />,
      href: "/client/feedback",
      color: "red" as const,
    },
  ]

  // Mock data for plots
  const ownedPlots = [
    {
      id: 1,
      name: "Sunset View Villa",
      plotNumber: "24B",
      location: "Lake District",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      status: "Purchased",
      progress: 100
    },
    {
      id: 2,
      name: "Mountain Retreat",
      plotNumber: "15A",
      location: "Highland Area",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      status: "In Progress",
      progress: 75
    }
  ]

  // Mock data for upcoming visits
  const upcomingVisits = [
    {
      id: 1,
      projectName: "Sunset View Villa",
      plotNumber: "24B",
      location: "Lake District",
      date: "Tomorrow, 10:00 AM",
      status: "confirmed"
    },
    {
      id: 2,
      projectName: "Mountain Retreat",
      plotNumber: "15A",
      location: "Highland Area",
      date: "Oct 25, 2:30 PM",
      status: "pending"
    }
  ]

  // Mock data for recent payments
  const recentPayments = [
    {
      id: 1,
      plotNumber: "24B",
      amount: "₹50,000",
      date: "Oct 15, 2023",
      status: "completed",
      type: "Installment"
    },
    {
      id: 2,
      plotNumber: "15A",
      amount: "₹25,000",
      date: "Sep 30, 2023",
      status: "completed",
      type: "Booking Amount"
    }
  ]

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <ProtectedRoute requiredRoles={["client"]}>
      <AppShell navItems={navItems} title="Client Dashboard">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative px-1 sm:px-4 pb-6"
        >
          {/* Header with gradient background */}
          <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 rounded-b-3xl -z-10" />
          
          {/* Profile Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="pt-4 pb-3 bg-transparent"
          >
            <MiniProfileCard className="max-w-md mx-auto md:mx-0 shadow-lg backdrop-blur-sm bg-white/90 border-none rounded-xl" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-6 mb-8 px-2"
          >
            <h1 className="text-2xl font-bold tracking-tight text-white">{getGreeting()}, {displayName}!</h1>
            <p className="text-blue-100 text-sm">Welcome to your personal dashboard</p>
          </motion.div>
          
          {/* Quick Access */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mb-6 px-2"
          >
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {modules.map((module, index) => (
                <motion.div
                  key={module.title}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.95 }}
                >
                  <DashboardTile {...module} />
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* My Plots */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6 px-2"
          >
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-md p-5 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Building className="h-4 w-4 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">My Plots</h2>
                </div>
                <Link 
                  href="/client/plots" 
                  className="text-xs font-medium text-blue-600 flex items-center"
                >
                  View all <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {ownedPlots.map((plot, index) => (
                  <motion.div
                    key={plot.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="flex bg-slate-50 rounded-xl overflow-hidden shadow-sm"
                  >
                    <div className="w-24 h-24 relative flex-shrink-0">
                      <Image
                        src={plot.image}
                        alt={plot.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3 flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-sm">{plot.name}</h3>
                        <Badge className={plot.progress === 100 
                          ? "bg-green-100 text-green-700 border-green-200" 
                          : "bg-blue-100 text-blue-700 border-blue-200"
                        }>
                          {plot.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        Plot {plot.plotNumber}, {plot.location}
                      </p>
                      {plot.progress < 100 ? (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Construction Progress</span>
                            <span className="font-medium">{plot.progress}%</span>
                          </div>
                          <Progress value={plot.progress} className="h-1.5" />
                        </div>
                      ) : (
                        <div className="flex items-center text-xs text-green-600 mt-1">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          <span>Complete</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Visit History */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-md p-5 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Upcoming Visits</h2>
                </div>
                <Link 
                  href="/client/visit-history" 
                  className="text-xs font-medium text-blue-600 flex items-center"
                >
                  View all <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Link>
              </div>
              
              <div className="space-y-3">
                {upcomingVisits.map((visit, index) => (
                  <motion.div 
                    key={visit.id} 
                    whileHover={{ x: 2 }}
                    className="flex items-start p-3 rounded-xl border border-slate-100 last:border-0 bg-slate-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mr-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-sm">{visit.projectName}</h3>
                        <Badge className={visit.status === 'confirmed' 
                          ? "bg-green-100 text-green-700 border-green-200" 
                          : "bg-yellow-100 text-yellow-700 border-yellow-200"
                        }>
                          {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Plot {visit.plotNumber}, {visit.location}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-slate-600">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{visit.date}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Recent Payments */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-md p-5 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Recent Payments</h2>
                </div>
                <Link 
                  href="/client/payments" 
                  className="text-xs font-medium text-blue-600 flex items-center"
                >
                  View all <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Link>
              </div>
              
              <div className="space-y-3">
                {recentPayments.map((payment, index) => (
                  <motion.div 
                    key={payment.id} 
                    whileHover={{ x: 2 }}
                    className="flex items-start p-3 rounded-xl border border-slate-100 bg-slate-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mr-3">
                      <Receipt className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-sm">{payment.type} - Plot {payment.plotNumber}</h3>
                        <span className="font-semibold text-sm text-green-600">{payment.amount}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center text-xs text-slate-600">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{payment.date}</span>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
                          Completed
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* QR Code Reminder */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-2xl shadow-lg p-5 text-white">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 mr-4">
                    <QrCode className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Generate Visit QR Code</h3>
                    <p className="text-sm text-blue-100 mb-3">
                      Generate a QR code to quickly check-in during your next site visit
                    </p>
                    <Button 
                      className="bg-white text-blue-600 hover:bg-blue-50 rounded-full shadow-md"
                      asChild
                    >
                      <Link href="/client/generate-qr">
                        Generate QR <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </AppShell>
    </ProtectedRoute>
  )
}

