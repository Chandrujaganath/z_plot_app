"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase-config"

export type UserRole = "superadmin" | "admin" | "manager" | "client" | "guest" | null

interface AuthContextType {
  user: User | null
  userRole: UserRole
  loading: boolean
  register: (email: string, password: string, name: string, role: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (displayName?: string, photoURL?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fetch user role from Firestore
  const fetchUserRole = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        setUserRole(userData.role as UserRole)

        // Redirect based on role and current path
        const pathname = window.location.pathname

        // Only redirect if on login page or root
        if (pathname === "/login" || pathname === "/") {
          // Redirect based on role
          switch (userData.role) {
            case "superadmin":
              router.push("/super-admin/dashboard")
              break
            case "admin":
              router.push("/admin/dashboard")
              break
            case "manager":
              router.push("/manager/dashboard")
              break
            case "client":
              router.push("/client/dashboard")
              break
            case "guest":
              router.push("/guest/dashboard")
              break
            default:
              router.push("/unauthorized")
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user role:", error)
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        fetchUserRole(currentUser.uid)
      } else {
        setUserRole(null)
        // If user is logged out and not on login/register page, redirect to login
        const pathname = window.location.pathname
        if (
          pathname !== "/login" &&
          pathname !== "/register" &&
          pathname !== "/forgot-password" &&
          !pathname.includes("/reset-password")
        ) {
          router.push("/login")
        }
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  // Register a new user
  const register = async (email: string, password: string, name: string, role: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update profile with display name
    await firebaseUpdateProfile(user, {
      displayName: name,
    })

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    })

    // Role will be set by the auth state listener
  }

  // Sign in existing user
  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
    // Role and redirect handled by auth state listener
  }

  // Sign out
  const logout = async () => {
    await signOut(auth)
    router.push("/login")
  }

  // Update user profile
  const updateProfile = async (displayName?: string, photoURL?: string) => {
    if (!user) return

    const updateData: {displayName?: string, photoURL?: string} = {}
    if (displayName) updateData.displayName = displayName
    if (photoURL) updateData.photoURL = photoURL

    await firebaseUpdateProfile(user, updateData)
    
    // Update the local user state
    setUser({ ...user, ...updateData })
  }

  const value = {
    user,
    userRole,
    loading,
    register,
    signIn,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

