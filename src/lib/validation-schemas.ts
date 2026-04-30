import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const courseEnrollmentSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
})

export const lessonCompleteSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().min(1),
    answer: z.union([z.string(), z.array(z.string())]),
  })).min(1, 'Answers are required'),
  timeSpent: z.number().optional(),
})

export const aiChatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(2000),
  })).min(1).max(50),
  context: z.string().optional(),
})

export const paymentInitSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
})

export const paymentVerifySchema = z.object({
  reference: z.string().min(1, 'Reference is required'),
})

export const pushSubscribeSchema = z.object({
  endpoint: z.string().url('Invalid endpoint'),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})

export const teacherApplicationSchema = z.object({
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(500),
  subjects: z.string().min(2, 'Please select at least one subject'),
  experience: z.enum(['0-1', '1-3', '3-5', '5-10', '10+']),
  reason: z.string().min(100, 'Please explain why you want to teach').max(1000),
  sampleTitle: z.string().min(5, 'Sample lesson title is required').max(100),
  sampleDescription: z.string().min(50, 'Sample description must be at least 50 characters').max(500),
})

export const courseCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().max(1000).optional(),
  categoryId: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  price: z.number().min(0, 'Price cannot be negative'),
  icon: z.string().optional(),
  color: z.string().optional(),
})

export const examAttemptSchema = z.object({
  examId: z.string().min(1, 'Exam ID is required'),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  timeSpent: z.number().optional(),
})

export const referralSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const gemGiftSchema = z.object({
  recipientId: z.string().min(1, 'Recipient is required'),
  amount: z.number().min(1, 'Amount must be at least 1').max(1000, 'Maximum 1000 gems per gift'),
  message: z.string().max(200).optional(),
})

export const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100),
  type: z.enum(['users', 'courses', 'all']).optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  offset: z.coerce.number().min(0).optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CourseEnrollmentInput = z.infer<typeof courseEnrollmentSchema>
export type LessonCompleteInput = z.infer<typeof lessonCompleteSchema>
export type AIChatInput = z.infer<typeof aiChatSchema>
export type PaymentInitInput = z.infer<typeof paymentInitSchema>
export type PaymentVerifyInput = z.infer<typeof paymentVerifySchema>
export type PushSubscribeInput = z.infer<typeof pushSubscribeSchema>
export type TeacherApplicationInput = z.infer<typeof teacherApplicationSchema>
export type CourseCreateInput = z.infer<typeof courseCreateSchema>
export type ExamAttemptInput = z.infer<typeof examAttemptSchema>
export type ReferralInput = z.infer<typeof referralSchema>
export type GemGiftInput = z.infer<typeof gemGiftSchema>
export type SearchInput = z.infer<typeof searchSchema>
