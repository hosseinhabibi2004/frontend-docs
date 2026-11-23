// Copies open-source (OFL) woff2 files from @fontsource into ./fonts and
// regenerates fonts/fonts.css, fonts/fonts.json and fonts/katex/katex.css.
//   npm run build:fonts                      -> core registry below
//   node scripts/build-fonts.mjs --add noto-sans-sc [--subsets chinese-simplified,latin] [--weights 400,700]
//                                            -> opt-in extra family (CJK etc.); remembered in fonts/extra.json
import { cpSync, mkdirSync, existsSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'fonts');
mkdirSync(out, { recursive: true });
for (const f of readdirSync(out)) if (f.endsWith('.woff2')) rmSync(join(out, f)); // drop stale files from removed families
const FS = join(root, 'node_modules/@fontsource');

const W = (...w) => w; // weights; suffix 'i' = italic
const LAT = ['latin', 'latin-ext', 'vietnamese'], CYR = ['cyrillic', 'cyrillic-ext'], GRK = ['greek', 'greek-ext'];
// cat: serif | sans | display | mono | hand | nastaliq | kufi ; adjust = size-adjust % so mixed-script lines have matching optical size
export const CORE = [
  // ── Latin / Cyrillic / Greek / Vietnamese ──
  { id: 'source-serif-4', cat: 'serif', scripts: ['latin', 'cyrillic', 'greek'], subsets: [...LAT, ...CYR, ...GRK], w: W('400', '400i', '600', '700', '700i') },
  { id: 'literata', cat: 'serif', scripts: ['latin', 'cyrillic', 'greek'], subsets: [...LAT, ...CYR, ...GRK], w: W('400', '400i', '600', '700') },
  { id: 'libre-caslon-text', cat: 'serif', scripts: ['latin'], subsets: ['latin', 'latin-ext'], w: W('400', '400i', '700') },
  { id: 'fraunces', cat: 'display', scripts: ['latin'], subsets: LAT, w: W('400', '400i', '700') },
  { id: 'playfair-display', cat: 'display', scripts: ['latin', 'cyrillic'], subsets: [...LAT, 'cyrillic'], w: W('400', '400i', '700') },
  { id: 'cormorant-garamond', cat: 'display', scripts: ['latin', 'cyrillic'], subsets: [...LAT, ...CYR], w: W('400', '400i', '600', '700') },
  { id: 'gloock', cat: 'display', scripts: ['latin'], subsets: ['latin', 'latin-ext'], w: W('400') },
  { id: 'archivo-black', cat: 'display', scripts: ['latin'], subsets: ['latin', 'latin-ext'], w: W('400') },
  { id: 'bricolage-grotesque', cat: 'sans', scripts: ['latin'], subsets: LAT, w: W('500', '700', '800') },
  { id: 'schibsted-grotesk', cat: 'sans', scripts: ['latin'], subsets: ['latin', 'latin-ext'], w: W('400', '500', '700', '800') },
  { id: 'ibm-plex-sans', cat: 'sans', scripts: ['latin', 'cyrillic', 'greek'], subsets: [...LAT, ...CYR, 'greek'], w: W('400', '400i', '600', '700') },
  { id: 'poppins', cat: 'sans', scripts: ['latin'], subsets: ['latin', 'latin-ext'], w: W('400', '500', '600') },
  { id: 'inter', cat: 'sans', scripts: ['latin', 'cyrillic', 'greek'], subsets: ['latin', 'latin-ext', 'cyrillic', 'greek'], w: W('300', '700') },
  { id: 'carlito', cat: 'sans', scripts: ['latin', 'cyrillic', 'greek'], subsets: ['latin', 'latin-ext', 'cyrillic', 'greek'], w: W('400', '400i', '700', '700i') },
  { id: 'barlow-condensed', cat: 'sans', scripts: ['latin'], subsets: LAT, w: W('500', '600', '700') },
  { id: 'caveat', cat: 'hand', scripts: ['latin', 'cyrillic'], subsets: ['latin', 'latin-ext', 'cyrillic'], w: W('500', '700') },
  { id: 'jetbrains-mono', cat: 'mono', scripts: ['latin', 'cyrillic', 'greek'], subsets: [...LAT, ...CYR, 'greek'], w: W('400', '700') },
  { id: 'ibm-plex-mono', cat: 'mono', scripts: ['latin', 'cyrillic'], subsets: [...LAT, 'cyrillic'], w: W('400', '400i', '700') },
  { id: 'dm-mono', cat: 'mono', scripts: ['latin'], subsets: ['latin', 'latin-ext'], w: W('400', '500') },
  // ── Arabic script: Persian / Arabic / Urdu / Pashto / Kurdish ──
  { id: 'vazirmatn', cat: 'sans', scripts: ['arabic', 'persian'], subsets: ['arabic'], w: W('400', '500', '700', '900'), adjust: 100 },
  { id: 'estedad', cat: 'sans', scripts: ['arabic', 'persian'], subsets: ['arabic'], w: W('400', '500', '700', '800'), adjust: 100 },
  { npm: 'sahel-font', family: 'Sahel', cat: 'sans', scripts: ['arabic', 'persian'], dir: 'dist/Without-Latin', files: { 300: 'Sahel-Light-WOL', 400: 'Sahel-WOL', 600: 'Sahel-SemiBold-WOL', 700: 'Sahel-Bold-WOL', 900: 'Sahel-Black-WOL' }, license: 'OFL-1.1', source: 'https://github.com/rastikerdar/sahel-font' },
  { npm: 'shabnam-font', family: 'Shabnam', cat: 'sans', scripts: ['arabic', 'persian'], dir: 'dist/Without-Latin', files: { 300: 'Shabnam-Light-WOL', 400: 'Shabnam-WOL', 500: 'Shabnam-Medium-WOL', 700: 'Shabnam-Bold-WOL' }, license: 'OFL-1.1', source: 'https://github.com/rastikerdar/shabnam-font' },
  { npm: 'samim-font', family: 'Samim', cat: 'sans', scripts: ['arabic', 'persian'], dir: 'dist/Without-Latin', files: { 400: 'Samim-WOL', 500: 'Samim-Medium-WOL', 700: 'Samim-Bold-WOL' }, license: 'OFL-1.1', source: 'https://github.com/rastikerdar/samim-font' },
  { npm: 'parastoo-font', family: 'Parastoo', cat: 'serif', scripts: ['arabic', 'persian'], dir: 'dist/Without-Latin', files: { 400: 'Parastoo-WOL', 700: 'Parastoo-Bold-WOL' }, license: 'OFL-1.1', source: 'https://github.com/rastikerdar/parastoo-font', adjust: 114 },
  { npm: 'gandom-font', family: 'Gandom', cat: 'serif', scripts: ['arabic', 'persian'], dir: 'dist/Without-Latin', files: { 400: 'Gandom-WOL' }, license: 'OFL-1.1', source: 'https://github.com/rastikerdar/gandom-font', adjust: 114 },
  { npm: 'tanha-font', family: 'Tanha', cat: 'hand', scripts: ['arabic', 'persian'], dir: 'dist/Without-Latin', files: { 400: 'Tanha-WOL' }, license: 'Public-Domain', source: 'https://github.com/rastikerdar/tanha-font' },
  { id: 'mirza', cat: 'serif', scripts: ['arabic', 'persian'], subsets: ['arabic'], w: W('400', '500', '600', '700'), adjust: 118 },
  { id: 'markazi-text', cat: 'serif', scripts: ['arabic', 'persian'], subsets: ['arabic'], w: W('400', '500', '700'), adjust: 118 },
  { id: 'noto-naskh-arabic', cat: 'serif', scripts: ['arabic', 'persian', 'urdu'], subsets: ['arabic'], w: W('400', '700'), adjust: 112 },
  { id: 'amiri', cat: 'serif', scripts: ['arabic', 'persian'], subsets: ['arabic'], w: W('400', '400i', '700'), adjust: 110 },
  { id: 'lateef', cat: 'serif', scripts: ['arabic', 'persian', 'urdu'], subsets: ['arabic'], w: W('400', '700'), adjust: 126 },
  { id: 'scheherazade-new', cat: 'serif', scripts: ['arabic', 'persian'], subsets: ['arabic'], w: W('400', '700'), adjust: 112 },
  { id: 'noto-sans-arabic', cat: 'sans', scripts: ['arabic', 'persian', 'urdu'], subsets: ['arabic'], w: W('400', '700') },
  { id: 'ibm-plex-sans-arabic', cat: 'sans', scripts: ['arabic', 'persian'], subsets: ['arabic'], w: W('400', '500', '700') },
  { id: 'cairo', cat: 'sans', scripts: ['arabic', 'persian'], subsets: ['arabic'], w: W('400', '600', '700', '900') },
  { id: 'readex-pro', cat: 'sans', scripts: ['arabic'], subsets: ['arabic'], w: W('400', '600', '700') },
  { id: 'almarai', cat: 'sans', scripts: ['arabic'], subsets: ['arabic'], w: W('400', '700', '800') },
  { id: 'el-messiri', cat: 'display', scripts: ['arabic'], subsets: ['arabic'], w: W('400', '600', '700') },
  { id: 'noto-kufi-arabic', cat: 'kufi', scripts: ['arabic', 'persian'], subsets: ['arabic'], w: W('400', '700') },
  { id: 'reem-kufi', cat: 'kufi', scripts: ['arabic', 'persian'], subsets: ['arabic'], w: W('400', '700') },
  { id: 'lalezar', cat: 'display', scripts: ['arabic', 'persian'], subsets: ['arabic'], w: W('400') },
  { id: 'rakkas', cat: 'display', scripts: ['arabic'], subsets: ['arabic'], w: W('400') },
  { id: 'katibeh', cat: 'display', scripts: ['arabic', 'persian'], subsets: ['arabic'], w: W('400'), adjust: 118 },
  { id: 'noto-nastaliq-urdu', cat: 'nastaliq', scripts: ['arabic', 'urdu', 'persian'], subsets: ['arabic'], w: W('400', '700') },
  { id: 'gulzar', cat: 'nastaliq', scripts: ['arabic', 'urdu', 'persian'], subsets: ['arabic'], w: W('400') },
  // ── Hebrew ──
  { id: 'frank-ruhl-libre', cat: 'serif', scripts: ['hebrew'], subsets: ['hebrew'], w: W('400', '700') },
  { id: 'david-libre', cat: 'serif', scripts: ['hebrew'], subsets: ['hebrew'], w: W('400', '700') },
  { id: 'noto-serif-hebrew', cat: 'serif', scripts: ['hebrew'], subsets: ['hebrew'], w: W('400', '700') },
  { id: 'noto-sans-hebrew', cat: 'sans', scripts: ['hebrew'], subsets: ['hebrew'], w: W('400', '600', '700') },
  { id: 'heebo', cat: 'sans', scripts: ['hebrew'], subsets: ['hebrew'], w: W('400', '500', '700', '900') },
  { id: 'assistant', cat: 'sans', scripts: ['hebrew'], subsets: ['hebrew'], w: W('400', '600', '700') },
  { id: 'suez-one', cat: 'display', scripts: ['hebrew'], subsets: ['hebrew'], w: W('400') },
  { id: 'secular-one', cat: 'display', scripts: ['hebrew'], subsets: ['hebrew'], w: W('400') },
  // ── Indic ──
  { id: 'noto-serif-devanagari', cat: 'serif', scripts: ['devanagari'], subsets: ['devanagari'], w: W('400', '700') },
  { id: 'noto-sans-devanagari', cat: 'sans', scripts: ['devanagari'], subsets: ['devanagari'], w: W('400', '600', '700') },
  { id: 'tiro-devanagari-hindi', cat: 'serif', scripts: ['devanagari'], subsets: ['devanagari'], w: W('400', '400i') },
  { id: 'hind', cat: 'sans', scripts: ['devanagari'], subsets: ['devanagari'], w: W('400', '500', '700') },
  { id: 'eczar', cat: 'display', scripts: ['devanagari'], subsets: ['devanagari'], w: W('400', '700', '800') },
  { id: 'noto-sans-bengali', cat: 'sans', scripts: ['bengali'], subsets: ['bengali'], w: W('400', '700') },
  { id: 'noto-serif-bengali', cat: 'serif', scripts: ['bengali'], subsets: ['bengali'], w: W('400', '700') },
  { id: 'noto-sans-tamil', cat: 'sans', scripts: ['tamil'], subsets: ['tamil'], w: W('400', '700') },
  { id: 'noto-serif-tamil', cat: 'serif', scripts: ['tamil'], subsets: ['tamil'], w: W('400', '700') },
  { id: 'noto-sans-telugu', cat: 'sans', scripts: ['telugu'], subsets: ['telugu'], w: W('400', '700') },
  { id: 'noto-serif-telugu', cat: 'serif', scripts: ['telugu'], subsets: ['telugu'], w: W('400', '700') },
  { id: 'noto-sans-gujarati', cat: 'sans', scripts: ['gujarati'], subsets: ['gujarati'], w: W('400', '700') },
  { id: 'noto-serif-gujarati', cat: 'serif', scripts: ['gujarati'], subsets: ['gujarati'], w: W('400', '700') },
  { id: 'noto-sans-gurmukhi', cat: 'sans', scripts: ['gurmukhi'], subsets: ['gurmukhi'], w: W('400', '700') },
  { id: 'noto-sans-kannada', cat: 'sans', scripts: ['kannada'], subsets: ['kannada'], w: W('400', '700') },
  { id: 'noto-sans-malayalam', cat: 'sans', scripts: ['malayalam'], subsets: ['malayalam'], w: W('400', '700') },
  // ── Southeast Asia, Caucasus ──
  { id: 'noto-sans-thai', cat: 'sans', scripts: ['thai'], subsets: ['thai'], w: W('400', '700') },
  { id: 'noto-serif-thai', cat: 'serif', scripts: ['thai'], subsets: ['thai'], w: W('400', '700') },
  { id: 'noto-sans-georgian', cat: 'sans', scripts: ['georgian'], subsets: ['georgian'], w: W('400', '700') },
  { id: 'noto-serif-georgian', cat: 'serif', scripts: ['georgian'], subsets: ['georgian'], w: W('400', '700') },
  { id: 'noto-sans-armenian', cat: 'sans', scripts: ['armenian'], subsets: ['armenian'], w: W('400', '700') },
  { id: 'noto-serif-armenian', cat: 'serif', scripts: ['armenian'], subsets: ['armenian'], w: W('400', '700') },
];

const RANGES = {
  arabic: 'U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC',
};

function famName(css) { return /font-family:\s*'([^']+)'/.exec(css)?.[1]; }

function collectNpm(entry) {
  const src = join(root, 'node_modules', entry.npm, entry.dir);
  const blocks = [];
  for (const [w, base] of Object.entries(entry.files)) {
    const f = `${base}.woff2`;
    if (!existsSync(join(src, f))) { console.warn('missing', entry.npm, f); continue; }
    const out_name = `${entry.npm.replace(/-font$/, '')}-arabic-${w}-normal.woff2`;
    cpSync(join(src, f), join(out, out_name));
    blocks.push(`@font-face { font-family: '${entry.family}'; font-style: normal; font-display: block; font-weight: ${w}; src: url(./${out_name}) format('woff2'); unicode-range: ${RANGES.arabic};${entry.adjust ? ` size-adjust: ${entry.adjust}%;` : ''} }`);
  }
  return { css: blocks, family: entry.family };
}

function collect(entry) {
  if (entry.npm) return collectNpm(entry);
  const src = join(FS, entry.id);
  if (!existsSync(src)) { console.warn('missing package', entry.id, '(npm i -D @fontsource/' + entry.id + ')'); return { css: [], family: null }; }
  const blocks = [];
  let family = null;
  for (const w of entry.w) {
    const file = join(src, w.endsWith('i') ? `${w.slice(0, -1)}-italic.css` : `${w}.css`);
    if (!existsSync(file)) continue;
    const css = readFileSync(file, 'utf8');
    for (const m of css.matchAll(/\/\*\s*([^*]+?)\s*\*\/\s*(@font-face\s*\{[\s\S]*?\n\})/g)) {
      const label = m[1]; // e.g. noto-sans-hebrew-hebrew-400-normal or noto-sans-sc-[12]-400-normal
      const sub = label.slice(entry.id.length + 1).replace(/-(\d{3})-(normal|italic)$/, '');
      if (entry.subsets !== '*' && !entry.subsets.includes(sub.replace(/^\[\d+\]$/, '*')) && !entry.subsets.includes(sub)) continue;
      let face = m[2];
      family = family || famName(face);
      face = face.replace(/font-display:\s*swap/, 'font-display: block');
      if (entry.adjust) face = face.replace(/\}\s*$/, ` size-adjust: ${entry.adjust}%; }`);
      // keep only woff2 and rewrite path
      face = face.replace(/src:\s*url\(\.\/files\/([^)]+\.woff2)\)\s*format\('woff2'\)[^;]*;/, (_, f) => {
        cpSync(join(src, 'files', f), join(out, f));
        return `src: url(./${f}) format('woff2');`;
      });
      blocks.push(face.replace(/\s*\n\s*/g, ' '));
    }
  }
  return { css: blocks, family };
}

const extraPath = join(out, 'extra.json');
let extra = existsSync(extraPath) ? JSON.parse(readFileSync(extraPath, 'utf8')) : [];
const argv = process.argv.slice(2);
if (argv[0] === '--add') {
  const id = argv[1];
  const opt = (k) => { const i = argv.indexOf(k); return i > -1 ? argv[i + 1] : null; };
  if (!existsSync(join(FS, id))) execSync(`npm i -D @fontsource/${id}`, { cwd: root, stdio: 'inherit' });
  const subsets = opt('--subsets') ? opt('--subsets').split(',') : '*';
  const weights = opt('--weights') ? opt('--weights').split(',') : ['400', '700'];
  extra = extra.filter((e) => e.id !== id).concat({ id, role: 'extra', scripts: [], subsets, w: weights });
  writeFileSync(extraPath, JSON.stringify(extra, null, 2) + '\n');
}

const css = [], manifest = [];
for (const e of [...CORE, ...extra]) {
  const { css: blocks, family } = collect(e);
  if (!blocks.length) continue;
  css.push(...blocks);
  manifest.push({ family, id: e.id || e.npm, category: e.cat || 'other', scripts: e.scripts, license: e.license || 'OFL-1.1', ...(e.source ? { source: e.source } : {}), ...(e.adjust ? { sizeAdjust: e.adjust } : {}) });
}

// KaTeX (math): css + fonts
const kdist = join(root, 'node_modules/katex/dist');
mkdirSync(join(out, 'katex'), { recursive: true });
for (const n of readdirSync(join(kdist, 'fonts'))) if (n.endsWith('.woff2')) cpSync(join(kdist, 'fonts', n), join(out, 'katex', n));
writeFileSync(join(out, 'katex/katex.css'), readFileSync(join(kdist, 'katex.min.css'), 'utf8')
  .replace(/url\(fonts\/([^)]+)\)\s*format\("woff2"\),\s*url\([^)]+\)\s*format\("woff"\),\s*url\([^)]+\)\s*format\("truetype"\)/g, 'url(./$1) format("woff2")'));
manifest.push({ family: 'KaTeX_*', role: 'math', scripts: ['latin', 'math'], license: 'MIT/OFL' });

writeFileSync(join(out, 'fonts.css'), css.join('\n') + '\n');
writeFileSync(join(out, 'fonts.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`fonts: ${css.length} faces, ${manifest.length} families`);
