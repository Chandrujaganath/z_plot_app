"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import { format, subDays, startOfDay, endOfDay } from "date-fns"

// Types for super admin analytics data
export interface SuperAdminAnalyticsData {
  // System metrics
  totalProjects: number
  totalUsers: number
  usersByRole: { role: string; count: number }[]

  // Visit metrics
  totalVisits: number
  visitsByStatus: { status: string; count: number }[]
  visitsByMonth: { month: string; count: number }[]

  // Plot metrics
  totalPlots: number
  soldPlots: number
  reservedPlots: number
  availablePlots: number

  // Project performance
  projectPerformance: {
    projectId: string
    projectName: string
    totalPlots: number
    soldPlots: number
    visitRequests: number
  }[]

  // Feedback metrics
  averageFeedbackRating: number
  feedbackCount: number

  // Task metrics
  activeTasks: number
  completedTasks: number
}

export interface DateRange {
  startDate: Date
  endDate: Date
}

// Predefined date ranges
export const dateRanges = {
  last7Days: {
    label: "Last 7 Days",
    range: (): DateRange => ({
      startDate: startOfDay(subDays(new Date(), 7)),
      endDate: endOfDay(new Date()),
    }),
  },
  last30Days: {
    label: "Last 30 Days",
    range: (): DateRange => ({
      startDate: startOfDay(subDays(new Date(), 30)),
      endDate: endOfDay(new Date()),
    }),
  },
  last90Days: {
    label: "Last 90 Days",
    range: (): DateRange => ({
      startDate: startOfDay(subDays(new Date(), 90)),
      endDate: endOfDay(new Date()),
    }),
  },
  lastYear: {
    label: "Last Year",
    range: (): DateRange => ({
      startDate: startOfDay(subDays(new Date(), 365)),
      endDate: endOfDay(new Date()),
    }),
  },
  allTime: {
    label: "All Time",
    range: (): DateRange => ({
      startDate: new Date(2020, 0, 1), // Arbitrary start date in the past
      endDate: endOfDay(new Date()),
    }),
  },
}

export function useSuperAdminAnalytics(dateRange: DateRange) {
  const [data, setData] = useState<SuperAdminAnalyticsData>({
    totalProjects: 0,
    totalUsers: 0,
    usersByRole: [],

    totalVisits: 0,
    visitsByStatus: [],
    visitsByMonth: [],

    totalPlots: 0,
    soldPlots: 0,
    reservedPlots: 0,
    availablePlots: 0,

    projectPerformance: [],

    averageFeedbackRating: 0,
    feedbackCount: 0,

    activeTasks: 0,
    completedTasks: 0,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSuperAdminAnalytics() {
      try {
        setLoading(true)

        // Convert date range to Firestore timestamps
        const startTimestamp = Timestamp.fromDate(dateRange.startDate)
        const endTimestamp = Timestamp.fromDate(dateRange.endDate)

        // Fetch projects
        const projectsQuery = query(collection(db, "projects"))
        const projectsSnapshot = await getDocs(projectsQuery)
        const projects = projectsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        const totalProjects = projects.length

        // Fetch users
        const usersQuery = query(collection(db, "users"))
        const usersSnapshot = await getDocs(usersQuery)
        const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        const totalUsers = users.length

        // Group users by role
        const roleCount: Record<string, number> = {}

        users.forEach((user) => {
          const role = user.role || "unknown"
          roleCount[role] = (roleCount[role] || 0) + 1
        })

        const usersByRole = Object.entries(roleCount)
          .map(([role, count]) => ({ role, count }))
          .sort((a, b) => b.count - a.count)

        // Fetch visits
        const visitsQuery = query(
          collection(db, "visitRequests"),
          where("createdAt", ">=", startTimestamp),
          where("createdAt", "<=", endTimestamp),
        )

        const visitsSnapshot = await getDocs(visitsQuery)
        const visits = visitsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        const totalVisits = visits.length

        // Group visits by status
        const statusCount: Record<string, number> = {}

        visits.forEach((visit) => {
          const status = visit.status || "unknown"
          statusCount[status] = (statusCount[status] || 0) + 1
        })

        const visitsByStatus = Object.entries(statusCount)
          .map(([status, count]) => ({ status, count }))
          .sort((a, b) => b.count - a.count)

        // Group visits by month
        const visitsByMonth: Record<string, number> = {}

        visits.forEach((visit) => {
          const date = (visit.createdAt as Timestamp).toDate()
          const monthKey = format(date, "MMM yyyy")
          visitsByMonth[monthKey] = (visitsByMonth[monthKey] || 0) + 1
        })

        const visitsByMonthArray = Object.entries(visitsByMonth)
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => {
            const dateA = new Date(a.month)
            const dateB = new Date(b.month)
            return dateA.getTime() - dateB.getTime()
          })

        // Fetch plots data
        let totalPlots = 0
        let soldPlots = 0
        let reservedPlots = 0

        // Project performance data
        const projectPerformance: SuperAdminAnalyticsData["projectPerformance"] = []

        for (const project of projects) {
          let projectTotalPlots = project.plotsCount || 0
          let projectSoldPlots = project.soldCount || 0

          // If project doesn't have plotsCount, fetch from plots collection
          if (!projectTotalPlots) {
            const plotsQuery = query(collection(db, "plots"), where("projectId", "==", project.id))

            const plotsSnapshot = await getDocs(plotsQuery)
            const plots = plotsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

            projectTotalPlots = plots.length
            projectSoldPlots = plots.filter((plot) => plot.status === "sold").length
          }

          // Count visit requests for this project
          const projectVisits = visits.filter((visit) => visit.projectId === project.id).length

          projectPerformance.push({
            projectId: project.id,
            projectName: project.name || `Project ${project.id}`,
            totalPlots: projectTotalPlots,
            soldPlots: projectSoldPlots,
            visitRequests: projectVisits,
          })

          totalPlots += projectTotalPlots
          soldPlots += projectSoldPlots
          if (project.reservedCount) reservedPlots += project.reservedCount
        }

        // Sort projects by performance (sold percentage)
        projectPerformance.sort((a, b) => {
          const aPercentage = a.totalPlots > 0 ? a.soldPlots / a.totalPlots : 0
          const bPercentage = b.totalPlots > 0 ? b.soldPlots / b.totalPlots : 0
          return bPercentage - aPercentage
        })

        const availablePlots = totalPlots - soldPlots - reservedPlots

        // Fetch feedback data
        const feedbackQuery = query(
          collection(db, "feedback"),
          where("createdAt", ">=", startTimestamp),
          where("createdAt", "<=", endTimestamp),
        )

        const feedbackSnapshot = await getDocs(feedbackQuery)
        const feedback = feedbackSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        const feedbackCount = feedback.length

        // Calculate average rating
        let averageFeedbackRating = 0

        if (feedbackCount > 0) {
          let totalRating = 0

          feedback.forEach((item) => {
            if (item.rating) {
              totalRating += item.rating
            }
          })

          averageFeedbackRating = totalRating / feedbackCount
        }

        // Fetch tasks data
        const tasksQuery = query(
          collection(db, "tasks"),
          where("createdAt", ">=", startTimestamp),
          where("createdAt", "<=", endTimestamp),
        )

        const tasksSnapshot = await getDocs(tasksQuery)
        const tasks = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        const activeTasks = tasks.filter((task) => task.status !== "completed").length
        const completedTasks = tasks.filter((task) => task.status === "completed").length

        // Set all data
        setData({
          totalProjects,
          totalUsers,
          usersByRole,

          totalVisits,
          visitsByStatus,
          visitsByMonth: visitsByMonthArray,

          totalPlots,
          soldPlots,
          reservedPlots,
          availablePlots,

          projectPerformance,

          averageFeedbackRating,
          feedbackCount,

          activeTasks,
          completedTasks,
        })

        setLoading(false)
      } catch (err) {
        console.error("Error fetching super admin analytics:", err)
        setError("Failed to load analytics data")
        setLoading(false)
      }
    }

    fetchSuperAdminAnalytics()
  }, [dateRange])

  return { data, loading, error }
}

