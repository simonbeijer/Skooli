import { render, screen } from '@testing-library/react';
import Home from '../src/app/page';
import { UserProvider } from '../src/app/context/userContext';

// Mock the useUserContext hook to avoid the provider requirement
jest.mock('../src/app/context/userContext', () => ({
  UserProvider: ({ children }) => children,
  useUserContext: jest.fn(() => ({
    user: null,
    loading: false,
    error: null,
    setUser: jest.fn(),
    refreshUser: jest.fn(),
    clearError: jest.fn(),
  })),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

describe('Home Page', () => {
  it('renders a Get Started link', () => {
    render(
      <UserProvider>
        <Home />
      </UserProvider>
    );
    const getStartedLink = screen.getByRole('link', { name: /Skapa Min Första Lektion/i });
    expect(getStartedLink).toBeInTheDocument();
    expect(getStartedLink).toHaveAttribute('href', '/login');
  });
});