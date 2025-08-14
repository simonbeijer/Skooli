import { render, screen, waitFor, act } from '@testing-library/react';
import { UserProvider, useUser, useUserContext } from '../src/app/context/userContext';

// Mock fetch globally
global.fetch = jest.fn();

// Test component to access context
function TestComponent() {
  const { user, loading, error, setUser, refreshUser, clearError } = useUser();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="error">{error || 'null'}</div>
      <div data-testid="user">{user ? user.email : 'null'}</div>
      <button onClick={() => setUser({ id: '1', email: 'test@example.com', name: 'Test', role: 'user' })}>
        Set User
      </button>
      <button onClick={refreshUser}>Refresh User</button>
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
}

// Test component that uses legacy hook
function LegacyTestComponent() {
  const { user } = useUserContext();
  return <div data-testid="legacy-user">{user ? user.email : 'null'}</div>;
}

// Component to test hook error
function ErrorTestComponent() {
  const { user } = useUser();
  return <div>{user?.email}</div>;
}

describe('UserContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('UserProvider', () => {
    it('should provide initial loading state', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'user' },
          timestamp: new Date().toISOString()
        })
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      // Initially should be loading
      expect(screen.getByTestId('loading')).toHaveTextContent('true');
      
      // Wait for API call to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('should fetch and set user on mount', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          timestamp: new Date().toISOString()
        })
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('null');
      });

      expect(fetch).toHaveBeenCalledWith('/api/auth/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle successful response with no user', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: null,
          timestamp: new Date().toISOString()
        })
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('null');
      });
    });

    it('should handle 401 unauthorized response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('null');
      });
    });

    it('should handle server error with JSON response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          message: 'Database connection failed'
        })
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Database connection failed');
      });
    });

    it('should handle server error without JSON response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Server error: 500 Internal Server Error');
      });
    });

    it('should handle network error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network connection failed'));

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Network connection failed');
      });
    });

    it('should handle unknown error type', async () => {
      fetch.mockRejectedValueOnce('Unknown error');

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Network error occurred');
      });
    });
  });

  describe('setUser functionality', () => {
    it('should set user and clear errors', async () => {
      // First, set up an error state
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: async () => ({ message: 'Server error' })
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      // Wait for initial error
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Server error');
      });

      // Now set a user, which should clear the error
      act(() => {
        screen.getByText('Set User').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('error')).toHaveTextContent('null');
      });
    });

    it('should set user to null', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: '1', email: 'test@example.com', name: 'Test', role: 'user' },
          timestamp: new Date().toISOString()
        })
      });

      const TestNullUser = () => {
        const { user, setUser } = useUser();
        return (
          <div>
            <div data-testid="user">{user ? user.email : 'null'}</div>
            <button onClick={() => setUser(null)}>Clear User</button>
          </div>
        );
      };

      render(
        <UserProvider>
          <TestNullUser />
        </UserProvider>
      );

      // Wait for user to be set
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });

      // Clear user
      act(() => {
        screen.getByText('Clear User').click();
      });

      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  describe('refreshUser functionality', () => {
    it('should refresh user data', async () => {
      // Initial fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: '1', email: 'initial@example.com', name: 'Initial', role: 'user' },
          timestamp: new Date().toISOString()
        })
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('initial@example.com');
      });

      // Mock refresh fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: '1', email: 'refreshed@example.com', name: 'Refreshed', role: 'user' },
          timestamp: new Date().toISOString()
        })
      });

      // Trigger refresh
      act(() => {
        screen.getByText('Refresh User').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('refreshed@example.com');
      });

      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('clearError functionality', () => {
    it('should clear error state', async () => {
      // Set up error state
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: async () => ({ message: 'Test error' })
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Test error');
      });

      // Clear error
      act(() => {
        screen.getByText('Clear Error').click();
      });

      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });
  });

  describe('useUser hook', () => {
    it('should throw error when used outside provider', () => {
      // Mock console.error to prevent error output during test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<ErrorTestComponent />);
      }).toThrow('useUser must be used within a UserProvider');
      
      consoleSpy.mockRestore();
    });

    it('should provide context value when used within provider', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: '1', email: 'test@example.com', name: 'Test', role: 'user' },
          timestamp: new Date().toISOString()
        })
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });
    });
  });

  describe('useUserContext legacy hook', () => {
    it('should work as alias for useUser', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: '1', email: 'legacy@example.com', name: 'Legacy', role: 'user' },
          timestamp: new Date().toISOString()
        })
      });

      render(
        <UserProvider>
          <LegacyTestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('legacy-user')).toHaveTextContent('legacy@example.com');
      });
    });
  });

  describe('component unmounting', () => {
    it('should handle component unmounting during async operation', async () => {
      // Mock a slow response
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      fetch.mockReturnValueOnce(promise);

      const { unmount } = render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      // Unmount before API call completes
      unmount();

      // Resolve the promise after unmounting
      resolvePromise({
        ok: true,
        json: async () => ({
          user: { id: '1', email: 'test@example.com', name: 'Test', role: 'user' },
          timestamp: new Date().toISOString()
        })
      });

      // Should not cause any errors or warnings
      await promise;
    });
  });
});