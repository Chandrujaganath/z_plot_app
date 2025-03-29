"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wifi, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

export default function OfflinePage() {
  useEffect(() => {
    // Check for network status changes
    const handleOnline = () => {
      window.location.href = "/"
    }

    window.addEventListener("online", handleOnline)

    return () => {
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center"
      >
        <div className="mb-6 rounded-full bg-blue-100 p-6">
          <Wifi className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">You're offline</h1>
        <p className="mb-6 text-muted-foreground">Please check your internet connection and try again</p>
        <Button onClick={handleRetry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </motion.div>
    </div>
  )
}

