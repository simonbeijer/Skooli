/**
 * Central Type Definitions
 * 
 * This file serves as the main type definitions export point for the application.
 * All shared types, interfaces, and type utilities should be defined here or
 * re-exported from their respective modules.
 */

import type { ReactNode } from 'react';

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================
// Auth types are re-exported from their respective modules
export type {
  User,
  DatabaseUser,
  AuthState,
  AuthContextType,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  AuthVerificationResponse,
  JWTPayload,
  TokenVerificationResult,
  AuthError,
  UserRole,
  AuthStatus,
  PublicUser
} from './auth';

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// ============================================================================
// FORM & COMPONENT TYPES
// ============================================================================
// Form types are re-exported from their respective modules
export type { LoginFormData, ContactFormData, UserProfileFormData, SearchFormData } from './forms';

export interface ComponentProps {
  className?: string;
  children?: ReactNode;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// ============================================================================
// NEXT.JS SPECIFIC TYPES
// ============================================================================

export interface PageProps {
  params: Record<string, string | string[]>;
  searchParams: Record<string, string | string[] | undefined>;
}

export interface LayoutProps {
  children: ReactNode;
  params: Record<string, string | string[]>;
}

// ============================================================================
// DATABASE TYPES (Prisma Integration Ready)
// ============================================================================
// Database types are now managed in auth.ts and re-exported above

// ============================================================================
// TYPE GUARDS & UTILITIES
// ============================================================================
// Type guards for auth types are re-exported from their respective modules
export { isUser, isJWTPayload, isAuthError } from './auth';
export { isSelectOption, isOptionGroup, isFormErrors } from './forms';

export const isApiResponse = <T>(obj: unknown): obj is ApiResponse<T> => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'success' in obj &&
    typeof (obj as ApiResponse).success === 'boolean'
  );
};