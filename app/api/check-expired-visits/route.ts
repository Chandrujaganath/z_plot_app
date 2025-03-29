import { type NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    const now = new Date()

    // Get all visits that have expired QR codes
    const visitsSnapshot = await adminDb
      .collection("visitRequests")
      .where("status", "in", ["approved", "checked-in"])
      .where("qrCodeExpiry", "<", now.toISOString())
      .get()

    if (visitsSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: "No expired visits found",
        processedCount: 0,
      })
    }

    const processedVisits = []

    // Process each expired visit
    for (const doc of visitsSnapshot.docs) {
      const visitData = doc.data()

      // Update visit status to completed
      await adminDb.collection("visitRequests").doc(doc.id).update({
        status: "completed",
        updatedAt: now.toISOString(),
      })

      // Check if the user is a guest
      const userDoc = await adminDb.collection("users").doc(visitData.userId).get()

      if (userDoc.exists && userDoc.data()?.role === "guest") {
        // Check if this was their last active visit
        const activeVisitsSnapshot = await adminDb
          .collection("visitRequests")
          .where("userId", "==", visitData.userId)
          .where("status", "in", ["approved", "checked-in"])
          .where("qrCodeExpiry", ">", now.toISOString())
          .limit(1)
          .get()

        // If no more active visits, disable the guest account
        if (activeVisitsSnapshot.empty) {
          // Update user document
          await adminDb.collection("users").doc(visitData.userId).update({
            disabled: true,
            updatedAt: now.toISOString(),
          })

          // Disable Firebase Auth account
          await adminAuth.updateUser(visitData.userId, { disabled: true })

          processedVisits.push({
            visitId: doc.id,
            userId: visitData.userId,
            action: "account_disabled",
          })
        } else {
          processedVisits.push({
            visitId: doc.id,
            userId: visitData.userId,
            action: "visit_completed",
          })
        }
      } else {
        processedVisits.push({
          visitId: doc.id,
          userId: visitData.userId,
          action: "visit_completed",
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Processed expired visits",
      processedCount: processedVisits.length,
      processedVisits,
    })
  } catch (error) {
    console.error("Error checking expired visits:", error)
    return NextResponse.json({ error: "Failed to process expired visits" }, { status: 500 })
  }
}

