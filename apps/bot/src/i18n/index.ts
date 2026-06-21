import { uz } from './uz';
import { ru } from './ru';

const translations: Record<string, typeof uz> = { uz, ru };
const userLanguages: Record<number, string> = {};

export function t(userId: number, key: keyof typeof uz): string {
  const lang = userLanguages[userId] || 'uz';
  return translations[lang]?.[key] || translations['uz'][key] || key;
}

export function setLanguage(userId: number, lang: string) {
  userLanguages[userId] = lang;
}

export function getLanguage(userId: number): string {
  return userLanguages[userId] || 'uz';
}
