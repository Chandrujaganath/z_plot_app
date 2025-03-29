"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { Users, Settings, BarChart } from "lucide-react"
import { DateRangeSelector } from "@/components/analytics/date-range-selector"
import { StatsCard } from "@/components/analytics/stats-card"
import { BarChart as BarChartComponent } from "@/components/analytics/bar-chart"
import { LineChart } from "@/components/analytics/line-chart"
import { PieChart } from "@/components/analytics/pie-chart"
import { useSuperAdminAnalytics } from "@/hooks/use-super-admin-analytics"

const navItems = [
  {
    title: "Dashboard",
    href: "/super-admin/dashboard",
    icon: <BarChart className="h-5 w-5" />,
  },
  {
    title: "Admin Management",
    href: "/super-admin/admin-management",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Global Configuration",
    href: "/super-admin/global-config",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    title: "Global Announcements",
    href: "/super-admin/announcements",
    icon: <BarChart className="h-5 w-5" />,
  },
  {
    title: "Analytics",
    href: "/super-admin/analytics",
    icon: <BarChart className="h-5 w-5" />,
  },
]

export default function SuperAdminAnalyticsPage() {
  const { data, isLoading, error, setDateRange } = useSuperAdminAnalytics()

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setDateRange(startDate, endDate)
  }

  if (error) {
    return (
      <ProtectedRoute requiredRoles={["superadmin"]}>
        <AppShell navItems={navItems} title="SuperAdmin Portal">
          <div className="w-full">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold tracking-tight">System Analytics</h1>
              <DateRangeSelector onChange={handleDateRangeChange} />
            </div>
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Error loading analytics data. Please try again later.</p>
              </CardContent>
            </Card>
          </div>
        </AppShell>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRoles={["superadmin"]}>
      <AppShell navItems={navItems} title="SuperAdmin Portal">
        <div className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold tracking-tight">System Analytics</h1>
            <DateRangeSelector onChange={handleDateRangeChange} />
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading analytics data...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <StatsCard title="Total Revenue" value={data.totalRevenue} change={data.revenueChange} isCurrency />
                <StatsCard title="Total Projects" value={data.totalProjects} change={data.projectsChange} />
                <StatsCard title="Total Users" value={data.totalUsers} change={data.usersChange} />
                <StatsCard title="System Uptime" value={data.systemUptime} suffix="%" change={data.uptimeChange} />
              </div>

              <div className="grid gap-6 md:grid-cols-2 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trends</CardTitle>
                    <CardDescription>System-wide revenue over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LineChart data={data.revenueTrends} xAxisKey="date" yAxisKey="revenue" height={300} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>New users by role over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BarChartComponent data={data.userGrowth} xAxisKey="month" yAxisKey="users" height={300} />
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Distribution</CardTitle>
                    <CardDescription>Users by role</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PieChart data={data.userDistribution} nameKey="role" valueKey="count" height={300} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Activity</CardTitle>
                    <CardDescription>Actions performed by admins</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BarChartComponent data={data.adminActivity} xAxisKey="admin" yAxisKey="actions" height={300} />
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  )
}

