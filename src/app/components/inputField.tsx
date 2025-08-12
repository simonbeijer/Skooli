"use client";

import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  name: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  label,
  required = false,
  helperText,
  startIcon,
  endIcon,
  className = '',
  disabled = false,
  ...props
}, ref) => {
  const inputId = useId();
  const errorId = useId();
  const helperId = useId();

  const baseInputClasses = 'w-full px-3 py-2 border rounded-md bg-white text-[#1C1C1C] placeholder:text-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3E8E7E] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed md:text-sm';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : 'border-[#E6F2F1] focus:border-[#3E8E7E]';
  const iconPadding = startIcon ? 'pl-10' : endIcon ? 'pr-10' : '';

  const inputClasses = `${baseInputClasses} ${errorClasses} ${iconPadding} ${className}`.trim();

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-[#1C1C1C]"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <div className="relative">
        {startIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {startIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClasses}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`.trim()}
          {...props}
        />
        
        {endIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {endIcon}
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="text-sm text-red-500 mt-1" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={helperId} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;