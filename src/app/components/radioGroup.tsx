"use client";

import { forwardRef, useId } from 'react';

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  selected: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  disabled?: boolean;
}

const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(({
  name,
  options,
  selected,
  onChange,
  label,
  required = false,
  error,
  orientation = 'vertical',
  size = 'default',
  className = '',
  disabled = false
}, ref) => {
  const fieldsetId = useId();
  const errorId = useId();

  const sizeClasses = {
    sm: { radio: 'w-3 h-3', text: 'text-xs', spacing: 'space-x-2' },
    default: { radio: 'w-4 h-4', text: 'text-sm', spacing: 'space-x-3' },
    lg: { radio: 'w-5 h-5', text: 'text-base', spacing: 'space-x-4' }
  };

  const orientationClasses = orientation === 'horizontal' 
    ? 'flex flex-wrap gap-4' 
    : 'flex flex-col space-y-2';

  const currentSizeClasses = sizeClasses[size];

  return (
    <fieldset 
      ref={ref}
      className={`flex flex-col mb-4 ${className}`.trim()}
      disabled={disabled}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={error ? errorId : undefined}
    >
      {label && (
        <legend className="block text-sm font-medium text-foreground mb-2">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </legend>
      )}
      
      <div className={orientationClasses} role="radiogroup">
        {options.map((option) => {
          const isSelected = selected === option.value;
          const isDisabled = disabled || option.disabled;
          
          return (
            <label 
              key={option.value} 
              className={`flex items-start ${currentSizeClasses.spacing} cursor-pointer group ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md p-1'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => !isDisabled && onChange(option.value)}
                disabled={isDisabled}
                className={`${currentSizeClasses.radio} text-primary bg-background border-grey rounded-full focus:ring-primary focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-describedby={option.description ? `${option.value}-desc` : undefined}
              />
              <div className="flex flex-col">
                <span className={`${currentSizeClasses.text} text-foreground font-medium`}>
                  {option.label}
                </span>
                {option.description && (
                  <span 
                    id={`${option.value}-desc`}
                    className={`${currentSizeClasses.text} text-gray-500 mt-1`}
                  >
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
});

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;