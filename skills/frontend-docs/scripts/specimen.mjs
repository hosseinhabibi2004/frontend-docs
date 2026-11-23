// Builds a type specimen PDF: every bundled family with a sample in its own script, plus the
// per-template / per-language font pairings the engine resolves. Output: ../../docs/specimen.pdf
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { buildFile } from '../engine/api.mjs';
import { resolveLangFonts, FONT_SETS } from '../engine/i18n.mjs';
import { templates, ROOT } from './matrix.mjs';

const fonts = JSON.parse(readFileSync(join(ROOT, 'fonts/fonts.json'), 'utf8')).filter((f) => !f.family.startsWith('KaTeX'));
const css = readFileSync(join(ROOT, 'fonts/fonts.css'), 'utf8');
const weights = (fam) => [...new Set([...css.matchAll(new RegExp(`font-family: '${fam}'; font-style: (\\w+); font-display: block; font-weight: (\\d+)`, 'g'))].map((m) => m[2] + (m[1] === 'italic' ? 'i' : '')))].sort((a, b) => parseInt(a) - parseInt(b)).join(' ');

const SAMPLE = {
  latin: 'Typography is the craft of making written language legible and beautiful. 0123456789',
  cyrillic: 'Типографика — это искусство делать письменную речь читаемой и красивой.',
  greek: 'Η τυπογραφία είναι η τέχνη να κάνουμε τον γραπτό λόγο ευανάγνωστο.',
  arabic: 'الطباعة فنّ جعل اللغة المكتوبة مقروءة وجميلة', persian: 'حروف‌چینی هنر خوانا و زیبا کردن زبان نوشتاری است ۰۱۲۳۴۵۶۷۸۹', urdu: 'ٹائپوگرافی تحریری زبان کو پڑھنے کے قابل بنانے کا فن ہے۔',
  hebrew: 'טיפוגרפיה היא אמנות הפיכת השפה הכתובה לקריאה ויפה.', devanagari: 'टाइपोग्राफ़ी लिखित भाषा को पठनीय और सुंदर बनाने की कला है।',
  bengali: 'টাইপোগ্রাফি হলো লিখিত ভাষাকে পাঠযোগ্য ও সুন্দর করে তোলার শিল্প।', tamil: 'அச்சுக்கலை என்பது எழுத்து மொழியை படிக்கவும் அழகாகவும் ஆக்கும் கலை.',
  telugu: 'టైపోగ్రఫీ అనేది వ్రాత భాషను చదవడానికి సులభంగా మార్చే కళ.', gujarati: 'ટાઇપોગ્રાફી એ લેખિત ભાષાને વાંચવા યોગ્ય બનાવવાની કળા છે.', gurmukhi: 'ਟਾਈਪੋਗ੍ਰਾਫੀ ਲਿਖਤੀ ਭਾਸ਼ਾ ਨੂੰ ਪੜ੍ਹਨ ਯੋਗ ਬਣਾਉਣ ਦੀ ਕਲਾ ਹੈ।',
  kannada: 'ಮುದ್ರಣಕಲೆ ಲಿಖಿತ ಭಾಷೆಯನ್ನು ಓದಲು ಸುಲಭವಾಗಿಸುವ ಕಲೆ.', malayalam: 'അച്ചടിവിദ്യ എഴുത്തുഭാഷയെ വായനായോഗ്യമാക്കുന്ന കലയാണ്.', thai: 'การพิมพ์ตัวอักษรคือศิลปะแห่งการทำให้ภาษาเขียนอ่านง่ายและงดงาม',
  georgian: 'ტიპოგრაფია წერილობითი ენის წაკითხვადად გახდომის ხელოვნებაა.', armenian: 'Տպագրությունը գրավոր լեզուն ընթեռնելի դարձնելու արվեստն է։',
};
const RTL = new Set(['arabic', 'persian', 'urdu', 'hebrew']);
const sampleFor = (f) => { const order = f.scripts.includes('persian') ? ['persian'] : f.scripts.includes('urdu') && f.id.includes('nastaliq') ? ['urdu'] : f.scripts.filter((s) => SAMPLE[s]); const s = order[0] || 'latin'; return { txt: SAMPLE[s], rtl: RTL.has(s), lang: { persian: 'fa', arabic: 'ar', urdu: 'ur', hebrew: 'he', devanagari: 'hi', bengali: 'bn', tamil: 'ta', telugu: 'te', gujarati: 'gu', gurmukhi: 'pa', kannada: 'kn', malayalam: 'ml', thai: 'th', georgian: 'ka', armenian: 'hy', cyrillic: 'ru', greek: 'el' }[s] || 'en' }; };

const groups = [['Latin · Cyrillic · Greek · Vietnamese', (f) => f.scripts.some((s) => ['latin', 'cyrillic', 'greek'].includes(s))],
  ['Arabic script — Persian, Arabic, Urdu, Pashto, Kurdish', (f) => f.scripts.includes('arabic')],
  ['Hebrew', (f) => f.scripts.includes('hebrew')],
  ['Indic · Thai · Caucasus', (f) => f.scripts.some((s) => ['devanagari', 'bengali', 'tamil', 'telugu', 'gujarati', 'gurmukhi', 'kannada', 'malayalam', 'thai', 'georgian', 'armenian'].includes(s))]];

let html = `<style>
.sp h2{ break-after:avoid; } .sp .row{ display:grid; grid-template-columns:34mm 1fr; gap:4mm; align-items:baseline; padding:2.2mm 0; border-bottom:.4pt solid #ddd; break-inside:avoid; }
.sp .meta{ font:8pt/1.35 'IBM Plex Sans'; color:#555; } .sp .meta b{ display:block; color:#111; font-size:8.6pt; } .sp .smp{ font-size:14pt; line-height:1.7; }
.sp table.pair{ font-size:7.6pt; } .sp table.pair td,.sp table.pair th{ padding:1.2mm 1.6mm; }
</style><div class="sp">
<h1>Type specimen</h1>
<p>${fonts.length} open-source families bundled in <code>fonts/</code>. Samples are set in the family's own script; the pairing tables show what the engine picks per template and language.</p>`;
for (const [title, test] of groups) {
  html += `<h2>${title}</h2>`;
  for (const f of fonts.filter(test)) {
    const s = sampleFor(f);
    html += `<div class="row"><div class="meta"><b>${f.family}</b>${f.category} · ${weights(f.family) || '400'}<br>${f.license}${f.sizeAdjust ? ` · size-adjust ${f.sizeAdjust}%` : ''}</div><div class="smp" lang="${s.lang}" dir="${s.rtl ? 'rtl' : 'ltr'}" style="font-family:'${f.family}',serif;${f.category === 'mono' ? 'font-size:11pt' : ''}">${s.txt}</div></div>`;
  }
}
html += `<h2>Template pairings</h2><p>Latin text/title come from each template; the columns show the language fonts the engine adds. <i>style</i> is serif or sans; <i>display</i> replaces the title font in expressive templates.</p>
<table class="pair"><thead><tr><th>Template</th><th>style</th><th>Persian text · title</th><th>Arabic text · title</th><th>Hebrew text · title</th><th>Hindi text · title</th></tr></thead><tbody>`;
for (const t of templates()) {
  const cfg = JSON.parse(readFileSync(join(ROOT, 'templates', t, 'template.json'), 'utf8'));
  const cell = (l) => { const r = resolveLangFonts(l, cfg); return r ? `${r.text.replace(/'/g, '')} · ${r.display.replace(/'/g, '')}` : '—'; };
  html += `<tr><td>${t}</td><td>${cfg.style || 'sans'}${cfg.display ? ' / ' + cfg.display : ''}</td><td>${cell('fa')}</td><td>${cell('ar')}</td><td>${cell('he')}</td><td>${cell('hi')}</td></tr>`;
}
html += `</tbody></table></div>`;
mkdirSync(join(ROOT, 'out'), { recursive: true });
const src = join(ROOT, 'out/specimen-src.html');
writeFileSync(src, `---\ntitle: Type specimen\nlang: en\ntemplate: tech\ncover: false\n---\n${html}`);
const REPO = join(ROOT, '../..');
mkdirSync(join(REPO, 'docs'), { recursive: true });
const r = await buildFile({ input: src, out: join(REPO, 'docs/specimen.pdf') });
import('node:fs').then(({ rmSync }) => rmSync(r.html, { force: true })); // the PDF is the deliverable
console.log('specimen:', r.pdf, r.problems.length ? `${r.problems.length} layout notes` : 'ok');
