// Kopierar Skoolis gemensamma design tokens till public/theme.css.
// Originalet: ${SKOOLI_DIR || '../Skooli'}/shared/theme.css (relativt projektroten).
import { copyFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(resolve(root, process.env.SKOOLI_DIR || '../Skooli'), 'shared', 'theme.css');
const dest = join(root, 'public', 'theme.css');

if (!existsSync(src)) {
  console.error(`Hittar inte ${src}. Sätt SKOOLI_DIR till Skooli-mappen.`);
  process.exit(1);
}

copyFileSync(src, dest);
console.log(`Kopierade ${src} -> ${dest} (${statSync(dest).size} byte)`);
