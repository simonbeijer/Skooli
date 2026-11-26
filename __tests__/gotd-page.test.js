import { cleanup, render, screen, waitFor } from '@testing-library/react';
import GrejOfTheDayPage from '../src/app/(auth)/grej-of-the-day/page';

describe('Grej of the Day – sidan', () => {
  beforeEach(() => {
    localStorage.clear();
    // generate ger ett jobb-id; allt annat svarar med en tom lista.
    global.fetch = jest.fn((url) => Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(url === '/api/grej-of-the-day/generate' ? { id: 'x' } : []),
    }));
  });

  afterEach(() => {
    cleanup(); // lämna sidan medan fetch-mocken finns kvar (städningen avbryter pågående jobb)
    jest.useRealTimers();
    delete global.fetch;
  });

  it('visar stegen 1–4 och steg 1 (ämne) från start', async () => {
    const { container } = render(<GrejOfTheDayPage />);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Vad är veckans grej?' })).toBeInTheDocument());

    const steps = container.querySelector('nav#steps');
    expect(steps).not.toBeNull();
    for (const n of [1, 2, 3, 4]) expect(steps.querySelector(`button[data-step="${n}"]`)).not.toBeNull();

    expect(container.querySelector('#step-1').hidden).toBe(false);
    expect(container.querySelector('#step-2').hidden).toBe(true);
  });

  it('har ingen egen header eller tillbaka-länk (Skoolis layout står för det)', async () => {
    const { container } = render(<GrejOfTheDayPage />);
    await waitFor(() => expect(container.querySelector('#steps')).not.toBeNull());
    expect(container.querySelector('.sk-header')).toBeNull();
    expect(screen.queryByText(/Tillbaka till Skooli/)).toBeNull();
    expect(container.innerHTML).not.toContain('SKOOLI_URL');
  });

  it('anropar modulens API och inte den gamla servern', async () => {
    render(<GrejOfTheDayPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Ta fram innehåll' })).toBeInTheDocument());
    screen.getByLabelText(/Ämne/).value = 'regnskogen';
    screen.getByRole('button', { name: 'Ta fram innehåll' }).click();
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    for (const [url] of global.fetch.mock.calls) expect(url).toMatch(/^\/api\/grej-of-the-day\//);
    expect(global.fetch.mock.calls[0][0]).toBe('/api/grej-of-the-day/generate');
  });

  it('avbryter jobbet på servern och slutar polla när sidan lämnas', async () => {
    jest.useFakeTimers();
    const { unmount } = render(<GrejOfTheDayPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Ta fram innehåll' })).toBeInTheDocument());
    screen.getByLabelText(/Ämne/).value = 'regnskogen';
    screen.getByRole('button', { name: 'Ta fram innehåll' }).click();
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/grej-of-the-day/generate', expect.anything()));
    await jest.advanceTimersByTimeAsync(0); // låt runJob läsa jobb-id:t

    unmount();
    expect(global.fetch).toHaveBeenCalledWith('/api/grej-of-the-day/jobs/x', { method: 'DELETE' });

    await jest.advanceTimersByTimeAsync(5000);
    const polls = global.fetch.mock.calls.filter(([url, opts]) => url.startsWith('/api/grej-of-the-day/jobs/') && !opts);
    expect(polls).toHaveLength(0);
  });

  it('tömmer sidan när den lämnas', async () => {
    const { container, unmount } = render(<GrejOfTheDayPage />);
    await waitFor(() => expect(container.querySelector('#steps')).not.toBeNull());
    const root = container.querySelector('.gotd');
    unmount();
    expect(root.innerHTML).toBe('');
  });
});
