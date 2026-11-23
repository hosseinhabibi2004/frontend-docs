// Renders screenshots of every template into docs/screenshots and rewrites the README gallery.
// Needs poppler (pdftoppm). Dev-only; end users do not need it.
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { buildFile } from '../engine/api.mjs';
import { templates, demos, ROOT } from './matrix.mjs';

const REPO = join(ROOT, '../..');
const shots = join(REPO, 'docs/screenshots');
const tmp = join(ROOT, 'out/gallery');
mkdirSync(shots, { recursive: true }); mkdirSync(tmp, { recursive: true });
const only = process.argv.slice(2);

const render = (pdf, page, name, dpi = 72) => {
  execSync(`pdftoppm -r ${dpi} -png -f ${page} -l ${page} -singlefile "${pdf}" "${join(shots, name)}"`);
  return `docs/screenshots/${name}.png`;
};
const pages = (pdf) => +/Pages:\s+(\d+)/.exec(execSync(`pdfinfo "${pdf}"`).toString())[1];

const sections = [];
for (const t of templates()) {
  if (only.length && !only.includes(t)) continue;
  const cfg = JSON.parse(readFileSync(join(ROOT, 'templates', t, 'template.json'), 'utf8'));
  const imgs = [];
  const built = {};
  for (const d of demos(t)) {
    const pdf = join(tmp, `${t}-${d.lang}.pdf`);
    await buildFile({ input: d.file, out: pdf, template: t });
    built[d.lang] = pdf;
  }
  const en = built.en, fa = built.fa, ar = built.ar;
  if (cfg.gallery) { for (const [l, pg] of cfg.gallery) imgs.push([render(built[l], pg, `${t}-${l}-${pg}`), `${cfg.name} (${l.toUpperCase()}) page ${pg}`]); }
  const N = en ? pages(en) : 0;
  const alt = (l, p) => `${cfg.name} (${l.toUpperCase()}) page ${p}`;
  if (!cfg.gallery && en) imgs.push([render(en, 1, `${t}-en-1`), alt('en', 1)]);
  if (!cfg.gallery && en && N > 1) imgs.push([render(en, Math.min(2, N), `${t}-en-2`), alt('en', 2)]);
  if (!cfg.gallery && fa) imgs.push([render(fa, 1, `${t}-fa-1`), alt('fa', 1)]);
  if (!cfg.gallery && ar) { const a = [render(ar, 1, `${t}-ar-1`), alt('ar', 1)]; if (imgs.length < 3) imgs.push(a); }
  const w = imgs.length === 3 ? '32.5%' : imgs.length === 2 ? '49%' : '60%';
  sections.push(`### ${cfg.name} — \`${t}\`\n\n<p>\n${imgs.map(([s, a]) => `  <img src="${s}" width="${w}" alt="${a}" />`).join('\n')}\n</p>\n\n> ${cfg.description}\n>\n> **Best for:** ${cfg.best_for.join(', ')} · **Page:** ${cfg.size}${cfg.landscape ? ' landscape' : ''} · **Mood:** ${cfg.mood.join(', ')}\n`);
  console.log('shots', t);
}
const gallery = sections.join('\n');
writeFileSync(join(REPO, 'docs/gallery.md'), gallery);
const readme = join(REPO, 'README.md');
if (!only.length && existsSync(readme)) {
  let r = readFileSync(readme, 'utf8');
  r = r.replace(/<!-- GALLERY:START -->[\s\S]*<!-- GALLERY:END -->/, `<!-- GALLERY:START -->\n${gallery}\n<!-- GALLERY:END -->`);
  writeFileSync(readme, r);
}
