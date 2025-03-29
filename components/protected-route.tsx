"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import type { UserRole } from "@/lib/auth-context"

interface ProtectedRouteProps {
  requiredRoles: UserRole[]
  children: React.ReactNode
}

export default function ProtectedRoute({ requiredRoles, children }: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (requiredRoles && !requiredRoles.includes(userRole!)) {
        router.push("/unauthorized")
      } else {
        setIsAuthorized(true)
      }
      setIsCheckingAuth(false)
    }
  }, [user, userRole, loading, requiredRoles, router])

  if (loading || isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

