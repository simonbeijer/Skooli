"use client";

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  callBack?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: ReactNode;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  text,
  callBack,
  variant = 'primary',
  size = 'default',
  className = '',
  children,
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-dark disabled:hover:bg-primary text-white focus:ring-primary',
    secondary: 'bg-secondary hover:bg-primary-light text-white focus:ring-secondary',
    outline: 'border border-primary bg-transparent hover:bg-primary text-primary hover:text-white focus:ring-primary',
    ghost: 'bg-transparent hover:bg-primary/10 text-primary focus:ring-primary',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };
  
  const sizeClasses = {
    default: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1.5 text-xs',
    lg: 'px-8 py-3 text-base rounded-xl shadow-lg hover:shadow-xl',
    icon: 'p-2'
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

  const handleClick = () => {
    if (!loading && !disabled && callBack) {
      callBack();
    }
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      type={type}
      disabled={disabled || loading}
      className={combinedClasses}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children || text}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;