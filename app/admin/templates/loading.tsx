import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, Building, Calendar, Copy, Users } from "lucide-react"
import AppShell from "@/components/layout/app-shell"

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

export default function TemplatesLoadingPage() {
  return (
    <AppShell navItems={navItems} title="Admin Dashboard">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-9 w-9 rounded-md border bg-background"></div>
        <div>
          <Skeleton className="h-8 w-48 mb-1" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-48 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-72" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-md border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-32 mb-2" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4 mt-1" />
                <div className="mt-3 flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  )
}

