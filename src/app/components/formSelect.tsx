"use client";

import { useState, useRef, useEffect, useId, forwardRef } from "react";
import type { ButtonHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value'> {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: SelectOption[];
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(({ 
  value, 
  onValueChange, 
  placeholder = "Select option...", 
  options = [],
  label,
  required = false,
  error,
  className = "",
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const fieldId = `select-${id}`;
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const selectedOption = options.find(option => option.value === value);
  
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-[#1C1C1C]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative" ref={selectRef}>
        <button
          ref={ref}
          id={fieldId}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-base ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E8E7E] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 ${
            error 
              ? "border-red-500 focus-visible:ring-red-500" 
              : "border-[#E6F2F1] focus:border-[#3E8E7E]"
          } ${className}`.trim()}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...props}
        >
          <span className={selectedOption ? "text-[#1C1C1C]" : "text-gray-500"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div 
            className="absolute z-50 mt-1 w-full rounded-md border border-[#E6F2F1] bg-white py-1 shadow-xl max-h-60 overflow-auto"
            role="listbox"
            aria-label={label || 'Select option'}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm text-[#1C1C1C] transition-colors duration-150 ${
                  option.value === value 
                    ? 'bg-[#3E8E7E] text-white' 
                    : 'hover:bg-[#3E8E7E]/10 focus:bg-[#3E8E7E]/10 hover:text-[#1C1C1C]'
                } focus:outline-none`}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p id={`${fieldId}-error`} className="text-sm text-red-500 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect;