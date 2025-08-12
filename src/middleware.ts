/**
 * Next.js 15 Middleware
 * 
 * Type-safe authentication middleware with comprehensive security features,
 * rate limiting, request logging, and proper error handling for all routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import type { JWTPayload } from '@/types/auth';

// ============================================================================
// MIDDLEWARE TYPES
// ============================================================================

interface RequestLogContext {
  timestamp: string;
  ip: string;
  pathname: string;
  method: string;
  userAgent: string;
  hasToken: boolean;
  userId?: string;
  userEmail?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

interface SecurityHeaders {
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'Referrer-Policy': string;
  'X-XSS-Protection': string;
  'Strict-Transport-Security': string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 100; // Maximum requests per window
const RATE_LIMIT_BLOCK_DURATION = 60 * 60 * 1000; // 1 hour block duration

// In-memory rate limiting store (consider Redis for production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Public paths that don't require authentication
const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
]);

// Static asset patterns that should bypass middleware
const STATIC_PATTERNS = [
  '/favicon.ico',
  '/robots.txt',
  '/_next/',
  '/api/health',
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract client IP address from request headers
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for the real client IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0]?.trim() || '127.0.0.1';
  }
  
  return cfConnectingIP || realIP || '127.0.0.1';
}

/**
 * Check if path should bypass middleware entirely
 */
function shouldBypassMiddleware(pathname: string): boolean {
  return STATIC_PATTERNS.some(pattern => pathname.startsWith(pattern));
}

/**
 * Check if path is publicly accessible
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname);
}

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimitStore(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime && !entry.blocked) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => {
    rateLimitStore.delete(key);
  });
}

/**
 * Check and update rate limit for IP address
 */
function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return { allowed: true };
  }
  
  const now = Date.now();
  const key = `rate_limit:${ip}`;
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup on each request
    cleanupRateLimitStore();
  }
  
  const entry = rateLimitStore.get(key);
  
  if (!entry) {
    // First request from this IP
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
      blocked: false,
    });
    return { allowed: true };
  }
  
  // Check if IP is currently blocked
  if (entry.blocked && now < entry.resetTime) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((entry.resetTime - now) / 1000) 
    };
  }
  
  // Reset if window has expired
  if (now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
      blocked: false,
    });
    return { allowed: true };
  }
  
  // Increment request count
  entry.count += 1;
  
  // Check if limit exceeded
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    entry.blocked = true;
    entry.resetTime = now + RATE_LIMIT_BLOCK_DURATION;
    rateLimitStore.set(key, entry);
    
    return { 
      allowed: false, 
      retryAfter: Math.ceil(RATE_LIMIT_BLOCK_DURATION / 1000) 
    };
  }
  
  rateLimitStore.set(key, entry);
  return { allowed: true };
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  const headers: SecurityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Create structured log context for request
 */
function createLogContext(
  request: NextRequest, 
  ip: string, 
  payload?: JWTPayload
): RequestLogContext {
  const userAgent = request.headers.get('user-agent') || '';
  
  const context: RequestLogContext = {
    timestamp: new Date().toISOString(),
    ip,
    pathname: request.nextUrl.pathname,
    method: request.method,
    userAgent: userAgent.slice(0, 200), // Truncate for security
    hasToken: !!request.cookies.get('token')?.value,
  };
  
  // Only add optional properties if they exist
  if (payload?.id) {
    context.userId = payload.id;
  }
  
  if (payload?.email) {
    context.userEmail = payload.email;
  }
  
  return context;
}

// ============================================================================
// MAIN MIDDLEWARE FUNCTION
// ============================================================================

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);
  
  // Skip middleware for static assets
  if (shouldBypassMiddleware(pathname)) {
    return NextResponse.next();
  }
  
  // Rate limiting check
  const rateLimitResult = checkRateLimit(ip);
  if (!rateLimitResult.allowed) {
    console.warn('[MIDDLEWARE-RATE-LIMIT]', {
      ip,
      pathname,
      retryAfter: rateLimitResult.retryAfter,
      action: 'rate_limit_exceeded'
    });
    
    const response = new NextResponse('Too Many Requests', { status: 429 });
    if (rateLimitResult.retryAfter) {
      response.headers.set('Retry-After', rateLimitResult.retryAfter.toString());
    }
    return addSecurityHeaders(response);
  }
  
  const token = request.cookies.get('token')?.value;
  const logContext = createLogContext(request, ip);
  
  // Log all access attempts
  console.info('[MIDDLEWARE-ACCESS]', logContext);
  
  // Handle public paths
  if (isPublicPath(pathname)) {
    // For login page, redirect authenticated users to dashboard
    if (pathname === '/login' && token) {
      try {
        const payload = await verifyAuth(token);
        console.info('[MIDDLEWARE-REDIRECT]', {
          ...logContext,
          userId: payload.id,
          userEmail: payload.email,
          action: 'authenticated_user_redirected_from_login'
        });
        
        const response = NextResponse.redirect(new URL('/dashboard', request.url));
        return addSecurityHeaders(response);
      } catch (error) {
        console.warn('[MIDDLEWARE-AUTH-WARNING]', {
          ...logContext,
          message: 'Invalid token detected on login page',
          action: 'invalid_token_cleanup',
          errorType: error instanceof Error ? error.constructor.name : 'Unknown'
        });
        
        // Clear invalid token and continue to login
        const response = NextResponse.next();
        response.cookies.delete('token');
        return addSecurityHeaders(response);
      }
    }
    
    // Allow access to other public paths
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }
  
  // Protected paths require authentication
  if (!token) {
    console.info('[MIDDLEWARE-REDIRECT]', {
      ...logContext,
      action: 'unauthenticated_redirect_to_login'
    });
    
    const response = NextResponse.redirect(new URL('/login', request.url));
    return addSecurityHeaders(response);
  }
  
  // Verify authentication token
  try {
    const payload = await verifyAuth(token);
    
    console.info('[MIDDLEWARE-AUTH-SUCCESS]', {
      ...logContext,
      userId: payload.id,
      userEmail: payload.email,
      action: 'authenticated_access_granted'
    });
    
    // Add user info to headers for downstream consumption
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.id);
    response.headers.set('x-user-email', payload.email);
    response.headers.set('x-user-role', payload.role);
    
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('[MIDDLEWARE-AUTH-ERROR]', {
      ...logContext,
      message: 'Authentication failed - redirecting to login',
      action: 'auth_failure_redirect',
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Clear invalid token and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    
    return addSecurityHeaders(response);
  }
}

// ============================================================================
// MIDDLEWARE CONFIG
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt (static assets)
     * - files with extensions (e.g., .png, .jpg, .css, .js)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|.*\\..*).*)',
  ],
};