"use client";

import { useState, useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { UserCircleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import Spinner from "./spinner";
import Image from "next/image"

interface User {
  name: string;
  email?: string;
  id?: string;
  avatar?: string;
}

interface DropdownAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  icon?: React.ReactNode;
}

interface DropdownProps {
  user: User | null;
  logoutUser: () => void;
  actions?: DropdownAction[];
  autoCloseDelay?: number;
  className?: string;
  dropdownClassName?: string;
  showChevron?: boolean;
}

const Dropdown = ({ 
  user, 
  logoutUser,
  actions = [],
  autoCloseDelay = 7000,
  className = '',
  dropdownClassName = '',
  showChevron = false
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  // Auto-close dropdown after delay
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timeout = setTimeout(() => {
        setIsOpen(false);
      }, autoCloseDelay);

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [isOpen, autoCloseDelay]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleDropdown();
    }
  };

  // Combine default logout action with custom actions
  const allActions: DropdownAction[] = [
    ...actions,
    {
      label: 'Logout',
      onClick: () => {
        logoutUser();
        setIsOpen(false);
      },
      variant: 'danger' as const
    }
  ];

  const getActionClasses = (variant: DropdownAction['variant'] = 'default') => {
    const baseClasses = 'w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3E8E7E] font-inter';
    
    return variant === 'danger' 
      ? `${baseClasses} text-red-600 hover:bg-red-50 hover:text-red-800`
      : `${baseClasses} text-[#333] hover:bg-[#3E8E7E]/10 hover:text-[#3E8E7E]`;
  };

  return (
    <div className={`relative ${className}`.trim()} ref={dropdownRef}>
      <button 
        ref={buttonRef}
        className="flex items-center p-2 rounded-full hover:bg-[#3E8E7E]/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3E8E7E] focus:ring-offset-2"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        {user?.avatar ? (
          <Image
            src={user.avatar} 
            alt={`${user.name} avatar`}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <UserCircleIcon className="h-8 w-8 text-[#3E8E7E]" />
        )}
        {showChevron && (
          <ChevronDownIcon 
            className={`ml-1 h-4 w-4 text-gray-600 dark:text-gray-300 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        )}
      </button>
      
      <div
        className={`transition-all duration-300 transform absolute right-0 mt-2 p-4 border rounded-2xl shadow-lg text-right bg-white/90 backdrop-blur-sm border-white/50 min-w-[200px] z-50 ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        } ${dropdownClassName}`.trim()}
        role="menu"
        aria-orientation="vertical"
      >
        {user ? (
          <>
            {/* User Info */}
            <div className="mb-3 pb-3 border-b border-[#E6F2F1]">
              <p className="text-sm font-medium font-inter text-[#1C1C1C] truncate">
                {user.name}
              </p>
              {user.email && (
                <p className="text-xs font-inter text-[#333] truncate">
                  {user.email}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-1">
              {allActions.map((action, index) => (
                <button
                  key={index}
                  className={getActionClasses(action.variant)}
                  onClick={action.onClick}
                  role="menuitem"
                >
                  <span className="flex items-center gap-2">
                    {action.icon}
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="h-[60px] w-[60px] flex items-center justify-center">
            <Spinner size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;