/**
 * Form Type Definitions
 * 
 * Comprehensive type definitions for form data, validation,
 * input components, and form-related UI elements.
 */

import type { ChangeEvent, FormEvent } from 'react';

// ============================================================================
// GENERIC FORM TYPES
// ============================================================================

export interface FormData {
  theme: string;
  grade: string;
  subjects: string;
  duration: string;
  notes?: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormState<T = Record<string, unknown>> {
  data: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isValid: boolean;
  touched: Record<keyof T, boolean>;
}

// ============================================================================
// SELECT & DROPDOWN TYPES
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface OptionGroup {
  label: string;
  options: SelectOption[];
}

export interface DropdownProps {
  options: SelectOption[] | OptionGroup[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  onChange?: (value: string | string[]) => void;
  onSearch?: (query: string) => void;
}

// ============================================================================
// INPUT FIELD TYPES
// ============================================================================

export interface InputFieldProps {
  id?: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  value?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  className?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export interface TextAreaFieldProps {
  id?: string;
  name: string;
  value?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  rows?: number;
  cols?: number;
  maxLength?: number;
  minLength?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  className?: string;
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}

// ============================================================================
// RADIO GROUP TYPES
// ============================================================================

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  onChange?: (value: string) => void;
}

// ============================================================================
// FORM VALIDATION TYPES
// ============================================================================

export interface ValidationRule<T = unknown> {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  custom?: (value: T) => string | boolean;
}

export type ValidationSchema<T = Record<string, unknown>> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
  firstErrorField?: string;
}

// ============================================================================
// SPECIFIC FORM DATA TYPES
// ============================================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface UserProfileFormData {
  name: string;
  email: string;
  bio?: string;
  website?: string;
  location?: string;
}

export interface SearchFormData {
  query: string;
  category?: string;
  sortBy?: string;
  filters?: Record<string, unknown>;
}

// ============================================================================
// FORM SUBMISSION TYPES
// ============================================================================

export interface FormSubmissionResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: FormErrors;
  message?: string;
}

export interface FormSubmitHandler<T = Record<string, unknown>> {
  (data: T): Promise<FormSubmissionResult<T>>;
}

export interface FormProps<T = Record<string, unknown>> {
  initialData?: Partial<T>;
  validationSchema?: ValidationSchema<T>;
  onSubmit: FormSubmitHandler<T>;
  onCancel?: () => void;
  className?: string;
  disabled?: boolean;
}

// ============================================================================
// FORM HOOK TYPES
// ============================================================================

export interface UseFormOptions<T = Record<string, unknown>> {
  initialData?: Partial<T>;
  validationSchema?: ValidationSchema<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  resetOnSubmit?: boolean;
}

export interface UseFormReturn<T = Record<string, unknown>> {
  data: T;
  errors: FormErrors;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  setValue: (name: keyof T, value: T[keyof T]) => void;
  setError: (name: keyof T, error: string) => void;
  clearError: (name: keyof T) => void;
  clearAllErrors: () => void;
  reset: (newData?: Partial<T>) => void;
  validate: (field?: keyof T) => ValidationResult;
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBlur: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isSelectOption = (obj: unknown): obj is SelectOption => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'value' in obj &&
    'label' in obj &&
    typeof (obj as SelectOption).value === 'string' &&
    typeof (obj as SelectOption).label === 'string'
  );
};

export const isOptionGroup = (obj: unknown): obj is OptionGroup => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'label' in obj &&
    'options' in obj &&
    typeof (obj as OptionGroup).label === 'string' &&
    Array.isArray((obj as OptionGroup).options)
  );
};

export const isFormErrors = (obj: unknown): obj is FormErrors => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Object.values(obj).every(value => typeof value === 'string')
  );
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type FormField = keyof FormData;
export type InputType = InputFieldProps['type'];
export type ValidationMessage = string | boolean;
export type FormEventHandler = (event: FormEvent<HTMLFormElement>) => void;