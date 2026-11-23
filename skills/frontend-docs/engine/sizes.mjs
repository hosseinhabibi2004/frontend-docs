// Page sizes (CSS @page size values + pixel dims at 96dpi for checks).
export const SIZES = {
  A4: 'A4', A5: 'A5', A3: 'A3', Letter: 'Letter', Legal: 'Legal',
  Card: '90mm 55mm', Slide: '254mm 142.9mm', Square: '200mm 200mm',
};
export function pageSize(size = 'A4', landscape = false) {
  const base = SIZES[size] || size; // allow custom "210mm 297mm"
  return landscape ? `${base} landscape` : base;
}

// Page dimensions in mm (used to size the audit viewport so 100vh equals the printed page content height).
const MM = { A3: [297, 420], A4: [210, 297], A5: [148, 210], Letter: [215.9, 279.4], Legal: [215.9, 355.6], Card: [90, 55], Slide: [254, 142.9], Square: [200, 200] };
const toMm = (v) => { const m = /^([\d.]+)(mm|cm|in|pt|px)?$/.exec(String(v).trim()); if (!m) return 0; const n = parseFloat(m[1]); return { mm: n, cm: n * 10, in: n * 25.4, pt: n * 25.4 / 72, px: n * 25.4 / 96 }[m[2] || 'mm']; };
export function contentBox(size = 'A4', landscape = false, margin = '0') {
  let dims = MM[size];
  if (!dims) { const p = String(size).split(/\s+/).map(toMm); dims = [p[0] || 210, p[1] || p[0] || 297]; }
  let [w, h] = dims; if (landscape) [w, h] = [h, w];
  const m = String(margin).trim().split(/\s+/).map(toMm);
  const [t, r, b, l] = m.length === 1 ? [m[0], m[0], m[0], m[0]] : m.length === 2 ? [m[0], m[1], m[0], m[1]] : m.length === 3 ? [m[0], m[1], m[2], m[1]] : m;
  const px = (mm) => Math.round(mm * 96 / 25.4);
  return { width: px(w - l - r), height: px(h - t - b) };
}
