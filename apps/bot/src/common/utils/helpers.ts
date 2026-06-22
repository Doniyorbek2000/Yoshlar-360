import { BotContext } from '../../types';
import { sessionService } from '../../services/session.service';
import { t } from '../../i18n';

export async function getLang(ctx: BotContext): Promise<string> {
  const userId = ctx.from?.id;
  if (!userId) return 'uz';
  return sessionService.getLanguage(userId);
}

export async function reply(ctx: BotContext, key: string, params?: Record<string, string | number>, extra?: any): Promise<void> {
  const lang = await getLang(ctx);
  const text = t(lang, key, params);
  await ctx.reply(text, extra);
}

export function parseDate(input: string): Date | null {
  const match = input.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  if (isNaN(date.getTime())) return null;
  if (date.getFullYear() < 1950 || date.getFullYear() > 2010) return null;
  return date;
}

export function formatDate(dateStr: string, lang: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len - 3) + '...';
}
