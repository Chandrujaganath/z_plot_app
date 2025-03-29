"use server"

import { auth, adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

export interface AdminUserData {
  uid: string
  email: string
  displayName: string
  role: "admin" | "superadmin"
  disabled: boolean
  createdAt: string
}

export async function createAdminUser(
  email: string,
  password: string,
  displayName: string,
  role: "admin" | "superadmin",
) {
  try {
    // Create user with Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: true,
    })

    // Set custom claims for admin role
    await auth.setCustomUserClaims(userRecord.uid, {
      role: role,
    })

    // Create user document in Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      email,
      displayName,
      role: role,
      disabled: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return { success: true, uid: userRecord.uid }
  } catch (error) {
    console.error("Error creating admin user:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getAdminUsers() {
  try {
    // Get all users with admin or superadmin role from Firestore
    const snapshot = await adminDb.collection("users").where("role", "in", ["admin", "superadmin"]).get()

    if (snapshot.empty) {
      return { success: true, users: [] }
    }

    const users = snapshot.docs.map(
      (doc) =>
        ({
          uid: doc.id,
          email: doc.data().email,
          displayName: doc.data().displayName,
          role: doc.data().role,
          disabled: doc.data().disabled || false,
          createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString(),
        }) as AdminUserData,
    )

    return { success: true, users }
  } catch (error) {
    console.error("Error getting admin users:", error)
    return { success: false, error: (error as Error).message, users: [] }
  }
}

export async function updateAdminUser(uid: string, data: { displayName?: string; role?: string; disabled?: boolean }) {
  try {
    // Update user in Firebase Auth
    await auth.updateUser(uid, {
      displayName: data.displayName,
      disabled: data.disabled,
    })

    // Update user document in Firestore
    const updateData: Record<string, any> = {}
    if (data.displayName) updateData.displayName = data.displayName
    if (data.role) updateData.role = data.role
    if (data.disabled !== undefined) updateData.disabled = data.disabled
    updateData.updatedAt = FieldValue.serverTimestamp()

    await adminDb.collection("users").doc(uid).update(updateData)

    return { success: true }
  } catch (error) {
    console.error("Error updating admin user:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function deleteAdminUser(uid: string) {
  try {
    // Delete user from Firebase Auth
    await auth.deleteUser(uid)

    // Delete user document from Firestore
    await adminDb.collection("users").doc(uid).delete()

    return { success: true }
  } catch (error) {
    console.error("Error deleting admin user:", error)
    return { success: false, error: (error as Error).message }
  }
}

