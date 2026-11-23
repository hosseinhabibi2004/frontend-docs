// Programmatic API: buildFile({ input, out, template, lang, dir, size, htmlOnly })
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, basename, join, extname } from 'node:path';
import { buildHtml } from './build.mjs';
import { renderPdf, outlinePages } from './pdf.mjs';

export async function buildFile({ input, out, template, lang, dir, size, htmlOnly = false, log = () => {} }) {
  input = resolve(input);
  const source = readFileSync(input, 'utf8');
  const isHtml = extname(input) === '.html';
  const overrides = {};
  for (const [k, v] of Object.entries({ template, lang, dir, size })) if (v) overrides[k] = v;
  const base = { source, isHtml, overrides, baseDir: dirname(input) };
  let built = buildHtml(base);
  const pdf = resolve(out || join(dirname(input), basename(input, extname(input)) + '.pdf'));
  const htmlPath = pdf.replace(/\.pdf$/, '.html');
  mkdirSync(dirname(pdf), { recursive: true });
  writeFileSync(htmlPath, built.html);
  if (htmlOnly) return { html: htmlPath, pdf: null, built, problems: [], warnings: built.warnings };
  let report = await renderPdf({ htmlPath, pdfPath: pdf, viewport: built.viewport });
  const warnings = [...built.warnings];
  if (built.tocEntries.length) {
    // table of contents: page numbers come from the PDF outline; re-render until stable
    let prev = null;
    for (let pass = 0; pass < 3; pass++) {
      const pages = await outlinePages(pdf);
      if (pages.length !== built.headingCount) warnings.push(`TOC: expected ${built.headingCount} headings in PDF outline, found ${pages.length}; page numbers may be wrong`);
      if (prev && prev.join() === pages.join()) break;
      prev = pages;
      built = buildHtml({ ...base, tocPages: pages });
      writeFileSync(htmlPath, built.html);
      report = await renderPdf({ htmlPath, pdfPath: pdf, viewport: built.viewport });
    }
  }
  return { html: htmlPath, pdf, built, problems: report.problems, warnings };
}
