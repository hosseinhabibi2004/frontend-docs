# Typography guide

How frontend-docs sets type, and how to choose and extend fonts. Read this before adding a template or a language.

## 1. Roles

Every template defines four roles. Each role is a *stack*: Latin family first, then the language family the engine injects (`--lang-*`), then a generic.

| Role | CSS var | Used for | Typical choice |
|---|---|---|---|
| text | `--text-font` | paragraphs, lists | a text serif (Source Serif 4, Literata, Libre Caslon) or a calm sans (IBM Plex Sans) |
| title | `--title-font` | h1–h4, cover title | a display face with character (Fraunces, Gloock, Schibsted Grotesk, Barlow Condensed) |
| ui | `--ui-font` | tables, captions, labels, page numbers | a neutral sans, tabular figures |
| mono | `--font-mono` | code, equations labels | JetBrains Mono / IBM Plex Mono / DM Mono |

Never put a generic (`serif`, `sans-serif`, `monospace`) or a system face (`Georgia`, `system-ui`) in the middle of a stack: it would capture Persian/Hebrew/Indic glyphs before the language font gets a chance. Use `--font-mono-ui` for labels set in mono so they still fall back to the language font. `npm test` fails if any glyph is drawn by a system font (Liberation, DejaVu, ...).

## 2. Pairing rules (from the typography-selector skill, adapted for print)

- **Contrast, not conflict**: serif with sans, or display with text. Match x-height; limit to two families plus mono.
- **Weight ladder**: headings 600–900, subheads 500–700, body 400, captions 400. Single-weight display faces (Lalezar, Gloock, Archivo Black) must never be bolded: the engine sets `font-synthesis-weight:none` and `--lang-title-wt`.
- **Avoid the defaults** that signal "no decision was made": Inter, Roboto, Open Sans, Arial/Helvetica, Lato, Poppins, Space Grotesk. Choose a face with a point of view that fits the document's own world.
- Persian/Arabic/Hebrew **do not copy Latin styling**: no italics, no tracking, no uppercase (see §5).

## 3. Scale, leading, tracking

Sizes come from a modular scale: `--size` × `--ratio`ⁿ (`--small`, `--h3`, `--h2`, `--h1`). Pick the ratio by density:

| Ratio | Name | Use |
|---|---|---|
| 1.2 | minor third | dense: cheat sheet, journal, invoice |
| 1.25 | major third (default) | reports, papers, manuals |
| 1.333 | perfect fourth | posters, covers, invitations |

| Content | Line-height | Letter-spacing |
|---|---|---|
| headline | 1.1–1.2 | −0.01 to −0.02em |
| subhead | 1.25–1.35 | 0 |
| body | 1.5–1.7 | 0 |
| small caps / ALL CAPS labels | 1.3 | +0.08 to +0.16em (Latin only) |

Script minimums (`--lh-lang`, applied as `max(--lh, --lh-lang)`): Arabic/Persian 1.85, Urdu Nastaliq 2.25, Devanagari/Bengali/Telugu/Kannada/Malayalam 1.75, Thai 1.8, Hebrew 1.7, Latin/Cyrillic/Greek 0.

## 4. Microtypography the engine applies

`text-wrap: balance` (headings, captions, cover) and `pretty` (paragraphs), `hyphenate-limit-chars`, widows/orphans 3, kerning, optical sizing, `font-variant-numeric` (lining + proportional by default; `--numeric:oldstyle-nums proportional-nums` in book-like templates; tables always lining + tabular), `font-synthesis-weight:none`, smart quotes per language (`« »` fa/ar/fr, `„ “` de, …) with `(c)` and `--` replacements off, `size-adjust` per Arabic-script face so Persian text matches the optical size of the Latin font beside it.

## 4b. Mixed direction (LTR inside RTL)

- Inline math, inline code and Latin runs are **isolated** (`dir="ltr"`, `unicode-bidi:isolate`) so parentheses, digits, units and punctuation keep their logical order. The engine wraps Latin runs automatically in RTL documents: `Python 3.12`, `https://x.org/a-b`, `36.6°C`, `MB/s`, `"Hello, world!"` (digits inside a run stay Latin).
- Inline math is never broken across lines (a formula split mid-expression reads scrambled in RTL). If a formula is wider than its column the audit says so: write it as display math (`$$...$$`).
- Phone numbers (`+98 912 345 6789`) are isolated as one LTR unit and take the document's digits; groups separated by spaces would otherwise reverse in RTL text.
- Each block gets an explicit `dir` decided at build time from its first strong character (not `dir="auto"`: Chromium does not update logical properties on pseudo-elements for `auto`, which put quote marks and markers on the wrong side). An English paragraph in a Persian document stays left-to-right; tables and lists follow the document direction.
- See `examples/features/bidi-fa.md` for the cases that are tested.

## 5. Scripts

| Script | Languages | Text / title / ui (serif style) | Rules the engine applies |
|---|---|---|---|
| Arabic | fa, ar, ps, ckb | Parastoo / Mirza / Estedad (fa); Noto Naskh / Amiri / IBM Plex Sans Arabic (ar) | RTL, justify, no tracking/uppercase, emphasis = weight + accent colour, Persian/Arabic-Indic digits |
| Nastaliq | ur | Noto Nastaliq Urdu | leading 2.25, ragged right |
| Hebrew | he | Frank Ruhl Libre / Heebo | RTL, justify, no italics |
| Indic | hi, mr, ne, bn, ta, te, gu, pa, kn, ml | Tiro Devanagari / Hind; Noto Serif/Sans per script | leading 1.75, no tracking, ragged right |
| Thai, Georgian, Armenian | th, ka, hy | Noto Serif/Sans | script leading |
| Cyrillic, Greek, Vietnamese | ru, uk, bg, el, vi | the Latin families (subsets bundled) | — |
| CJK | zh, ja, ko | opt-in `node scripts/build-fonts.mjs --add noto-sans-sc` | warns with the exact command |

Template style comes from `template.json`: `"style":"serif|sans"`, `"display":"loud|elegant|hand"` and per-language overrides `"langFonts":{"fa":{"text":"Gandom","title":"Estedad"}}`. Display options per language live in `engine/i18n.mjs` (`FONT_SETS`).

Mixed documents: wrap a section in `::: lang he` … `:::`; fonts, leading and rules switch for that block.

## 6. Adding a font

1. `node scripts/build-fonts.mjs --add <fontsource-id> [--subsets arabic] [--weights 400,700]` (any Fontsource family), or add an entry to `CORE` in `scripts/build-fonts.mjs` (npm-sourced files are supported, see Sahel/Parastoo).
2. Only OFL / Apache / public-domain fonts. Record the licence (it ends up in `fonts/fonts.json`).
3. For an Arabic-script face, tune `adjust` (size-adjust %) until its x-height matches the Latin partner; check `docs/specimen.pdf` (`node scripts/specimen.mjs`).
4. Reference it from `FONT_SETS` or a template's `langFonts`, then run `npm test` (fails on system-font fallback).

## 7. Where the fonts came from

Curated from [Awesome-Persian-Fonts](https://github.com/alr-rashidi/Awesome-Persian-Fonts) (Vazirmatn, Estedad, Sahel, Shabnam, Samim, Parastoo, Gandom, Tanha, Mirza, Markazi, Lalezar, Katibeh, Gulzar…), [Awesome Hebrew Fonts](https://github.com/danielrosehill/Awesome-Hebrew-Fonts) and Open Siddur (Frank Ruhl Libre, David Libre, Heebo, Noto Serif Hebrew), Google's Noto project for Indic/SE Asian/Caucasus scripts, Tiro Typeworks and Ek Type (Devanagari), and Google Fonts for Latin/Cyrillic/Greek. Candidates for CJK: Noto CJK / Source Han (OFL), [awesome-chinese-fonts](https://github.com/kevchentw/awesome-chinese-fonts).
