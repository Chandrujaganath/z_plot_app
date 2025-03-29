import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    // Get the task data from the request
    const {
      taskType,
      title,
      description,
      priority,
      dueDate,
      projectId,
      projectName,
      plotId,
      plotNumber,
      clientId,
      clientName,
    } = await request.json()

    if (!taskType || !title || !description || !priority || !dueDate) {
      return NextResponse.json({ error: "Missing required task fields" }, { status: 400 })
    }

    // Get all active managers
    const managersSnapshot = await adminDb
      .collection("users")
      .where("role", "==", "manager")
      .where("disabled", "==", false)
      .get()

    if (managersSnapshot.empty) {
      return NextResponse.json({ error: "No active managers found" }, { status: 404 })
    }

    const managers = managersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Get the most recent task assignment
    const tasksSnapshot = await adminDb.collection("managerTasks").orderBy("createdAt", "desc").limit(1).get()

    let lastAssignedManagerId = null

    if (!tasksSnapshot.empty) {
      lastAssignedManagerId = tasksSnapshot.docs[0].data().managerId
    }

    // Find the next manager to assign (round-robin)
    let nextManagerIndex = 0

    if (lastAssignedManagerId) {
      const lastManagerIndex = managers.findIndex((manager) => manager.id === lastAssignedManagerId)
      nextManagerIndex = (lastManagerIndex + 1) % managers.length
    }

    const assignedManager = managers[nextManagerIndex]

    // Create the task
    const taskData = {
      managerId: assignedManager.id,
      managerName: assignedManager.displayName || "",
      taskType,
      title,
      description,
      status: "pending",
      priority,
      dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add optional fields if provided
    if (projectId) taskData.projectId = projectId
    if (projectName) taskData.projectName = projectName
    if (plotId) taskData.plotId = plotId
    if (plotNumber) taskData.plotNumber = plotNumber
    if (clientId) taskData.clientId = clientId
    if (clientName) taskData.clientName = clientName

    // Save to Firestore
    const taskRef = await adminDb.collection("managerTasks").add(taskData)

    return NextResponse.json({
      success: true,
      taskId: taskRef.id,
      assignedTo: {
        managerId: assignedManager.id,
        managerName: assignedManager.displayName || "",
      },
    })
  } catch (error) {
    console.error("Error assigning task:", error)
    return NextResponse.json({ error: "Failed to assign task" }, { status: 500 })
  }
}

