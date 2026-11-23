// HTML -> PDF with Chromium, plus layout verification (page separation, overflow, fonts).
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try { return require('playwright'); } catch {}
  try { return require(execSync('npm root -g').toString().trim() + '/playwright'); } catch {}
  throw new Error('Playwright not found. Run: npm i -D playwright && npx playwright install chromium');
}

export async function renderPdf({ htmlPath, pdfPath, verify = true, viewport }) {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage(viewport ? { viewport } : {});
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
    // load every declared face: fonts used only in @page margin boxes (page numbers) are never touched by the DOM
    await page.evaluate(async () => { await Promise.all([...document.fonts].map((f) => f.load().catch(() => {}))); await document.fonts.ready; });
    await page.emulateMedia({ media: 'print' });
    const report = verify ? await page.evaluate(auditDom) : null;
    mkdirSync(dirname(pdfPath), { recursive: true });
    await page.pdf({ path: pdfPath, preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false, outline: true, tagged: true });
    return report;
  } finally { await browser.close(); }
}

// Runs inside the page. Flags anything that would silently break a printed page.
function auditDom() {
  const problems = [];
  const pageEls = [...document.querySelectorAll('section.page')];
  const sizeProbe = document.createElement('div');
  sizeProbe.style.cssText = 'position:absolute;visibility:hidden;width:100vw;height:100vh';
  for (const el of pageEls) {
    // fixed pages must not overflow their own box
    if (el.scrollHeight > el.clientHeight + 2) problems.push({ type: 'page-overflow', msg: `fixed page content is ${el.scrollHeight - el.clientHeight}px taller than its page`, where: el.className });
  }
  for (const el of document.querySelectorAll('.doc *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0) continue;
    const cs = getComputedStyle(el);
    if (parseFloat(cs.marginInlineStart) < 0 || cs.position === 'absolute') continue; // intentional bleed / decorative shapes
    let parent = el.closest('main.doc');
    if (getComputedStyle(parent).display === 'contents') parent = document.body;
    const pr = parent.getBoundingClientRect();
    if (r.right > pr.right + 2 || r.left < pr.left - 2) {
      if (!el.closest('.katex, .katex-display, pre, .math-display')) problems.push({ type: 'horizontal-overflow', msg: `<${el.tagName.toLowerCase()}> exceeds the text column`, where: (el.textContent || '').slice(0, 40) });
    }
  }
  // wide code / math is checked separately (these scroll on screen but are clipped in print)
  for (const el of document.querySelectorAll('pre.code, .math-display')) {
    if (el.scrollWidth > el.clientWidth + 2) problems.push({ type: 'wide-block', msg: `${el.tagName.toLowerCase()} is wider than the page; it will be clipped in print`, where: (el.textContent || '').slice(0, 40) });
  }
  for (const el of document.querySelectorAll('.math')) {
    let box = el.parentElement;
    while (box && getComputedStyle(box).display.startsWith('inline')) box = box.parentElement; // run-in paragraphs are inline: use the block around them
    if (box && el.getBoundingClientRect().width > box.clientWidth + 2) problems.push({ type: 'wide-inline-math', msg: 'inline math is wider than its text column; write it as display math ($$...$$)', where: (el.textContent || '').slice(0, 40) });
  }
  const missing = [];
  for (const f of document.fonts) if (f.status === 'error') missing.push(f.family);
  if (missing.length) problems.push({ type: 'font-error', msg: 'fonts failed to load: ' + [...new Set(missing)].join(', ') });
  return { problems, fixedPages: pageEls.length };
}

// Reads the PDF outline (bookmarks Chromium generates from h1-h6) -> 1-based page number per heading, in order.
export async function outlinePages(pdfPath) {
  const { PDFDocument, PDFName, PDFDict, PDFArray, PDFRef } = await import('pdf-lib');
  const { readFileSync } = await import('node:fs');
  const doc = await PDFDocument.load(readFileSync(pdfPath));
  const refs = doc.getPages().map((p) => p.ref.toString());
  const out = [];
  const root = doc.catalog.lookupMaybe(PDFName.of('Outlines'), PDFDict);
  if (!root) return out;
  const walk = (item) => {
    for (let it = item; it; it = it.lookupMaybe(PDFName.of('Next'), PDFDict)) {
      let dest = it.lookup(PDFName.of('Dest'));
      if (!dest) { const a = it.lookupMaybe(PDFName.of('A'), PDFDict); dest = a && a.lookup(PDFName.of('D')); }
      let idx = -1;
      if (dest instanceof PDFArray) idx = refs.indexOf(dest.get(0).toString());
      out.push(idx + 1);
      const first = it.lookupMaybe(PDFName.of('First'), PDFDict);
      if (first) walk(first);
    }
  };
  const first = root.lookupMaybe(PDFName.of('First'), PDFDict);
  if (first) walk(first);
  return out;
}
