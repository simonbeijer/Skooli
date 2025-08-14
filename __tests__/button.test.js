import { render, screen, fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import Button from '../src/app/components/button';

describe('Button Component', () => {
  describe('Basic Functionality', () => {
    it('should render with text prop', () => {
      render(<Button text="Click me" />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
    });

    it('should render with children instead of text', () => {
      render(<Button>Child content</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Child content');
    });

    it('should prioritize children over text prop', () => {
      render(<Button text="Text prop">Children content</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Children content');
      expect(button).not.toHaveTextContent('Text prop');
    });

    it('should render with default type button', () => {
      render(<Button text="Default button" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should render with custom type', () => {
      render(<Button text="Submit" type="submit" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Click Handling', () => {
    it('should call callBack when clicked', () => {
      const mockCallback = jest.fn();
      render(<Button text="Click me" callBack={mockCallback} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should not call callBack when disabled', () => {
      const mockCallback = jest.fn();
      render(<Button text="Disabled" callBack={mockCallback} disabled />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should not call callBack when loading', () => {
      const mockCallback = jest.fn();
      render(<Button text="Loading" callBack={mockCallback} loading />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should work without callBack prop', () => {
      render(<Button text="No callback" />);
      
      const button = screen.getByRole('button');
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });

  describe('Variants', () => {
    it('should apply primary variant classes by default', () => {
      render(<Button text="Primary" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-[#3E8E7E]');
      expect(button).toHaveClass('hover:bg-[#2d6b5e]');
      expect(button).toHaveClass('text-white');
      expect(button).toHaveClass('focus:ring-[#3E8E7E]');
    });

    it('should apply secondary variant classes', () => {
      render(<Button text="Secondary" variant="secondary" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-[#88C9BF]');
      expect(button).toHaveClass('hover:bg-[#6bb3a8]');
      expect(button).toHaveClass('text-white');
      expect(button).toHaveClass('focus:ring-[#88C9BF]');
    });

    it('should apply outline variant classes', () => {
      render(<Button text="Outline" variant="outline" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border');
      expect(button).toHaveClass('border-[#3E8E7E]');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('hover:bg-[#3E8E7E]');
      expect(button).toHaveClass('text-[#3E8E7E]');
      expect(button).toHaveClass('hover:text-white');
    });

    it('should apply ghost variant classes', () => {
      render(<Button text="Ghost" variant="ghost" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('hover:bg-[#3E8E7E]/10');
      expect(button).toHaveClass('text-[#3E8E7E]');
      expect(button).toHaveClass('focus:ring-[#3E8E7E]');
    });

    it('should apply danger variant classes', () => {
      render(<Button text="Danger" variant="danger" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600');
      expect(button).toHaveClass('hover:bg-red-700');
      expect(button).toHaveClass('text-white');
      expect(button).toHaveClass('focus:ring-red-500');
    });
  });

  describe('Sizes', () => {
    it('should apply default size classes by default', () => {
      render(<Button text="Default size" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
      expect(button).toHaveClass('text-sm');
    });

    it('should apply small size classes', () => {
      render(<Button text="Small" size="sm" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('py-1.5');
      expect(button).toHaveClass('text-xs');
    });

    it('should apply large size classes', () => {
      render(<Button text="Large" size="lg" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-8');
      expect(button).toHaveClass('py-3');
      expect(button).toHaveClass('text-base');
      expect(button).toHaveClass('rounded-xl');
      expect(button).toHaveClass('shadow-lg');
      expect(button).toHaveClass('hover:shadow-xl');
    });

    it('should apply icon size classes', () => {
      render(<Button text="Icon" size="icon" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('p-2');
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      render(<Button text="Loading" loading />);
      
      const button = screen.getByRole('button');
      const spinner = button.querySelector('.animate-spin');
      
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('h-4');
      expect(spinner).toHaveClass('w-4');
      expect(spinner).toHaveClass('border-2');
      expect(spinner).toHaveClass('border-current');
      expect(spinner).toHaveClass('border-t-transparent');
      expect(spinner).toHaveClass('rounded-full');
    });

    it('should set aria-busy when loading', () => {
      render(<Button text="Loading" loading />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should not set aria-busy when not loading', () => {
      render(<Button text="Not loading" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'false');
    });

    it('should disable button when loading', () => {
      render(<Button text="Loading" loading />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show both spinner and text/children when loading', () => {
      render(<Button text="Loading text" loading />);
      
      const button = screen.getByRole('button');
      expect(button.querySelector('.animate-spin')).toBeInTheDocument();
      expect(button).toHaveTextContent('Loading text');
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button text="Disabled" disabled />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should apply disabled styling classes', () => {
      render(<Button text="Disabled" disabled />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });

    it('should be disabled when both disabled and loading are true', () => {
      render(<Button text="Disabled and loading" disabled loading />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('CSS Classes', () => {
    it('should apply base classes', () => {
      render(<Button text="Base classes" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex');
      expect(button).toHaveClass('items-center');
      expect(button).toHaveClass('justify-center');
      expect(button).toHaveClass('font-medium');
      expect(button).toHaveClass('rounded-lg');
      expect(button).toHaveClass('transition-all');
      expect(button).toHaveClass('duration-200');
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-offset-2');
    });

    it('should apply custom className', () => {
      render(<Button text="Custom class" className="custom-button-class" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-button-class');
    });

    it('should combine all classes correctly', () => {
      render(
        <Button 
          text="All classes" 
          variant="secondary" 
          size="lg" 
          className="extra-class"
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex'); // base
      expect(button).toHaveClass('bg-[#88C9BF]'); // variant
      expect(button).toHaveClass('px-8'); // size
      expect(button).toHaveClass('extra-class'); // custom
    });
  });

  describe('Forward Ref', () => {
    it('should forward ref to button element', () => {
      const ref = createRef();
      render(<Button text="Ref test" ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toBe(screen.getByRole('button'));
    });

    it('should allow ref methods to be called', () => {
      const ref = createRef();
      render(<Button text="Focus test" ref={ref} />);
      
      expect(() => ref.current.focus()).not.toThrow();
      expect(() => ref.current.blur()).not.toThrow();
    });
  });

  describe('Additional Props', () => {
    it('should pass through additional HTML attributes', () => {
      render(
        <Button 
          text="Extra props" 
          data-testid="custom-button"
          aria-label="Custom button"
          tabIndex={5}
        />
      );
      
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('aria-label', 'Custom button');
      expect(button).toHaveAttribute('tabindex', '5');
    });

    it('should not override controlled props', () => {
      render(
        <Button 
          text="Original text"
          type="button"
          disabled={false}
          // Try to override with additional props
          {...{ type: 'submit', disabled: true }}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toBeDisabled();
    });
  });

  describe('Complex Combinations', () => {
    it('should handle all props together', () => {
      const mockCallback = jest.fn();
      render(
        <Button 
          text="Complex button"
          callBack={mockCallback}
          variant="outline"
          size="lg"
          className="test-class"
          disabled={false}
          loading={false}
          type="submit"
          data-testid="complex-button"
        />
      );
      
      const button = screen.getByTestId('complex-button');
      
      // Check it renders correctly
      expect(button).toHaveTextContent('Complex button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveClass('border-[#3E8E7E]'); // outline variant
      expect(button).toHaveClass('px-8'); // lg size
      expect(button).toHaveClass('test-class'); // custom class
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'false');
      
      // Check callback works
      fireEvent.click(button);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle loading state with custom content', () => {
      render(
        <Button loading variant="danger" size="sm">
          <span data-testid="custom-content">Save Changes</span>
        </Button>
      );
      
      const button = screen.getByRole('button');
      const spinner = button.querySelector('.animate-spin');
      const customContent = screen.getByTestId('custom-content');
      
      expect(spinner).toBeInTheDocument();
      expect(customContent).toBeInTheDocument();
      expect(button).toHaveClass('bg-red-600'); // danger variant
      expect(button).toHaveClass('px-3'); // sm size
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Display Name', () => {
    it('should have correct display name for debugging', () => {
      expect(Button.displayName).toBe('Button');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text gracefully', () => {
      render(<Button text="" />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('');
    });

    it('should handle null/undefined children', () => {
      render(<Button>{null}</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should work with complex children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('IconText');
    });
  });
});