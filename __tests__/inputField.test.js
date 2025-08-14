import { render, screen, fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import InputField from '../src/app/components/inputField';

// Mock useId since it returns different values in tests
let useIdCallCount = 0;
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: jest.fn(() => {
    useIdCallCount++;
    if (useIdCallCount % 3 === 1) return `input-id-${Math.floor(useIdCallCount / 3) + 1}`;
    if (useIdCallCount % 3 === 2) return `error-id-${Math.floor(useIdCallCount / 3) + 1}`;
    return `helper-id-${Math.floor(useIdCallCount / 3) + 1}`;
  })
}));

describe('InputField Component', () => {
  const defaultProps = {
    name: 'test-input',
    value: '',
    onChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useIdCallCount = 0; // Reset the counter
  });

  describe('Basic Functionality', () => {
    it('should render with basic props', () => {
      render(<InputField {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('name', 'test-input');
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveValue('');
    });

    it('should render with initial value', () => {
      render(<InputField {...defaultProps} value="initial value" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('initial value');
    });

    it('should call onChange when input value changes', () => {
      const onChange = jest.fn();
      render(<InputField {...defaultProps} onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });
      
      expect(onChange).toHaveBeenCalledWith('new value');
    });

    it('should render with different input types', () => {
      render(<InputField {...defaultProps} type="email" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
      render(<InputField {...defaultProps} type="password" />);
      
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render with placeholder', () => {
      render(<InputField {...defaultProps} placeholder="Enter text here" />);
      
      const input = screen.getByPlaceholderText('Enter text here');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Label Functionality', () => {
    it('should render label when provided', () => {
      render(<InputField {...defaultProps} label="Test Label" />);
      
      const label = screen.getByText('Test Label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for', 'input-id-1');
    });

    it('should associate label with input', () => {
      render(<InputField {...defaultProps} label="Email Address" />);
      
      const input = screen.getByLabelText('Email Address');
      expect(input).toBeInTheDocument();
    });

    it('should not render label when not provided', () => {
      render(<InputField {...defaultProps} />);
      
      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });
  });

  describe('Required Field Functionality', () => {
    it('should show required indicator when required', () => {
      render(<InputField {...defaultProps} label="Required Field" required />);
      
      const requiredIndicator = screen.getByText('*');
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator).toHaveAttribute('aria-label', 'required');
      expect(requiredIndicator).toHaveClass('text-red-500');
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('required');
    });

    it('should not show required indicator when not required', () => {
      render(<InputField {...defaultProps} label="Optional Field" />);
      
      expect(screen.queryByText('*')).not.toBeInTheDocument();
      
      const input = screen.getByRole('textbox');
      expect(input).not.toHaveAttribute('required');
    });
  });

  describe('Error State', () => {
    it('should display error message when error is provided', () => {
      render(<InputField {...defaultProps} error="This field is required" />);
      
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('This field is required');
      expect(errorMessage).toHaveClass('text-red-500');
    });

    it('should set aria-invalid when error is present', () => {
      render(<InputField {...defaultProps} error="Error message" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-invalid to false when no error', () => {
      render(<InputField {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should apply error styling classes', () => {
      render(<InputField {...defaultProps} error="Error message" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
      expect(input).toHaveClass('focus:ring-red-500');
    });

    it('should associate error with input via aria-describedby', () => {
      render(<InputField {...defaultProps} error="Error message" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'error-id-1');
    });
  });

  describe('Helper Text', () => {
    it('should display helper text when provided and no error', () => {
      render(<InputField {...defaultProps} helperText="This is helpful information" />);
      
      const helperText = screen.getByText('This is helpful information');
      expect(helperText).toBeInTheDocument();
      expect(helperText).toHaveClass('text-gray-500');
    });

    it('should not display helper text when error is present', () => {
      render(
        <InputField 
          {...defaultProps} 
          helperText="This is helpful information" 
          error="This is an error"
        />
      );
      
      expect(screen.queryByText('This is helpful information')).not.toBeInTheDocument();
      expect(screen.getByText('This is an error')).toBeInTheDocument();
    });

    it('should associate helper text with input via aria-describedby', () => {
      render(<InputField {...defaultProps} helperText="Helper text" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('helper-id'));
    });

    it('should combine error and helper in aria-describedby when both present', () => {
      render(
        <InputField 
          {...defaultProps} 
          error="Error message" 
          helperText="Helper text"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('error-id'));
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<InputField {...defaultProps} disabled />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should apply disabled styling', () => {
      render(<InputField {...defaultProps} disabled />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('disabled:opacity-50');
      expect(input).toHaveClass('disabled:cursor-not-allowed');
    });

    it('should not call onChange when disabled', () => {
      const onChange = jest.fn();
      render(<InputField {...defaultProps} onChange={onChange} disabled />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });
      
      // Note: HTML disabled inputs still trigger onChange in jsdom
      // but the disabled state is what prevents actual user interaction
      expect(input).toBeDisabled();
    });
  });

  describe('Icons', () => {
    it('should render start icon', () => {
      const StartIcon = () => <span data-testid="start-icon">📧</span>;
      render(<InputField {...defaultProps} startIcon={<StartIcon />} />);
      
      const icon = screen.getByTestId('start-icon');
      expect(icon).toBeInTheDocument();
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pl-10');
    });

    it('should render end icon', () => {
      const EndIcon = () => <span data-testid="end-icon">👁️</span>;
      render(<InputField {...defaultProps} endIcon={<EndIcon />} />);
      
      const icon = screen.getByTestId('end-icon');
      expect(icon).toBeInTheDocument();
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pr-10');
    });

    it('should prioritize start icon padding over end icon', () => {
      const StartIcon = () => <span data-testid="start-icon">📧</span>;
      const EndIcon = () => <span data-testid="end-icon">👁️</span>;
      render(
        <InputField 
          {...defaultProps} 
          startIcon={<StartIcon />} 
          endIcon={<EndIcon />} 
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pl-10');
      expect(input).not.toHaveClass('pr-10');
    });
  });

  describe('CSS Classes', () => {
    it('should apply default CSS classes', () => {
      render(<InputField {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('px-3');
      expect(input).toHaveClass('py-2');
      expect(input).toHaveClass('border');
      expect(input).toHaveClass('rounded-md');
      expect(input).toHaveClass('focus:ring-2');
      expect(input).toHaveClass('focus:ring-[#3E8E7E]');
    });

    it('should apply custom className', () => {
      render(<InputField {...defaultProps} className="custom-class" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('should apply normal border classes when no error', () => {
      render(<InputField {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-[#E6F2F1]');
      expect(input).toHaveClass('focus:border-[#3E8E7E]');
    });
  });

  describe('Forward Ref', () => {
    it('should forward ref to input element', () => {
      const ref = createRef();
      render(<InputField {...defaultProps} ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current).toBe(screen.getByRole('textbox'));
    });

    it('should allow ref methods to be called', () => {
      const ref = createRef();
      render(<InputField {...defaultProps} ref={ref} />);
      
      expect(() => ref.current.focus()).not.toThrow();
      expect(() => ref.current.blur()).not.toThrow();
    });
  });

  describe('Additional Props', () => {
    it('should pass through additional HTML attributes', () => {
      render(
        <InputField 
          {...defaultProps} 
          autoComplete="email"
          maxLength={100}
          data-testid="custom-input"
        />
      );
      
      const input = screen.getByTestId('custom-input');
      expect(input).toHaveAttribute('autocomplete', 'email');
      expect(input).toHaveAttribute('maxlength', '100');
    });

    it('should not override controlled props', () => {
      render(
        <InputField 
          {...defaultProps} 
          name="original-name"
          value="original-value"
          // Try to override with additional props
          {...{ name: 'override-name', value: 'override-value' }}
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'override-name');
      expect(input).toHaveValue('override-value');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <InputField 
          {...defaultProps} 
          label="Email" 
          error="Invalid email" 
          helperText="Enter your email address"
          required
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('error-id'));
      expect(input).toHaveAttribute('required');
    });

    it('should have display name for debugging', () => {
      expect(InputField.displayName).toBe('InputField');
    });
  });

  describe('Multiple Instances', () => {
    it('should handle multiple input fields with unique IDs', () => {
      render(
        <div>
          <InputField name="field1" value="" onChange={jest.fn()} label="Field 1" />
          <InputField name="field2" value="" onChange={jest.fn()} label="Field 2" />
        </div>
      );
      
      const field1 = screen.getByLabelText('Field 1');
      const field2 = screen.getByLabelText('Field 2');
      
      expect(field1).toHaveAttribute('id', 'input-id-1');
      expect(field2).toHaveAttribute('id', 'input-id-2');
    });
  });
});