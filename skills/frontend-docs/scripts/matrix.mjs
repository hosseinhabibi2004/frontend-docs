// Shared by test + gallery: which demo files each template is shown with.
import { existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const ROOT = root;
export const templates = () => readdirSync(join(root, 'templates')).filter((t) => existsSync(join(root, 'templates', t, 'template.json'))).sort();
export function demos(t, langs = ['en', 'fa', 'ar']) {
  const own = join(root, 'examples', t);
  const dir = existsSync(own) ? own : join(root, 'examples', 'shared');
  return langs.filter((l) => existsSync(join(dir, `${l}.md`))).map((l) => ({ lang: l, file: join(dir, `${l}.md`) }));
}
