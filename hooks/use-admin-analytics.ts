"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import { format, subDays, startOfDay, endOfDay } from "date-fns"

// Types for analytics data
export interface AdminAnalyticsData {
  // Visit metrics
  totalVisits: number
  pendingVisits: number
  completedVisits: number
  visitsByMonth: { month: string; count: number }[]

  // Plot metrics
  totalPlots: number
  soldPlots: number
  reservedPlots: number
  availablePlots: number

  // Feedback metrics
  averageFeedbackRating: number
  feedbackCount: number
  feedbackDistribution: { rating: number; count: number }[]

  // Task metrics
  activeTasks: number
  completedTasks: number
  tasksByManager: { managerId: string; managerName: string; count: number }[]
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

export function useAdminAnalytics(projectIds: string[], dateRange: DateRange) {
  const [data, setData] = useState<AdminAnalyticsData>({
    totalVisits: 0,
    pendingVisits: 0,
    completedVisits: 0,
    visitsByMonth: [],

    totalPlots: 0,
    soldPlots: 0,
    reservedPlots: 0,
    availablePlots: 0,

    averageFeedbackRating: 0,
    feedbackCount: 0,
    feedbackDistribution: [],

    activeTasks: 0,
    completedTasks: 0,
    tasksByManager: [],
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalyticsData() {
      if (!projectIds.length) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Convert date range to Firestore timestamps
        const startTimestamp = Timestamp.fromDate(dateRange.startDate)
        const endTimestamp = Timestamp.fromDate(dateRange.endDate)

        // Fetch visits data
        const visitsQuery = query(
          collection(db, "visitRequests"),
          where("projectId", "in", projectIds),
          where("createdAt", ">=", startTimestamp),
          where("createdAt", "<=", endTimestamp),
        )

        const visitsSnapshot = await getDocs(visitsQuery)
        const visits = visitsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        // Process visits data
        const totalVisits = visits.length
        const pendingVisits = visits.filter((visit) => visit.status === "pending").length
        const completedVisits = visits.filter((visit) => visit.status === "completed").length

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

        for (const projectId of projectIds) {
          const projectQuery = query(collection(db, "projects"), where("id", "==", projectId))

          const projectSnapshot = await getDocs(projectQuery)
          const project = projectSnapshot.docs[0]?.data()

          if (project) {
            // If project has plotsCount and soldCount fields
            if (project.plotsCount) totalPlots += project.plotsCount
            if (project.soldCount) soldPlots += project.soldCount
            if (project.reservedCount) reservedPlots += project.reservedCount

            // If not, fetch plots collection
            if (!project.plotsCount) {
              const plotsQuery = query(collection(db, "plots"), where("projectId", "==", projectId))

              const plotsSnapshot = await getDocs(plotsQuery)
              const plots = plotsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

              totalPlots += plots.length
              soldPlots += plots.filter((plot) => plot.status === "sold").length
              reservedPlots += plots.filter((plot) => plot.status === "reserved").length
            }
          }
        }

        const availablePlots = totalPlots - soldPlots - reservedPlots

        // Fetch feedback data
        const feedbackQuery = query(
          collection(db, "feedback"),
          where("projectId", "in", projectIds),
          where("createdAt", ">=", startTimestamp),
          where("createdAt", "<=", endTimestamp),
        )

        const feedbackSnapshot = await getDocs(feedbackQuery)
        const feedback = feedbackSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        const feedbackCount = feedback.length

        // Calculate average rating if feedback has rating field
        let averageFeedbackRating = 0
        const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

        if (feedbackCount > 0) {
          let totalRating = 0

          feedback.forEach((item) => {
            if (item.rating) {
              totalRating += item.rating
              ratingDistribution[item.rating] = (ratingDistribution[item.rating] || 0) + 1
            }
          })

          averageFeedbackRating = totalRating / feedbackCount
        }

        const feedbackDistribution = Object.entries(ratingDistribution)
          .map(([rating, count]) => ({ rating: Number(rating), count }))
          .sort((a, b) => a.rating - b.rating)

        // Fetch tasks data
        const tasksQuery = query(
          collection(db, "tasks"),
          where("projectId", "in", projectIds),
          where("createdAt", ">=", startTimestamp),
          where("createdAt", "<=", endTimestamp),
        )

        const tasksSnapshot = await getDocs(tasksQuery)
        const tasks = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        const activeTasks = tasks.filter((task) => task.status !== "completed").length
        const completedTasks = tasks.filter((task) => task.status === "completed").length

        // Group tasks by manager
        const tasksByManagerMap: Record<string, { managerId: string; managerName: string; count: number }> = {}

        for (const task of tasks) {
          if (task.assignedTo && task.status !== "completed") {
            if (!tasksByManagerMap[task.assignedTo]) {
              // Fetch manager name
              let managerName = "Unknown Manager"

              try {
                const managerDoc = await db.collection("users").doc(task.assignedTo).get()
                const managerData = managerDoc.data()

                if (managerData && managerData.name) {
                  managerName = managerData.name
                } else if (managerData && managerData.email) {
                  managerName = managerData.email
                }
              } catch (err) {
                console.error("Error fetching manager data:", err)
              }

              tasksByManagerMap[task.assignedTo] = {
                managerId: task.assignedTo,
                managerName,
                count: 0,
              }
            }

            tasksByManagerMap[task.assignedTo].count++
          }
        }

        const tasksByManager = Object.values(tasksByManagerMap).sort((a, b) => b.count - a.count)

        // Set all data
        setData({
          totalVisits,
          pendingVisits,
          completedVisits,
          visitsByMonth: visitsByMonthArray,

          totalPlots,
          soldPlots,
          reservedPlots,
          availablePlots,

          averageFeedbackRating,
          feedbackCount,
          feedbackDistribution,

          activeTasks,
          completedTasks,
          tasksByManager,
        })

        setLoading(false)
      } catch (err) {
        console.error("Error fetching analytics data:", err)
        setError("Failed to load analytics data")
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [projectIds, dateRange])

  return { data, loading, error }
}

