/**
 * API Validation Schemas
 * 
 * Comprehensive Zod validation schemas for all API routes with robust
 * validation rules, sanitization, and error handling.
 */

import { z } from "zod";

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

/**
 * Login request validation schema
 * Validates email format, password strength, and sanitizes input
 */
export const LoginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string"
    })
    .trim()
    .toLowerCase()
    .min(1, "Email cannot be empty")
    .email("Invalid email format")
    .max(254, "Email must be less than 255 characters"), // RFC 5321 limit
  
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string"
    })
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    )
});

/**
 * User registration schema (for future use)
 */
export const RegisterSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string"
    })
    .trim()
    .toLowerCase()
    .min(1, "Email cannot be empty")
    .email("Invalid email format")
    .max(254, "Email must be less than 255 characters"),
  
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string"
    })
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  
  confirmPassword: z.string({
    required_error: "Password confirmation is required",
    invalid_type_error: "Password confirmation must be a string"
  }),
  
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string"
    })
    .trim()
    .min(1, "Name cannot be empty")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s\-'\.]+$/, "Name can only contain letters, spaces, hyphens, apostrophes, and periods"),
  
  role: z
    .enum(["user", "admin"], {
      invalid_type_error: "Role must be either 'user' or 'admin'"
    })
    .default("user")
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  }
);

// ============================================================================
// GEMINI API SCHEMAS (Future Integration)
// ============================================================================

/**
 * Lesson plan generation schema for future Gemini integration
 */
export const GeneratePlanSchema = z.object({
  theme: z
    .string({
      required_error: "Theme is required",
      invalid_type_error: "Theme must be a string"
    })
    .trim()
    .min(1, "Theme cannot be empty")
    .max(500, "Theme must be less than 500 characters"),
  
  grade: z
    .string({
      required_error: "Grade is required",
      invalid_type_error: "Grade must be a string"
    })
    .trim()
    .min(1, "Grade cannot be empty")
    .max(50, "Grade must be less than 50 characters"),
  
  subjects: z
    .string({
      required_error: "Subjects are required",
      invalid_type_error: "Subjects must be a string"
    })
    .trim()
    .min(1, "Subjects cannot be empty")
    .max(200, "Subjects must be less than 200 characters"),
  
  duration: z
    .string({
      required_error: "Duration is required",
      invalid_type_error: "Duration must be a string"
    })
    .trim()
    .min(1, "Duration cannot be empty")
    .max(100, "Duration must be less than 100 characters"),
  
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
  
  difficulty: z
    .enum(["beginner", "intermediate", "advanced"], {
      invalid_type_error: "Difficulty must be beginner, intermediate, or advanced"
    })
    .default("intermediate"),
  
  includeActivities: z
    .boolean({
      invalid_type_error: "Include activities must be a boolean"
    })
    .default(true),
  
  includeAssessment: z
    .boolean({
      invalid_type_error: "Include assessment must be a boolean"
    })
    .default(false)
});

// ============================================================================
// COMMON API SCHEMAS
// ============================================================================

/**
 * Pagination schema for list endpoints
 */
export const PaginationSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a positive integer")
    .transform(Number)
    .refine(val => val > 0, "Page must be greater than 0")
    .default("1"),
  
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a positive integer")
    .transform(Number)
    .refine(val => val > 0 && val <= 100, "Limit must be between 1 and 100")
    .default("10"),
  
  sortBy: z
    .string()
    .max(50, "Sort field must be less than 50 characters")
    .optional(),
  
  sortOrder: z
    .enum(["asc", "desc"], {
      invalid_type_error: "Sort order must be 'asc' or 'desc'"
    })
    .default("desc")
});

/**
 * Search query schema
 */
export const SearchSchema = z.object({
  query: z
    .string({
      required_error: "Search query is required",
      invalid_type_error: "Query must be a string"
    })
    .trim()
    .min(1, "Query cannot be empty")
    .max(200, "Query must be less than 200 characters"),
  
  filters: z
    .record(z.string())
    .optional()
});

/**
 * ID parameter schema for route parameters
 */
export const IdSchema = z.object({
  id: z
    .string({
      required_error: "ID is required",
      invalid_type_error: "ID must be a string"
    })
    .uuid("Invalid ID format")
});

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

/**
 * Standard API error response schema
 */
export const ErrorResponseSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime()
});

/**
 * Standard API success response schema
 */
export const SuccessResponseSchema = z.object({
  message: z.string(),
  data: z.unknown().optional(),
  timestamp: z.string().datetime()
});

// ============================================================================
// TYPE INFERENCE
// ============================================================================

// Infer TypeScript types from Zod schemas
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type GeneratePlanInput = z.infer<typeof GeneratePlanSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
export type SearchInput = z.infer<typeof SearchSchema>;
export type IdInput = z.infer<typeof IdSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

// ============================================================================
// SCHEMA VALIDATION UTILITIES
// ============================================================================

/**
 * Validates request body against a schema and returns parsed data
 * Throws ZodError if validation fails
 */
export const validateRequestBody = <T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> => {
  return schema.parse(data);
};

/**
 * Safe validation that returns success/error result instead of throwing
 */
export const safeValidateRequestBody = <T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } => {
  const result = schema.safeParse(data);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, error: result.error };
};

// ============================================================================
// VALIDATION ERROR FORMATTERS
// ============================================================================

/**
 * Format Zod validation errors into user-friendly messages
 */
export const formatValidationError = (error: z.ZodError): string => {
  const firstError = error.errors[0];
  if (!firstError) return "Invalid input";
  
  return firstError.message;
};

/**
 * Format all Zod validation errors into a detailed object
 */
export const formatValidationErrors = (error: z.ZodError): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });
  
  return errors;
};