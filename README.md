# Frontend Docs

**Create beautiful, print-ready PDF documents from a chat, notes or a topic, using a coding agent's frontend skills.**

A skill for coding agents that turns whatever you have into a PDF you can print or send: the conversation you just had, a few notes, a topic, a table of numbers, or a Markdown file. Choose from 31 templates, write in more than 20 languages, and get real pages with real text instead of screenshots.

<p>
  <img src="docs/screenshots/report-fa-1.png" width="24%" alt="Report template, Persian cover" />
  <img src="docs/screenshots/paper-en-1.png" width="24%" alt="Paper template, English" />
  <img src="docs/screenshots/course-notes-fa-3.png" width="24%" alt="Course notes template, Persian chapter page" />
  <img src="docs/screenshots/resume-sidebar-en-1.png" width="24%" alt="Sidebar résumé template, English" />
</p>

## What this does

You don't need a finished file. Say what you want ("turn this chat into a one-page summary for my team", "write a Persian lab report from what we just measured", "make an invoice with these numbers") and the agent works out the rest:

1. It looks at what you gave it: the chat so far, pasted notes, files, or only a topic.
2. It asks what the document is for, which language, and what page size, in a single message.
3. If you didn't supply the content, it writes it, and shows an outline first when the document is long.
4. It renders the first page in three different templates with your real content, so you pick by looking.
5. It builds the PDF, checks every page for overflow and missing fonts, and shows you the result.

### Key features

- **Starts from anything.** Chat history, notes, a topic, data, files, Markdown or HTML.
- **31 templates.** Papers, theses, lecture notes, reports, proposals, contracts, résumés, invoices, certificates, posters, menus, planners and more.
- **Real pages.** A4, Letter, A5, A3 or a custom size, with selectable text, bookmarks and working links. Fixed pages such as covers, résumés and certificates can't spill over: the build fails instead of cutting text.
- **Math and code.** LaTeX through KaTeX, and highlighted code in mono fonts that wraps instead of running off the page.
- **Right-to-left that holds up.** Persian, Arabic, Urdu, Hebrew and others. Phone numbers, Latin words and formulas inside RTL text stay in order.
- **Fonts included.** 77 open-source families are bundled, so nothing is downloaded when you build. A Persian report is set in Estedad, a Persian paper in Parastoo and Mirza, a poster in Lalezar.
- **Contents and figures.** A table of contents with real page numbers, and figures numbered per chapter.

## Installation

### Claude Code plugin

Run these as two separate messages:

```text
/plugin marketplace add https://github.com/hosseinhabibi2004/frontend-docs
```

```text
/plugin install frontend-docs@frontend-docs
```

Then use it with `/frontend-docs:frontend-docs`.

### Manual

```bash
git clone https://github.com/hosseinhabibi2004/frontend-docs.git
cp -R frontend-docs/skills/frontend-docs ~/.claude/skills/frontend-docs
cd ~/.claude/skills/frontend-docs && npm install && npx playwright install chromium
```

Then type `/frontend-docs` in Claude Code.

### Other agents

Point the agent at `skills/frontend-docs/SKILL.md`. It needs a shell, Node.js 18 or newer, and Chromium (installed through Playwright). `pdftoppm` from poppler is optional; it is only used to preview pages.

## Usage

### From a conversation

```text
/frontend-docs

> Turn what we just discussed into a one-page brief I can send to the team.
```

The agent reads the chat, keeps the decisions and numbers, drops the small talk, and picks a template that fits. Say "as meeting minutes", "as a report" or "as a cheat sheet" to steer it.

### From notes, files or a topic

```text
> Here are my notes from today's lecture. Make a Persian handout.
> Write a two-page proposal for a refill-and-return packaging startup.
> Make an invoice for 3 days of consulting at 12,000,000 rials per day.
```

### From a Markdown file

```bash
cd skills/frontend-docs
node engine/cli.mjs templates
node engine/cli.mjs build notes.md --template thesis --lang ar --size Letter --strict
```

<details>
<summary>Markdown syntax</summary>

````markdown
---
title: Quarterly report
lang: en            # fa, ar, ur, he, hi, ... sets direction, fonts and digits
template: report
toc: true
---

# Summary
Inline math $E=mc^2$, display math $$\int_0^\infty e^{-x^2}dx = \frac{\sqrt\pi}{2}$$

::: theorem
Callouts: note, tip, warning, danger, definition, theorem, lemma, proposition, proof, example,
exercise, answer, abstract, simple, correction
:::

![A caption, with $math$ if you like](figure.svg)

### Acme Ltd || Berlin
```python
print("code is always left-to-right mono")
```
````

`Left || Right` in a heading puts the two parts on one line. A paragraph that is only an image becomes a numbered figure.

</details>

## Templates

Each template has its own palette, type pairing and one detail that belongs to that kind of document: a margin rule and hanging clause numbers on the contract, a millimetre ruler down the lab report, risograph overprint on the brochure, a dot grid behind the planner. Screenshots below are real output (English, Persian and, where available, Arabic).

<!-- GALLERY:START -->
### Booklet / Manual — `booklet`

<p>
  <img src="docs/screenshots/booklet-en-1.png" width="32.5%" alt="Booklet / Manual (EN) page 1" />
  <img src="docs/screenshots/booklet-en-2.png" width="32.5%" alt="Booklet / Manual (EN) page 2" />
  <img src="docs/screenshots/booklet-fa-1.png" width="32.5%" alt="Booklet / Manual (FA) page 1" />
</p>

> A5 user manual: big numbered steps, safety callouts, chapter bands and plenty of margin for binding.
>
> **Best for:** user manual, quick-start guide, instruction booklet, handbook · **Page:** A5 · **Mood:** approachable, practical

### Brochure (tri-fold) — `brochure`

<p>
  <img src="docs/screenshots/brochure-en-1.png" width="32.5%" alt="Brochure (tri-fold) (EN) page 1" />
  <img src="docs/screenshots/brochure-en-2.png" width="32.5%" alt="Brochure (tri-fold) (EN) page 2" />
  <img src="docs/screenshots/brochure-fa-1.png" width="32.5%" alt="Brochure (tri-fold) (FA) page 1" />
</p>

> Risograph-style tri-fold: two-ink overprint circles, halftone dots, fold ticks, Archivo Black headlines. Two A4 landscape sides (outside / inside).
>
> **Best for:** brochure, tri-fold flyer, program leaflet, service overview · **Page:** A4 landscape · **Mood:** playful, printed

### Business Plan — `business-plan`

<p>
  <img src="docs/screenshots/business-plan-en-1.png" width="32.5%" alt="Business Plan (EN) page 1" />
  <img src="docs/screenshots/business-plan-en-2.png" width="32.5%" alt="Business Plan (EN) page 2" />
  <img src="docs/screenshots/business-plan-fa-1.png" width="32.5%" alt="Business Plan (FA) page 1" />
</p>

> Bound venture-book look: graph-paper cover with a pine spine, full-bleed chapter bands with real chapter numbers, ledger-style financial tables.
>
> **Best for:** business plan, investor memo, feasibility study, grant narrative · **Page:** A4 · **Mood:** serious, structured

### Case Study — `case-study`

<p>
  <img src="docs/screenshots/case-study-en-1.png" width="49%" alt="Case Study (EN) page 1" />
  <img src="docs/screenshots/case-study-fa-1.png" width="49%" alt="Case Study (FA) page 1" />
</p>

> Client case study: pomegranate hero block with a heavy grotesque title, a pistachio Snapshot sidebar, and pull-quotes that break the column.
>
> **Best for:** case study, project write-up, client story, portfolio piece · **Page:** A4 · **Mood:** editorial, persuasive

### Certificate — `certificate`

<p>
  <img src="docs/screenshots/certificate-en-1.png" width="49%" alt="Certificate (EN) page 1" />
  <img src="docs/screenshots/certificate-fa-1.png" width="49%" alt="Certificate (FA) page 1" />
</p>

> Landscape A4 certificate with a double ornamental border, centered display type and signature lines.
>
> **Best for:** certificate, award, diploma, recognition · **Page:** A4 landscape · **Mood:** ceremonial, elegant

### Cheat Sheet — `cheatsheet`

<p>
  <img src="docs/screenshots/cheatsheet-en-1.png" width="32.5%" alt="Cheat Sheet (EN) page 1" />
  <img src="docs/screenshots/cheatsheet-fa-1.png" width="32.5%" alt="Cheat Sheet (FA) page 1" />
  <img src="docs/screenshots/cheatsheet-ar-1.png" width="32.5%" alt="Cheat Sheet (AR) page 1" />
</p>

> Dense landscape reference card: 3 columns, tiny type, colored section heads, compact code and tables.
>
> **Best for:** cheat sheet, quick reference, formula sheet, cribs · **Page:** A4 landscape · **Mood:** dense, utilitarian

### Contract — `contract`

<p>
  <img src="docs/screenshots/contract-en-1.png" width="49%" alt="Contract (EN) page 1" />
  <img src="docs/screenshots/contract-fa-1.png" width="49%" alt="Contract (FA) page 1" />
</p>

> Legal agreement: double red margin rule, clause numbers hanging in the gutter (1.1, 1.2), defined terms in small caps, initials boxes on every page.
>
> **Best for:** contract, NDA, service agreement, terms and conditions · **Page:** A4 · **Mood:** formal, exacting

### Course notes — `course-notes`

<p>
  <img src="docs/screenshots/course-notes-fa-3.png" width="32.5%" alt="Course notes (FA) page 3" />
  <img src="docs/screenshots/course-notes-en-3.png" width="32.5%" alt="Course notes (EN) page 3" />
  <img src="docs/screenshots/course-notes-fa-1.png" width="32.5%" alt="Course notes (FA) page 1" />
</p>

> Lecture-notes book in the style of a university handout: minimal cover, teal contents page, orange chapter cards with a numbered disc, numbered definition boxes, run-in 'in plain words' callouts and auto-numbered figures. Built for RTL.
>
> **Best for:** course notes, lecture handout, study guide, math notes, textbook draft · **Page:** A4 · **Mood:** friendly, academic

### Invitation — `invitation`

<p>
  <img src="docs/screenshots/invitation-en-1.png" width="49%" alt="Invitation (EN) page 1" />
  <img src="docs/screenshots/invitation-fa-1.png" width="49%" alt="Invitation (FA) page 1" />
</p>

> A5 invitation as a cut-paper collage: ultramarine, sun and leaf shapes behind a Gloock headline; details set small and exact.
>
> **Best for:** invitation, event card, wedding card, announcement · **Page:** A5 · **Mood:** festive, handmade

### Invoice — `invoice`

<p>
  <img src="docs/screenshots/invoice-en-1.png" width="49%" alt="Invoice (EN) page 1" />
  <img src="docs/screenshots/invoice-fa-1.png" width="49%" alt="Invoice (FA) page 1" />
</p>

> Clean invoice: header with number and dates, itemized table with right-aligned amounts, bold total.
>
> **Best for:** invoice, quote, receipt, statement · **Page:** A4 · **Mood:** precise, neutral

### Journal (2-column) — `journal`

<p>
  <img src="docs/screenshots/journal-en-1.png" width="32.5%" alt="Journal (2-column) (EN) page 1" />
  <img src="docs/screenshots/journal-fa-1.png" width="32.5%" alt="Journal (2-column) (FA) page 1" />
  <img src="docs/screenshots/journal-ar-1.png" width="32.5%" alt="Journal (2-column) (AR) page 1" />
</p>

> Two-column journal article with a full-width title block, compact 9pt text and tight figures.
>
> **Best for:** journal paper, conference paper, preprint, article · **Page:** A4 · **Mood:** dense, academic

### Lab Report — `lab-report`

<p>
  <img src="docs/screenshots/lab-report-en-1.png" width="49%" alt="Lab Report (EN) page 1" />
  <img src="docs/screenshots/lab-report-fa-1.png" width="49%" alt="Lab Report (FA) page 1" />
</p>

> Scientific lab report: a millimetre ruler runs down every page edge, equations carry (n) numbers, tables are booktabs-style with units.
>
> **Best for:** lab report, experiment write-up, data report, technical note · **Page:** A4 · **Mood:** empirical, precise

### Lecture Notes — `lecture`

<p>
  <img src="docs/screenshots/lecture-en-1.png" width="32.5%" alt="Lecture Notes (EN) page 1" />
  <img src="docs/screenshots/lecture-en-2.png" width="32.5%" alt="Lecture Notes (EN) page 2" />
  <img src="docs/screenshots/lecture-fa-1.png" width="32.5%" alt="Lecture Notes (FA) page 1" />
</p>

> Friendly study notes: sans body, bold numbered sections, strong definition/example/exercise boxes.
>
> **Best for:** lecture notes, course handout, study guide, tutorial · **Page:** A4 · **Mood:** friendly, clear

### Letter — `letter`

<p>
  <img src="docs/screenshots/letter-en-1.png" width="49%" alt="Letter (EN) page 1" />
  <img src="docs/screenshots/letter-fa-1.png" width="49%" alt="Letter (FA) page 1" />
</p>

> Formal business letter: sender block, recipient, subject line and signature space, on a quiet letterhead.
>
> **Best for:** business letter, cover letter, notice, official correspondence · **Page:** A4 · **Mood:** formal, personal

### Menu — `menu`

<p>
  <img src="docs/screenshots/menu-en-1.png" width="49%" alt="Menu (EN) page 1" />
  <img src="docs/screenshots/menu-fa-1.png" width="49%" alt="Menu (FA) page 1" />
</p>

> A5 restaurant/cafe menu: Cormorant display type, dotted price leaders, two-column sections, warm paper tone.
>
> **Best for:** menu, price list, tasting card, program · **Page:** A5 · **Mood:** warm, elegant

### Meeting Minutes — `minutes`

<p>
  <img src="docs/screenshots/minutes-en-1.png" width="32.5%" alt="Meeting Minutes (EN) page 1" />
  <img src="docs/screenshots/minutes-en-2.png" width="32.5%" alt="Meeting Minutes (EN) page 2" />
  <img src="docs/screenshots/minutes-fa-1.png" width="32.5%" alt="Meeting Minutes (FA) page 1" />
</p>

> Compact minutes sheet: attendee strip, decision/action tables, checkbox-style actions, minimal ornamentation.
>
> **Best for:** meeting minutes, status notes, decision log, agenda · **Page:** A4 · **Mood:** neutral, efficient

### Newsletter — `newsletter`

<p>
  <img src="docs/screenshots/newsletter-en-1.png" width="32.5%" alt="Newsletter (EN) page 1" />
  <img src="docs/screenshots/newsletter-en-2.png" width="32.5%" alt="Newsletter (EN) page 2" />
  <img src="docs/screenshots/newsletter-fa-1.png" width="32.5%" alt="Newsletter (FA) page 1" />
</p>

> Magazine-style newsletter: masthead with rules, two-column body, bold section heads and boxed callouts.
>
> **Best for:** newsletter, magazine, bulletin, company update · **Page:** A4 · **Mood:** editorial, lively

### Paper — `paper`

<p>
  <img src="docs/screenshots/paper-en-1.png" width="32.5%" alt="Paper (EN) page 1" />
  <img src="docs/screenshots/paper-en-2.png" width="32.5%" alt="Paper (EN) page 2" />
  <img src="docs/screenshots/paper-fa-1.png" width="32.5%" alt="Paper (FA) page 1" />
</p>

> Quiet academic paper: serif text, centered abstract, justified body, numbered pages.
>
> **Best for:** academic paper, thesis chapter, lecture notes, essay · **Page:** A4 · **Mood:** calm, scholarly

### Planner — `planner`

<p>
  <img src="docs/screenshots/planner-en-1.png" width="49%" alt="Planner (EN) page 1" />
  <img src="docs/screenshots/planner-fa-1.png" width="49%" alt="Planner (FA) page 1" />
</p>

> Monthly planner on a bullet-journal dot grid: handwritten month heading, tall calendar cells with weekend tints, habit tracker bubbles.
>
> **Best for:** monthly planner, weekly planner, habit tracker, schedule · **Page:** A4 landscape · **Mood:** organized, personal

### Poster — `poster`

<p>
  <img src="docs/screenshots/poster-en-1.png" width="49%" alt="Poster (EN) page 1" />
  <img src="docs/screenshots/poster-fa-1.png" width="49%" alt="Poster (FA) page 1" />
</p>

> A3 poster: oversized headline on a solid color field, one-line takeaways and a footer strip for details.
>
> **Best for:** poster, event flyer, announcement, conference poster · **Page:** A3 · **Mood:** loud, creative

### Proposal — `proposal`

<p>
  <img src="docs/screenshots/proposal-en-1.png" width="32.5%" alt="Proposal (EN) page 1" />
  <img src="docs/screenshots/proposal-en-2.png" width="32.5%" alt="Proposal (EN) page 2" />
  <img src="docs/screenshots/proposal-fa-1.png" width="32.5%" alt="Proposal (FA) page 1" />
</p>

> Confident proposal: split-color cover with a vertical accent block, airy sans body, pull-out callouts.
>
> **Best for:** project proposal, pitch document, grant application, RFP response · **Page:** A4 · **Mood:** bold, modern

### Report — `report`

<p>
  <img src="docs/screenshots/report-en-1.png" width="32.5%" alt="Report (EN) page 1" />
  <img src="docs/screenshots/report-en-2.png" width="32.5%" alt="Report (EN) page 2" />
  <img src="docs/screenshots/report-fa-1.png" width="32.5%" alt="Report (FA) page 1" />
</p>

> Modern business report with a full-bleed accent cover, sans body and strong section rhythm.
>
> **Best for:** business report, status update, annual review, proposal · **Page:** A4 · **Mood:** confident, clean

### Résumé — `resume`

<p>
  <img src="docs/screenshots/resume-en-1.png" width="49%" alt="Résumé (EN) page 1" />
  <img src="docs/screenshots/resume-fa-1.png" width="49%" alt="Résumé (FA) page 1" />
</p>

> One-page CV with a tinted sidebar column and a clean main column; fixed single page, no overflow.
>
> **Best for:** resume, CV, portfolio sheet, bio · **Page:** A4 · **Mood:** clean, personal

### Résumé · Classic ATS — `resume-classic`

<p>
  <img src="docs/screenshots/resume-classic-en-1.png" width="49%" alt="Résumé · Classic ATS (EN) page 1" />
  <img src="docs/screenshots/resume-classic-fa-1.png" width="49%" alt="Résumé · Classic ATS (FA) page 1" />
</p>

> Dense single-column CV that parses cleanly in applicant-tracking systems: centred light/bold name, small-caps subtitle, ruled section headings, a label/skills table and two-line experience headers.
>
> **Best for:** resume, CV, applicant tracking system, engineer CV · **Page:** A4 · **Mood:** compact, technical

### Résumé · Navy sidebar — `resume-sidebar`

<p>
  <img src="docs/screenshots/resume-sidebar-en-1.png" width="49%" alt="Résumé · Navy sidebar (EN) page 1" />
  <img src="docs/screenshots/resume-sidebar-fa-1.png" width="49%" alt="Résumé · Navy sidebar (FA) page 1" />
</p>

> One-page CV with a full-height navy sidebar (name, grey contact chips, skills, education, languages, links) and a quiet main column with dot-marked experience entries.
>
> **Best for:** resume, CV, engineer profile, portfolio sheet · **Page:** A4 · **Mood:** calm, professional

### Syllabus — `syllabus`

<p>
  <img src="docs/screenshots/syllabus-en-1.png" width="49%" alt="Syllabus (EN) page 1" />
  <img src="docs/screenshots/syllabus-fa-1.png" width="49%" alt="Syllabus (FA) page 1" />
</p>

> Course syllabus: oversized condensed course code, a week-by-week grid with a thick top rule, and highlighter-pen marks for deadlines.
>
> **Best for:** syllabus, course outline, lesson plan, training program · **Page:** A4 · **Mood:** academic, practical

### Tech Doc — `tech`

<p>
  <img src="docs/screenshots/tech-en-1.png" width="32.5%" alt="Tech Doc (EN) page 1" />
  <img src="docs/screenshots/tech-en-2.png" width="32.5%" alt="Tech Doc (EN) page 2" />
  <img src="docs/screenshots/tech-fa-1.png" width="32.5%" alt="Tech Doc (FA) page 1" />
</p>

> Technical documentation: sans text, large mono code blocks, admonitions, API-style headings.
>
> **Best for:** API docs, README to PDF, runbook, engineering spec · **Page:** A4 · **Mood:** precise, developer

### Textbook — `textbook`

<p>
  <img src="docs/screenshots/textbook-en-1.png" width="32.5%" alt="Textbook (EN) page 1" />
  <img src="docs/screenshots/textbook-en-2.png" width="32.5%" alt="Textbook (EN) page 2" />
  <img src="docs/screenshots/textbook-fa-1.png" width="32.5%" alt="Textbook (FA) page 1" />
</p>

> Book-style A5 pages: serif text, chapter openers with a drop cap, generous margins, running page numbers.
>
> **Best for:** textbook, book chapter, ebook to print, course reader · **Page:** A5 · **Mood:** literary, traditional

### Thesis — `thesis`

<p>
  <img src="docs/screenshots/thesis-en-1.png" width="32.5%" alt="Thesis (EN) page 1" />
  <img src="docs/screenshots/thesis-en-2.png" width="32.5%" alt="Thesis (EN) page 2" />
  <img src="docs/screenshots/thesis-fa-1.png" width="32.5%" alt="Thesis (FA) page 1" />
</p>

> Formal dissertation layout: centered title page, 1.65 line spacing, chapter openers on new pages, restrained serif.
>
> **Best for:** thesis, dissertation, research report, academic submission · **Page:** A4 · **Mood:** formal, scholarly

### Whitepaper — `whitepaper`

<p>
  <img src="docs/screenshots/whitepaper-en-1.png" width="32.5%" alt="Whitepaper (EN) page 1" />
  <img src="docs/screenshots/whitepaper-en-2.png" width="32.5%" alt="Whitepaper (EN) page 2" />
  <img src="docs/screenshots/whitepaper-fa-1.png" width="32.5%" alt="Whitepaper (FA) page 1" />
</p>

> Dark-cover authority document: ink-navy cover with a gold rule, spacious serif body, pull-quote styling.
>
> **Best for:** whitepaper, research brief, industry report, executive briefing · **Page:** A4 · **Mood:** authoritative, premium

### Worksheet — `worksheet`

<p>
  <img src="docs/screenshots/worksheet-en-1.png" width="49%" alt="Worksheet (EN) page 1" />
  <img src="docs/screenshots/worksheet-fa-1.png" width="49%" alt="Worksheet (FA) page 1" />
</p>

> Exercise sheet with a name/date strip, numbered questions and ruled answer areas.
>
> **Best for:** worksheet, exam, quiz, homework · **Page:** A4 · **Mood:** practical, clean

<!-- GALLERY:END -->
## Typography

Type gets the same attention as layout.

<p>
  <img src="docs/screenshots/specimen-3.png" width="32.5%" alt="Type specimen: Persian and Arabic-script families" />
  <img src="docs/screenshots/scripts-1.png" width="32.5%" alt="One document in 21 languages, page 1" />
  <img src="docs/screenshots/scripts-2.png" width="32.5%" alt="One document in 21 languages, page 2" />
</p>

- Every template has four font roles: text, title, UI and mono. Each is a Latin family followed by the language family, and no system font is ever used (the tests fail on a single fallback glyph).
- Fonts are chosen per template and per language. `engine/i18n.mjs` maps each template's style (serif or sans) and display variant to the right family for Persian, Arabic, Urdu, Pashto, Kurdish, Hebrew, the Indic scripts, Thai, Georgian, Armenian, Cyrillic, Greek and Vietnamese.
- Joined scripts get their own rules: more leading for Persian and Arabic (1.85) and Nastaliq (2.25), no letter-spacing or uppercase, no fake italics, emphasis as weight plus colour, justified Naskh and Hebrew, ragged Nastaliq and Indic.
- Sizes follow a modular scale. Headings are balanced, paragraphs avoid orphans, figures are lining or old-style per template, and quotation marks follow the language (`« »`, `„ “`).
- A section can switch language with `::: lang he` ... `:::`.

The full guide is in [typography.md](skills/frontend-docs/references/typography.md) and every family is shown in the [type specimen](docs/specimen.pdf).

## Languages

| Script | Languages | Fonts included | Digits |
|---|---|---|---|
| Latin, Cyrillic, Greek | English, Russian, Ukrainian, Greek, Vietnamese and others | Source Serif 4, Literata, IBM Plex Sans, Fraunces, Playfair | latin |
| Arabic (RTL) | Persian, Arabic, Urdu, Pashto, Kurdish | Vazirmatn, Estedad, Sahel, Shabnam, Samim, Parastoo, Gandom, Mirza, Markazi, Amiri, Noto Naskh, Lateef, Scheherazade, Cairo, Lalezar, Reem Kufi, Gulzar, Noto Nastaliq Urdu | persian, arabic or latin |
| Hebrew (RTL) | Hebrew | Frank Ruhl Libre, David Libre, Noto Serif and Sans Hebrew, Heebo, Assistant, Suez One | latin |
| Indic | Hindi, Marathi, Nepali, Bengali, Tamil, Telugu, Gujarati, Punjabi, Kannada, Malayalam | Tiro Devanagari, Hind, Eczar, Noto Serif and Sans | latin |
| Southeast Asia, Caucasus | Thai, Georgian, Armenian | Noto Serif and Sans | latin |
| CJK | Chinese, Japanese, Korean | optional: `node scripts/build-fonts.mjs --add noto-sans-sc` | latin |

## Project structure

```
frontend-docs/
├── .claude-plugin/          plugin and marketplace manifests
├── docs/                    gallery screenshots and the type specimen
└── skills/frontend-docs/
    ├── SKILL.md             what the agent reads
    ├── engine/              Markdown to HTML to PDF, layout audit, contents pass
    ├── base/base.css        shared typography, code, math, callouts, RTL rules
    ├── templates/<id>/      template.json and template.css, 31 templates
    ├── fonts/               77 families as woff2, plus fonts.css and fonts.json
    ├── references/          typography.md
    ├── examples/            demo content in English, Persian, Arabic, Hebrew, Urdu, Hindi
    └── scripts/             build-fonts, test, gallery, specimen
```

## Development

```bash
cd skills/frontend-docs
npm test              # every template in every demo language; fails on overflow, blank pages, system fonts
npm run gallery       # regenerates docs/screenshots and the gallery above
npm run build:fonts   # copies fonts from Fontsource and npm
node scripts/specimen.mjs
```

## License

MIT. Bundled fonts keep their own open licenses (see `skills/frontend-docs/fonts/fonts.json`). Math is typeset with [KaTeX](https://katex.org), code is highlighted with [highlight.js](https://highlightjs.org), and pages are printed with Chromium through [Playwright](https://playwright.dev).

## Acknowledgements

The skill layout and the habit of showing real previews before you commit to a style come from [frontend-slides](https://github.com/zarazhangrui/frontend-slides) by Zara Zhang, along with its companion template library [beautiful-html-templates](https://github.com/zarazhangrui/beautiful-html-templates) (both MIT). If you want HTML slide decks instead of print documents, start there.
