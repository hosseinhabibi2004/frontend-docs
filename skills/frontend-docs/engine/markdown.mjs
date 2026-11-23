// Markdown -> HTML with KaTeX (pre-rendered), highlight.js, containers, bidi + digits.
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import footnote from 'markdown-it-footnote';
import attrs from 'markdown-it-attrs';
import katex from 'katex';
import hljs from 'highlight.js';
import { convertDigits, labels, QUOTES, langBase, dirFor, detectDir } from './i18n.mjs';
import { pathToFileURL } from 'node:url';
import { resolve as resolvePath, isAbsolute } from 'node:path';

const CALLOUTS = ['note', 'tip', 'warning', 'danger', 'definition', 'theorem', 'lemma', 'proof', 'example', 'exercise', 'answer', 'abstract', 'simple', 'correction', 'remark', 'proposition', 'corollary'];

function renderMath(src, display) {
  try {
    return katex.renderToString(src, { displayMode: display, throwOnError: false, strict: 'ignore', output: 'html', trust: false });
  } catch (e) {
    return `<span class="math-error">${MarkdownIt().utils.escapeHtml(src)}</span>`;
  }
}

// $inline$ and $$display$$ (also \( \) and \[ \])
function mathPlugin(md) {
  md.inline.ruler.after('escape', 'math_inline', (state, silent) => {
    const s = state.src, pos = state.pos;
    if (s[pos] !== '$') return false;
    const dbl = s[pos + 1] === '$';
    const open = dbl ? 2 : 1;
    let end = pos + open;
    while ((end = s.indexOf('$', end)) !== -1) {
      if (s[end - 1] === '\\') { end++; continue; }
      if (dbl && s[end + 1] !== '$') { end++; continue; }
      break;
    }
    if (end === -1) return false;
    const content = s.slice(pos + open, end);
    if (!content.trim() || (!dbl && (/^\s/.test(content) || /\s$/.test(content)))) return false;
    if (!dbl && /^\d/.test(s.slice(end + 1))) return false; // "$5 and $10"
    if (!silent) { const t = state.push('math_inline', '', 0); t.content = content; t.meta = { display: dbl }; }
    state.pos = end + open;
    return true;
  });
  md.block.ruler.before('fence', 'math_block', (state, start, endLine, silent) => {
    let pos = state.bMarks[start] + state.tShift[start], max = state.eMarks[start];
    if (state.src.slice(pos, pos + 2) !== '$$') return false;
    let first = state.src.slice(pos + 2, max);
    let content = '', next = start, found = false;
    if (first.trim().endsWith('$$')) { content = first.trim().slice(0, -2); found = true; }
    else {
      content = first + '\n';
      while (++next < endLine) {
        pos = state.bMarks[next] + state.tShift[next]; max = state.eMarks[next];
        const line = state.src.slice(pos, max);
        if (line.trim().endsWith('$$')) { content += line.trim().slice(0, -2); found = true; break; }
        content += line + '\n';
      }
    }
    if (!found) return false;
    if (silent) return true;
    state.line = next + 1;
    const t = state.push('math_block', '', 0);
    t.content = content.trim(); t.map = [start, state.line]; t.block = true;
    return true;
  }, { alt: ['paragraph', 'reference', 'blockquote', 'list'] });
  md.renderer.rules.math_inline = (tk, i) => {
    const t = tk[i];
    return `<span class="math" dir="ltr">${renderMath(t.content, t.meta.display)}</span>`;
  };
  md.renderer.rules.math_block = (tk, i) => `<div class="math-display" dir="ltr">${renderMath(tk[i].content, true)}</div>\n`;
}

// ::: name [title]  ...  :::   (nestable by using more colons)
function containerPlugin(md, getLabels) {
  md.block.ruler.before('fence', 'container', (state, start, endLine, silent) => {
    let pos = state.bMarks[start] + state.tShift[start], max = state.eMarks[start];
    const m = /^(:{3,})\s*([\w-]+)\s*(.*)$/.exec(state.src.slice(pos, max));
    if (!m) return false;
    if (silent) return true;
    const fence = m[1].length;
    let next = start + 1, depth = 0, closed = false;
    for (; next < endLine; next++) {
      const line = state.src.slice(state.bMarks[next] + state.tShift[next], state.eMarks[next]);
      const o = /^(:{3,})\s*[\w-]+/.exec(line);
      if (o && o[1].length >= fence) { depth++; continue; }
      const c = /^(:{3,})\s*$/.exec(line);
      if (c && c[1].length >= fence) { if (depth === 0) { closed = true; break; } depth--; }
    }
    const oldParent = state.parentType, oldMax = state.lineMax;
    state.parentType = 'container'; state.lineMax = next;
    const open = state.push('container_open', 'div', 1);
    open.info = m[2]; open.meta = { title: m[3] }; open.map = [start, next];
    state.md.block.tokenize(state, start + 1, next);
    const cl = state.push('container_close', 'div', -1); cl.info = m[2];
    state.parentType = oldParent; state.lineMax = oldMax;
    state.line = next + (closed ? 1 : 0);
    return true;
  }, { alt: ['paragraph', 'reference', 'blockquote', 'list'] });
  md.renderer.rules.container_open = (tk, i) => {
    const { info, meta } = tk[i];
    const esc = md.utils.escapeHtml;
    if (info === 'page') return '<section class="page">';
    if (info === 'lang') { const c = (meta.title || '').trim(); return `<div class="lang-block" lang="${esc(c)}" dir="${dirFor(c)}">`; }
    if (info === 'columns') return '<div class="columns">';
    if (info === 'col') return '<div class="col">';
    if (info === 'avoid-break') return '<div class="avoid-break">';
    if (CALLOUTS.includes(info)) {
      const title = meta.title || getLabels()[info] || info;
      return `<div class="callout callout-${info}"><div class="callout-title">${esc(title)}</div><div class="callout-body">`;
    }
    return `<div class="${esc(info)}">`;
  };
  md.renderer.rules.container_close = (tk, i) => {
    const info = tk[i].info;
    if (CALLOUTS.includes(info)) return '</div></div>\n';
    if (info === 'page') return '</section>\n';
    return '</div>\n';
  };
}

// Latin-script runs inside right-to-left text ("Python 3.12", "https://x.org/a-b", "36.6°C", "MB/s") are wrapped in a
// dir=ltr isolate so punctuation, digits and units keep their logical order instead of being reordered by the bidi algorithm.
const RTL_CHAR = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
const LRUN = /(?:\d+(?:[.,]\d+)?\s?(?:°[CF]|[A-Za-z]+(?:\/[A-Za-z]+)*)(?:[ \t]+[A-Za-z0-9][A-Za-z0-9_.+#\/\-@:'’%]*)*)|(?:[A-Za-z][A-Za-z0-9_.+#\/\-@:'’%]*(?:(?:[ \t]+|[,;،][ \t]+|[ \t]*[\/&+][ \t]*)[A-Za-z0-9][A-Za-z0-9_.+#\/\-@:'’%]*)*)/g;
// phone-like number groups ("+98 918 003 1461", "(021) 1234-5678"): groups separated by spaces would otherwise reverse in RTL text
const PHONE = /\+?[\d۰-۹][\d۰-۹ ()\-.]{4,}[\d۰-۹]/g;
const digitsOf = (x) => (x.match(/[\d۰-۹]/g) || []).length;
function isolateNumbers(children, Token, esc, digits) {
  const out = [];
  for (const t of children) {
    if (t.type !== 'text' || !/[\d۰-۹]/.test(t.content)) { out.push(t); continue; }
    let last = 0; const src = t.content;
    for (const m of src.matchAll(PHONE)) {
      const run = m[0].trim();
      if (!/[ \-()]/.test(run) || digitsOf(run) < 7) continue;
      if (m.index > last) { const a = new Token('text', '', 0); a.content = src.slice(last, m.index); out.push(a); }
      const h = new Token('html_inline', '', 0); h.content = `<span class="ltr" dir="ltr">${esc(convertDigits(run, digits))}</span>`; out.push(h);
      last = m.index + m[0].length;
    }
    if (last === 0) { out.push(t); continue; }
    if (last < src.length) { const a = new Token('text', '', 0); a.content = src.slice(last); out.push(a); }
  }
  return out;
}

function isolateLatin(children, Token, esc) {
  const out = [];
  for (const t of children) {
    if (t.type !== 'text' || !/[A-Za-z]/.test(t.content)) { out.push(t); continue; }
    let last = 0; const src = t.content;
    for (const m of src.matchAll(LRUN)) {
      let run = m[0]; const trail = /[.,:;'’\-+/]+$/.exec(run);
      if (trail) run = run.slice(0, -trail[0].length);
      if (!/[A-Za-z]/.test(run)) continue;
      if (m.index > last) { const a = new Token('text', '', 0); a.content = src.slice(last, m.index); out.push(a); }
      const h = new Token('html_inline', '', 0); h.content = `<span class="ltr" dir="ltr">${esc(run)}</span>`; out.push(h);
      last = m.index + run.length;
    }
    if (last < src.length) { const a = new Token('text', '', 0); a.content = src.slice(last); out.push(a); }
  }
  return out;
}

export function createMarkdown({ lang = 'en', digits = 'latin', baseDir = process.cwd() } = {}) {
  let L = labels(lang);
  const md = new MarkdownIt({
    html: true, linkify: true, typographer: true, breaks: false,
    quotes: ((QUOTES[langBase(lang)] || QUOTES.en).split(' ')),
    highlight(code, language) {
      let html;
      if (language && hljs.getLanguage(language)) html = hljs.highlight(code, { language, ignoreIllegals: true }).value;
      else html = md.utils.escapeHtml(code);
      return `<pre class="code" dir="ltr"><code class="hljs${language ? ' language-' + language : ''}">${html}</code></pre>`;
    },
  });
  md.disable('replacements'); // keep (c) / -- as typed; smart quotes stay on
  md.use(mathPlugin).use(footnote).use(attrs).use(anchor, { permalink: false, tabIndex: false });
  containerPlugin(md, () => L);

  // inline code: always LTR, isolated
  md.renderer.rules.code_inline = (tk, i) => `<code class="inline" dir="ltr">${md.utils.escapeHtml(tk[i].content)}</code>`;

  // text direction per block, decided at build time from the first strong character (not dir="auto": Chromium does not
  // update logical properties on pseudo-elements for dir=auto, so quote marks, markers and borders ended up on the wrong side)
  const docDir = dirFor(lang);
  md.core.ruler.push('block_dir', (state) => {
    const T = state.tokens;
    for (let i = 0; i < T.length; i++) {
      if (!['paragraph_open', 'heading_open', 'blockquote_open', 'th_open', 'td_open'].includes(T[i].type)) continue;
      let j = i + 1; while (j < T.length && T[j].type !== 'inline') j++;
      const txt = (T[j]?.children || []).filter((c) => c.type === 'text' || c.type === 'html_inline').map((c) => c.type === 'text' ? c.content : c.content.replace(/<[^>]+>/g, '')).join('');
      const d = detectDir(txt, docDir);
      if (d !== docDir || T[i].type === 'blockquote_open') T[i].attrSet('dir', d);
    }
  });
  // isolate Latin runs and phone numbers in right-to-left documents (before digit conversion so runs keep their digits)
  if (docDir === 'rtl') {
    md.core.ruler.push('ltr_runs', (state) => {
      for (const blk of state.tokens) if (blk.type === 'inline') blk.children = isolateLatin(isolateNumbers(blk.children, state.Token, md.utils.escapeHtml, digits), state.Token, md.utils.escapeHtml);
    });
  }
  // digit conversion in plain text only (never in code/math)
  if (digits !== 'latin') {
    md.core.ruler.push('digits', (state) => {
      for (const blk of state.tokens) {
        if (blk.type !== 'inline') continue;
        for (const t of blk.children) if (t.type === 'text') t.content = convertDigits(t.content, digits);
      }
    });
  }
  // "Title || right-hand part" in a heading becomes two spans (job || place, school || dates)
  md.core.ruler.push('split_heading', (state) => {
    const T = state.tokens;
    for (let i = 0; i < T.length; i++) {
      if (T[i].type !== 'heading_open' || T[i + 1]?.type !== 'inline') continue;
      const kids = T[i + 1].children; const k = kids.findIndex((c) => c.type === 'text' && c.content.includes(' || '));
      if (k < 0) continue;
      const [a, b] = kids[k].content.split(' || ', 2);
      const mk = (type, content) => { const x = new state.Token(type, '', 0); x.content = content; return x; };
      const left = [mk('html_inline', '<span class="l">'), ...kids.slice(0, k), ...(a ? [mk('text', a)] : []), mk('html_inline', '</span>')];
      const right = [mk('html_inline', '<span class="r">'), ...(b ? [mk('text', b)] : []), ...kids.slice(k + 1), mk('html_inline', '</span>')];
      T[i + 1].children = [...left, ...right];
      T[i].attrJoin('class', 'split');
    }
  });
  // a paragraph holding only an image becomes <figure> with the alt text as caption; relative paths resolve against the source file
  md.core.ruler.push('figures', (state) => {
    const T = state.tokens;
    for (let i = 0; i < T.length - 2; i++) {
      if (T[i].type !== 'paragraph_open' || T[i + 1].type !== 'inline' || T[i + 2].type !== 'paragraph_close') continue;
      const kids = T[i + 1].children;
      if (kids.length !== 1 || kids[0].type !== 'image') continue;
      const img = kids[0]; let src = img.attrGet('src') || '';
      if (!/^[a-z]+:|^data:/i.test(src)) src = pathToFileURL(isAbsolute(src) ? src : resolvePath(baseDir, src)).href;
      const cap = img.children?.map((c) => c.content).join('') || img.content || '';
      const capHtml = img.children?.length ? md.renderer.renderInline(img.children, md.options, state.env) : md.utils.escapeHtml(cap);
      const h = new state.Token('html_block', '', 0);
      h.content = `<figure><img src="${md.utils.escapeHtml(src)}" alt="${md.utils.escapeHtml(cap)}">${cap ? `<figcaption dir="${detectDir(cap, docDir)}">${capHtml}</figcaption>` : ''}</figure>\n`;
      T.splice(i, 3, h);
    }
  });
  // collect headings (for the table of contents)
  md.core.ruler.push('collect_headings', (state) => {
    const list = state.env.headings = [];
    const T = state.tokens;
    for (let i = 0; i < T.length; i++) {
      if (T[i].type !== 'heading_open') continue;
      const inl = T[i + 1];
      const text = inl.children.filter((c) => c.type === 'text' || c.type === 'code_inline').map((c) => c.content).join('').trim();
      list.push({ level: +T[i].tag.slice(1), id: T[i].attrGet('id'), text });
    }
  });
  // code fences are already wrapped; make fence renderer return highlight output directly
  md.renderer.rules.fence = (tk, i) => {
    const t = tk[i]; const lang = (t.info || '').trim().split(/\s+/)[0];
    const out = md.options.highlight(t.content, lang);
    return out + '\n';
  };
  md.setLabels = (l) => { L = l; };
  return md;
}
