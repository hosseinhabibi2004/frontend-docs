// Build pipeline: front matter + Markdown/HTML -> self-contained HTML (fonts inlined by URL)
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createMarkdown } from './markdown.mjs';
import { dirFor, defaultDigits, langBase, resolveLangFonts, scriptFor, SCRIPT_TRAITS, leadingFor, QUOTES, labels, convertDigits, FONT_SETS, ALIAS, detectDir } from './i18n.mjs';
import { pageSize, contentBox } from './sizes.mjs';

// Chromium drops @page margin boxes (page numbers) on a final page that ends in a <pre>; a zero-height sentinel avoids it
const SENTINEL = '<div class="end" aria-hidden="true" style="height:0"></div>\n';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export function parseFrontMatter(src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  if (!m) return { meta: {}, body: src };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let v = kv[2].trim().replace(/^["']|["']$/g, '');
    if (v === 'true') v = true; else if (v === 'false') v = false;
    meta[kv[1]] = v;
  }
  return { meta, body: src.slice(m[0].length) };
}

export function loadTemplate(id) {
  const dir = join(ROOT, 'templates', id);
  if (!existsSync(dir)) throw new Error(`Unknown template "${id}" (looked in ${dir})`);
  const cfg = JSON.parse(readFileSync(join(dir, 'template.json'), 'utf8'));
  return { id, dir, cfg, css: readFileSync(join(dir, 'template.css'), 'utf8') };
}

const cssStr = (t) => `"${String(t).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function coverHtml(meta, cfg, docDir) {
  if (meta.cover === false || cfg.cover === 'none') return '';
  const d = (t) => ` dir="${detectDir(t, docDir)}"`;
  const bits = [];
  if (meta.kicker) bits.push(`<div class="cover-kicker"${d(meta.kicker)}>${esc(meta.kicker)}</div>`);
  bits.push(`<div class="cover-title"${d(meta.title || 'Untitled')}>${esc(meta.title || 'Untitled')}</div>`);
  if (meta.subtitle) bits.push(`<p class="cover-subtitle"${d(meta.subtitle)}>${esc(meta.subtitle)}</p>`);
  const foot = [meta.author, meta.org, meta.date].filter(Boolean).map((x) => `<span${d(String(x))}>${esc(x)}</span>`).join('');
  const extra = (meta.by ? `<div class="cover-by"${d(meta.by)}>${esc(meta.by)}</div>` : '') + (meta.note ? `<div class="cover-note"${d(meta.note)}>${esc(meta.note)}</div>` : '');
  if (cfg.cover === 'inline') return `<header class="masthead" data-cover="inline">${bits.join('')}<div class="cover-meta">${foot}</div>${extra}</header>`;
  return `<section class="cover page" data-cover="${esc(cfg.cover || 'plain')}">${bits.join('')}<div class="cover-meta">${foot}</div>${extra}</section>`;
}

export function buildHtml({ source, isHtml = false, overrides = {}, baseDir = process.cwd(), tocPages = null }) {
  const { meta: fm, body } = parseFrontMatter(source);
  const meta = { ...fm, ...overrides };
  const tpl = loadTemplate(meta.template || 'paper');
  const lang = meta.lang || 'en';
  const dir = meta.dir && meta.dir !== 'auto' ? meta.dir : dirFor(lang);
  const digits = meta.digits || defaultDigits(lang);
  const size = meta.size || tpl.cfg.size || 'A4';
  const L = labels(lang);

  let content;
  let headings = [];
  if (isHtml) content = body;
  else {
    const md = createMarkdown({ lang, digits, baseDir });
    const env = {};
    content = md.render(body, env);
    headings = env.headings || [];
  }
  const lf = resolveLangFonts(lang, tpl.cfg);
  const script = scriptFor(lang);
  const traits = SCRIPT_TRAITS[script];
  const endsWithPre = /<\/pre>\s*$/.test(content.trim());
  const warnings = [];
  if (lf && lf.optIn) { try { const have = readFileSync(join(ROOT, 'fonts/fonts.css'), 'utf8'); if (!have.includes(lf.text.replace(/'/g, ''))) warnings.push(`No ${langBase(lang)} fonts bundled. Run: ${lf.optIn.map((f) => 'node scripts/build-fonts.mjs --add ' + f).join(' && ')}`); } catch {} }
  const tocDepth = +(meta['toc-depth'] || 2);
  const tocOn = meta.toc === true && !isHtml;
  const tocEntries = tocOn ? headings.map((h, i) => ({ ...h, i })).filter((h) => h.level <= tocDepth) : [];
  const fmt = (n) => convertDigits(String(n), digits);
  const tocHtml = tocOn ? `<nav class="toc" dir="${dir}"><div class="toc-title">${esc(L.contents)}</div><ol>${tocEntries.map((h) => `<li class="lvl${h.level}"><a href="#${esc(h.id)}"><span class="t" dir="${detectDir(h.text, dir)}">${esc(h.text)}</span><span class="dots"></span><span class="pg">${tocPages ? fmt(tocPages[h.i] ?? '') : fmt('00')}</span></a></li>`).join('')}</ol></nav>` : '';
  const margin = meta.margin || tpl.cfg.margin || '22mm 20mm 24mm 20mm';
  const pageNumbers = meta.pagenumbers !== false && tpl.cfg.pagenumbers !== false;
  const css = [
    pathToFileURL(join(ROOT, 'fonts/fonts.css')).href,
    pathToFileURL(join(ROOT, 'fonts/katex/katex.css')).href,
  ].map((u) => `<link rel="stylesheet" href="${u}">`).join('\n');

  // the template may define its own --text-font/--title-font/--ui-font; re-emit them for every [lang] so nested languages recompute
  const DEF = { text: 'var(--font-text-latin),var(--lang-text),serif', title: 'var(--font-title-latin),var(--lang-title),serif', ui: 'var(--font-ui),var(--lang-sans),sans-serif' };
  const stackOf = (k) => { const m = new RegExp(`--${k}-font:\\s*([^;]+);`).exec(tpl.css); return m ? m[1].trim() : DEF[k]; };
  const quotes = QUOTES[langBase(lang)] || QUOTES.en;
  const justify = traits.justify && langBase(lang) !== 'ur';
  // Per-language typography: every language gets a :lang() block so a document can mix languages
  // (`::: lang he` ... `:::`); the root language is just the one on <html>.
  const langs = [...new Set([...Object.keys(FONT_SETS), ...Object.keys(ALIAS)])];
  const rules = [];
  const lists = { track0: [], noItalic: [], justify: [] };
  for (const code of langs) {
    const f = resolveLangFonts(code, tpl.cfg);
    if (!f) continue;
    rules.push(`:lang(${code}){ --lang-text:${f.text}; --lang-title:${f.title}; --lang-sans:${f.ui}; --lang-display:${f.display}; --lang-title-wt:${f.displayWeight}; --lh-lang:${leadingFor(code)}; }`);
    const t = SCRIPT_TRAITS[scriptFor(code)];
    if (t.track0 || scriptFor(code) === 'arabic') lists.track0.push(`:lang(${code})`);
    if (!t.italic) lists.noItalic.push(`:lang(${code})`);
    if (t.justify && code !== 'ur') lists.justify.push(`:lang(${code})`);
  }
  const star = (l, sfx = '') => l.map((x) => `${x} *${sfx}, ${x}${sfx}`).join(', ');
  const dynamic = `
${rules.join('\n')}
:root{ --lh-lang:${leadingFor(lang)}; }
:root,[lang]{ --text-font:${stackOf('text')}; --title-font:${stackOf('title')}; --ui-font:${stackOf('ui')}; --font-mono-ui:var(--font-mono-names),var(--lang-sans),monospace; }
body,[lang]{ font-family:var(--text-font); line-height:max(var(--lh), var(--lh-lang)); }
html{ quotes:${quotes.split(' ').map((q) => `"${q}"`).join(' ')}; }
${lists.track0.length ? `${star(lists.track0)}, ${star(lists.track0, '::before')}, ${star(lists.track0, '::after')}{ letter-spacing:0 !important; text-transform:none !important; font-variant-caps:normal !important; }` : ''}
${lists.noItalic.length ? `${lists.noItalic.map((l) => `${l}, ${l} *`).join(', ')}{ font-synthesis-style:none; }
${lists.noItalic.map((l) => `${l} em, ${l} i, ${l} cite`).join(', ')}{ font-style:normal; font-weight:600; color:var(--accent); }
${lists.noItalic.map((l) => `${l} h4, ${l} .callout-theorem .callout-body, ${l} .callout-lemma .callout-body`).join(', ')}{ font-style:normal; }` : ''}
${lists.justify.length ? `${lists.justify.map((l) => `${l} p, ${l} li`).join(', ')}{ text-align:justify; text-justify:inter-word; }` : ''}

@page{ size:${pageSize(size, meta.landscape === true || (tpl.cfg.landscape && meta.landscape !== false))}; margin:${margin}; }
@page cover{ margin:0; @top-left{content:none} @top-right{content:none} @top-center{content:none} @bottom-center{content:none} @bottom-left{content:none} @bottom-right{content:none} }
@counter-style doc{ system:numeric; symbols:${digits === 'persian' ? "'۰' '۱' '۲' '۳' '۴' '۵' '۶' '۷' '۸' '۹'" : digits === 'arabic' ? "'٠' '١' '٢' '٣' '٤' '٥' '٦' '٧' '٨' '٩'" : "'0' '1' '2' '3' '4' '5' '6' '7' '8' '9'"}; }
:root{ --doc-title:${cssStr(meta.title || '')}; --l-chapter:'${L.chapter}'; --l-figure:'${L.figure}'; --l-question:'${L.question}'; }
@counter-style persian{ system:numeric; symbols:'۰' '۱' '۲' '۳' '۴' '۵' '۶' '۷' '۸' '۹'; }
@counter-style arabic-indic{ system:numeric; symbols:'٠' '١' '٢' '٣' '٤' '٥' '٦' '٧' '٨' '٩'; }
${tpl.cfg.runninghead ? `@page{ @top-${dir === 'rtl' ? 'right' : 'left'}{ content:${cssStr(meta.header || meta.title || '')}; font-family:var(--ui-font); font-size:8.5pt; color:var(--head-color, var(--muted)); } }` : ''}
${tpl.cfg.initials ? `@page{ @bottom-right{ content:'${L.initials}  ________  ________'; font-family:var(--ui-font); font-size:8pt; color:var(--muted);} }` : ''}
${pageNumbers ? `@page{ @bottom-center{ content: counter(page, ${digits === 'persian' ? 'persian' : digits === 'arabic' ? 'arabic-indic' : 'decimal'}); font-family:var(--ui-font); font-size:9pt; color:var(--pn-color, var(--muted));} }` : ''}
`;
  const html = `<!doctype html>
<html lang="${esc(lang)}" dir="${dir}" data-template="${esc(tpl.id)}" data-digits="${digits}" data-script="${script}">
<head>
<meta charset="utf-8">
<title>${esc(meta.title || 'Document')}</title>
${css}
<link rel="stylesheet" href="${pathToFileURL(join(ROOT, 'base/base.css')).href}">
<style>${tpl.css}</style>
<style>${dynamic}</style>
</head>
<body>
${coverHtml(meta, tpl.cfg, dir)}
${tocHtml}
<main class="doc" data-contents-label="${esc(L.contents)}">
${content}
</main>
${endsWithPre ? SENTINEL : ''}</body>
</html>`;
  const viewport = contentBox(size, meta.landscape === true || (tpl.cfg.landscape && meta.landscape !== false), margin);
  return { html, meta, tpl, dir, lang, size, viewport, warnings, tocEntries, headingCount: headings.length };
}
