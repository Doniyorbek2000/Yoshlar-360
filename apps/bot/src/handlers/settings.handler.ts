import { Telegraf } from 'telegraf';
import { BotContext } from '../types';
import { t } from '../i18n';
import { sessionService } from '../services/session.service';
import { apiService } from '../services/api.service';
import { settingsKeyboard, confirmDeleteKeyboard } from '../keyboards/settings.keyboard';
import { languageKeyboard } from '../keyboards/main-menu.keyboard';

export function registerSettingsHandler(bot: Telegraf<BotContext>) {
  bot.action('delete_confirm', async (ctx) => {
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    const user = await apiService.getUserByTelegramId(userId.toString());

    if (user) {
      try {
        await apiService.deleteUser(user.id);
        await sessionService.clearSession(userId);
        await ctx.answerCbQuery();
        await ctx.reply(t(lang, 'profileDeleted'));
      } catch {
        await ctx.answerCbQuery();
        await ctx.reply(t(lang, 'error'));
      }
    } else {
      await ctx.answerCbQuery();
    }
  });

  bot.action('delete_cancel', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'cancelled'));
  });
}

export async function showSettings(ctx: BotContext) {
  const userId = ctx.from!.id;
  const lang = await sessionService.getLanguage(userId);
  await ctx.reply(t(lang, 'settingsTitle'), settingsKeyboard(lang));
}

export async function handleSettingsText(ctx: BotContext, text: string, lang: string): Promise<boolean> {
  const userId = ctx.from!.id;

  if (text === t(lang, 'changeLanguage')) {
    await ctx.reply(t(lang, 'selectLanguage'), languageKeyboard());
    return true;
  }

  if (text === t(lang, 'toggleNotifications')) {
    const redis = sessionService.getRedis();
    const key = `bot:notif:${userId}`;
    const current = await redis.get(key);
    if (current === 'off') {
      await redis.del(key);
      await ctx.reply(t(lang, 'notificationsOn'));
    } else {
      await redis.set(key, 'off');
      await ctx.reply(t(lang, 'notificationsOff'));
    }
    return true;
  }

  if (text === t(lang, 'deleteProfile')) {
    await ctx.reply(t(lang, 'confirmDelete'), confirmDeleteKeyboard(lang));
    return true;
  }

  if (text === t(lang, 'logout')) {
    await sessionService.clearSession(userId);
    await ctx.reply(t(lang, 'loggedOut'));
    return true;
  }

  return false;
}
