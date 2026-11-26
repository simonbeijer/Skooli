/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { POST as generate } from '@/app/api/grej-of-the-day/generate/route';
import { GET as imageSources } from '@/app/api/grej-of-the-day/image-sources/route';
import { GET as getJob } from '@/app/api/grej-of-the-day/jobs/[id]/route';

jest.mock('@/lib/auth', () => ({ verifyAuth: jest.fn() }));

const req = (path, { token, ...init } = {}) => {
  const r = new NextRequest(`http://localhost${path}`, init);
  if (token) r.cookies.set('token', token);
  return r;
};

describe('Grej of the Day API', () => {
  beforeEach(() => verifyAuth.mockReset());

  test('svarar 401 utan inloggning', async () => {
    const res = await generate(req('/api/grej-of-the-day/generate', { method: 'POST', body: JSON.stringify({ topic: 'grodor' }) }));
    expect(res.status).toBe(401);
    expect(verifyAuth).not.toHaveBeenCalled();
  });

  test('svarar 401 med ogiltig token', async () => {
    verifyAuth.mockRejectedValue(new Error('ogiltig'));
    const res = await imageSources(req('/api/grej-of-the-day/image-sources', { token: 'fel' }));
    expect(res.status).toBe(401);
  });

  test('GET jobs/[id] svarar 401 utan inloggning', async () => {
    const res = await getJob(req('/api/grej-of-the-day/jobs/x'), { params: Promise.resolve({ id: 'x' }) });
    expect(res.status).toBe(401);
  });

  test('inloggad: image-sources listar källor med GOTD_-nycklar', async () => {
    verifyAuth.mockResolvedValue({ id: '1', email: 'a@b.se' });
    const res = await imageSources(req('/api/grej-of-the-day/image-sources', { token: 'ok' }));
    expect(res.status).toBe(200);
    const keys = (await res.json()).map((s) => s.key).filter(Boolean);
    expect(keys.length).toBeGreaterThan(0);
    for (const k of keys) expect(k).toMatch(/^GOTD_/);
  });

  test('inloggad: generate utan ämne svarar 400, okänt jobb 404', async () => {
    verifyAuth.mockResolvedValue({ id: '1', email: 'a@b.se' });
    const res = await generate(req('/api/grej-of-the-day/generate', { method: 'POST', token: 'ok', body: '{}' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Skriv ett ämne.' });
    const job = await getJob(req('/api/grej-of-the-day/jobs/x', { token: 'ok' }), { params: Promise.resolve({ id: 'x' }) });
    expect(job.status).toBe(404);
  });
});
