import { render, screen } from '@testing-library/react';

// Dashboard imports @/context/userContext and @/components/termsModal, which
// resolve to src/app/... — mock those real modules.
jest.mock(
  '../src/app/context/userContext',
  () => ({
    useUserContext: () => ({
      user: { name: 'Test Lärare', email: 'test@example.com' },
      loading: false,
      error: null,
      setUser: jest.fn(),
      refreshUser: jest.fn(),
      clearError: jest.fn(),
    }),
  })
);

jest.mock('../src/app/components/termsModal', () => () => null);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() })),
  usePathname: jest.fn(() => '/dashboard'),
}));

import Dashboard from '../src/app/(auth)/dashboard/page';

describe('Dashboard – Grej of the Day card', () => {
  it('links to the module page /grej-of-the-day', () => {
    render(<Dashboard />);
    const heading = screen.getByRole('heading', { name: 'Grej of the Day' });
    expect(heading.closest('a')).toHaveAttribute('href', '/grej-of-the-day');
  });
});
