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

  return (
    <nav className="relative z-10 mt-12 mb-4">
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        
        {/* Left section - Brand Logo */}
        <Link href={currentState === 'login' ? '/' : '/dashboard'} className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#3E8E7E] rounded-xl flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-2xl font-playfair font-bold text-[#1C1C1C]">Skooli</span>
        </Link>
        
        {/* Center navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {currentState === 'public' && (
            <>
              <Link href="/login" className="text-[#333] hover:text-[#3E8E7E] transition-colors font-medium">
                Skapa Lektion
              </Link>
              <Link href="/login" className="text-[#333] hover:text-[#3E8E7E] transition-colors font-medium">
                Om Oss
              </Link>
              <Link href="/login" className="text-[#333] hover:text-[#3E8E7E] transition-colors font-medium">
                Kontakt
              </Link>
            </>
          )}
          
          {currentState === 'authenticated' && (
            <>
              <Link href="/dashboard" className="text-[#333] hover:text-[#3E8E7E] transition-colors font-medium">
                Dashboard
              </Link>
              <Link href="/generate" className="text-[#333] hover:text-[#3E8E7E] transition-colors font-medium">
                Skapa Lektion
              </Link>
            </>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {currentState === 'public' && (
            <>
              <Link href="/login" className="text-[#333] hover:text-[#3E8E7E] transition-colors font-medium">
                Logga In
              </Link>
              <Link href="/login">
                <button className="px-5 py-2 rounded-xl bg-[#3E8E7E] text-white font-medium hover:bg-[#2d6b5e] transition-colors">
                  Kom Igång
                </button>
              </Link>
            </>
          )}
          
          {currentState === 'login' && (
            <div></div>
          )}
          
          {currentState === 'loading' && (
            <div className="flex items-center space-x-4">
              {/* Loading skeleton matching dropdown button dimensions */}
              <div className="flex items-center p-2">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
          
          {currentState === 'authenticated' && (
            user ? (
              <Dropdown logoutUser={logoutUser} user={user as User} />
            ) : (
              <div className="flex items-center p-2">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            )
          )}
        </div>
        
      </div>
    </nav>
  );
};

export default Header;