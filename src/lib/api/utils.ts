/**
 * API Utilities
 * 
 * Type-safe utilities for API routes including rate limiting, security logging,
 * error handling, and request/response processing.
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ErrorResponse } from "./schemas";

// ============================================================================
// TYPES
// ============================================================================

export interface SecurityLogEvent {
  timestamp: string;
  event: string;
  details: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  userId?: string;
}

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

// ============================================================================
// IP ADDRESS UTILITIES
// ============================================================================

/**
 * Extract client IP address from request headers
 */
export const getClientIP = (request: NextRequest): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0] || '127.0.0.1';
  }
  
  return '127.0.0.1';
};

/**
 * Get user agent from request headers
 */
export const getUserAgent = (request: NextRequest): string => {
  return request.headers.get('user-agent') || 'Unknown';
};

// ============================================================================
// SECURITY LOGGING
// ============================================================================

/**
 * Log security events with basic data
 */
export const logSecurityEvent = (
  event: string,
  details: Record<string, unknown>,
  request?: NextRequest,
  userId?: string
): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    userId
  };
  
  if (process.env.NODE_ENV === 'production') {
    console.log('SECURITY_EVENT:', JSON.stringify(logEntry));
  } else {
    console.warn('Security Event:', logEntry);
  }
};

/**
 * Log API errors with context
 */
export const logAPIError = (
  error: Error,
  request: NextRequest,
  context?: Record<string, unknown>
): string => {
  const errorId = crypto.randomUUID();
  
  const logEntry = {
    errorId,
    message: error.message,
    name: error.name,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ip: getClientIP(request),
    userAgent: getUserAgent(request),
    method: request.method,
    url: request.url,
    context
  };
  
  if (process.env.NODE_ENV === 'production') {
    // In production, log structured error without sensitive details
    console.error('API_ERROR:', JSON.stringify({
      errorId: logEntry.errorId,
      message: logEntry.message,
      name: logEntry.name,
      timestamp: logEntry.timestamp,
      method: logEntry.method,
      url: logEntry.url,
      context: logEntry.context
    }));
  } else {
    // In development, log full error details
    console.error(`API Error [${errorId}]:`, logEntry);
  }
  
  return errorId;
};

// ============================================================================
// RATE LIMITING
// ============================================================================

// In-memory rate limiting store
const rateLimitStore = new Map<string, { attempts: number[] }>();

/**
 * Simple in-memory rate limiter
 * For production, consider using a distributed solution like Redis
 */
export class RateLimiter {
  private config: RateLimitConfig;
  
  constructor(config: RateLimitConfig) {
    this.config = config;
  }
  
  /**
   * Check if request should be rate limited
   */
  check(identifier: string): RateLimitResult {
    // Skip rate limiting in development
    if (process.env.NODE_ENV === 'development') {
      return {
        allowed: true,
        remaining: this.config.maxAttempts,
        resetTime: Date.now() + this.config.windowMs
      };
    }
    
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Get or create entry for this identifier
    let entry = rateLimitStore.get(identifier);
    if (!entry) {
      entry = { attempts: [] };
      rateLimitStore.set(identifier, entry);
    }
    
    // Remove expired attempts
    entry.attempts = entry.attempts.filter(time => time > windowStart);
    
    // Check if limit exceeded
    const remaining = Math.max(0, this.config.maxAttempts - entry.attempts.length);
    const allowed = entry.attempts.length < this.config.maxAttempts;
    
    // Calculate reset time
    const oldestAttempt = entry.attempts[0];
    const resetTime = oldestAttempt ? oldestAttempt + this.config.windowMs : now + this.config.windowMs;
    
    return {
      allowed,
      remaining,
      resetTime
    };
  }
  
  /**
   * Record an attempt for the identifier
   */
  recordAttempt(identifier: string): void {
    const now = Date.now();
    let entry = rateLimitStore.get(identifier);
    
    if (!entry) {
      entry = { attempts: [] };
      rateLimitStore.set(identifier, entry);
    }
    
    entry.attempts.push(now);
  }
  
  /**
   * Clear rate limit data for identifier
   */
  clear(identifier: string): void {
    rateLimitStore.delete(identifier);
  }
}

// Pre-configured rate limiters for common use cases
export const loginRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000 // 15 minutes
});

export const generalAPIRateLimiter = new RateLimiter({
  maxAttempts: 100,
  windowMs: 15 * 60 * 1000 // 15 minutes
});

// ============================================================================
// ERROR RESPONSE UTILITIES
// ============================================================================

/**
 * Create standardized error response
 */
export const createErrorResponse = (
  message: string,
  status: number,
  code?: string,
  details?: Record<string, unknown>
): NextResponse<ErrorResponse> => {
  const response: ErrorResponse = {
    message,
    code,
    details,
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(response, { status });
};

/**
 * Handle Zod validation errors
 */
export const handleValidationError = (error: ZodError): NextResponse<ErrorResponse> => {
  const firstError = error.errors[0];
  const message = firstError?.message || "Invalid input";
  
  // Format all errors for detailed response
  const details = error.errors.reduce((acc, err) => {
    const field = err.path.join('.');
    if (!acc[field]) acc[field] = [];
    acc[field].push(err.message);
    return acc;
  }, {} as Record<string, string[]>);
  
  return createErrorResponse(message, 400, "VALIDATION_ERROR", details);
};

/**
 * Handle rate limit exceeded
 */
export const handleRateLimitExceeded = (resetTime: number): NextResponse<ErrorResponse> => {
  const response = createErrorResponse(
    "Too many requests. Please try again later.",
    429,
    "RATE_LIMIT_EXCEEDED",
    { resetTime }
  );
  
  // Add rate limit headers
  response.headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
  
  return response;
};

/**
 * Handle authentication errors
 */
export const handleAuthError = (message: string = "Authentication required"): NextResponse<ErrorResponse> => {
  return createErrorResponse(message, 401, "AUTHENTICATION_ERROR");
};

/**
 * Handle authorization errors
 */
export const handleAuthorizationError = (message: string = "Insufficient permissions"): NextResponse<ErrorResponse> => {
  return createErrorResponse(message, 403, "AUTHORIZATION_ERROR");
};

/**
 * Handle not found errors
 */
export const handleNotFoundError = (resource: string = "Resource"): NextResponse<ErrorResponse> => {
  return createErrorResponse(`${resource} not found`, 404, "NOT_FOUND");
};

/**
 * Handle internal server errors
 */
export const handleInternalError = (
  request: NextRequest,
  error: Error,
  context?: Record<string, unknown>
): NextResponse<ErrorResponse> => {
  const errorId = logAPIError(error, request, context);
  
  return createErrorResponse(
    process.env.NODE_ENV === 'production' 
      ? "An internal error occurred" 
      : error.message,
    500,
    "INTERNAL_ERROR",
    process.env.NODE_ENV === 'production' 
      ? { errorId }
      : { errorId, stack: error.stack }
  );
};

// ============================================================================
// SUCCESS RESPONSE UTILITIES
// ============================================================================

/**
 * Create standardized success response
 */
export const createSuccessResponse = <T>(
  data: T,
  message: string = "Success",
  status: number = 200
): NextResponse<{ message: string; data: T; timestamp: string }> => {
  return NextResponse.json(
    {
      message,
      data,
      timestamp: new Date().toISOString()
    },
    { status }
  );
};

// ============================================================================
// REQUEST PROCESSING UTILITIES
// ============================================================================

/**
 * Safely parse JSON request body
 */
export const parseRequestBody = async (request: NextRequest): Promise<unknown> => {
  try {
    return await request.json();
  } catch (error) {
    throw new Error("Invalid JSON in request body");
  }
};

/**
 * Extract query parameters with type conversion
 */
export const getQueryParams = (request: NextRequest): Record<string, string> => {
  const url = new URL(request.url);
  const params: Record<string, string> = {};
  
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
};

// ============================================================================
// SECURITY HEADERS
// ============================================================================

/**
 * Add security headers to response
 */
export const addSecurityHeaders = <T>(response: NextResponse<T>): NextResponse<T> => {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
};

