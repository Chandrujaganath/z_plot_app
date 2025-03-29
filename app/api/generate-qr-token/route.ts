import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    // Get the visit ID from the request
    const { visitId } = await request.json()

    if (!visitId) {
      return NextResponse.json({ error: "Visit ID is required" }, { status: 400 })
    }

    // Get the visit document
    const visitDoc = await adminDb.collection("visitRequests").doc(visitId).get()

    if (!visitDoc.exists) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 })
    }

    const visitData = visitDoc.data()

    // Check if the visit is already approved
    if (visitData?.status === "approved" && visitData?.qrCodeToken) {
      return NextResponse.json({
        success: true,
        qrCodeToken: visitData.qrCodeToken,
        message: "QR code already generated",
      })
    }

    // Generate a unique token
    const token = uuidv4()

    // Calculate expiry date (end of the visit day)
    const visitDate = new Date(visitData?.timeSlot.date)
    const expiryDate = new Date(visitDate)
    expiryDate.setHours(23, 59, 59, 999)

    // Update the visit document with the token and expiry
    await adminDb.collection("visitRequests").doc(visitId).update({
      status: "approved",
      qrCodeToken: token,
      qrCodeExpiry: expiryDate.toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      qrCodeToken: token,
    })
  } catch (error) {
    console.error("Error generating QR token:", error)
    return NextResponse.json({ error: "Failed to generate QR token" }, { status: 500 })
  }
}

