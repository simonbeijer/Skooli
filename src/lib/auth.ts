/**
 * Authentication Utilities
 * 
 * Type-safe JWT authentication utilities with comprehensive error handling
 * and proper environment variable validation.
 */

import * as jose from "jose";
import type { 
  JWTPayload, 
  TokenVerificationResult,
  User 
} from "@/types/auth";
import { isJWTPayload } from "@/types/auth";

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

/**
 * JWT Secret with proper validation
 * Throws descriptive error if not configured properly
 */
const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is required. " +
      "Please add a secure random string to your .env file."
    );
  }
  
  if (secret.length < 32) {
    throw new Error(
      "JWT_SECRET must be at least 32 characters long for security. " +
      "Please generate a stronger secret."
    );
  }
  
  return secret;
};

// Cache the secret after validation
const JWT_SECRET = getJWTSecret();

// ============================================================================
// JWT CREATION UTILITIES
// ============================================================================

/**
 * Create a signed JWT token for a user
 */
export const createToken = async (user: User): Promise<string> => {
  try {
    const payload: Omit<JWTPayload, 'exp' | 'iat'> = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(new TextEncoder().encode(JWT_SECRET));

    return token;
  } catch (error) {
    throw new AuthError(
      `Failed to create JWT token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { cause: error }
    );
  }
};

// ============================================================================
// JWT VERIFICATION UTILITIES
// ============================================================================

/**
 * Verify and decode a JWT token
 * Returns the payload if valid, throws AuthError if invalid
 */
export const verifyAuth = async (token: string): Promise<JWTPayload> => {
  if (!token || typeof token !== 'string') {
    throw new AuthError("Missing or invalid token", { code: 'MISSING_TOKEN' });
  }

  try {
    const { payload } = await jose.jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    // Type guard to ensure payload matches our expected structure
    if (!isJWTPayload(payload)) {
      throw new AuthError("Invalid token payload structure", { 
        code: 'INVALID_CREDENTIALS' 
      });
    }

    return payload;
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      throw new AuthError("Token has expired", { 
        code: 'TOKEN_EXPIRED',
        statusCode: 401
      });
    }
    
    if (error instanceof jose.errors.JWTInvalid) {
      throw new AuthError("Invalid token signature", { 
        code: 'INVALID_CREDENTIALS',
        statusCode: 401
      });
    }

    if (error instanceof AuthError) {
      throw error;
    }

    throw new AuthError(
      `Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { 
        code: 'UNAUTHORIZED',
        statusCode: 401,
        cause: error
      }
    );
  }
};

/**
 * Verify a token and return detailed verification result
 * Does not throw, returns result object with validation status
 */
export const verifyTokenSafe = async (token: string): Promise<TokenVerificationResult> => {
  try {
    const payload = await verifyAuth(token);
    return {
      payload,
      isValid: true
    };
  } catch (error) {
    return {
      payload: {} as JWTPayload, // Empty payload for failed verification
      isValid: false
    };
  }
};

// ============================================================================
// TOKEN EXTRACTION UTILITIES
// ============================================================================

/**
 * Extract token from Authorization header
 * Supports both "Bearer <token>" and "<token>" formats
 */
export const extractTokenFromHeader = (authHeader: string | null): string | null => {
  if (!authHeader) return null;
  
  // Handle "Bearer <token>" format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  
  // Handle direct token format
  return authHeader;
};

/**
 * Extract token from cookie string
 */
export const extractTokenFromCookie = (cookieHeader: string | null, cookieName = 'auth-token'): string | null => {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      acc[name] = value;
    }
    return acc;
  }, {} as Record<string, string>);
  
  return cookies[cookieName] || null;
};

// ============================================================================
// TOKEN VALIDATION UTILITIES
// ============================================================================

/**
 * Check if a token is expired without full verification
 * Useful for quick checks before attempting verification
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payloadPart = parts[1];
    if (!payloadPart) return true;
    
    const payload = JSON.parse(atob(payloadPart));
    const now = Math.floor(Date.now() / 1000);
    
    return payload.exp && payload.exp < now;
  } catch {
    return true;
  }
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payloadPart = parts[1];
    if (!payloadPart) return null;
    
    const payload = JSON.parse(atob(payloadPart));
    
    return payload.exp ? new Date(payload.exp * 1000) : null;
  } catch {
    return null;
  }
};

// ============================================================================
// CUSTOM ERROR CLASS
// ============================================================================

class AuthError extends Error {
  public code: 'INVALID_CREDENTIALS' | 'TOKEN_EXPIRED' | 'MISSING_TOKEN' | 'UNAUTHORIZED';
  public statusCode?: number;

  constructor(
    message: string, 
    options: { 
      code?: 'INVALID_CREDENTIALS' | 'TOKEN_EXPIRED' | 'MISSING_TOKEN' | 'UNAUTHORIZED';
      statusCode?: number;
      cause?: unknown;
    } = {}
  ) {
    super(message);
    this.name = 'AuthError';
    this.code = options.code || 'UNAUTHORIZED';
    
    if (options.statusCode !== undefined) {
      this.statusCode = options.statusCode;
    }
    
    // Set cause if provided (for modern environments)
    if (options.cause && 'cause' in Error.prototype) {
      (this as any).cause = options.cause;
    }
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { AuthError };

// Type exports are already handled by the import from @/types/auth
export type { JWTPayload, TokenVerificationResult } from "@/types/auth";