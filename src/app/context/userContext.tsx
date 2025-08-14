'use client';

/**
 * User Context Provider
 * 
 * Type-safe React context for user authentication state management.
 * Provides user data, loading states, and authentication actions
 * throughout the application.
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
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

interface UserProviderProps {
  children: ReactNode;
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



  /**
   * Fetch current user from the API
   */
  const fetchUser = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

      const response = await fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: AuthVerificationResponse = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
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
    setUser,
    refreshUser,
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