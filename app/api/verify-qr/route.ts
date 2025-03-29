import { type NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    // Check for maintenance or development mode
    if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true") {
      return NextResponse.json(
        { message: "This API is currently in maintenance mode." },
        { status: 503 }
      )
    }

    // Get the QR token from the request
    const { qrToken, type } = await request.json()

    if (!qrToken || !type) {
      return NextResponse.json({ error: "QR token and type are required" }, { status: 400 })
    }

    try {
      // Check if it's a client permanent QR or visitor QR
      if (type === "client") {
        // Format: client:userId:plot:plotId
        const parts = qrToken.split(":")
        if (parts.length !== 4 || parts[0] !== "client") {
          return NextResponse.json({ error: "Invalid client QR format" }, { status: 400 })
        }

        const userId = parts[1]
        const plotId = parts[3]

        // Verify the user exists and is a client
        const userRecord = await adminAuth.getUser(userId)
        if (!userRecord || userRecord.disabled) {
          return NextResponse.json({ error: "Invalid or disabled user" }, { status: 400 })
        }

        // Verify the user owns the plot
        const plotDoc = await adminDb.collection("plots").doc(plotId).get()
        if (!plotDoc.exists || plotDoc.data()?.ownerId !== userId) {
          return NextResponse.json({ error: "User does not own this plot" }, { status: 400 })
        }

        // Log the entry/exit
        await adminDb.collection("accessLogs").add({
          userId,
          plotId,
          type: "client",
          timestamp: new Date().toISOString(),
          action: "entry", // or 'exit' based on additional parameters
        })

        return NextResponse.json({
          success: true,
          user: {
            name: userRecord.displayName,
            email: userRecord.email,
          },
          plot: {
            id: plotId,
            number: plotDoc.data()?.plotNumber,
          },
        })
      } else if (type === "visitor") {
        // Check visitor QR in the visitorQRs collection
        const now = new Date()

        const visitorQRsRef = adminDb.collection("visitorQRs")
        const snapshot = await visitorQRsRef
          .where("qrCodeToken", "==", qrToken)
          .where("status", "==", "active")
          .where("expiryDate", ">", now.toISOString())
          .limit(1)
          .get()

        if (snapshot.empty) {
          return NextResponse.json({ error: "Invalid or expired visitor QR code" }, { status: 400 })
        }

        const visitorQR = snapshot.docs[0]
        const visitorData = visitorQR.data()

        // Log the entry
        await adminDb.collection("accessLogs").add({
          visitorId: visitorQR.id,
          clientId: visitorData.clientId,
          plotId: visitorData.plotId,
          type: "visitor",
          timestamp: new Date().toISOString(),
          action: "entry", // or 'exit' based on additional parameters
        })

        // Update the visitor QR status to 'used' if this is an entry
        // In a real system, you might want to keep it active until they exit
        await visitorQR.ref.update({
          status: "used",
          updatedAt: now.toISOString(),
        })

        return NextResponse.json({
          success: true,
          visitor: {
            name: visitorData.visitorName,
            phone: visitorData.visitorPhone,
            purpose: visitorData.purpose,
          },
          plot: {
            id: visitorData.plotId,
          },
        })
      }

      return NextResponse.json({ error: "Invalid QR type" }, { status: 400 })
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
    console.error("Error verifying QR code:", error)
    return NextResponse.json({ error: "Failed to verify QR code" }, { status: 500 })
  }
}

