"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Edit, Check, X } from "lucide-react"
import { ProfileCard } from "@/components/ui/profile-card"
import { useAuth } from "@/lib/auth-context"

interface ProfilePageProps {
  backUrl?: string
}

export default function ProfilePage({ backUrl }: ProfilePageProps) {
  const { userRole } = useAuth()
  
  const getDefaultBackUrl = () => {
    if (!userRole) return "/login"
    return `/${userRole}/dashboard`
  }
  
  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <div className="mb-6 flex items-center">
        <Link 
          href={backUrl || getDefaultBackUrl()} 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          <span>Back</span>
        </Link>
        <h1 className="mx-auto pr-8 text-xl font-semibold">My Profile</h1>
      </div>
      
      <div className="space-y-6">
        <ProfileCard className="w-full" />
        
        <div className="rounded-xl bg-white p-5 shadow-md">
          <h2 className="mb-4 font-semibold">Account Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Joined On</span>
                <span className="font-medium">January 15, 2023</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Account Type</span>
                <span className="capitalize font-medium">{userRole || "Guest"}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pb-2">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Two-Factor Authentication</span>
                <span className="font-medium text-red-500">Not Enabled</span>
              </div>
              <button className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
                Enable
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 