import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderIndex, skooliUrlFromEnv } from '../lib/page.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'public', 'index.html'), 'utf8');
const BOOK_PATH =
  'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253';

// Plockar ut <header class="sk-header">…</header>
const skHeader = () => {
  const m = html.match(/<header class="sk-header">([\s\S]*?)<\/header>/);
  assert.ok(m, 'saknar <header class="sk-header">');
  return m[1];
};

test('renderIndex ersätter alla {{SKOOLI_URL}} och tar bort avslutande snedstreck', () => {
  const out = renderIndex('<a href="{{SKOOLI_URL}}/a">{{SKOOLI_URL}}</a>', 'http://x.test/');
  assert.equal(out, '<a href="http://x.test/a">http://x.test</a>');
});

test('renderIndex HTML-escapar värdet', () => {
  const out = renderIndex('{{SKOOLI_URL}}', 'http://x.test/?a="<b>"&c');
  assert.equal(out, 'http://x.test/?a=&quot;&lt;b&gt;&quot;&amp;c');
});

test('renderIndex tolkar inte $-mönster i URL:en', () => {
  const out = renderIndex('<a href="{{SKOOLI_URL}}">', 'http://x.test/$`$&$$');
  assert.equal(out, '<a href="http://x.test/$`$&amp;$$">');
});

test('skooliUrlFromEnv ger SKOOLI_URL eller default', () => {
  assert.equal(skooliUrlFromEnv({ SKOOLI_URL: 'https://skooli.test' }), 'https://skooli.test');
  assert.equal(skooliUrlFromEnv({}), 'http://localhost:3000');
});

test('index.html har Skoolis header med brand, bok-logga och tillbaka-länk', () => {
  const h = skHeader();
  assert.match(h, /<a class="sk-header__brand" href="\{\{SKOOLI_URL\}\}\/dashboard">/);
  assert.match(h, /<span class="sk-header__name">Skooli<\/span>/);
  assert.match(h, /<span class="sk-header__logo">[\s\S]*<svg[\s\S]*<\/svg>\s*<\/span>/);
  assert.ok(h.includes(`d="${BOOK_PATH}"`), 'bok-SVG:ns path skiljer sig från Skoolis');
  const back = h.match(/<a([^>]*)>← Tillbaka till Skooli<\/a>/);
  assert.ok(back, 'saknar länk med texten "← Tillbaka till Skooli"');
  assert.match(back[1], /href="\{\{SKOOLI_URL\}\}\/dashboard"/);
});

test('nav#steps finns kvar utanför .sk-header', () => {
  assert.match(html, /<nav id="steps"/);
  assert.ok(!skHeader().includes('id="steps"'), 'nav#steps ska inte ligga i .sk-header');
  for (const n of [1, 2, 3, 4]) assert.match(html, new RegExp(`<button data-step="${n}">`));
});
