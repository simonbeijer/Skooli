/**
 * Login API Route
 * 
 * Secure authentication endpoint with comprehensive validation,
 * rate limiting, and security logging using TypeScript and Zod.
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import type { LoginResponse, User, DatabaseUser } from "@/types/auth";
import { LoginSchema, type ErrorResponse } from "@/lib/api/schemas";
import {
  getClientIP,
  logSecurityEvent,
  loginRateLimiter,
  handleValidationError,
  handleRateLimitExceeded,
  handleInternalError,
  createSuccessResponse,
  parseRequestBody,
  addSecurityHeaders,
  executeDummyOperation
} from "@/lib/api/utils";

// ============================================================================
// RATE LIMITING & SECURITY CONFIG
// ============================================================================

const MAX_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

// ============================================================================
// LOGIN ENDPOINT
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse | ErrorResponse>> {
  let validatedInput: { email: string; password: string } | null = null;
  const clientIP = getClientIP(request);

  try {
    // ========================================================================
    // RATE LIMITING CHECK
    // ========================================================================
    
    const rateLimitResult = loginRateLimiter.check(clientIP);
    
    if (!rateLimitResult.allowed) {
      logSecurityEvent('login_rate_limit_exceeded', {
        ip: clientIP,
        remaining: rateLimitResult.remaining,
        blocked: rateLimitResult.blocked
      }, request);
      
      return handleRateLimitExceeded(rateLimitResult.resetTime);
    }

    // ========================================================================
    // REQUEST BODY PARSING & VALIDATION
    // ========================================================================
    
    const body = await parseRequestBody(request);
    
    try {
      validatedInput = LoginSchema.parse(body);
    } catch (error) {
      // Record failed attempt for rate limiting
      loginRateLimiter.recordAttempt(clientIP);
      
      logSecurityEvent('login_validation_failed', {
        error: error instanceof ZodError ? error.errors[0]?.message : 'Invalid input',
        hasEmail: typeof (body as any)?.email === 'string',
        hasPassword: typeof (body as any)?.password === 'string',
      }, request);
      
      if (error instanceof ZodError) {
        return handleValidationError(error);
      }
      
      return NextResponse.json(
        { 
          message: "Invalid credentials",
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    const { email, password } = validatedInput;

    // ========================================================================
    // DATABASE USER LOOKUP
    // ========================================================================
    
    const user: DatabaseUser | null = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // ========================================================================
    // USER NOT FOUND - TIMING ATTACK PREVENTION
    // ========================================================================
    
    if (!user) {
      // Record failed attempt for rate limiting
      loginRateLimiter.recordAttempt(clientIP);
      
      // Execute dummy operation to prevent timing attacks
      await executeDummyOperation();
      
      logSecurityEvent('login_user_not_found', {
        attempted_email: email,
        ip: clientIP
      }, request);
      
      return NextResponse.json(
        {
          message: "Invalid credentials",
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    // ========================================================================
    // PASSWORD VERIFICATION
    // ========================================================================
    
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Record failed attempt for rate limiting
      loginRateLimiter.recordAttempt(clientIP);
      
      logSecurityEvent('login_invalid_password', {
        user_id: user.id,
        email: user.email,
        ip: clientIP
      }, request);
      
      return NextResponse.json(
        {
          message: "Invalid credentials",
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    // ========================================================================
    // SUCCESSFUL AUTHENTICATION
    // ========================================================================
    
    logSecurityEvent('login_successful', {
      user_id: user.id,
      email: user.email,
      ip: clientIP,
      user_agent: request.headers.get('user-agent')
    }, request);

    // Clear any existing rate limit data for successful login
    loginRateLimiter.clear(clientIP);

    // ========================================================================
    // JWT TOKEN CREATION
    // ========================================================================
    
    const publicUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    const token = await createToken(publicUser);

    // ========================================================================
    // RESPONSE WITH SECURE COOKIE
    // ========================================================================
    
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: publicUser,
        timestamp: new Date().toISOString()
      } satisfies LoginResponse,
      { status: 200 }
    );

    // Set secure HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 2 * 60 * 60, // 2 hours (matches JWT expiration)
      path: "/",
    });

    // Add security headers
    return addSecurityHeaders(response);

  } catch (error) {
    // Record failed attempt for rate limiting on system errors
    loginRateLimiter.recordAttempt(clientIP);
    
    logSecurityEvent('login_system_error', {
      error_type: error instanceof Error ? error.constructor.name : 'unknown',
      attempted_email: validatedInput?.email || 'unknown',
      ip: clientIP
    }, request);
    
    return handleInternalError(request, error as Error, {
      endpoint: 'POST /api/auth/login',
      attempted_email: validatedInput?.email
    });
  }
}

// ============================================================================
// METHOD NOT ALLOWED HANDLER
// ============================================================================

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      message: "Method not allowed. Use POST to login.",
      timestamp: new Date().toISOString()
    },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      message: "Method not allowed. Use POST to login.",
      timestamp: new Date().toISOString()
    },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      message: "Method not allowed. Use POST to login.",
      timestamp: new Date().toISOString()
    },
    { status: 405 }
  );
}