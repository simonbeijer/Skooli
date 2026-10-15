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

const ORIGINAL_GOTD_URL = process.env.NEXT_PUBLIC_GOTD_URL;

// NEXT_PUBLIC_GOTD_URL is read at render time (inside the component body),
// so no jest.resetModules()/re-require is needed between cases.
import Dashboard from '../src/app/(auth)/dashboard/page';

function renderDashboard() {
  render(<Dashboard />);
  const heading = screen.getByRole('heading', { name: 'Grej of the Day' });
  return heading.closest('a');
}

describe('Dashboard – Grej of the Day card', () => {
  afterEach(() => {
    if (ORIGINAL_GOTD_URL === undefined) {
      delete process.env.NEXT_PUBLIC_GOTD_URL;
    } else {
      process.env.NEXT_PUBLIC_GOTD_URL = ORIGINAL_GOTD_URL;
    }
  });

  it('links to http://localhost:3001 when NEXT_PUBLIC_GOTD_URL is unset', () => {
    delete process.env.NEXT_PUBLIC_GOTD_URL;
    const link = renderDashboard();
    expect(link).toHaveAttribute('href', 'http://localhost:3001');
  });

  it('links to NEXT_PUBLIC_GOTD_URL when it is set', () => {
    process.env.NEXT_PUBLIC_GOTD_URL = 'https://example.test/gotd';
    const link = renderDashboard();
    expect(link).toHaveAttribute('href', 'https://example.test/gotd');
  });
});
