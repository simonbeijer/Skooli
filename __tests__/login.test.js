import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../src/app/(public)/login/page'; // Corrected path
import { useRouter } from 'next/navigation';
import { useUserContext } from '../src/context/userContext';
global.fetch = jest.fn();
// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock your user context
jest.mock('../src/context/userContext', () => ({
  useUserContext: jest.fn(),
}));

// Mock the InputField component to simplify testing (optional, but good for unit tests)
jest.mock('../src/app/components/inputField', () => ({
  __esModule: true,
  default: ({ label, value, onChange, name, type, placeholder, error }) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? "true" : "false"}
      />
    </div>
  ),
}));

// Mock the Spinner component to prevent rendering issues in tests
jest.mock('../src/app/components/spinner', () => ({
  __esModule: true,
  default: () => <div data-testid="spinner">Loading...</div>,
}));

describe('Login Page', () => {
  const mockPush = jest.fn();
  const mockSetUser = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    useRouter.mockReturnValue({ push: mockPush });
    useUserContext.mockReturnValue({ setUser: mockSetUser });
    jest.clearAllMocks();
  });

  it('renders email, password inputs, and a login button', () => {
    render(<Login />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows error message on empty password submission', async () => {
    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Login failed\. Please check your email and password\./i)).toBeVisible();
    });
    expect(mockPush).not.toHaveBeenCalled(); // Router push should not be called
  });

  it('shows error message on invalid email format', async () => {
    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Login failed\. Please check your email and password\./i)).toBeVisible();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navigates to dashboard on successful login', async () => {
    // Mock successful fetch response
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: 1, email: 'user@example.com' } }),
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for async operations (like fetch and router.push) to complete
    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith({ id: 1, email: 'user@example.com' });
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    // Restore original fetch after test
    jest.restoreAllMocks();
  });

  it('shows error message on failed login API call', async () => {
    // Mock failed fetch response
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/Login failed\. Please check your email and password\./i)).toBeVisible();
    });
    expect(mockPush).not.toHaveBeenCalled();
    jest.restoreAllMocks();
  });

  it('shows spinner when loading is true', async () => {
    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Mock fetch to stay pending so loading state remains true
    jest.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {})); // Never resolves

    fireEvent.click(loginButton);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    jest.restoreAllMocks();
  });
});