/**
 * User Authentication Verification API Route
 * 
 * Endpoint to verify JWT tokens and return authenticated user information
 * with proper TypeScript typing, security logging, and error handling.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuth, AuthError } from "@/lib/auth";
import type { AuthVerificationResponse, User, JWTPayload } from "@/types/auth";
import type { ErrorResponse } from "@/lib/api/schemas";
import {
  getClientIP,
  logSecurityEvent,
  handleAuthError,
  handleInternalError,
  addSecurityHeaders,
  generalAPIRateLimiter,
  handleRateLimitExceeded
} from "@/lib/api/utils";

// ============================================================================
// USER VERIFICATION ENDPOINT
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse<AuthVerificationResponse | ErrorResponse>> {
  const clientIP = getClientIP(request);

  try {
    // ========================================================================
    // RATE LIMITING CHECK
    // ========================================================================
    
    const rateLimitResult = generalAPIRateLimiter.check(clientIP);
    
    if (!rateLimitResult.allowed) {
      logSecurityEvent('auth_verification_rate_limit_exceeded', {
        ip: clientIP,
        remaining: rateLimitResult.remaining
      }, request);
      
      return handleRateLimitExceeded(rateLimitResult.resetTime);
    }

    // Record the API call attempt
    generalAPIRateLimiter.recordAttempt(clientIP);

    // ========================================================================
    // EXTRACT TOKEN FROM COOKIE
    // ========================================================================
    
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      logSecurityEvent('auth_verification_no_token', {
        ip: clientIP,
        user_agent: request.headers.get('user-agent')
      }, request);
      
      return NextResponse.json(
        {
          user: null,
          message: "No authentication token found",
          timestamp: new Date().toISOString()
        } satisfies AuthVerificationResponse,
        { status: 401 }
      );
    }

    // ========================================================================
    // TOKEN VERIFICATION
    // ========================================================================
    
    let payload: JWTPayload;
    
    try {
      payload = await verifyAuth(token);
    } catch (error) {
      // Log different types of auth errors
      if (error instanceof AuthError) {
        logSecurityEvent('auth_verification_token_invalid', {
          error_code: error.code,
          error_message: error.message,
          ip: clientIP,
          user_agent: request.headers.get('user-agent')
        }, request);
        
        // Clear invalid token cookie
        const response = NextResponse.json(
          {
            user: null,
            message: error.message || "Invalid token",
            timestamp: new Date().toISOString()
          } satisfies AuthVerificationResponse,
          { status: 401 }
        );

        response.cookies.set("token", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 0, // Immediately expire
          path: "/",
        });

        return addSecurityHeaders(response);
      }
      
      throw error; // Re-throw non-auth errors
    }

    // ========================================================================
    // CONSTRUCT USER OBJECT
    // ========================================================================
    
    const user: User = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role as 'user' | 'admin',
      createdAt: new Date(), // These would normally come from the database
      updatedAt: new Date()  // but JWT payload doesn't include them
    };

    // ========================================================================
    // SUCCESSFUL VERIFICATION
    // ========================================================================
    
    logSecurityEvent('auth_verification_successful', {
      user_id: user.id,
      email: user.email,
      role: user.role,
      ip: clientIP,
      token_exp: payload.exp,
      token_iat: payload.iat
    }, request, user.id);

    const response = NextResponse.json(
      {
        user,
        timestamp: new Date().toISOString()
      } satisfies AuthVerificationResponse,
      { status: 200 }
    );

    return addSecurityHeaders(response);

  } catch (error) {
    logSecurityEvent('auth_verification_system_error', {
      error_type: error instanceof Error ? error.constructor.name : 'unknown',
      ip: clientIP
    }, request);
    
    return handleInternalError(request, error as Error, {
      endpoint: 'GET /api/auth/user'
    });
  }
}

// ============================================================================
// UPDATE USER PROFILE ENDPOINT (Future Enhancement)
// ============================================================================

export async function PUT(request: NextRequest): Promise<NextResponse> {
  // This endpoint could be implemented in the future for user profile updates
  return NextResponse.json(
    {
      message: "User profile updates not yet implemented",
      timestamp: new Date().toISOString()
    },
    { status: 501 } // Not Implemented
  );
}

// ============================================================================
// METHOD NOT ALLOWED HANDLERS
// ============================================================================

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      message: "Method not allowed. Use GET to verify authentication.",
      timestamp: new Date().toISOString()
    },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      message: "Method not allowed. Use GET to verify authentication.",
      timestamp: new Date().toISOString()
    },
    { status: 405 }
  );
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      message: "Method not allowed. Use GET to verify authentication or PUT to update profile.",
      timestamp: new Date().toISOString()
    },
    { status: 405 }
  );
}