#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, basename, join, extname } from 'node:path';
import { ROOT } from './build.mjs';
import { buildFile } from './api.mjs';

function usage() {
  console.log(`frontend-docs

  build <input.md|input.html> [-o out.pdf] [--template id] [--lang fa|ar|en|...] [--dir rtl|ltr]
                              [--size A4|Letter|A5|"210mm 297mm"] [--html-only] [--strict]
  templates                    list available templates`);
}

const args = process.argv.slice(2);
const cmd = args.shift();
if (!cmd || cmd === '-h' || cmd === '--help') { usage(); process.exit(0); }

if (cmd === 'templates') {
  for (const id of readdirSync(join(ROOT, 'templates'))) {
    const p = join(ROOT, 'templates', id, 'template.json');
    if (!existsSync(p)) continue;
    const c = JSON.parse(readFileSync(p, 'utf8'));
    console.log(`${id.padEnd(14)} ${c.name} — ${c.description}`);
  }
  process.exit(0);
}

if (cmd === 'build') {
  const o = { strict: false, htmlOnly: false };
  const pos = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-o') o.out = args[++i];
    else if (a === '--template') o.template = args[++i];
    else if (a === '--lang') o.lang = args[++i];
    else if (a === '--dir') o.dir = args[++i];
    else if (a === '--size') o.size = args[++i];
    else if (a === '--html-only') o.htmlOnly = true;
    else if (a === '--strict') o.strict = true;
    else pos.push(a);
  }
  if (!pos[0] || !existsSync(resolve(pos[0]))) { console.error('Input file not found'); process.exit(1); }
  const r = await buildFile({ input: pos[0], out: o.out, template: o.template, lang: o.lang, dir: o.dir, size: o.size, htmlOnly: o.htmlOnly });
  console.log(`html: ${r.html}  (template: ${r.built.tpl.id}, lang: ${r.built.lang})`);
  for (const w of r.warnings) console.warn('⚠ ' + w);
  if (o.htmlOnly) process.exit(0);
  console.log(`pdf:  ${r.pdf}`);
  if (r.problems.length) {
    console.warn(`\n⚠ ${r.problems.length} layout problem(s):`);
    for (const p of r.problems.slice(0, 12)) console.warn(`  - [${p.type}] ${p.msg}${p.where ? ` — "${p.where}"` : ''}`);
    if (r.problems.length > 12) console.warn(`  … and ${r.problems.length - 12} more`);
    if (o.strict) process.exit(2);
  } else console.log('✓ layout check passed (no overflow, fonts loaded)');
  process.exit(0);
}
usage(); process.exit(1);
