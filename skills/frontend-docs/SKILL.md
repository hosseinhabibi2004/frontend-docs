---
name: frontend-docs
description: Create a print-ready PDF document from anything the user has: the conversation so far, rough notes, a topic, data, pasted text, files, or a Markdown/HTML file. 31 templates (reports, papers, theses, lecture notes, proposals, contracts, business plans, résumés, letters, invoices, certificates, posters, menus, planners, newsletters...), LaTeX math, highlighted code, 77 bundled open-source fonts, and true LTR/RTL layout (Persian, Arabic, Urdu, Hebrew, Hindi, English and more). Use when the user wants a document, report, summary, handout or PDF, including "turn this chat into a document". No input file is required.
---

# Frontend Docs

Turn anything the user has (the conversation so far, notes, a topic, data, files) into a paginated PDF: real fixed-size pages (A4 default), vector selectable text, KaTeX math, bundled open-source fonts, correct RTL shaping. No network needed at build time.

All commands run from this skill's directory (the folder containing this `SKILL.md`). First time: `npm install` and, if Chromium is missing, `npx playwright install chromium`.

## Core principles
1. **Pages never mix.** Output is real paged media (`@page`). Cover pages and `::: page` blocks are fixed-size and must fit; the build audits overflow, wide code/math, and font loading, and fails with `--strict`.
2. **Show, don't tell.** Render 3 first-page previews of the user's real content in 3 different templates and let them choose.
3. **Language first.** Detect language/direction from the content. Never reflow RTL as LTR. Code and math stay LTR isolates inside RTL text.
4. **Quiet, distinctive design.** Documents are read, not presented: restrained color, strong typography, no generic look.

## Workflow
1. **Find the source. Do not ask for an input file when the material is already in the chat.**
   - *Conversation*: "this", "what we discussed", "turn our chat into..." or no file given. Use the chat history as the source.
   - *Notes, pasted text, data, uploaded files*: read them and restructure.
   - *Topic only*: draft the content yourself.
   - *A `.md` / `.html` file*: use it as is.
2. **Ask everything together** (one message, use a structured-question UI if available):
   - What the document is and who reads it (see the recipes below)
   - Language(s) (default: the language of the conversation); mixed direction?
   - Page size (A4 default; Letter, A5, A3, custom `"210mm 297mm"`) and orientation
   - Cover page? Table of contents? Page numbers? Persian/Arabic digits?
3. **Write the content** as Markdown with front matter in the working directory (for example `doc.md`; see the syntax below).
   - Restructure, don't transcribe. Keep decisions, numbers, names, code and formulas exactly; drop greetings, retries and side tracks.
   - Give it a real title block (`title`, `subtitle`, `author`, `date`) and a structure that matches the document type.
   - Invent nothing. If a fact is missing (a date, an amount, a name), ask or leave a visible placeholder.
   - For anything longer than two pages, show the outline and wait for a yes before building.
4. **Pick 3 templates** that fit the type but differ in mood (`node engine/cli.mjs templates`, or read `templates/*/template.json`: `mood`, `best_for`). Build previews with the real content:
   `node engine/cli.mjs build doc.md --template <id> -o out/preview-<id>.pdf`
   then rasterize page 1 (`pdftoppm -r 80 -png -f 1 -l 1 -singlefile out/preview-<id>.pdf out/preview-<id>`), show the images, and wait for a choice. Do not skip this step.
5. **Build the final** with `--strict`. Fix every reported problem (wide code, oversized images, fixed-page overflow, missing fonts) by editing content, never by disabling the check. Look at the page PNGs yourself (RTL direction, math, code, tables, cover) before delivering.
6. Deliver the PDF path (and the Markdown source, so the user can edit and rebuild).

### Document recipes
| The user says | Template | Shape of the content |
|---|---|---|
| "summarize this chat", "brief for the team" | `report` or `minutes` | title, 3-5 line summary, decisions, open questions, next steps |
| "meeting minutes / action items" | `minutes` | attendees, agenda, decisions table, checkbox actions with owners and dates |
| "study notes / handout from this lesson" | `course-notes`, `lecture` | chapters, definitions, worked examples, exercises |
| "write a paper / article" | `paper`, `journal` | abstract, numbered sections, equations, references |
| "proposal / pitch / plan" | `proposal`, `business-plan` | problem, solution, scope, timeline, costs |
| "report with data" | `report`, `whitepaper`, `lab-report` | executive summary, findings with tables, method, conclusion |
| "cheat sheet / quick reference" | `cheatsheet` | dense sections, code and formula snippets |
| "résumé / CV" from the user's facts | `resume-sidebar`, `resume-classic`, `resume` | profile, skills, experience with dates, education |
| "letter", "invoice", "contract" | `letter`, `invoice`, `contract` | fixed fields first, then body; confirm names and amounts |
| "certificate, invitation, poster, menu, brochure" | the template of the same name | short text, one page per side |
| "exam / worksheet / syllabus" | `worksheet`, `syllabus` | numbered questions with answer areas, or a week grid |

## CLI
```
node engine/cli.mjs build <file.md|file.html> [-o out.pdf] [--template id] [--lang fa|ar|en|he|ur|hi|...]
     [--dir rtl|ltr] [--size A4|Letter|A5|A3|"w h"] [--html-only] [--strict]
node engine/cli.mjs templates
npm test            # builds every template x language and fails on layout problems
npm run gallery     # regenerates README screenshots (needs poppler)
```
Programmatic: `import { buildFile } from './engine/api.mjs'`.

## Authoring format (Markdown)
Front matter keys: `title, subtitle, kicker, author, org, date, lang, dir, template, size, landscape, digits (latin|persian|arabic), toc (true), toc-depth, cover (false), pagenumbers (false), margin`.

- **Math:** `$inline$`, `$$display$$` (KaTeX, pre-rendered, offline).
- **Code:** fenced blocks with a language (highlight.js); `inline code`. Always LTR mono, wrapped, never overflows.
- **Callouts:** `::: note|tip|warning|danger|definition|theorem|lemma|proof|example|exercise|answer|abstract [custom title]` … `:::` (titles localized: en, fa, ar, he, ur, hi, zh).
- **Layout containers:** `::: page` (fixed page), `::: columns` with `::: col` children (outer fence needs more colons: `:::: columns` / `::: col` / `::::`), `::: avoid-break`. Any other `::: name` becomes `<div class="name">` (templates style some, e.g. `sender`, `total`).
- **Split headings:** `### Left part || Right part` renders two spans on one line (job and place, school and dates).
- **Figures:** a paragraph that is only an image, `![caption with $math$](fig.svg)`, becomes `<figure>` with a caption; relative paths resolve against the source file.
- **More callouts:** `simple` ("in plain words"), `correction`, `remark`. Front matter: `by`, `note` (extra cover lines), `header` (running head text where the template enables it).
- Footnotes `[^1]`, tables, images, blockquotes standard. Raw HTML allowed. `\n---\n` is a horizontal rule, not a page break; for a forced page break use `<div class="pagebreak"></div>`.
- `toc: true` adds a table of contents with real page numbers (read back from the PDF outline).
- Mixed-direction text works: blocks use `dir="auto"`, digits convert per `digits`.

## Templates (31) — `templates/<id>/template.json` + `template.css`
| id | type | page |
|---|---|---|
| `paper` | academic paper, essay (calm serif) | A4 |
| `journal` | two-column journal/conference article | A4 |
| `thesis` | dissertation, chapter openers, 1.65 spacing | A4 |
| `report` | business report, accent cover | A4 |
| `proposal` | proposal / pitch, split cover | A4 |
| `whitepaper` | dark authoritative cover, serif body | A4 |
| `tech` | API docs / runbook, dark code blocks | A4 |
| `lecture` | lecture notes, numbered sections, example/exercise boxes | A4 |
| `worksheet` | exercises with ruled answer areas (`::: exercise` + `::: answer`) | A4 |
| `textbook` | book chapters, drop caps | A5 |
| `booklet` | manual with numbered steps | A5 |
| `cheatsheet` | dense 3-column reference | A4 landscape |
| `newsletter` | magazine masthead, 2 columns | A4 |
| `minutes` | meeting minutes, checkbox actions | A4 |
| `resume` | one-page CV: `::: page` > `:::: columns` > two `::: col` | A4 |
| `letter` | `::: sender`, `::: date`, `::: recipient`, `::: subject`, `::: signature` | A4 |
| `invoice` | `<div class="meta">`, table, `<div class="total">` (+ `.grand`), `::: note` | A4 |
| `certificate` | landscape, `::::: cert` with `.name`, `.sign` | A4 landscape |
| `poster` | `.poster-top`, `.poster-body`, `.poster-foot` | A3 |
| `menu` | table with empty header: name / description / price | A5 |
| `contract` | legal agreement: auto-numbered clauses (1.1, 1.2) hang in the gutter; `<div class="parties">`, `<div class="signatures">`; initials boxes in every footer | A4 |
| `business-plan` | graph-paper cover with spine, chapter bands, ledger tables (numbers right-aligned, last row = total) | A4 |
| `brochure` | riso tri-fold, two `::: page` sides of `<div class="panels">` with 3 `.panel` (`.cover-panel`, `.tint`, `.pinkpanel`, `.dot`) | A4 landscape |
| `invitation` | cut-paper card: `<div class="art">` shapes, `# title`, `.details` grid (`span.k` + `b`), `.rsvp` | A5 |
| `syllabus` | course code masthead (`kicker`), week grid table, `<mark>` highlights deadlines | A4 |
| `lab-report` | edge ruler, numbered equations `(n)`, figure captions, booktabs tables | A4 |
| `case-study` | pomegranate hero, `<div class="snapshot">` sidebar (list of `**Label** value`), pull-quote blockquotes | A4 |
| `resume-sidebar` | navy sidebar CV: `::::: page` > `:::: columns` > sidebar `::: col` (`# name`, role, chips list + `{.chips}`, skills `- **x**  \n  *y*`, `.edu`, links) and main `::: col` (`::: entry` with `### Title \|\| dates`, `Org {.org}`) | A4 |
| `resume-classic` | single-column ATS CV: `# First **Last**`, role line, contact line, `## Technical Skills` table (empty header), `### Org \|\| place`, `#### Role \|\| dates`, bullets with **bold** keywords | A4 |
| `course-notes` | RTL-first lecture notes: cover (`kicker`, `subtitle`, `by`, `note`), `toc: true`, `# Chapter` becomes an orange card with a numbered disc, `::: definition/theorem/lemma/example` get auto numbers (0.3), `::: simple` (run-in "in plain words"), `::: correction`, figures `![caption](img.svg)` numbered per chapter | A4 |
| `planner` | dot-grid month planner: 7-column table followed by a blank line and `{.cal}`, then `:::: columns` for goals/habits | A4 landscape |
Attach a class to a Markdown table with `{.cal}` on its own line after a **blank line** (markdown-it-attrs). See `examples/<template>/` (special layouts) and `examples/shared/` (flow documents, en/fa/ar/he/ur/hi) for working markup. Fixed-page templates (`resume, certificate, poster, menu, brochure, invitation`) must fit on one page; the audit reports overflow.

## Languages and fonts (all OFL / open source / public domain, bundled in `fonts/`, 77 families)
Full guide: `references/typography.md`; specimen of every family and pairing: `docs/specimen.pdf` (`node scripts/specimen.mjs`).
- **Latin / Cyrillic / Greek / Vietnamese:** Source Serif 4, Literata, Libre Caslon Text, Fraunces, Playfair Display, Cormorant Garamond, Gloock, Archivo Black, Bricolage Grotesque, Schibsted Grotesk, IBM Plex Sans, Barlow Condensed, Caveat; mono: JetBrains Mono, IBM Plex Mono, DM Mono; math: KaTeX.
- **Persian / Arabic / Urdu / Pashto / Kurdish:** Vazirmatn, Estedad, Sahel, Shabnam, Samim, Parastoo, Gandom, Tanha, Mirza, Markazi Text, Noto Naskh Arabic, Amiri, Lateef, Scheherazade New, Noto Sans Arabic, IBM Plex Sans Arabic, Cairo, Readex Pro, Almarai, El Messiri, Noto Kufi Arabic, Reem Kufi, Lalezar, Rakkas, Katibeh, Noto Nastaliq Urdu, Gulzar.
- **Hebrew:** Frank Ruhl Libre, David Libre, Noto Serif/Sans Hebrew, Heebo, Assistant, Suez One, Secular One.
- **Indic, Thai, Caucasus:** Devanagari (Noto, Tiro, Hind, Eczar), Bengali, Tamil, Telugu, Gujarati, Gurmukhi, Kannada, Malayalam, Thai, Georgian, Armenian (Noto).
- CJK is opt-in (large): `node scripts/build-fonts.mjs --add noto-sans-sc --subsets chinese-simplified --weights 400,700` (and `noto-serif-sc`, `-jp`, `-kr`, `-tc`); the build prints the exact command when a CJK language is used without fonts.
- **Per-language fonts are automatic.** Each template declares `style` (`serif|sans`), optional `display` (`loud|elegant|hand`) and `langFonts` overrides; the engine resolves text/title/ui fonts, leading, justification, emphasis style, digits and quotes per language (`engine/i18n.mjs`: `FONT_SETS`, `SCRIPT_TRAITS`, `QUOTES`). Do not hard-code Persian/Arabic font names in template CSS: use `var(--text-font)`, `var(--title-font)`, `var(--ui-font)`, `var(--font-mono-ui)`, and `var(--lang-title-wt)` for display weights.
- **Mixed-language documents:** `::: lang he` … `:::` switches fonts, leading, direction and rules for that block (`examples/features/scripts.md` shows 21 languages).
- Add any other Fontsource family with `node scripts/build-fonts.mjs --add <id>`; tune `adjust` (size-adjust) for Arabic-script faces.

## Editing / adding templates
- **Design for the subject, not for a style.** Each template needs a point of view drawn from the document's own world (legal pad rule, lab ruler, riso overprint, dot-grid), a named palette (4-6 hex), a deliberate type pairing and ONE signature detail. Avoid the generic defaults: cream paper + terracotta + high-contrast serif, near-black + acid accent, hairline broadsheet columns, purple gradients, Inter/Roboto/Space Grotesk. Structural devices (numbers, rules, labels) must encode something true about the content.
- **Typography checklist** (`references/typography.md`): roles (text/title/ui/mono), modular scale via `--size`/`--ratio`, no generic or system fonts inside stacks, labels in mono use `--font-mono-ui`, uppercase/tracking only for Latin labels (the engine neutralizes them for Arabic/Indic scripts), no glyphs outside bundled subsets (draw shapes with CSS instead of `■ ☐ →`).
- Chromium clips print content to the page content box: backgrounds and rules cannot bleed into @page margins (only a `page: cover` with margin 0 can). Keep decoration inside the content area, or use a zero-margin fixed page.
- Templates set variables and accents on top of `base/base.css`; use CSS logical properties (`inline-start`, `padding-inline-start`...), never `left/right`, so RTL works.
- No external URLs; fonts only from `fonts/`. Keep letter-spacing/uppercase off for Arabic-script text (see existing `:lang(fa)` overrides).
- Every template needs `template.json` (`name, description, mood, best_for, size, margin, cover: none|plain|band|split|dark|inline, pagenumbers`, optional `landscape`).
- Run `npm test` and look at the screenshots (`npm run gallery`) before committing.

## Known limits
Absolute decorations that extend past a fixed page keep the page scrollable, so wrap them in an `overflow:clip` container (see `invitation`). Chromium cannot generate a PDF table of contents without a second pass (handled automatically). Raw-HTML input has no automatic TOC. Very wide tables/code are wrapped or flagged, not scaled. 
