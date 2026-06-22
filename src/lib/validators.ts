import { z } from "zod"

export const BookingCreateSchema = z.object({
  teacherId: z.string().min(1, "teacherId is required"),
  subject: z.string().min(1, "subject is required").max(200),
  doubtContext: z.string().max(5000).optional().nullable(),
  sessionType: z.enum(["instant", "scheduled"]),
  durationMinutes: z.number().int().min(15).max(180),
  startsAt: z.string().datetime().optional().nullable(),
})

export const BookingPatchSchema = z.object({
  status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled", "disputed"]).optional(),
})

export const SessionPatchSchema = z.object({
  teacherJoinedAt: z.string().datetime().optional(),
  studentJoinedAt: z.string().datetime().optional(),
  actualStartAt: z.string().datetime().optional(),
  teacherDurationMs: z.number().int().nonnegative().optional(),
  studentDurationMs: z.number().int().nonnegative().optional(),
  disconnectedAt: z.string().datetime().optional(),
  admittedAt: z.string().datetime().optional(),
  extensionRequestedBy: z.string().optional(),
  extensionRequestedMin: z.number().int().min(1).max(30).optional(),
  extensionExpiresAt: z.string().datetime().optional(),
})

export const PaymentCreateSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
})

export const RefundCreateSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
})

export const DoubtSolveSchema = z.object({
  text: z.string().max(10000).optional().default(""),
  image: z.any().optional(),
})

export const DoubtExplainSchema = z.object({
  mode: z.enum(["standard", "simple", "visual", "analogy", "step_by_step", "exam_oriented"]),
  doubtText: z.string().min(1, "doubtText is required").max(5000),
})

export const PracticeCreateSchema = z.object({
  sessionId: z.string().optional(),
  subject: z.string().max(200).optional(),
})

export const PracticeAttemptSchema = z.object({
  questionId: z.string().min(1),
  studentAnswer: z.string().optional(),
  isCorrect: z.boolean().optional(),
})

export const RatingCreateSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  stars: z.number().int().min(1, "stars must be 1-5").max(5, "stars must be 1-5"),
  comment: z.string().max(1000).optional(),
})

export const MasteryUpdateSchema = z.object({
  subject: z.string().min(1, "subject is required").max(200),
  practiceScore: z.number().min(0).max(100),
})

export const ProfileUpdateSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(2000).optional().nullable(),
  subjects: z.array(z.string().max(100)).max(20).optional(),
  teachingLanguages: z.array(z.string().max(100)).max(10).optional(),
  hourlyRateInr: z.number().positive().max(99999).optional().nullable(),
})

export const StudentOnboardingSchema = z.object({
  displayName: z.string().min(1, "displayName is required").max(100),
  gradeLevel: z.string().max(50).optional(),
  subjects: z.array(z.string().max(100)).max(20).optional(),
  examTargets: z.array(z.string().max(100)).max(10).optional(),
  preferredLanguages: z.array(z.string().max(100)).max(10).optional(),
  timezone: z.string().max(100).optional(),
})

export const TeacherOnboardingSchema = z.object({
  displayName: z.string().min(1, "displayName is required").max(100),
  bio: z.string().max(2000).optional(),
  subjects: z.array(z.string().max(100)).min(1, "At least one subject required").max(20),
  teachingLanguages: z.array(z.string().max(100)).min(1, "At least one language required").max(10),
  hourlyRateInr: z.number().positive("Rate must be positive").max(99999),
  timezone: z.string().max(100).optional(),
})

export const AvailabilityCreateSchema = z.object({
  slots: z.array(z.object({
    slotStart: z.string().datetime(),
    slotEnd: z.string().datetime(),
    isRecurring: z.boolean().optional(),
  })).min(1, "At least one slot required").max(50),
})

export const AvailabilityDeleteSchema = z.object({
  id: z.string().min(1, "id is required"),
})

export const VerificationSubmitSchema = z.object({
  idType: z.string().min(1, "idType is required").max(100),
  idNumber: z.string().min(1, "idNumber is required").max(100),
  credentials: z.string().max(2000).optional(),
  teachingDemo: z.string().max(2000).optional(),
})

export const LiveKitTokenSchema = z.object({
  roomName: z.string().min(1, "roomName is required").max(200),
})

export const TeacherQuerySchema = z.object({
  subject: z.string().max(200).optional(),
  language: z.string().max(100).optional(),
  maxRate: z.coerce.number().positive().optional(),
  available: z.enum(["true", "false"]).optional(),
  search: z.string().max(200).optional(),
})

export const ChatMessageSchema = z.object({
  messageText: z.string().min(1, "messageText is required").max(5000),
})

export const ExtensionRequestSchema = z.object({
  requestedMinutes: z.number().int().min(1, "Extension must be 1-30 minutes").max(30, "Extension must be 1-30 minutes"),
})

export const ExtensionActionSchema = z.object({
  action: z.enum(["accept", "deny"]),
})

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
  displayName: z.string().min(1, "Display name is required").max(100),
  role: z.enum(["student", "teacher"]),
})
