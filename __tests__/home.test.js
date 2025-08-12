import { render, screen } from '@testing-library/react';

import Home from '../src/app/page'; // Adjust the import path as necessary

describe('Home Page', () => {
  it('renders a Get Started link', () => {
    render(<Home />);
    const getStartedLink = screen.getByRole('link', { name: /Get Started/i });
    expect(getStartedLink).toBeInTheDocument();
    expect(getStartedLink).toHaveAttribute('href', 'login');
  });
});