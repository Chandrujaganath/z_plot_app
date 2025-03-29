"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Settings, Camera, Edit, Mail, Phone, User as UserIcon } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

export interface ProfileCardProps {
  className?: string
}

export function ProfileCard({ className }: ProfileCardProps) {
  const { user, userRole, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  // Default profile based on role
  const getDefaultImage = () => {
    switch(userRole) {
      case "superadmin": return "/images/avatars/superadmin.png"
      case "admin": return "/images/avatars/admin.png"
      case "manager": return "/images/avatars/manager.png"
      case "client": return "/images/avatars/client.png"
      default: return "/images/avatars/guest.png"
    }
  }
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }
  
  // Format display name
  const displayName = user?.displayName || user?.email?.split('@')[0] || `${userRole?.charAt(0).toUpperCase()}${userRole?.slice(1)}`
  
  return (
    <div className={cn("rounded-xl bg-white p-5 shadow-md", className)}>
      <div className="flex flex-col items-center space-y-4">
        {/* Profile Image */}
        <div className="relative">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg">
            {user?.photoURL ? (
              <Image 
                src={user.photoURL} 
                alt={displayName} 
                width={96} 
                height={96} 
                className="h-full w-full object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-500">
                <UserIcon size={40} />
              </div>
            )}
          </div>
          <button className="absolute bottom-0 right-0 rounded-full bg-blue-500 p-2 text-white shadow-md hover:bg-blue-600">
            <Camera size={16} />
          </button>
        </div>
        
        {/* User Info */}
        <div className="text-center">
          <h2 className="text-xl font-semibold">{displayName}</h2>
          <p className="text-sm text-gray-500 capitalize">{userRole || "Guest"}</p>
        </div>
        
        {/* Contact Details */}
        {user?.email && (
          <div className="flex w-full items-center space-x-2 text-sm text-gray-600">
            <Mail size={16} className="shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
        )}
        
        {/* Profile Actions */}
        <div className="grid w-full grid-cols-2 gap-3">
          <button 
            className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            onClick={() => router.push(`/${userRole}/settings`)}
          >
            <Settings size={16} className="mr-2" />
            Settings
          </button>
          
          <motion.button 
            className="flex items-center justify-center rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-100"
            onClick={handleLogout}
            disabled={isLoggingOut}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={16} className="mr-2" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </motion.button>
        </div>
      </div>
    </div>
  )
} 