"use client";

import { forwardRef, useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  name: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  maxLength?: number;
  showCharCount?: boolean;
}

const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(({
  name,
  value,
  onChange,
  placeholder,
  error,
  label,
  required = false,
  helperText,
  resize = 'vertical',
  rows = 4,
  maxLength,
  showCharCount = false,
  className = '',
  disabled = false,
  ...props
}, ref) => {
  const textareaId = useId();
  const errorId = useId();
  const helperId = useId();
  
  const baseTextareaClasses = 'w-full px-3 py-2 border rounded-md bg-white text-[#1C1C1C] placeholder:text-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3E8E7E] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed md:text-sm min-h-[80px]';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : 'border-[#E6F2F1] focus:border-[#3E8E7E]';
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  };

  const textareaClasses = `${baseTextareaClasses} ${errorClasses} ${resizeClasses[resize]} ${className}`.trim();

  const currentLength = value?.length || 0;
  const isNearLimit = maxLength && currentLength > maxLength * 0.8;
  const isOverLimit = maxLength && currentLength > maxLength;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={textareaId} 
          className="block text-sm font-medium text-[#1C1C1C]"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={textareaClasses}
        rows={rows}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`.trim()}
        {...props}
      />

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

      {(showCharCount || maxLength) && (
        <div className={`text-xs mt-1 text-right ${
          isOverLimit 
            ? 'text-red-600' 
            : isNearLimit 
            ? 'text-yellow-600' 
            : 'text-gray-500'
        }`}>
          {maxLength ? `${currentLength}/${maxLength}` : currentLength}
        </div>
      )}
    </div>
  );
});

TextAreaField.displayName = 'TextAreaField';

export default TextAreaField;