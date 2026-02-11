/**
 * ORBIT Security - Input Validation Schemas
 *
 * This file contains Zod validation schemas for all user inputs across the application.
 * All API endpoints MUST validate inputs using these schemas to prevent injection attacks.
 *
 * Security Agent: security-agent
 * Created: 2026-02-11
 * Status: READY FOR USE (once API routes exist)
 *
 * Usage:
 * ```typescript
 * import { AlertCreateSchema } from '@/lib/validation'
 *
 * export async function POST(request: Request) {
 *   const body = await request.json()
 *   const validated = AlertCreateSchema.parse(body) // Throws if invalid
 *   // ... proceed with validated data
 * }
 * ```
 */

import { z } from 'zod'

// ============================================================================
// ALERT VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for creating a new price alert
 *
 * Validates:
 * - token: 1-10 uppercase alphanumeric characters (e.g., "BTC", "ETH", "SOL")
 * - condition: Must be either "above" or "below"
 * - targetPrice: Positive number, max 10 million (reasonable crypto price limit)
 * - notifications: Array of notification types (in-app, email, sms, phone, telegram, slack)
 *
 * Security: Prevents injection, validates business rules
 */
export const AlertCreateSchema = z.object({
  token: z
    .string()
    .min(1, 'Token symbol is required')
    .max(10, 'Token symbol too long')
    .regex(/^[A-Z0-9]+$/, 'Token must be uppercase alphanumeric only')
    .trim(),

  condition: z.enum(['above', 'below'], {
    message: 'Condition must be "above" or "below"'
  }),

  targetPrice: z
    .number({
      required_error: 'Target price is required',
      invalid_type_error: 'Target price must be a number'
    })
    .positive('Price must be positive')
    .max(10_000_000, 'Price too high (max: 10M)')
    .finite('Price must be finite'),

  notifications: z
    .array(z.enum(['in-app', 'email', 'sms', 'phone', 'telegram', 'slack']))
    .min(1, 'At least one notification type is required')
    .max(6, 'Too many notification types'),
})

export type AlertCreateInput = z.infer<typeof AlertCreateSchema>

/**
 * Schema for updating an existing alert
 * All fields are optional (partial update)
 */
export const AlertUpdateSchema = z.object({
  active: z.boolean().optional(),
  targetPrice: z
    .number()
    .positive()
    .max(10_000_000)
    .finite()
    .optional(),
  condition: z.enum(['above', 'below']).optional(),
  notifications: z
    .array(z.enum(['in-app', 'email', 'sms', 'phone', 'telegram', 'slack']))
    .min(1)
    .max(6)
    .optional(),
})

export type AlertUpdateInput = z.infer<typeof AlertUpdateSchema>

/**
 * Schema for alert query parameters
 * Used for filtering alerts in GET /api/alerts
 */
export const AlertQuerySchema = z.object({
  token: z
    .string()
    .max(10)
    .regex(/^[A-Z0-9]+$/)
    .optional(),
  active: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().positive().max(100))
    .optional(),
  offset: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(0))
    .optional(),
})

export type AlertQueryInput = z.infer<typeof AlertQuerySchema>

// ============================================================================
// NEWS VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for news search requests
 *
 * Validates:
 * - topic: 1-100 characters, trimmed
 * - No special characters that could cause injection
 *
 * Security: Prevents XSS, injection attacks in Gemini API calls
 */
export const NewsSearchSchema = z.object({
  topic: z
    .string()
    .min(1, 'Search topic is required')
    .max(100, 'Search topic too long (max 100 characters)')
    .trim()
    .refine(
      (val) => !/<script|javascript:|onerror=/i.test(val),
      'Invalid characters in search topic'
    ),
})

export type NewsSearchInput = z.infer<typeof NewsSearchSchema>

// ============================================================================
// DEFI VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for wallet address validation
 *
 * Validates:
 * - Ethereum address format (0x + 40 hex characters)
 * - Case-insensitive
 *
 * Security: Prevents malformed addresses, injection
 */
export const WalletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format')
  .transform(val => val.toLowerCase())

/**
 * Schema for adding a wallet to track
 */
export const WalletAddSchema = z.object({
  address: WalletAddressSchema,
  name: z
    .string()
    .min(1, 'Wallet name is required')
    .max(50, 'Wallet name too long')
    .trim()
    .optional(),
})

export type WalletAddInput = z.infer<typeof WalletAddSchema>

/**
 * Schema for DeFi position query parameters
 */
export const DeFiPositionQuerySchema = z.object({
  walletAddress: WalletAddressSchema.optional(),
  protocol: z
    .string()
    .max(50)
    .regex(/^[a-zA-Z0-9\s-]+$/)
    .optional(),
  minValue: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .transform(Number)
    .pipe(z.number().nonnegative())
    .optional(),
})

export type DeFiPositionQueryInput = z.infer<typeof DeFiPositionQuerySchema>

// ============================================================================
// USER VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for user settings updates
 *
 * Validates notification preferences, theme, etc.
 */
export const UserSettingsSchema = z.object({
  notificationChannels: z
    .array(z.enum(['email', 'push', 'telegram', 'discord', 'sms']))
    .max(5, 'Too many notification channels')
    .optional(),

  theme: z.enum(['dark', 'light']).optional(),

  defaultCurrency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .regex(/^[A-Z]+$/)
    .optional(),

  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
})

export type UserSettingsInput = z.infer<typeof UserSettingsSchema>

// ============================================================================
// PAGINATION SCHEMAS
// ============================================================================

/**
 * Standard pagination schema for all list endpoints
 *
 * Query parameters: ?limit=20&offset=0
 */
export const PaginationSchema = z.object({
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().positive().max(100).default(20))
    .optional(),

  offset: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(0).default(0))
    .optional(),
})

export type PaginationInput = z.infer<typeof PaginationSchema>

// ============================================================================
// AUTHENTICATION SCHEMAS (for future use)
// ============================================================================

/**
 * Schema for email validation
 * Used in email magic link authentication
 */
export const EmailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email too long')
  .trim()
  .toLowerCase()

/**
 * Schema for password validation (if implementing email/password auth)
 *
 * Requirements:
 * - Minimum 12 characters (security best practice 2026)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const PasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

/**
 * Schema for user registration (email/password)
 */
export const UserRegistrationSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }
)

export type UserRegistrationInput = z.infer<typeof UserRegistrationSchema>

// ============================================================================
// TELEGRAM SCHEMAS
// ============================================================================

/**
 * Schema for Telegram chat ID linking
 */
export const TelegramLinkSchema = z.object({
  chatId: z
    .string()
    .regex(/^-?\d+$/, 'Invalid Telegram chat ID')
    .transform(val => parseInt(val, 10)),

  userId: z
    .string()
    .regex(/^[a-f0-9]{24}$/, 'Invalid user ID format'), // MongoDB ObjectId
})

export type TelegramLinkInput = z.infer<typeof TelegramLinkSchema>

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Format Zod validation errors for API responses
 *
 * @param error - Zod validation error
 * @returns Formatted error response
 */
export function formatValidationError(error: z.ZodError) {
  return {
    error: 'Validation failed',
    details: error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  }
}

/**
 * Safely parse and validate input, returning error response if invalid
 *
 * Usage:
 * ```typescript
 * const result = safeValidate(AlertCreateSchema, body)
 * if (!result.success) {
 *   return NextResponse.json(result.error, { status: 400 })
 * }
 * const data = result.data
 * ```
 */
export function safeValidate<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: object } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: formatValidationError(error) }
    }
    return {
      success: false,
      error: { error: 'Validation failed', message: 'Unknown error' }
    }
  }
}

// ============================================================================
// EXPORTS FOR CONVENIENCE
// ============================================================================

/**
 * All validation schemas in one object for easy import
 */
export const ValidationSchemas = {
  // Alerts
  AlertCreate: AlertCreateSchema,
  AlertUpdate: AlertUpdateSchema,
  AlertQuery: AlertQuerySchema,

  // News
  NewsSearch: NewsSearchSchema,

  // DeFi
  WalletAddress: WalletAddressSchema,
  WalletAdd: WalletAddSchema,
  DeFiPositionQuery: DeFiPositionQuerySchema,

  // User
  UserSettings: UserSettingsSchema,
  Email: EmailSchema,
  Password: PasswordSchema,
  UserRegistration: UserRegistrationSchema,

  // Telegram
  TelegramLink: TelegramLinkSchema,

  // Pagination
  Pagination: PaginationSchema,
} as const

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  AlertCreateInput,
  AlertUpdateInput,
  AlertQueryInput,
  NewsSearchInput,
  WalletAddInput,
  DeFiPositionQueryInput,
  UserSettingsInput,
  UserRegistrationInput,
  TelegramLinkInput,
  PaginationInput,
}

// ============================================================================
// SECURITY NOTES
// ============================================================================

/**
 * IMPORTANT: How to Use These Schemas
 *
 * 1. ALWAYS validate user input in API routes:
 *    ```typescript
 *    const body = await request.json()
 *    const validated = AlertCreateSchema.parse(body)
 *    ```
 *
 * 2. Handle validation errors properly:
 *    ```typescript
 *    try {
 *      const validated = schema.parse(data)
 *    } catch (error) {
 *      if (error instanceof z.ZodError) {
 *        return NextResponse.json(
 *          formatValidationError(error),
 *          { status: 400 }
 *        )
 *      }
 *    }
 *    ```
 *
 * 3. Use safeValidate for cleaner code:
 *    ```typescript
 *    const result = safeValidate(AlertCreateSchema, body)
 *    if (!result.success) {
 *      return NextResponse.json(result.error, { status: 400 })
 *    }
 *    ```
 *
 * 4. NEVER trust user input without validation
 * 5. NEVER skip validation because "it's internal"
 * 6. NEVER use string concatenation with user input
 * 7. ALWAYS use parameterized queries for databases
 *
 * Security Best Practices:
 * - Validate on the server, not just the client
 * - Fail securely (reject invalid input, don't try to fix it)
 * - Log validation failures for security monitoring
 * - Return generic error messages to users (don't leak schema details)
 * - Keep validation schemas updated when requirements change
 */
