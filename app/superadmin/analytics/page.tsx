"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SuperadminAnalyticsRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the correct path
    router.replace("/super-admin/analytics")
  }, [router])
  
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Redirecting to analytics dashboard...</p>
    </div>
  )
}

