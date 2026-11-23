// Language metadata: direction, default digits, default font stacks, UI labels.
export const RTL_LANGS = new Set(['fa', 'ar', 'ur', 'he', 'ps', 'ckb', 'ku', 'sd', 'yi', 'dv', 'ug']);

export function langBase(lang = 'en') { return String(lang).toLowerCase().split('-')[0]; }
// Direction of a text by its first strong character (RTL script vs Latin/Cyrillic/Greek/Indic...), else the fallback.
const RTL_STRONG = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
const LTR_STRONG = /[A-Za-z\u00C0-\u024F\u0370-\u03FF\u0400-\u052F\u0900-\u0DFF\u0E00-\u0EFF\u10A0-\u10FF\u0530-\u058F]/;
export function detectDir(text, fallback = 'ltr') {
  for (const ch of String(text)) {
    if (RTL_STRONG.test(ch)) return 'rtl';
    if (LTR_STRONG.test(ch)) return 'ltr';
  }
  return fallback;
}
export function dirFor(lang) { return RTL_LANGS.has(langBase(lang)) ? 'rtl' : 'ltr'; }

export function defaultDigits(lang) {
  const b = langBase(lang);
  if (b === 'fa' || b === 'ps' || b === 'ur' || b === 'ckb') return 'persian';
  return 'latin';
}

const DIGITS = {
  persian: '۰۱۲۳۴۵۶۷۸۹',
  arabic: '٠١٢٣٤٥٦٧٨٩',
};
export function convertDigits(s, mode) {
  const map = DIGITS[mode];
  if (!map) return s;
  return s.replace(/[0-9]/g, (d) => map[+d]);
}

// ── Scripts ───────────────────────────────────────────────
const SCRIPT_OF = { fa: 'arabic', ar: 'arabic', ur: 'arabic', ps: 'arabic', ckb: 'arabic', ku: 'arabic', sd: 'arabic', ug: 'arabic',
  he: 'hebrew', yi: 'hebrew', hi: 'devanagari', mr: 'devanagari', ne: 'devanagari', bn: 'bengali', ta: 'tamil', te: 'telugu', gu: 'gujarati',
  pa: 'gurmukhi', kn: 'kannada', ml: 'malayalam', th: 'thai', ka: 'georgian', hy: 'armenian', zh: 'cjk', ja: 'cjk', ko: 'cjk',
  ru: 'cyrillic', uk: 'cyrillic', bg: 'cyrillic', sr: 'cyrillic', mk: 'cyrillic', el: 'greek' };
export function scriptFor(lang) { return SCRIPT_OF[langBase(lang)] || 'latin'; }

// Typographic traits per script. lh = minimum line-height (Arabic/Indic marks need air), track0 = no letter-spacing/uppercase,
// italic = script has real italics (otherwise emphasis becomes weight).
export const SCRIPT_TRAITS = {
  latin: { lh: 0, italic: true }, cyrillic: { lh: 0, italic: true }, greek: { lh: 0, italic: true },
  arabic: { lh: 1.85, track0: true, italic: false, justify: true }, hebrew: { lh: 1.7, italic: false, justify: true },
  devanagari: { lh: 1.75, track0: true, italic: false }, bengali: { lh: 1.75, track0: true, italic: false }, tamil: { lh: 1.7, track0: true, italic: false },
  telugu: { lh: 1.75, track0: true, italic: false }, gujarati: { lh: 1.7, track0: true, italic: false }, gurmukhi: { lh: 1.75, track0: true, italic: false },
  kannada: { lh: 1.75, track0: true, italic: false }, malayalam: { lh: 1.75, track0: true, italic: false }, thai: { lh: 1.8, track0: true, italic: false },
  georgian: { lh: 1.6, italic: false }, armenian: { lh: 1.6, italic: true }, cjk: { lh: 1.8, track0: true, italic: false },
};
// Nastaliq needs far more leading than Naskh
export function leadingFor(lang) { return langBase(lang) === 'ur' ? 2.25 : SCRIPT_TRAITS[scriptFor(lang)].lh; }

// Typographic quotation marks per language (open close open2 close2)
export const QUOTES = { en: '“ ” ‘ ’', fa: '« » ‹ ›', ar: '« » ‹ ›', ur: '“ ” ‘ ’', he: '” ” ’ ’', de: '„ “ ‚ ‘', fr: '« » ‹ ›', ru: '« » „ “', es: '« » “ ”', hi: '“ ” ‘ ’', zh: '“ ” ‘ ’', ja: '「 」 『 』', ko: '“ ” ‘ ’' };

// ── Per-language font sets ────────────────────────────────
// For each language and template style ("serif" | "sans") three roles: text, title, ui. Optional display variants
// (loud / elegant / hand) replace the title for expressive templates. Names are CSS family names, all bundled
// except zh/ja/ko (opt-in: node scripts/build-fonts.mjs --add noto-sans-sc).
const q = (n) => `'${n}'`;
const set = (text, title, ui) => ({ text: q(text), title: q(title), ui: q(ui) });
export const FONT_SETS = {
  fa: { serif: set('Parastoo', 'Mirza', 'Estedad'), sans: set('Estedad', 'Estedad', 'Estedad'), loud: q('Lalezar'), elegant: q('Markazi Text'), hand: q('Tanha'), mono: q('Vazirmatn') },
  ar: { serif: set('Noto Naskh Arabic', 'Amiri', 'IBM Plex Sans Arabic'), sans: set('IBM Plex Sans Arabic', 'Cairo', 'IBM Plex Sans Arabic'), loud: q('Reem Kufi'), elegant: q('Amiri'), hand: q('Katibeh') },
  ur: { serif: set('Noto Nastaliq Urdu', 'Noto Nastaliq Urdu', 'Noto Sans Arabic'), sans: set('Noto Naskh Arabic', 'Noto Naskh Arabic', 'Noto Sans Arabic'), loud: q('Gulzar'), elegant: q('Gulzar'), hand: q('Gulzar') },
  ps: { serif: set('Noto Naskh Arabic', 'Amiri', 'Noto Sans Arabic'), sans: set('Noto Sans Arabic', 'Noto Sans Arabic', 'Noto Sans Arabic'), loud: q('Reem Kufi'), elegant: q('Amiri'), hand: q('Katibeh') },
  ckb: { serif: set('Noto Naskh Arabic', 'Amiri', 'Noto Sans Arabic'), sans: set('Noto Sans Arabic', 'Noto Sans Arabic', 'Noto Sans Arabic'), loud: q('Reem Kufi'), elegant: q('Amiri'), hand: q('Katibeh') },
  he: { serif: set('Frank Ruhl Libre', 'Frank Ruhl Libre', 'Heebo'), sans: set('Heebo', 'Heebo', 'Heebo'), loud: q('Suez One'), elegant: q('David Libre'), hand: q('Secular One') },
  hi: { serif: set('Tiro Devanagari Hindi', 'Eczar', 'Hind'), sans: set('Hind', 'Hind', 'Hind'), loud: q('Eczar'), elegant: q('Tiro Devanagari Hindi'), hand: q('Hind') },
  ru: { serif: set('Source Serif 4', 'Playfair Display', 'IBM Plex Sans'), sans: set('IBM Plex Sans', 'IBM Plex Sans', 'IBM Plex Sans'), loud: q('Playfair Display'), elegant: q('Cormorant Garamond'), hand: q('Caveat') },
  el: { serif: set('Source Serif 4', 'Source Serif 4', 'IBM Plex Sans'), sans: set('IBM Plex Sans', 'IBM Plex Sans', 'IBM Plex Sans'), loud: q('Source Serif 4'), elegant: q('Source Serif 4'), hand: q('Source Serif 4') },
  vi: { serif: set('Source Serif 4', 'Fraunces', 'IBM Plex Sans'), sans: set('IBM Plex Sans', 'Bricolage Grotesque', 'IBM Plex Sans'), loud: q('Fraunces'), elegant: q('Cormorant Garamond'), hand: q('Source Serif 4') },
  bn: { serif: set('Noto Serif Bengali', 'Noto Serif Bengali', 'Noto Sans Bengali'), sans: set('Noto Sans Bengali', 'Noto Sans Bengali', 'Noto Sans Bengali') },
  ta: { serif: set('Noto Serif Tamil', 'Noto Serif Tamil', 'Noto Sans Tamil'), sans: set('Noto Sans Tamil', 'Noto Sans Tamil', 'Noto Sans Tamil') },
  te: { serif: set('Noto Serif Telugu', 'Noto Serif Telugu', 'Noto Sans Telugu'), sans: set('Noto Sans Telugu', 'Noto Sans Telugu', 'Noto Sans Telugu') },
  gu: { serif: set('Noto Serif Gujarati', 'Noto Serif Gujarati', 'Noto Sans Gujarati'), sans: set('Noto Sans Gujarati', 'Noto Sans Gujarati', 'Noto Sans Gujarati') },
  pa: { serif: set('Noto Sans Gurmukhi', 'Noto Sans Gurmukhi', 'Noto Sans Gurmukhi'), sans: set('Noto Sans Gurmukhi', 'Noto Sans Gurmukhi', 'Noto Sans Gurmukhi') },
  kn: { serif: set('Noto Sans Kannada', 'Noto Sans Kannada', 'Noto Sans Kannada'), sans: set('Noto Sans Kannada', 'Noto Sans Kannada', 'Noto Sans Kannada') },
  ml: { serif: set('Noto Sans Malayalam', 'Noto Sans Malayalam', 'Noto Sans Malayalam'), sans: set('Noto Sans Malayalam', 'Noto Sans Malayalam', 'Noto Sans Malayalam') },
  th: { serif: set('Noto Serif Thai', 'Noto Serif Thai', 'Noto Sans Thai'), sans: set('Noto Sans Thai', 'Noto Sans Thai', 'Noto Sans Thai') },
  ka: { serif: set('Noto Serif Georgian', 'Noto Serif Georgian', 'Noto Sans Georgian'), sans: set('Noto Sans Georgian', 'Noto Sans Georgian', 'Noto Sans Georgian') },
  hy: { serif: set('Noto Serif Armenian', 'Noto Serif Armenian', 'Noto Sans Armenian'), sans: set('Noto Sans Armenian', 'Noto Sans Armenian', 'Noto Sans Armenian') },
  // opt-in (large): node scripts/build-fonts.mjs --add noto-sans-sc --add noto-serif-sc  (same for jp, kr, tc)
  zh: { serif: set('Noto Serif SC', 'Noto Serif SC', 'Noto Sans SC'), sans: set('Noto Sans SC', 'Noto Sans SC', 'Noto Sans SC'), optIn: ['noto-sans-sc', 'noto-serif-sc'] },
  ja: { serif: set('Noto Serif JP', 'Noto Serif JP', 'Noto Sans JP'), sans: set('Noto Sans JP', 'Noto Sans JP', 'Noto Sans JP'), optIn: ['noto-sans-jp', 'noto-serif-jp'] },
  ko: { serif: set('Noto Serif KR', 'Noto Serif KR', 'Noto Sans KR'), sans: set('Noto Sans KR', 'Noto Sans KR', 'Noto Sans KR'), optIn: ['noto-sans-kr', 'noto-serif-kr'] },
};
// Display fonts that exist in one weight only: never synthesize bold for them.
export const SINGLE_WEIGHT = new Set(['Lalezar', 'Rakkas', 'Katibeh', 'Gulzar', 'Suez One', 'Secular One', 'Tanha', 'Noto Nastaliq Urdu']);

// Resolve the per-language fonts for a template config. cfg.style: serif|sans (default sans); cfg.display: loud|elegant|hand;
// cfg.langFonts[lang] = { text, title, ui, display } overrides.
export const ALIAS = { uk: 'ru', bg: 'ru', sr: 'ru', mk: 'ru', be: 'ru', ku: 'ckb', sd: 'ur', ug: 'ckb', yi: 'he', mr: 'hi', ne: 'hi' };
export function resolveLangFonts(lang, cfg = {}) {
  const base = ALIAS[langBase(lang)] || langBase(lang);
  const fam = FONT_SETS[base];
  if (!fam) return null;
  const s = { ...fam[cfg.style === 'serif' ? 'serif' : 'sans'] };
  let display = (cfg.display && fam[cfg.display]) || s.title;
  const ov = (cfg.langFonts && (cfg.langFonts[base] || cfg.langFonts[langBase(lang)])) || {};
  for (const k of ['text', 'title', 'ui']) if (ov[k]) s[k] = q(ov[k]);
  if (ov.display) display = q(ov.display);
  const name = display.replace(/'/g, '');
  return { text: s.text, title: s.title, ui: s.ui, display, displayWeight: SINGLE_WEIGHT.has(name) ? 400 : 800, optIn: fam.optIn };
}
// Back-compat for older imports
export const LANG_FONT = Object.fromEntries(Object.entries(FONT_SETS).map(([k, v]) => [k, { sans: v.sans.ui, text: v.serif.text, display: v.serif.title, optIn: v.optIn }]));
export const RTL_FONT = LANG_FONT;

const L = {
  en: { proposition: 'Proposition', corollary: 'Corollary', simple: 'In plain words', correction: 'Correction to the notes', remark: 'Remark', chapter: 'Chapter', figure: 'Fig.', question: 'Q', initials: 'Initials', note: 'Note', tip: 'Tip', warning: 'Warning', danger: 'Danger', definition: 'Definition', theorem: 'Theorem', lemma: 'Lemma', proof: 'Proof', example: 'Example', exercise: 'Exercise', answer: 'Answer', abstract: 'Abstract', keywords: 'Keywords', contents: 'Contents', footnotes: 'Notes', page: 'Page' },
  fa: { proposition: 'گزاره', corollary: 'نتیجه', simple: 'به زبان ساده', correction: 'اصلاح نسبت به جزوه', remark: 'یادآوری', chapter: 'فصل', figure: 'شکل', question: 'سؤال', initials: 'امضا / پاراف', note: 'نکته', tip: 'پیشنهاد', warning: 'هشدار', danger: 'خطر', definition: 'تعریف', theorem: 'قضیه', lemma: 'لم', proof: 'اثبات', example: 'مثال', exercise: 'تمرین', answer: 'پاسخ', abstract: 'چکیده', keywords: 'واژگان کلیدی', contents: 'فهرست مطالب', footnotes: 'پی‌نوشت‌ها', page: 'صفحه' },
  he: { proposition: 'טענה', corollary: 'מסקנה', simple: 'במילים פשוטות', correction: 'תיקון להערות', remark: 'הערה', chapter: 'פרק', figure: 'איור', question: 'שאלה', initials: 'ראשי תיבות', note: 'הערה', tip: 'טיפ', warning: 'אזהרה', danger: 'סכנה', definition: 'הגדרה', theorem: 'משפט', lemma: 'למה', proof: 'הוכחה', example: 'דוגמה', exercise: 'תרגיל', answer: 'תשובה', abstract: 'תקציר', keywords: 'מילות מפתח', contents: 'תוכן עניינים', footnotes: 'הערות', page: 'עמוד' },
  ur: { proposition: 'تجویز', corollary: 'نتیجہ', simple: 'آسان الفاظ میں', correction: 'حواشی کی اصلاح', remark: 'یاد دہانی', chapter: 'باب', figure: 'شکل', question: 'سوال', initials: 'ابتدائی دستخط', note: 'نوٹ', tip: 'مشورہ', warning: 'انتباہ', danger: 'خطرہ', definition: 'تعریف', theorem: 'مسئلہ', lemma: 'لیما', proof: 'ثبوت', example: 'مثال', exercise: 'مشق', answer: 'جواب', abstract: 'خلاصہ', keywords: 'کلیدی الفاظ', contents: 'فہرست', footnotes: 'حواشی', page: 'صفحہ' },
  hi: { proposition: 'प्रतिज्ञप्ति', corollary: 'परिणाम', simple: 'सरल शब्दों में', correction: 'नोट्स में सुधार', remark: 'स्मरण', chapter: 'अध्याय', figure: 'चित्र', question: 'प्रश्न', initials: 'आद्याक्षर', note: 'टिप्पणी', tip: 'सुझाव', warning: 'चेतावनी', danger: 'खतरा', definition: 'परिभाषा', theorem: 'प्रमेय', lemma: 'उपप्रमेय', proof: 'उपपत्ति', example: 'उदाहरण', exercise: 'अभ्यास', answer: 'उत्तर', abstract: 'सार', keywords: 'मुख्य शब्द', contents: 'विषय-सूची', footnotes: 'टिप्पणियाँ', page: 'पृष्ठ' },
  zh: { chapter: '章', figure: '图', question: '题', initials: '签章', note: '注意', tip: '提示', warning: '警告', danger: '危险', definition: '定义', theorem: '定理', lemma: '引理', proof: '证明', example: '例', exercise: '习题', answer: '答案', abstract: '摘要', keywords: '关键词', contents: '目录', footnotes: '注释', page: '页' },
  ar: { proposition: 'اقتراح', corollary: 'نتيجة', simple: 'بعبارة بسيطة', correction: 'تصحيح للمذكرات', remark: 'تذكير', chapter: 'الفصل', figure: 'شكل', question: 'سؤال', initials: 'الأحرف الأولى', note: 'ملاحظة', tip: 'نصيحة', warning: 'تحذير', danger: 'خطر', definition: 'تعريف', theorem: 'مبرهنة', lemma: 'تمهيدية', proof: 'البرهان', example: 'مثال', exercise: 'تمرين', answer: 'الإجابة', abstract: 'الملخص', keywords: 'الكلمات المفتاحية', contents: 'المحتويات', footnotes: 'الحواشي', page: 'صفحة' },
};
export function labels(lang) { return { ...L.en, ...(L[langBase(lang)] || {}) }; }
