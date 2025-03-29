"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, PieChart } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import { formatIndianRupees } from "@/lib/utils"

// Define types for our data
interface AnalyticsData {
  plotsSold: number
  totalRevenue: number
  pendingPayments: number
  visitConversion: number
  monthlySales: { month: string; sales: number }[]
  plotTypeDistribution: { type: string; count: number }[]
  paymentStatusDistribution: { status: string; amount: number }[]
  employeePerformance: { name: string; sales: number }[]
}

export default function SuperAdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch plots data
        const plotsQuery = query(collection(db, "plots"))
        const plotsSnapshot = await getDocs(plotsQuery)
        const plotsData = plotsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        // Fetch bookings data
        const bookingsQuery = query(collection(db, "bookings"))
        const bookingsSnapshot = await getDocs(bookingsQuery)
        const bookingsData = bookingsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        // Fetch payments data
        const paymentsQuery = query(collection(db, "payments"))
        const paymentsSnapshot = await getDocs(paymentsQuery)
        const paymentsData = paymentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        // Fetch users data (for employee performance)
        const usersQuery = query(collection(db, "users"), where("role", "in", ["admin", "manager"]))
        const usersSnapshot = await getDocs(usersQuery)
        const usersData = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        // Calculate analytics metrics
        const soldPlots = plotsData.filter((plot) => plot.status === "sold")
        const totalRevenue = paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0)
        const pendingPayments = paymentsData
          .filter((payment) => payment.status === "pending")
          .reduce((sum, payment) => sum + (payment.amount || 0), 0)

        // Calculate visit conversion rate
        const totalVisits = bookingsData.length
        const convertedVisits = bookingsData.filter((booking) =>
          soldPlots.some((plot) => plot.id === booking.plotId),
        ).length
        const visitConversion = totalVisits > 0 ? (convertedVisits / totalVisits) * 100 : 0

        // Prepare monthly sales data
        const monthlySalesMap = new Map()
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        // Initialize with zero values
        months.forEach((month) => {
          monthlySalesMap.set(month, 0)
        })

        // Fill in actual data
        soldPlots.forEach((plot) => {
          if (plot.soldDate) {
            const date = new Date(plot.soldDate)
            const month = months[date.getMonth()]
            monthlySalesMap.set(month, monthlySalesMap.get(month) + 1)
          }
        })

        const monthlySales = Array.from(monthlySalesMap.entries()).map(([month, sales]) => ({
          month,
          sales,
        }))

        // Calculate plot type distribution
        const plotTypeMap = new Map()
        plotsData.forEach((plot) => {
          const type = plot.type || "Unknown"
          plotTypeMap.set(type, (plotTypeMap.get(type) || 0) + 1)
        })

        const plotTypeDistribution = Array.from(plotTypeMap.entries()).map(([type, count]) => ({
          type,
          count: count as number,
        }))

        // Calculate payment status distribution
        const paymentStatusMap = new Map()
        paymentsData.forEach((payment) => {
          const status = payment.status || "Unknown"
          paymentStatusMap.set(status, (paymentStatusMap.get(status) || 0) + (payment.amount || 0))
        })

        const paymentStatusDistribution = Array.from(paymentStatusMap.entries()).map(([status, amount]) => ({
          status,
          amount: amount as number,
        }))

        // Calculate employee performance
        const employeePerformanceMap = new Map()

        // Initialize with zero values for all employees
        usersData.forEach((user) => {
          employeePerformanceMap.set(user.name || user.email || user.id, 0)
        })

        // Count sales by employee
        soldPlots.forEach((plot) => {
          if (plot.soldBy) {
            const employeeName = usersData.find((user) => user.id === plot.soldBy)?.name || plot.soldBy
            employeePerformanceMap.set(employeeName, (employeePerformanceMap.get(employeeName) || 0) + 1)
          }
        })

        const employeePerformance = Array.from(employeePerformanceMap.entries())
          .filter(([_, sales]) => sales > 0) // Only include employees with sales
          .map(([name, sales]) => ({
            name,
            sales: sales as number,
          }))
          .sort((a, b) => b.sales - a.sales) // Sort by sales in descending order
          .slice(0, 10) // Get top 10 performers

        // Set the analytics data
        setData({
          plotsSold: soldPlots.length,
          totalRevenue,
          pendingPayments,
          visitConversion,
          monthlySales,
          plotTypeDistribution,
          paymentStatusDistribution,
          employeePerformance,
        })
      } catch (err) {
        console.error("Error fetching analytics data:", err)
        setError("Failed to load analytics data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 md:p-8">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-3/4" />
              </CardContent>
            </Card>
          ))}
          <Card className="col-span-1 md:col-span-2 lg:col-span-4">
            <CardHeader>
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="h-80">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Plots Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.plotsSold || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatIndianRupees(data?.totalRevenue || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatIndianRupees(data?.pendingPayments || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Visit Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.visitConversion.toFixed(1) || 0}%</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="sales">
            <TabsList className="mb-4">
              <TabsTrigger value="sales">Sales Trends</TabsTrigger>
              <TabsTrigger value="plots">Plot Distribution</TabsTrigger>
              <TabsTrigger value="payments">Payment Status</TabsTrigger>
              <TabsTrigger value="employees">Employee Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Sales</CardTitle>
                  <CardDescription>Number of plots sold per month</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {data?.monthlySales && (
                    <BarChart
                      data={data.monthlySales}
                      index="month"
                      categories={["sales"]}
                      colors={["blue"]}
                      valueFormatter={(value) => `${value} plots`}
                      className="h-full"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plots">
              <Card>
                <CardHeader>
                  <CardTitle>Plot Type Distribution</CardTitle>
                  <CardDescription>Distribution of plots by type</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {data?.plotTypeDistribution && (
                    <PieChart
                      data={data.plotTypeDistribution}
                      index="type"
                      categories={["count"]}
                      colors={["blue", "cyan", "indigo", "violet"]}
                      valueFormatter={(value) => `${value} plots`}
                      className="h-full"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Status Distribution</CardTitle>
                  <CardDescription>Distribution of payments by status</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {data?.paymentStatusDistribution && (
                    <PieChart
                      data={data.paymentStatusDistribution}
                      index="status"
                      categories={["amount"]}
                      colors={["green", "yellow", "red"]}
                      valueFormatter={(value) => formatIndianRupees(value)}
                      className="h-full"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="employees">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Employees</CardTitle>
                  <CardDescription>Number of plots sold by each employee</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {data?.employeePerformance && (
                    <BarChart
                      data={data.employeePerformance}
                      index="name"
                      categories={["sales"]}
                      colors={["blue"]}
                      valueFormatter={(value) => `${value} plots`}
                      layout="vertical"
                      className="h-full"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

