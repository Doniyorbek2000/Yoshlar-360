import { Telegraf, Markup } from 'telegraf';
import { BotContext } from '../types';
import { t } from '../i18n';
import { sessionService } from '../services/session.service';
import { apiService } from '../services/api.service';
import { paginationKeyboard } from '../keyboards/main-menu.keyboard';
import { formatDate } from '../common/utils/helpers';

export function registerTasksHandler(bot: Telegraf<BotContext>) {
  bot.action(/^taskdone_(\d+)$/, async (ctx) => {
    const taskId = parseInt(ctx.match![1]);
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);

    try {
      await apiService.updateTaskStatus(taskId, 'DONE');
      await ctx.answerCbQuery();
      await ctx.reply(t(lang, 'statusUpdated'));
    } catch {
      await ctx.answerCbQuery();
      await ctx.reply(t(lang, 'error'));
    }
  });

  bot.action(/^tasks_page_(\d+)$/, async (ctx) => {
    const page = parseInt(ctx.match![1]);
    await ctx.answerCbQuery();
    await showAdminTasks(ctx, page);
  });
}

export async function showAdminTasks(ctx: BotContext, page = 1) {
  const userId = ctx.from!.id;
  const lang = await sessionService.getLanguage(userId);
  const user = await apiService.getUserByTelegramId(userId.toString());
  if (!user) {
    await ctx.reply(t(lang, 'notRegistered'));
    return;
  }

  const result = await apiService.getMyTasks(user.id, page);
  if (result.data.length === 0) {
    await ctx.reply(t(lang, 'noTasks'));
    return;
  }

  const statusIcons: Record<string, string> = {
    TODO: '📋', IN_PROGRESS: '⏳', DONE: '✅', CANCELLED: '❌',
  };

  let message = t(lang, 'myTasks', { count: result.total }) + '\n\n';
  const buttons: any[] = [];

  for (const task of result.data) {
    message += t(lang, 'taskItem', {
      id: task.id,
      status: statusIcons[task.status] || task.status,
      title: task.title,
      dueDate: task.dueDate ? formatDate(task.dueDate, lang) : '-',
    }) + '\n\n';

    if (task.status !== 'DONE' && task.status !== 'CANCELLED') {
      buttons.push([Markup.button.callback(`#${task.id} ${t(lang, 'taskDone')}`, `taskdone_${task.id}`)]);
    }
  }

  const totalPages = Math.ceil(result.total / 5);
  const pagination = paginationKeyboard(page, totalPages, 'tasks', lang);
  if (pagination) {
    const paginationButtons = (pagination as any).reply_markup?.inline_keyboard?.[0];
    if (paginationButtons) buttons.push(paginationButtons);
  }

  await ctx.reply(message, buttons.length > 0 ? Markup.inlineKeyboard(buttons) : undefined);
}
