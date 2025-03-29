"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function LogoutPage() {
  const router = useRouter()
  const { logout } = useAuth()

  useEffect(() => {
    const performLogout = async () => {
      await logout()
      router.push("/login")
    }

    performLogout()
  }, [logout, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
        <h1 className="mt-4 text-xl font-semibold">Logging out...</h1>
        <p className="mt-2 text-muted-foreground">Please wait while we log you out.</p>
      </div>
    </div>
  )
}

