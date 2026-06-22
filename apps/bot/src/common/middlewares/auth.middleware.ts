import { BotContext } from '../../types';
import { apiService } from '../../services/api.service';
import { sessionService } from '../../services/session.service';
import { t } from '../../i18n';

export async function authMiddleware(ctx: BotContext, next: () => Promise<void>): Promise<void> {
  if (!ctx.from) return;

  const telegramId = ctx.from.id.toString();
  const session = await sessionService.getSession(ctx.from.id);
  ctx.session = session;

  if (session.step === 'select_language' || session.step?.startsWith('reg_')) {
    return next();
  }

  const text = (ctx.message as any)?.text;
  if (text === '/start' || text === '/help') {
    return next();
  }

  if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
    const cbData = ctx.callbackQuery.data;
    if (cbData?.startsWith('lang_')) {
      return next();
    }
  }

  const user = await apiService.getUserByTelegramId(telegramId);
  if (!user && !session.step) {
    const lang = await sessionService.getLanguage(ctx.from.id);
    await ctx.reply(t(lang, 'notRegistered'));
    return;
  }

  return next();
}
