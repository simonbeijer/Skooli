/**
 * Logout API Route
 * 
 * Secure logout endpoint that clears authentication cookies
 * with proper TypeScript typing and security logging.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { LogoutResponse } from "@/types/auth";
import type { ErrorResponse } from "@/lib/api/schemas";
import { verifyAuth } from "@/lib/auth";
import {
  getClientIP,
  logSecurityEvent,
  handleInternalError,
  addSecurityHeaders
} from "@/lib/api/utils";

// ============================================================================
// LOGOUT ENDPOINT
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<LogoutResponse | ErrorResponse>> {
  const clientIP = getClientIP(request);
  let userId: string | undefined;

  try {
    // ========================================================================
    // EXTRACT TOKEN FROM COOKIE
    // ========================================================================
    
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // Try to get user info from token for logging (if token exists and is valid)
    if (token) {
      try {
        const payload = await verifyAuth(token);
        userId = payload.id;
      } catch (error) {
        // Token might be invalid/expired, but we still want to clear the cookie
        logSecurityEvent('logout_invalid_token_cleared', {
          token_present: true,
          ip: clientIP
        }, request);
      }
    }

    // ========================================================================
    // CLEAR AUTHENTICATION COOKIE
    // ========================================================================
    
    const response = NextResponse.json(
      {
        message: "Logout successful",
        timestamp: new Date().toISOString()
      } satisfies LogoutResponse,
      { status: 200 }
    );

    // Clear the authentication cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Immediately expire
      path: "/",
    });

    // ========================================================================
    // SECURITY LOGGING
    // ========================================================================
    
    logSecurityEvent('logout_successful', {
      user_id: userId,
      ip: clientIP,
      had_token: Boolean(token),
      user_agent: request.headers.get('user-agent')
    }, request, userId);

    // Add security headers
    return addSecurityHeaders(response);

  } catch (error) {
    logSecurityEvent('logout_system_error', {
      error_type: error instanceof Error ? error.constructor.name : 'unknown',
      user_id: userId,
      ip: clientIP
    }, request, userId);
    
    return handleInternalError(request, error as Error, {
      endpoint: 'POST /api/auth/logout',
      user_id: userId
    });
  }
}

// ============================================================================
// METHOD NOT ALLOWED HANDLERS
// ============================================================================

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      message: "Method not allowed. Use POST to logout.",
      timestamp: new Date().toISOString()
    },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      message: "Method not allowed. Use POST to logout.",
      timestamp: new Date().toISOString()
    },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      message: "Method not allowed. Use POST to logout.",
      timestamp: new Date().toISOString()
    },
    { status: 405 }
  );
}