type Role = "student" | "teacher" | "admin"
type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "disputed"
type SessionType = "instant" | "scheduled"
type ConfidenceLevel = "high" | "medium" | "low"
type VerificationStatus = "pending" | "under_review" | "approved" | "rejected"
type ExtensionStatus = "none" | "pending" | "accepted" | "denied" | "expired"
type SessionPhase = "waiting_for_teacher" | "waiting_for_admit" | "admitted" | "active" | "disconnected" | "post"

declare module "next-auth" {
  interface User {
    role?: Role
  }
  interface Session {
    user: {
      id: string
      role?: Role
      email: string
      name?: string | null
      image?: string | null
    }
  }
}

export interface TeacherProfile {
  id: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  subjects: string[]
  teachingLanguages: string[]
  hourlyRateInr: number
  verificationStatus: VerificationStatus
  compositeScore: number
  totalSessions: number
  rank: string
  isAvailableNow: boolean
}

export interface BookingWithDetails {
  id: string
  subject: string
  sessionType: SessionType
  durationMinutes: number
  status: BookingStatus
  amountInr: number
  startsAt: string | null
  roomUrl: string | null
  teacher: {
    id: string
    displayName: string
    avatarUrl: string | null
  }
  student: {
    id: string
    displayName: string
    avatarUrl: string | null
  }
}

export interface AiResponse {
  text: string
  confidenceLevel: ConfidenceLevel
  subjectDetected: string
}

export interface ExplainResponse {
  mode: string
  content: string
}

export interface PracticeQuestion {
  id: string
  type: "easy" | "medium" | "advanced"
  question: string
  options?: string[]
  answer: string
  explanation: string
}

export interface MasteryData {
  subject: string
  score: number
  sessionCount: number
  practiceCount: number
  lastUpdated: string
}

export interface LiveSession {
  id: string
  bookingId: string
  roomName: string | null
  recordingUrl: string | null
  transcriptText: string | null
  summaryText: string | null
  whiteboardState: unknown
  startedAt: string | null
  endedAt: string | null
  aiSummaryStatus: string
  teacherJoinedAt: string | null
  studentJoinedAt: string | null
  actualStartAt: string | null
  extendedByMinutes: number | null
  graceEndedAt: string | null
  teacherDurationMs: number | null
  studentDurationMs: number | null
  admittedAt: string | null
  disconnectedAt: string | null
  extensionStatus: ExtensionStatus | null
  extensionRequestedBy: string | null
  extensionRequestedMin: number | null
  extensionExpiresAt: string | null
}

export interface PracticeSet {
  id: string
  sessionId: string
  studentId: string
  subject: string
  conceptTags: string[]
  questions: PracticeQuestion[]
  status: string
  createdAt: string
}

export interface TeacherAvailabilitySlot {
  id: string
  teacherId: string
  slotStart: string
  slotEnd: string
  isRecurring: boolean
  isBooked: boolean
}

export interface Rating {
  id: string
  sessionId: string
  studentId: string
  teacherId: string
  stars: number
  comment: string | null
  createdAt: string
}

export interface AppNotification {
  id: string
  userId: string
  title: string
  body: string | null
  type: string | null
  isRead: boolean
  createdAt: string
}

export interface SessionStatusData {
  phase: SessionPhase
  teacherJoined: boolean
  studentJoined: boolean
  admitted: boolean
  actualStartAt: string | null
  remainingSeconds: number
  graceRemainingSeconds: number
  graceExpired: boolean
  disconnectedAt: string | null
  extensionStatus: ExtensionStatus | null
  extensionRequestedBy: string | null
  extensionRequestedMin: number | null
  extensionExpiresAt: string | null
}

export interface SessionDetails {
  booking: {
    id: string
    subject: string
    sessionType: string
    durationMinutes: number
    status: BookingStatus
    amountInr: number | null
    startsAt: string | null
    createdAt: string
    student: { id: string; displayName: string; avatarUrl: string | null }
    teacher: { id: string; displayName: string; avatarUrl: string | null }
  }
  liveSession: LiveSession | null
  chatMessages: {
    id: string
    senderId: string
    messageText: string
    createdAt: string
  }[]
  practiceSet: PracticeSet | null
  rating: Rating | null
  totalActualDuration: number
}
