"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { User as UserIcon, LogOut, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

export interface MiniProfileCardProps {
  className?: string
}

export function MiniProfileCard({ className }: MiniProfileCardProps) {
  const { user, userRole, logout } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Format display name
  const displayName = user?.displayName || user?.email?.split('@')[0] || `${userRole?.charAt(0).toUpperCase()}${userRole?.slice(1)}`
  
  // Get profile URL based on role
  const getProfileUrl = () => {
    return `/${userRole}/profile`
  }

  // Handle logout
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
  // Get role badge color based on userRole
  const getRoleBadgeColor = () => {
    switch(userRole) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'superadmin': return 'bg-red-100 text-red-700';
      case 'manager': return 'bg-blue-100 text-blue-700';
      case 'client': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
  
  return (
    <div className="relative">
      <motion.div 
        className={cn(
          "bg-white rounded-xl shadow-md p-3.5 flex items-center justify-between", 
          "border border-gray-100 hover:border-blue-200 transition-all",
          "backdrop-blur-sm bg-white/95",
          isMenuOpen ? "shadow-lg ring-2 ring-blue-100" : "hover:shadow-lg",
          className
        )}
        whileHover={{ scale: 1.01, y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <div className="flex items-center">
          <motion.div 
            className={cn(
              "h-12 w-12 overflow-hidden rounded-full flex-shrink-0 mr-3.5",
              "ring-2 shadow-sm ring-blue-200"
            )}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            {user?.photoURL ? (
              <Image 
                src={user.photoURL} 
                alt={displayName} 
                width={48} 
                height={48} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-blue-500">
                <UserIcon size={24} />
              </div>
            )}
          </motion.div>
          
          <div className="flex-grow min-w-0">
            <h3 className="font-medium text-sm truncate">{displayName}</h3>
            <div className="flex items-center mt-0.5">
              <span className={cn("text-xs px-2 py-0.5 rounded-full capitalize truncate", getRoleBadgeColor())}>
                {userRole || "Guest"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="ml-2 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="absolute z-10 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Link 
              href={getProfileUrl()} 
              className="flex items-center p-3.5 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <Star size={14} className="text-blue-600" />
                </div>
                <span className="text-sm font-medium">View full profile</span>
              </div>
              <motion.div className="ml-auto text-gray-400">
                <Star size={14} />
              </motion.div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 