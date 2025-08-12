'use client';

/**
 * User Context Provider
 * 
 * Type-safe React context for user authentication state management.
 * Provides user data, loading states, and authentication actions
 * throughout the application with comprehensive error handling.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthVerificationResponse } from '@/types/auth';

// ============================================================================
// CONTEXT TYPES
// ============================================================================

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

interface UserProviderProps {
  children: ReactNode;
}

interface ApiErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const UserContext = createContext<UserContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Clear any existing error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);


  /**
   * Fetch current user from the API
   * Handles authentication verification and user session restoration
   */
  const fetchUser = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Since we're on a protected route, we know the token exists
      // HTTP-only cookies aren't accessible via document.cookie, so just make the API call

      const response = await fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: AuthVerificationResponse = await response.json();
        
        if (data.user) {
          console.log('✅ User session restored:', data.user.email);
          setUser(data.user);
        } else {
          console.log('ℹ️ No active user session found');
          setUser(null);
        }
      } else {
        // Handle non-200 responses
        if (response.status === 401) {
          console.log('ℹ️ No valid authentication token found');
          setUser(null);
        } else {
          // Try to get error message from response
          try {
            const errorData: ApiErrorResponse = await response.json();
            const errorMessage = errorData.message || `Server error: ${response.status}`;
            setError(errorMessage);
            console.error('❌ User fetch error:', errorMessage);
          } catch {
            const errorMessage = `Server error: ${response.status} ${response.statusText}`;
            setError(errorMessage);
            console.error('❌ User fetch error:', errorMessage);
          }
          setUser(null);
        }
      }
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error 
        ? fetchError.message 
        : 'Network error occurred';
      
      setError(errorMessage);
      setUser(null);
      console.error('❌ User fetch network error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh user data
   * Public method to re-fetch user information
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    await fetchUser();
  }, [fetchUser]);

  /**
   * Set user with error clearing
   * Enhanced setter that clears errors when setting user data
   */
  const setUserWithErrorHandling = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (newUser && error) {
      setError(null);
    }
  }, [error]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Initial user session restoration
   * Attempts to restore user session on mount
   */
  useEffect(() => {
    let mounted = true;

    const initializeUser = async () => {
      if (mounted) {
        await fetchUser();
      }
    };

    initializeUser();

    return () => {
      mounted = false;
    };
  }, [fetchUser]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: UserContextType = {
    user,
    loading,
    error,
    setUser: setUserWithErrorHandling,
    refreshUser,
    clearError,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Custom hook to access user context
 * Provides type-safe access to user authentication state
 * 
 * @throws Error if used outside of UserProvider
 * @returns UserContextType with user state and actions
 */
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error(
      'useUser must be used within a UserProvider. ' +
      'Wrap your component tree with <UserProvider> to use this hook.'
    );
  }
  
  return context;
}

// ============================================================================
// LEGACY HOOK ALIAS
// ============================================================================

/**
 * Legacy alias for useUser hook
 * Maintained for backward compatibility
 * 
 * @deprecated Use useUser instead
 */
export const useUserContext = useUser;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { UserContextType, UserProviderProps };