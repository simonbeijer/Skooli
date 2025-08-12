/**
 * Authentication Type Definitions
 * 
 * Comprehensive type definitions for authentication, user management,
 * JWT operations, and auth-related API responses.
 */

// ============================================================================
// CORE USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseUser extends User {
  password: string;
}

// ============================================================================
// JWT & TOKEN TYPES
// ============================================================================

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  exp: number;
  iat: number;
}

export interface TokenVerificationResult {
  payload: JWTPayload;
  isValid: boolean;
}

// ============================================================================
// AUTHENTICATION REQUEST/RESPONSE TYPES
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user?: User;
  timestamp: string;
}

export interface LogoutResponse {
  message: string;
  timestamp: string;
}

export interface AuthVerificationResponse {
  user: User | null;
  message?: string;
  timestamp: string;
}

// ============================================================================
// AUTH CONTEXT TYPES
// ============================================================================

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token?: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ============================================================================
// AUTH MIDDLEWARE TYPES
// ============================================================================

export interface AuthMiddlewareConfig {
  publicPaths?: string[];
  protectedPaths?: string[];
  redirectTo?: string;
}

export interface MiddlewareAuthResult {
  isAuthenticated: boolean;
  user?: User;
  shouldRedirect: boolean;
  redirectTo?: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface AuthError extends Error {
  code: 'INVALID_CREDENTIALS' | 'TOKEN_EXPIRED' | 'MISSING_TOKEN' | 'UNAUTHORIZED';
  statusCode?: number;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isUser = (obj: unknown): obj is User => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj &&
    'name' in obj &&
    'role' in obj &&
    typeof (obj as User).id === 'string' &&
    typeof (obj as User).email === 'string' &&
    typeof (obj as User).name === 'string' &&
    ['user', 'admin'].includes((obj as User).role)
  );
};

export const isJWTPayload = (obj: unknown): obj is JWTPayload => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj &&
    'name' in obj &&
    'role' in obj &&
    'exp' in obj &&
    'iat' in obj &&
    typeof (obj as JWTPayload).id === 'string' &&
    typeof (obj as JWTPayload).email === 'string' &&
    typeof (obj as JWTPayload).name === 'string' &&
    typeof (obj as JWTPayload).role === 'string' &&
    typeof (obj as JWTPayload).exp === 'number' &&
    typeof (obj as JWTPayload).iat === 'number'
  );
};

export const isAuthError = (error: unknown): error is AuthError => {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as AuthError).code === 'string'
  );
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type UserRole = User['role'];
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';
export type PublicUser = Omit<User, 'password'>;