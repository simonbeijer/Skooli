/** @jest-environment node */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const themePath = path.join(root, 'shared', 'theme.css');
const globalsPath = path.join(root, 'src', 'app', 'globals.css');

function readRootBlock() {
  const css = fs.readFileSync(themePath, 'utf8');
  const match = css.match(/:root\s*\{([\s\S]*?)\}/);
  return match ? match[1] : '';
}

function tokenValue(block, name) {
  const re = new RegExp(`${name.replace(/-/g, '\\-')}\\s*:\\s*([^;]+);`);
  const m = block.match(re);
  return m ? m[1].trim() : null;
}

describe('shared/theme.css', () => {
  test('filen finns', () => {
    expect(fs.existsSync(themePath)).toBe(true);
  });

  const expected = {
    '--sk-color-primary': '#3E8E7E',
    '--sk-color-primary-dark': '#2D6B5E',
    '--sk-color-primary-light': '#6BB3A8',
    '--sk-color-secondary': '#88C9BF',
    '--sk-color-accent': '#A4D4AE',
    '--sk-color-bg': '#F0F7F6',
    '--sk-color-surface': '#FFFFFF',
    '--sk-color-muted': '#E6F2F1',
    '--sk-color-text': '#1C1C1C',
    '--sk-color-text-soft': '#333333',
    '--sk-color-border': '#E6F2F1',
    '--sk-color-glass-bg': 'rgba(255, 255, 255, 0.8)',
    '--sk-color-glass-border': 'rgba(255, 255, 255, 0.5)',
    '--sk-space-1': '4px',
    '--sk-space-2': '8px',
    '--sk-space-3': '12px',
    '--sk-space-4': '16px',
    '--sk-space-5': '24px',
    '--sk-space-6': '32px',
    '--sk-space-7': '48px',
    '--sk-space-8': '64px',
    '--sk-radius-sm': '8px',
    '--sk-radius-md': '12px',
    '--sk-radius-lg': '16px',
    '--sk-radius-xl': '24px',
    '--sk-content-width': '1152px',
  };

  test.each(Object.entries(expected))('%s = %s', (name, value) => {
    const v = tokenValue(readRootBlock(), name);
    expect(v && v.toLowerCase()).toBe(value.toLowerCase());
  });

  test('typsnitt', () => {
    const block = readRootBlock();
    const body = tokenValue(block, '--sk-font-body') || '';
    const heading = tokenValue(block, '--sk-font-heading') || '';
    expect(body).toMatch(/['"]?Inter['"]?\s*,/);
    expect(body).toMatch(/sans-serif/);
    expect(heading).toMatch(/['"]?Playfair Display['"]?\s*,\s*serif/);
  });

  test('skuggor', () => {
    const block = readRootBlock();
    expect(tokenValue(block, '--sk-shadow-sm')).toBeTruthy();
    expect(tokenValue(block, '--sk-shadow-md')).toBe(
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    );
  });

  test('globals.css importerar theme.css', () => {
    const css = fs.readFileSync(globalsPath, 'utf8');
    expect(css).toMatch(/@import\s+["']\.\.\/\.\.\/shared\/theme\.css["']/);
  });

  test('globals.css använder tokens', () => {
    const css = fs.readFileSync(globalsPath, 'utf8');
    expect(css).toContain('var(--sk-color-primary)');
    expect(css).toContain('var(--sk-shadow-md)');
  });

  test.each([
    '.sk-header',
    '.sk-header__inner',
    '.sk-header__brand',
    '.sk-header__logo',
    '.sk-header__name',
    '.sk-header__link',
    '.sk-header__button',
    '.sk-header__nav',
    '.sk-header__actions',
  ])('theme.css innehåller %s', (selector) => {
    const css = fs.readFileSync(themePath, 'utf8');
    const re = new RegExp(selector.replace(/[.\-]/g, (c) => '\\' + c) + '(?![\\w-])');
    expect(css).toMatch(re);
  });
});
