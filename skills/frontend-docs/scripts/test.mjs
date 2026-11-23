// Builds every template with every demo language and fails on any layout problem.
//   npm test            all templates
//   node scripts/test.mjs paper tech
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { buildFile } from '../engine/api.mjs';
import { templates, demos, ROOT } from './matrix.mjs';

const only = process.argv.slice(2);
const out = join(ROOT, 'out/test');
mkdirSync(out, { recursive: true });
let failed = 0, n = 0;
for (const t of templates()) {
  if (only.length && !only.includes(t)) continue;
  for (const d of demos(t)) {
    n++;
    const pdf = join(out, `${t}-${d.lang}.pdf`);
    const r = await buildFile({ input: d.file, out: pdf, template: t });
    const errs = [...r.problems.map((p) => `[${p.type}] ${p.msg}`)];
    let text = '';
    try { text = execSync(`pdftotext "${pdf}" -`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString(); } catch {}
    if (text && d.lang === 'fa' && /[0-9]/.test(readFileSync(d.file, 'utf8').split('---')[2] || '') === false && !/[۰-۹]/.test(text) && t !== 'poster') errs.push('expected Persian digits in output');
    // system-font fallback check: every glyph must come from a bundled font
    try {
      const used = execSync(`pdffonts "${pdf}"`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
      const bad = [...new Set(used.split('\n').slice(2).map((l) => l.trim().split(/\s+/)[0].replace(/^[A-Z]+\+/, '')).filter((n) => /^(Liberation|DejaVu|Free(Sans|Serif|Mono)|Arial|Helvetica|Times|Courier|Noto(Sans|Serif)CJK)/.test(n)))];
      if (bad.length) errs.push(`system fallback fonts used: ${bad.join(', ')}`);
    } catch {}
    // blank-page check (a page with nothing but its page number)
    try {
      const np = +/Pages:\s+(\d+)/.exec(execSync(`pdfinfo "${pdf}"`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString())[1];
      for (let i = 1; i <= np; i++) {
        const txt = execSync(`pdftotext -f ${i} -l ${i} "${pdf}" -`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().replace(/[\s0-9٠-٩۰-۹\u200b-\u200f\u202a-\u202e]/g, '');
        if (!txt) errs.push(`page ${i} is blank`);
      }
    } catch {}
    console.log(`${errs.length ? '✗' : '✓'} ${t.padEnd(12)} ${d.lang}`);
    for (const e of errs) console.log('    ' + e);
    if (errs.length) failed++;
  }
}
// long documents with a table of contents (pagination, page-number read-back)
if (!only.length) for (const [t, l, f] of [['thesis', 'fa', 'toc'], ['report', 'en', 'toc'], ['tech', 'en', 'toc'], ['paper', 'en', 'scripts'], ['report', 'en', 'scripts'], ['lab-report', 'en', 'scripts'], ['paper', 'fa', 'bidi-fa']]) {
  n++;
  const pdf = join(out, `${f}-${t}-${l}.pdf`);
  const r = await buildFile({ input: join(ROOT, 'examples/features', f === 'toc' ? `toc-${l}.md` : `${f}.md`), out: pdf, template: t });
  try { const used = execSync(`pdffonts "${pdf}"`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString(); const bad = [...new Set(used.split('\n').slice(2).map((x) => x.trim().split(/\s+/)[0].replace(/^[A-Z]+\+/, '')).filter((n) => /^(Liberation|DejaVu|Free(Sans|Serif|Mono)|Arial|Helvetica|Times|Courier)/.test(n)))]; if (bad.length) r.warnings.push(`system fallback fonts used: ${bad.join(', ')}`); } catch {}
  const errs = [...r.problems.map((p) => `[${p.type}] ${p.msg}`), ...r.warnings];
  console.log(`${errs.length ? '✗' : '✓'} ${(f + '/' + t).padEnd(16)} ${l}`);
  for (const e of errs) console.log('    ' + e);
  if (errs.length) failed++;
}
console.log(`\n${n - failed}/${n} passed`);
process.exit(failed ? 1 : 0);
