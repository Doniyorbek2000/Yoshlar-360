import * as fs from 'fs';
import * as path from 'path';

const locales: Record<string, Record<string, string>> = {};

const localesDir = path.join(__dirname, 'locales');
for (const file of fs.readdirSync(localesDir)) {
  if (file.endsWith('.json')) {
    const lang = file.replace('.json', '');
    locales[lang] = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf-8'));
  }
}

export function t(lang: string, key: string, params?: Record<string, string | number>): string {
  let text = locales[lang]?.[key] || locales['uz']?.[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return text;
}

export function getLocaleKeys(): string[] {
  return Object.keys(locales['uz'] || {});
}
