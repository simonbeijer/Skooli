import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pub = (f) => join(root, 'public', f);
const skooliDir = resolve(root, process.env.SKOOLI_DIR || '../Skooli');
const original = join(skooliDir, 'shared', 'theme.css');

test('public/theme.css finns', () => {
  assert.ok(existsSync(pub('theme.css')), 'public/theme.css saknas – kör npm run sync:theme');
});

test('public/theme.css är byte-identisk med Skoolis shared/theme.css', (t) => {
  if (!existsSync(original)) {
    t.skip(`Originalet saknas (${original}). Sätt SKOOLI_DIR för att jämföra.`);
    return;
  }
  assert.ok(existsSync(pub('theme.css')), 'public/theme.css saknas');
  assert.ok(
    readFileSync(pub('theme.css')).equals(readFileSync(original)),
    'public/theme.css skiljer sig från originalet – kör npm run sync:theme',
  );
});

test('index.html länkar theme.css före style.css', () => {
  const html = readFileSync(pub('index.html'), 'utf8');
  const theme = html.search(/<link[^>]+href="theme\.css"/);
  const style = html.search(/<link[^>]+href="style\.css"/);
  assert.ok(theme !== -1, 'ingen länk till theme.css');
  assert.ok(style !== -1, 'ingen länk till style.css');
  assert.ok(theme < style, 'theme.css måste länkas före style.css');
});

test('style.css använder --sk-font-body och inte Lexend', () => {
  const css = readFileSync(pub('style.css'), 'utf8');
  assert.ok(css.includes('var(--sk-font-body)'), 'saknar var(--sk-font-body)');
  assert.ok(!css.includes('Lexend'), 'innehåller fortfarande Lexend');
});
