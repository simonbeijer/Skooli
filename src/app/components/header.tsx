"use client";

import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/userContext";
import Link from "next/link";
import Dropdown from "./dropdown";

interface User {
  name: string;
  email?: string;
  id?: string;
}

interface HeaderProps {
  state?: 'public' | 'login' | 'authenticated';
}

const Header = ({ state }: HeaderProps) => {
  const { user, setUser, loading } = useUserContext();
  const router = useRouter();

  // Auto-detect state if not provided - show loading state while user context loads
  const currentState = state || (loading ? 'loading' : (user ? 'authenticated' : 'public'));

  const logoutUser = async (): Promise<void> => {
    try {
      const response = await fetch("/api/auth/logout", { 
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ User logged out successfully');
        setUser(null);
        router.push("/login");
      } else {
        console.error('❌ Logout failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Logout error:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const skeleton = (
    <div className="flex items-center p-2">
      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
    </div>
  );

  return (
    <header className="sk-header">
      <div className="sk-header__inner">
        {/* Left section - Brand Logo */}
        <Link href={currentState === 'login' ? '/' : '/dashboard'} className="sk-header__brand">
          <span className="sk-header__logo">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </span>
          <span className="sk-header__name">Skooli</span>
        </Link>

        {/* Center navigation (döljs på smala skärmar via theme.css) */}
        {(currentState === 'public' || currentState === 'authenticated') && (
          <nav className="sk-header__nav" aria-label="Huvudmeny">
            {currentState === 'public' && (
              <>
                <Link href="/login" className="sk-header__link">Skapa Lektion</Link>
                <Link href="/demo" className="sk-header__link">Demo</Link>
              </>
            )}
            {currentState === 'authenticated' && (
              <>
                <Link href="/dashboard" className="sk-header__link">Dashboard</Link>
                <Link href="/generate" className="sk-header__link">Skapa Lektion</Link>
              </>
            )}
          </nav>
        )}

        {/* Right section */}
        <div className="sk-header__actions">
          {currentState === 'public' && (
            <>
              <Link href="/login" className="sk-header__link">Logga In</Link>
              <Link href="/login" className="sk-header__button">Kom Igång</Link>
            </>
          )}

          {currentState === 'loading' && skeleton}

          {currentState === 'authenticated' && (
            user ? <Dropdown logoutUser={logoutUser} user={user as User} /> : skeleton
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;