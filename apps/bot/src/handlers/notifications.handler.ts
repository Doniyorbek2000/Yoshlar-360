import { Telegraf, Markup } from 'telegraf';
import { BotContext } from '../types';
import { t } from '../i18n';
import { sessionService } from '../services/session.service';
import { apiService } from '../services/api.service';
import { formatDate } from '../common/utils/helpers';

export function registerNotificationsHandler(bot: Telegraf<BotContext>) {
  bot.action('mark_all_read', async (ctx) => {
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    const user = await apiService.getUserByTelegramId(userId.toString());
    if (!user) return ctx.answerCbQuery();

    await apiService.markNotificationsRead(user.id);
    await ctx.answerCbQuery();
    await ctx.reply(t(lang, 'markAllRead'));
  });

  bot.action(/^notif_page_(\d+)$/, async (ctx) => {
    const page = parseInt(ctx.match![1]);
    await ctx.answerCbQuery();
    await showNotifications(ctx, page);
  });
}

export async function showNotifications(ctx: BotContext, page = 1) {
  const userId = ctx.from!.id;
  const lang = await sessionService.getLanguage(userId);
  const user = await apiService.getUserByTelegramId(userId.toString());
  if (!user) {
    await ctx.reply(t(lang, 'notRegistered'));
    return;
  }

  const result = await apiService.getNotifications(user.id, page);
  if (result.data.length === 0) {
    await ctx.reply(t(lang, 'noNotifications'));
    return;
  }

  let message = t(lang, 'notificationsTitle') + '\n\n';
  for (const notif of result.data) {
    message += t(lang, 'notificationItem', {
      title: notif.title || '',
      message: notif.message || notif.text || '',
      date: formatDate(notif.createdAt, lang),
    }) + '\n\n';
  }

  const buttons: any[] = [];
  buttons.push([Markup.button.callback(t(lang, 'markAllRead'), 'mark_all_read')]);

  const totalPages = Math.ceil(result.total / 10);
  if (totalPages > 1) {
    const navButtons = [];
    if (page > 1) navButtons.push(Markup.button.callback(t(lang, 'prev'), `notif_page_${page - 1}`));
    if (page < totalPages) navButtons.push(Markup.button.callback(t(lang, 'next'), `notif_page_${page + 1}`));
    if (navButtons.length > 0) buttons.push(navButtons);
  }

  await ctx.reply(message, Markup.inlineKeyboard(buttons));
}

export async function showNews(ctx: BotContext) {
  const userId = ctx.from!.id;
  const lang = await sessionService.getLanguage(userId);

  await ctx.reply(t(lang, 'noNews'));
}
