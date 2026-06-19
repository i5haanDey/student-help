declare module "next-auth" {
  interface User {
    role?: string
  }
  interface Session {
    user: {
      id: string
      role?: string
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
  verificationStatus: string
  compositeScore: number
  totalSessions: number
  rank: string
  isAvailableNow: boolean
}

export interface BookingWithDetails {
  id: string
  subject: string
  sessionType: "instant" | "scheduled"
  durationMinutes: number
  status: string
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
  confidenceLevel: "high" | "medium" | "low"
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
