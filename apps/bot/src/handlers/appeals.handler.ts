import { Telegraf } from 'telegraf';
import { BotContext, ApiAppeal } from '../types';
import { t } from '../i18n';
import { sessionService } from '../services/session.service';
import { apiService } from '../services/api.service';
import { appealDetailKeyboard } from '../keyboards/appeal.keyboard';
import { paginationKeyboard } from '../keyboards/main-menu.keyboard';
import { formatDate, truncate } from '../common/utils/helpers';
import { Markup } from 'telegraf';

export function registerAppealsHandler(bot: Telegraf<BotContext>) {
  // View appeal detail
  bot.action(/^viewappeal_(\d+)$/, async (ctx) => {
    const appealId = parseInt(ctx.match![1]);
    await ctx.answerCbQuery();
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);

    const appeal = await apiService.getAppealById(appealId);
    if (!appeal) {
      await ctx.reply(t(lang, 'appealNotFound'));
      return;
    }
    await formatAppealDetail(ctx, appeal, lang);
  });

  // Add comment
  bot.action(/^comment_(\d+)$/, async (ctx) => {
    const appealId = parseInt(ctx.match![1]);
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    session.step = 'admin_comment';
    session.adminAppealId = appealId;
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'addComment'));
  });

  // Rate appeal
  bot.action(/^rate_(\d+)$/, async (ctx) => {
    const appealId = parseInt(ctx.match![1]);
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    await ctx.answerCbQuery();

    await ctx.reply(
      t(lang, 'rateAppeal'),
      Markup.inlineKeyboard([
        [1, 2, 3, 4, 5].map((n) => Markup.button.callback(`${'⭐'.repeat(n)}`, `rateval_${appealId}_${n}`)),
      ]),
    );
  });

  bot.action(/^rateval_(\d+)_(\d+)$/, async (ctx) => {
    const appealId = parseInt(ctx.match![1]);
    const rating = parseInt(ctx.match![2]);
    await ctx.answerCbQuery();
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);

    try {
      await apiService.rateAppeal(appealId, rating);
      await ctx.reply('⭐'.repeat(rating) + ' ' + t(lang, 'commentAdded'));
    } catch {
      await ctx.reply(t(lang, 'error'));
    }
  });

  // Back to appeals list
  bot.action('back_appeals', async (ctx) => {
    await ctx.answerCbQuery();
    await showMyAppeals(ctx);
  });

  // Pagination
  bot.action(/^appeals_page_(\d+)$/, async (ctx) => {
    const page = parseInt(ctx.match![1]);
    await ctx.answerCbQuery();
    await showMyAppeals(ctx, page);
  });
}

export async function showMyAppeals(ctx: BotContext, page = 1) {
  const userId = ctx.from!.id;
  const lang = await sessionService.getLanguage(userId);
  const user = await apiService.getUserByTelegramId(userId.toString());

  if (!user) {
    await ctx.reply(t(lang, 'notRegistered'));
    return;
  }

  const result = await apiService.getMyAppeals(user.id, page);
  if (result.data.length === 0) {
    await ctx.reply(t(lang, 'noAppeals'));
    return;
  }

  const statusMap = getStatusMap(lang);
  let message = t(lang, 'myAppeals', { count: result.total }) + '\n\n';

  const buttons: any[] = [];
  for (const appeal of result.data) {
    message += t(lang, 'appealItem', {
      id: appeal.id,
      category: appeal.category,
      title: truncate(appeal.title, 30),
      status: statusMap[appeal.status] || appeal.status,
      date: formatDate(appeal.createdAt, lang),
    }) + '\n\n';

    buttons.push([Markup.button.callback(
      `#${appeal.id} ${t(lang, 'viewAppeal')}`,
      `viewappeal_${appeal.id}`,
    )]);
  }

  const totalPages = Math.ceil(result.total / 5);
  const pagination = paginationKeyboard(page, totalPages, 'appeals', lang);
  if (pagination) {
    const paginationButtons = (pagination as any).reply_markup?.inline_keyboard?.[0];
    if (paginationButtons) buttons.push(paginationButtons);
  }

  await ctx.reply(message, buttons.length > 0 ? Markup.inlineKeyboard(buttons) : undefined);
}

export async function formatAppealDetail(ctx: BotContext, appeal: ApiAppeal, lang: string) {
  const statusMap = getStatusMap(lang);
  const text = t(lang, 'appealDetail', {
    id: appeal.id,
    category: appeal.category,
    title: appeal.title,
    description: truncate(appeal.description, 500),
    status: statusMap[appeal.status] || appeal.status,
    assignee: appeal.assignedTo?.fullName || '-',
    region: appeal.region ? (lang === 'ru' ? appeal.region.nameRu : appeal.region.nameUz) : '-',
    date: formatDate(appeal.createdAt, lang),
    comments: appeal.comments?.length?.toString() || '0',
  });

  await ctx.reply(text, appealDetailKeyboard(lang, appeal.id));
}

function getStatusMap(lang: string): Record<string, string> {
  return {
    NEW: t(lang, 'statusNew'),
    IN_PROGRESS: t(lang, 'statusInProgress'),
    RESOLVED: t(lang, 'statusResolved'),
    REJECTED: t(lang, 'statusRejected'),
    CLOSED: t(lang, 'statusClosed'),
  };
}
