import { render, screen } from '@testing-library/react';
import Header from '../src/app/components/header';
import { useUserContext } from '../src/app/context/userContext';

jest.mock('../src/app/context/userContext', () => ({
  useUserContext: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() })),
}));

const user = { name: 'Test Lärare', email: 'test@example.com', id: '1' };

function renderHeader(state) {
  useUserContext.mockReturnValue({
    user: state === 'authenticated' ? user : null,
    loading: false,
    setUser: jest.fn(),
  });
  return render(<Header state={state} />);
}

function linkByText(container, text) {
  return Array.from(container.querySelectorAll('a')).find(
    (a) => a.textContent.trim() === text
  );
}

describe.each(['public', 'authenticated', 'login'])('Header (%s)', (state) => {
  test('roten är header.sk-header med brand och logga', () => {
    const { container } = renderHeader(state);
    const root = container.firstElementChild;
    expect(root.tagName).toBe('HEADER');
    expect(root).toHaveClass('sk-header');
    expect(root.querySelector('.sk-header__inner')).toBeInTheDocument();
    const brand = root.querySelector('a.sk-header__brand');
    expect(brand).toBeInTheDocument();
    expect(brand).toHaveAttribute('href', state === 'login' ? '/' : '/dashboard');
    expect(brand).toHaveTextContent('Skooli');
    expect(brand.querySelector('.sk-header__logo')).toBeInTheDocument();
    expect(brand.querySelector('.sk-header__name')).toHaveTextContent('Skooli');
  });
});

describe('Header länkar', () => {
  test('public: Verktyg, Demo, Logga In, Kom Igång', () => {
    const { container } = renderHeader('public');
    const nav = container.querySelector('nav.sk-header__nav');
    expect(nav).toHaveAttribute('aria-label', 'Huvudmeny');
    const expected = {
      'Verktyg': '/login',
      Demo: '/demo',
      'Logga In': '/login',
      'Kom Igång': '/login',
    };
    Object.entries(expected).forEach(([text, href]) => {
      const a = linkByText(container, text);
      expect(a).toBeDefined();
      expect(a).toHaveAttribute('href', href);
    });
    expect(linkByText(container, 'Verktyg')).toHaveClass('sk-header__link');
    expect(linkByText(container, 'Demo')).toHaveClass('sk-header__link');
    expect(linkByText(container, 'Logga In')).toHaveClass('sk-header__link');
    expect(linkByText(container, 'Kom Igång')).toHaveClass('sk-header__button');
  });

  test('authenticated: Dashboard, Skapa Lektion', () => {
    const { container } = renderHeader('authenticated');
    expect(linkByText(container, 'Dashboard')).toHaveAttribute('href', '/dashboard');
    expect(linkByText(container, 'Skapa Lektion')).toHaveAttribute('href', '/lektionsplanering');
    expect(linkByText(container, 'Dashboard')).toHaveClass('sk-header__link');
    expect(linkByText(container, 'Logga In')).toBeUndefined();
  });

  test('authenticated: dropdown renderas för inloggad user', () => {
    const { container } = renderHeader('authenticated');
    const trigger = screen.getByRole('button', { name: 'User menu' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(container.querySelector('.sk-header__actions')).toContainElement(trigger);
  });

  test('login: inga nav-länkar', () => {
    const { container } = renderHeader('login');
    expect(container.querySelectorAll('.sk-header__link, .sk-header__button')).toHaveLength(0);
    expect(container.querySelectorAll('a')).toHaveLength(1);
  });
});
