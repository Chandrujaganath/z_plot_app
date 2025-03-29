import type { Timestamp } from "firebase/firestore"

// User Role enum
export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  MANAGER = "manager",
  CLIENT = "client",
  GUEST = "guest",
}

// Project and Plot models
export interface Project {
  id: string
  name: string
  description: string
  location: string
  totalPlots: number
  availablePlots: number
  plotSizes: string
  startingPrice: number
  status: "active" | "completed" | "upcoming"
  imageUrl?: string
  createdAt: Timestamp | string
  updatedAt: Timestamp | string
  // New fields for geofencing
  latitude?: number
  longitude?: number
  geofenceRadius?: number // in meters
  // New fields for grid layout
  gridSize?: {
    rows: number
    cols: number
  }
  gridCells?: GridCell[][]
  createdBy?: string
}

export interface GridCell {
  row: number
  col: number
  type: "empty" | "plot" | "road" | "amenity"
  plotNumber?: number
  size?: number
  price?: number
  description?: string
  status?: "available" | "sold" | "reserved"
}

export interface Plot {
  id: string
  projectId: string
  plotNumber: number
  row: number
  col: number
  size: number // in sq ft
  price: number
  status: "available" | "sold" | "reserved"
  type: "plot" | "road" | "amenity"
  ownerId?: string // reference to user if sold
  address?: string
  purchaseDate?: Timestamp | string
  cctvFeedUrl?: string
}

// Visit models
export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  date: string
  available: boolean
}

export interface VisitRequest {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  projectId: string
  projectName: string
  plotId?: string
  plotNumber?: number
  timeSlotId: string
  timeSlot: {
    date: string
    startTime: string
    endTime: string
  }
  status: "pending" | "approved" | "rejected" | "checked-in" | "completed"
  qrCodeToken?: string
  qrCodeExpiry?: Timestamp | string
  notes?: string
  createdAt: Timestamp | string
  updatedAt: Timestamp | string
  isClient?: boolean // Flag to indicate if request is from a client
  // New fields for manager assignment
  assignedTo?: string // manager UID
  assignedAt?: Timestamp | string
}

// Feedback model
export interface Feedback {
  id: string
  visitId?: string
  userId: string
  rating: number
  comment: string
  createdAt: Timestamp | string
  type: "visit" | "service" // Type of feedback
}

// Visitor QR model
export interface VisitorQR {
  id: string
  clientId: string
  plotId: string
  visitorName: string
  visitorPhone: string
  purpose: string
  qrCodeToken: string
  createdAt: Timestamp | string
  expiryDate: Timestamp | string
  status: "active" | "used" | "expired"
}

// Sell Request model
export interface SellRequest {
  id: string
  clientId: string
  plotId: string
  projectId: string
  plotNumber: number
  reason: string
  additionalNotes?: string
  status: "pending" | "in-process" | "approved" | "rejected"
  createdAt: Timestamp | string
  updatedAt: Timestamp | string
}

// Manager Task model
export interface ManagerTask {
  id: string
  managerId: string
  managerName?: string
  taskType: "visit_approval" | "site_visit" | "client_assistance" | "maintenance"
  title: string
  description: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high"
  dueDate: Timestamp | string
  projectId?: string
  projectName?: string
  plotId?: string
  plotNumber?: number
  clientId?: string
  clientName?: string
  visitId?: string
  createdAt: Timestamp | string
  updatedAt: Timestamp | string
  completedAt?: Timestamp | string
  feedbackSubmitted?: boolean
}

// Manager Attendance model
export interface Attendance {
  id: string
  managerId: string
  managerName?: string
  type: "check_in" | "check_out"
  timestamp: Timestamp | string
  location: {
    latitude: number
    longitude: number
    accuracy?: number
  }
  projectId?: string
  projectName?: string
  isWithinGeofence: boolean
  notes?: string
}

// Leave Request model
export interface LeaveRequest {
  id: string
  managerId: string
  managerName?: string
  startDate: Timestamp | string
  endDate: Timestamp | string
  reason: string
  status: "pending" | "approved" | "rejected"
  approvedBy?: string
  approvedAt?: Timestamp | string
  rejectionReason?: string
  createdAt: Timestamp | string
  updatedAt: Timestamp | string
}

// Manager Feedback model
export interface ManagerFeedback {
  id: string
  managerId: string
  managerName?: string
  taskId: string
  taskType: string
  rating: number
  comment: string
  createdAt: Timestamp | string
}

// Announcement model
export interface Announcement {
  id: string
  title: string
  message: string
  targetRoles: string[]
  publishAt?: Timestamp | string
  createdBy: string
  createdAt: Timestamp | string
  updatedAt?: Timestamp | string
}

// Project Template model
export interface ProjectTemplate {
  id: string
  name: string
  description?: string
  gridSize: {
    rows: number
    cols: number
  }
  gridCells: GridCell[][]
  createdBy: string
  createdAt: Timestamp | string
  updatedAt?: Timestamp | string
}

// Camera model
export interface Camera {
  id: string
  name: string
  location: string
  streamUrl: string
  type: "indoor" | "outdoor" | "gate" | "perimeter"
  status: "active" | "inactive" | "maintenance"
  allowedRoles: string[]
  projectId: string
  createdAt: Timestamp | string
  updatedAt: Timestamp | string
}

