import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    // Check for maintenance or development mode
    if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true") {
      return NextResponse.json(
        { message: "This API is currently in maintenance mode." },
        { status: 503 }
      )
    }

    // Get the leave request data from the request
    const { leaveId, approved, reason, approvedBy } = await request.json()

    if (!leaveId || approved === undefined || !approvedBy) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    try {
      // Get the leave request
      const leaveDoc = await adminDb.collection("leaveRequests").doc(leaveId).get()

      if (!leaveDoc.exists) {
        return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
      }

      // Update the leave request
      const updateData = {
        status: approved ? "approved" : "rejected",
        updatedAt: new Date().toISOString(),
        approvedBy,
        approvedAt: new Date().toISOString(),
      }

      if (!approved && reason) {
        updateData.rejectionReason = reason
      }

      await adminDb.collection("leaveRequests").doc(leaveId).update(updateData)

      return NextResponse.json({
        success: true,
        status: approved ? "approved" : "rejected",
      })
    } catch (dbError) {
      console.error("Database operation failed:", dbError)
      // Return a more specific error for Firebase-related issues
      if (dbError.code && dbError.code.startsWith("app/")) {
        return NextResponse.json(
          { error: "Firebase service unavailable. Please try again later." },
          { status: 503 }
        )
      }
      throw dbError; // Re-throw for general error handling
    }
  } catch (error) {
    console.error("Error processing leave request:", error)
    return NextResponse.json({ error: "Failed to process leave request" }, { status: 500 })
  }
}

