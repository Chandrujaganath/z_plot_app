import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  type Timestamp,
  serverTimestamp,
  limit,
  startAfter,
  type DocumentSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import type {
  Project,
  Plot,
  VisitRequest,
  Feedback,
  TimeSlot,
  VisitorQR,
  SellRequest,
  ManagerTask,
  Attendance,
  LeaveRequest,
  ManagerFeedback,
  Announcement,
  ProjectTemplate,
  Camera,
} from "@/lib/models"

// Helper function to safely convert Firestore timestamps to ISO strings
const safeTimestampToISO = (timestamp: Timestamp | string | undefined | null) => {
  if (!timestamp) return null

  if (typeof timestamp === "string") {
    return timestamp
  }

  try {
    return timestamp.toDate().toISOString()
  } catch (error) {
    console.error("Error converting timestamp:", error)
    return null
  }
}

// Helper function to safely convert data for Firestore
const prepareForFirestore = (data: any) => {
  // Create a new object to avoid mutating the original
  const prepared = { ...data }

  // Remove undefined values
  Object.keys(prepared).forEach((key) => {
    if (prepared[key] === undefined) {
      delete prepared[key]
    }
  })

  return prepared
}

// Projects
export async function getProjects(): Promise<Project[]> {
  try {
    const projectsRef = collection(db, "projects")
    const snapshot = await getDocs(projectsRef)

    if (snapshot.empty) {
      console.log("No projects found")
      return []
    }

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Project,
    )
  } catch (error) {
    console.error("Error getting projects:", error)
    return []
  }
}

export async function getProject(projectId: string): Promise<Project | null> {
  try {
    const projectRef = doc(db, "projects", projectId)
    const projectDoc = await getDoc(projectRef)

    if (!projectDoc.exists()) {
      console.log("Project not found")
      return null
    }

    return {
      id: projectDoc.id,
      ...projectDoc.data(),
    } as Project
  } catch (error) {
    console.error("Error getting project:", error)
    return null
  }
}

// Plots
export async function getPlots(projectId: string): Promise<Plot[]> {
  try {
    const plotsRef = collection(db, "projects", projectId, "plots")
    const snapshot = await getDocs(plotsRef)

    if (snapshot.empty) {
      console.log("No plots found")
      return []
    }

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Plot,
    )
  } catch (error) {
    console.error("Error getting plots:", error)
    return []
  }
}

// Visit Requests
export async function getVisitRequests(userId?: string): Promise<VisitRequest[]> {
  try {
    let visitRequestsQuery

    if (userId) {
      visitRequestsQuery = query(
        collection(db, "visitRequests"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      )
    } else {
      visitRequestsQuery = query(collection(db, "visitRequests"), orderBy("createdAt", "desc"))
    }

    const snapshot = await getDocs(visitRequestsQuery)

    if (snapshot.empty) {
      console.log("No visit requests found")
      return []
    }

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as VisitRequest,
    )
  } catch (error) {
    console.error("Error getting visit requests:", error)
    return []
  }
}

// Create a new project with plots
export async function createProject(
  projectData: Omit<Project, "id" | "createdAt" | "updatedAt">,
  plotsData: Omit<Plot, "id" | "projectId">[],
) {
  try {
    // Create project document
    const projectRef = collection(db, "projects")

    // Prepare data for Firestore
    const preparedProjectData = prepareForFirestore({
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    const projectDoc = await addDoc(projectRef, preparedProjectData)
    const projectId = projectDoc.id

    // Create plot documents
    const plotsPromises = plotsData.map((plotData) => {
      const plotRef = collection(db, "plots")

      // Prepare data for Firestore
      const preparedPlotData = prepareForFirestore({
        ...plotData,
        projectId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return addDoc(plotRef, preparedPlotData)
    })

    await Promise.all(plotsPromises)

    return projectId
  } catch (error) {
    console.error("Error creating project:", error)
    throw error
  }
}

// Function to get plots for a specific project
export async function getProjectPlots(projectId: string): Promise<Plot[]> {
  try {
    const plotsRef = collection(db, "plots")
    const q = query(plotsRef, where("projectId", "==", projectId))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      console.log("No plots found for project:", projectId)
      return []
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Plot[]
  } catch (error) {
    console.error("Error getting plots for project:", error)
    return []
  }
}

// Get a specific project with its plots
export async function getProjectWithPlots(projectId: string) {
  try {
    // Get project document
    const projectDoc = await getProject(projectId)

    if (!projectDoc) {
      return null
    }

    // Get plots for this project
    const plots = await getProjectPlots(projectId)

    return {
      ...projectDoc,
      plots,
    }
  } catch (error) {
    console.error("Error getting project with plots:", error)
    throw error
  }
}

// Update a project
export async function updateProject(projectId: string, projectData: Partial<Project>) {
  try {
    const projectRef = doc(db, "projects", projectId)

    // Prepare data for Firestore
    const preparedData = prepareForFirestore({
      ...projectData,
      updatedAt: serverTimestamp(),
    })

    await updateDoc(projectRef, preparedData)

    return true
  } catch (error) {
    console.error("Error updating project:", error)
    throw error
  }
}

// Update a plot
export async function updatePlot(plotId: string, plotData: Partial<Plot>) {
  try {
    const plotRef = doc(db, "plots", plotId)

    // Prepare data for Firestore
    const preparedData = prepareForFirestore({
      ...plotData,
      updatedAt: serverTimestamp(),
    })

    await updateDoc(plotRef, preparedData)

    return true
  } catch (error) {
    console.error("Error updating plot:", error)
    throw error
  }
}

// Announcement functions
export async function createAnnouncement(announcementData: Omit<Announcement, "id" | "createdAt" | "updatedAt">) {
  try {
    const announcementRef = collection(db, "announcements")

    // Prepare data for Firestore
    const preparedData = prepareForFirestore({
      ...announcementData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    const docRef = await addDoc(announcementRef, preparedData)
    return docRef.id
  } catch (error) {
    console.error("Error creating announcement:", error)
    throw error
  }
}

export async function getAnnouncements() {
  try {
    const announcementsRef = collection(db, "announcements")
    const q = query(announcementsRef, orderBy("createdAt", "desc"))

    const snapshot = await getDocs(q)
    const announcements: Announcement[] = []

    snapshot.forEach((doc) => {
      announcements.push({ id: doc.id, ...doc.data() } as Announcement)
    })

    return announcements
  } catch (error) {
    console.error("Error fetching announcements:", error)
    throw error
  }
}

export async function deleteAnnouncement(announcementId: string) {
  try {
    const announcementRef = doc(db, "announcements", announcementId)
    await deleteDoc(announcementRef)
    return true
  } catch (error) {
    console.error("Error deleting announcement:", error)
    throw error
  }
}

// Template functions
export async function createTemplate(
  templateData: Omit<ProjectTemplate, "id" | "createdAt" | "updatedAt">,
  templateId?: string,
) {
  try {
    // Prepare data for Firestore
    const preparedData = prepareForFirestore({
      ...templateData,
      updatedAt: serverTimestamp(),
    })

    if (templateId) {
      // Update existing template
      const templateRef = doc(db, "templates", templateId)
      await updateDoc(templateRef, preparedData)
      return templateId
    } else {
      // Create new template
      const templateRef = collection(db, "templates")
      preparedData.createdAt = serverTimestamp()
      const docRef = await addDoc(templateRef, preparedData)
      return docRef.id
    }
  } catch (error) {
    console.error("Error creating/updating template:", error)
    throw error
  }
}

export async function getTemplates() {
  try {
    const templatesRef = collection(db, "templates")
    const q = query(templatesRef, orderBy("createdAt", "desc"))

    const snapshot = await getDocs(q)
    const templates: ProjectTemplate[] = []

    snapshot.forEach((doc) => {
      templates.push({ id: doc.id, ...doc.data() } as ProjectTemplate)
    })

    return templates
  } catch (error) {
    console.error("Error fetching templates:", error)
    throw error
  }
}

export async function getTemplate(templateId: string) {
  try {
    const templateRef = doc(db, "templates", templateId)
    const docSnap = await getDoc(templateRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ProjectTemplate
    }

    return null
  } catch (error) {
    console.error("Error fetching template:", error)
    throw error
  }
}

export async function deleteTemplate(templateId: string) {
  try {
    const templateRef = doc(db, "templates", templateId)
    await deleteDoc(templateRef)
    return true
  } catch (error) {
    console.error("Error deleting template:", error)
    throw error
  }
}

// Manager Task functions
export async function getManagerTasks(managerId: string, status?: string, limitCount = 10, lastDoc?: DocumentSnapshot) {
  const tasksRef = collection(db, "managerTasks")
  let q

  if (status) {
    if (lastDoc) {
      q = query(
        tasksRef,
        where("managerId", "==", managerId),
        where("status", "==", status),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(limitCount),
      )
    } else {
      q = query(
        tasksRef,
        where("managerId", "==", managerId),
        where("status", "==", status),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      )
    }
  } else {
    if (lastDoc) {
      q = query(
        tasksRef,
        where("managerId", "==", managerId),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(limitCount),
      )
    } else {
      q = query(tasksRef, where("managerId", "==", managerId), orderBy("createdAt", "desc"), limit(limitCount))
    }
  }

  const snapshot = await getDocs(q)
  const tasks: ManagerTask[] = []

  snapshot.forEach((doc) => {
    tasks.push({ id: doc.id, ...doc.data() } as ManagerTask)
  })

  const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null

  return { tasks, lastVisible }
}

export async function getManagerTask(taskId: string) {
  const docRef = doc(db, "managerTasks", taskId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as ManagerTask
  }

  return null
}

export async function updateManagerTaskStatus(taskId: string, status: string, notes?: string) {
  const taskRef = doc(db, "managerTasks", taskId)

  const updateData: any = {
    status,
    updatedAt: serverTimestamp(),
  }

  if (status === "completed") {
    updateData.completedAt = serverTimestamp()
  }

  if (notes) {
    updateData.notes = notes
  }

  await updateDoc(taskRef, updateData)

  return true
}

// Attendance functions
export async function checkAttendanceStatus(managerId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const attendanceRef = collection(db, "attendance")
  const q = query(
    attendanceRef,
    where("managerId", "==", managerId),
    where("timestamp", ">=", today),
    orderBy("timestamp", "desc"),
    limit(1),
  )

  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    return { isCheckedIn: false, lastAttendance: null }
  }

  const lastAttendance = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Attendance
  const isCheckedIn = lastAttendance.type === "check_in"

  return { isCheckedIn, lastAttendance }
}

export async function recordAttendance(attendanceData: Omit<Attendance, "id" | "timestamp">) {
  const attendanceRef = collection(db, "attendance")

  // Prepare data for Firestore
  const preparedData = prepareForFirestore(attendanceData)

  const docRef = await addDoc(attendanceRef, {
    ...preparedData,
    timestamp: serverTimestamp(),
  })

  return docRef.id
}

export async function getManagerAttendanceHistory(
  managerId: string,
  startDate?: Date,
  endDate?: Date,
  limitCount = 30,
) {
  const attendanceRef = collection(db, "attendance")
  let q

  if (startDate && endDate) {
    q = query(
      attendanceRef,
      where("managerId", "==", managerId),
      where("timestamp", ">=", startDate),
      where("timestamp", "<=", endDate),
      orderBy("timestamp", "desc"),
      limit(limitCount),
    )
  } else {
    q = query(attendanceRef, where("managerId", "==", managerId), orderBy("timestamp", "desc"), limit(limitCount))
  }

  const snapshot = await getDocs(q)
  const attendanceRecords: Attendance[] = []

  snapshot.forEach((doc) => {
    attendanceRecords.push({ id: doc.id, ...doc.data() } as Attendance)
  })

  return attendanceRecords
}

// Leave Request functions
export async function createLeaveRequest(leaveData: Omit<LeaveRequest, "id" | "createdAt" | "updatedAt" | "status">) {
  const leaveRef = collection(db, "leaveRequests")

  // Prepare data for Firestore
  const preparedData = prepareForFirestore(leaveData)

  const docRef = await addDoc(leaveRef, {
    ...preparedData,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function getManagerLeaveRequests(managerId: string) {
  const leaveRef = collection(db, "leaveRequests")
  const q = query(leaveRef, where("managerId", "==", managerId), orderBy("createdAt", "desc"))

  const snapshot = await getDocs(q)
  const leaveRequests: LeaveRequest[] = []

  snapshot.forEach((doc) => {
    leaveRequests.push({ id: doc.id, ...doc.data() } as LeaveRequest)
  })

  return leaveRequests
}

// Manager Feedback functions
export async function submitManagerFeedback(feedbackData: Omit<ManagerFeedback, "id" | "createdAt">) {
  const feedbackRef = collection(db, "managerFeedback")

  // Prepare data for Firestore
  const preparedData = prepareForFirestore(feedbackData)

  const docRef = await addDoc(feedbackRef, {
    ...preparedData,
    createdAt: serverTimestamp(),
  })

  // Update the task to mark feedback as submitted
  if (feedbackData.taskId) {
    const taskRef = doc(db, "managerTasks", feedbackData.taskId)
    await updateDoc(taskRef, {
      feedbackSubmitted: true,
      updatedAt: serverTimestamp(),
    })
  }

  return docRef.id
}

export async function getManagerFeedbackHistory(managerId: string) {
  const feedbackRef = collection(db, "managerFeedback")
  const q = query(feedbackRef, where("managerId", "==", managerId), orderBy("createdAt", "desc"))

  const snapshot = await getDocs(q)
  const feedback: ManagerFeedback[] = []

  snapshot.forEach((doc) => {
    feedback.push({ id: doc.id, ...doc.data() } as ManagerFeedback)
  })

  return feedback
}

// Client-specific functions
export async function getClientOwnedPlots(clientId: string) {
  const plotsRef = collection(db, "plots")
  const q = query(plotsRef, where("ownerId", "==", clientId))

  const snapshot = await getDocs(q)
  const plots: Plot[] = []

  snapshot.forEach((doc) => {
    plots.push({ id: doc.id, ...doc.data() } as Plot)
  })

  return plots
}

export async function getPlotDetails(plotId: string) {
  const docRef = doc(db, "plots", plotId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Plot
  }

  return null
}

// Visitor QR functions
export async function getActiveVisitorQR(clientId: string) {
  const now = new Date()
  const visitorQRRef = collection(db, "visitorQRs")
  const q = query(
    visitorQRRef,
    where("clientId", "==", clientId),
    where("status", "==", "active"),
    where("expiryDate", ">", now.toISOString()),
    orderBy("expiryDate", "desc"),
    limit(1),
  )

  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    return null
  }

  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as VisitorQR
}

export async function createVisitorQR(visitorData: Omit<VisitorQR, "id" | "createdAt" | "qrCodeToken">) {
  // Generate a unique token
  const qrCodeToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

  const visitorQRRef = collection(db, "visitorQRs")

  // Prepare data for Firestore
  const preparedData = prepareForFirestore(visitorData)

  const docRef = await addDoc(visitorQRRef, {
    ...preparedData,
    qrCodeToken,
    createdAt: serverTimestamp(),
    status: "active",
  })

  return { id: docRef.id, qrCodeToken }
}

export async function getClientVisitorQRHistory(clientId: string) {
  const visitorQRRef = collection(db, "visitorQRs")
  const q = query(visitorQRRef, where("clientId", "==", clientId), orderBy("createdAt", "desc"))

  const snapshot = await getDocs(q)
  const visitorQRs: VisitorQR[] = []

  snapshot.forEach((doc) => {
    visitorQRs.push({ id: doc.id, ...doc.data() } as VisitorQR)
  })

  return visitorQRs
}

// Sell Request functions
export async function createSellRequest(sellRequestData: Omit<SellRequest, "id" | "createdAt" | "updatedAt">) {
  const sellRequestRef = collection(db, "sellRequests")

  // Prepare data for Firestore
  const preparedData = prepareForFirestore(sellRequestData)

  const docRef = await addDoc(sellRequestRef, {
    ...preparedData,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function getClientSellRequests(clientId: string) {
  const sellRequestRef = collection(db, "sellRequests")
  const q = query(sellRequestRef, where("clientId", "==", clientId), orderBy("createdAt", "desc"))

  const snapshot = await getDocs(q)
  const sellRequests: SellRequest[] = []

  snapshot.forEach((doc) => {
    sellRequests.push({ id: doc.id, ...doc.data() } as SellRequest)
  })

  return sellRequests
}

// Time slot functions
export async function getAvailableTimeSlots() {
  const now = new Date()
  const timeSlotsRef = collection(db, "timeSlots")
  const q = query(timeSlotsRef, where("available", "==", true), where("date", ">=", now.toISOString().split("T")[0]))

  const snapshot = await getDocs(q)
  const timeSlots: TimeSlot[] = []

  snapshot.forEach((doc) => {
    timeSlots.push({ id: doc.id, ...doc.data() } as TimeSlot)
  })

  return timeSlots
}

// Visit request functions
export async function createVisitRequest(visitData: Omit<VisitRequest, "id" | "createdAt" | "updatedAt">) {
  const visitRef = collection(db, "visitRequests")

  // Prepare data for Firestore
  const preparedData = prepareForFirestore(visitData)

  const docRef = await addDoc(visitRef, {
    ...preparedData,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function getUserVisitRequests(userId: string) {
  const visitsRef = collection(db, "visitRequests")
  const q = query(visitsRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

  const snapshot = await getDocs(q)
  const visits: VisitRequest[] = []

  snapshot.forEach((doc) => {
    visits.push({ id: doc.id, ...doc.data() } as VisitRequest)
  })

  return visits
}

export async function getVisitRequest(visitId: string) {
  const docRef = doc(db, "visitRequests", visitId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as VisitRequest
  }

  return null
}

// Feedback functions
export async function submitFeedback(feedbackData: Omit<Feedback, "id" | "createdAt">) {
  const feedbackRef = collection(db, "feedback")

  // Prepare data for Firestore
  const preparedData = prepareForFirestore(feedbackData)

  const docRef = await addDoc(feedbackRef, {
    ...preparedData,
    createdAt: serverTimestamp(),
  })

  // If this is visit feedback, update the visit status to completed
  if (feedbackData.visitId) {
    const visitRef = doc(db, "visitRequests", feedbackData.visitId)
    await updateDoc(visitRef, {
      status: "completed",
      updatedAt: serverTimestamp(),
    })
  }

  return docRef.id
}

export async function getUserFeedback(userId: string) {
  const feedbackRef = collection(db, "feedback")
  const q = query(feedbackRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

  const snapshot = await getDocs(q)
  const feedback: Feedback[] = []

  snapshot.forEach((doc) => {
    feedback.push({ id: doc.id, ...doc.data() } as Feedback)
  })

  return feedback
}

// QR Code verification
export async function verifyQRCode(qrToken: string) {
  try {
    const response = await fetch("/api/verify-qr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        qrToken,
        type: qrToken.startsWith("client:") ? "client" : "visitor",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to verify QR code")
    }

    return await response.json()
  } catch (error) {
    console.error("Error verifying QR code:", error)
    throw error
  }
}

// Get manager's assigned projects
export async function getManagerProjects(managerId: string) {
  try {
    const projectsRef = collection(db, "projects")
    const q = query(projectsRef, where("assignedManagers", "array-contains", managerId))

    const snapshot = await getDocs(q)
    const projects: Project[] = []

    snapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() } as Project)
    })

    return projects
  } catch (error) {
    console.error("Error fetching manager projects:", error)
    throw error
  }
}

// Get all projects (for admin)
export async function getAllProjects() {
  try {
    const projectsRef = collection(db, "projects")
    const q = query(projectsRef, orderBy("name"))

    const snapshot = await getDocs(q)
    const projects: Project[] = []

    snapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() } as Project)
    })

    return projects
  } catch (error) {
    console.error("Error fetching all projects:", error)
    throw error
  }
}

// Get projects for a specific admin
export async function getAdminProjects(adminId: string) {
  try {
    const projectsRef = collection(db, "projects")
    const q = query(projectsRef, where("createdBy", "==", adminId))

    const snapshot = await getDocs(q)
    const projects: Project[] = []

    snapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() } as Project)
    })

    return projects
  } catch (error) {
    console.error("Error fetching admin projects:", error)
    throw error
  }
}

// Get cameras for a project
export async function getProjectCameras(projectId: string) {
  try {
    const camerasRef = collection(db, `projects/${projectId}/cameras`)
    const q = query(camerasRef, orderBy("name"))

    const snapshot = await getDocs(q)
    const cameras: Camera[] = []

    snapshot.forEach((doc) => {
      cameras.push({ id: doc.id, ...doc.data() } as Camera)
    })

    return cameras
  } catch (error) {
    console.error("Error fetching project cameras:", error)
    throw error
  }
}

// Add more functions as needed for other collections

export default {
  getProjects,
  getProject,
  getPlots,
  getVisitRequests,
  // Add other functions here
}

