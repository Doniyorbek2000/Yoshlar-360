import { Telegraf } from 'telegraf';
import { BotContext, SessionData } from '../types';
import { t } from '../i18n';
import { sessionService } from '../services/session.service';
import { apiService } from '../services/api.service';
import { appealActionsKeyboard, statusSelectKeyboard } from '../keyboards/admin-menu.keyboard';
import { paginationKeyboard } from '../keyboards/main-menu.keyboard';
import { formatDate, truncate } from '../common/utils/helpers';
import { Markup } from 'telegraf';

export function registerAdminHandler(bot: Telegraf<BotContext>) {
  // Accept appeal
  bot.action(/^accept_(\d+)$/, async (ctx) => {
    const appealId = parseInt(ctx.match![1]);
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    const user = await apiService.getUserByTelegramId(userId.toString());
    if (!user) return ctx.answerCbQuery();

    try {
      await apiService.updateAppealStatus(appealId, 'IN_PROGRESS', user.id);
      await ctx.answerCbQuery();
      await ctx.reply(t(lang, 'statusUpdated'));
    } catch {
      await ctx.answerCbQuery();
      await ctx.reply(t(lang, 'error'));
    }
  });

  // Reject appeal
  bot.action(/^reject_(\d+)$/, async (ctx) => {
    const appealId = parseInt(ctx.match![1]);
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    const user = await apiService.getUserByTelegramId(userId.toString());
    if (!user) return ctx.answerCbQuery();

    try {
      await apiService.updateAppealStatus(appealId, 'REJECTED', user.id);
      await ctx.answerCbQuery();
      await ctx.reply(t(lang, 'statusUpdated'));
    } catch {
      await ctx.answerCbQuery();
      await ctx.reply(t(lang, 'error'));
    }
  });

  // Close appeal
  bot.action(/^close_(\d+)$/, async (ctx) => {
    const appealId = parseInt(ctx.match![1]);
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    const user = await apiService.getUserByTelegramId(userId.toString());
    if (!user) return ctx.answerCbQuery();

    try {
      await apiService.updateAppealStatus(appealId, 'CLOSED', user.id);
      await ctx.answerCbQuery();
      await ctx.reply(t(lang, 'statusUpdated'));
    } catch {
      await ctx.answerCbQuery();
      await ctx.reply(t(lang, 'error'));
    }
  });

  // Reply to appeal
  bot.action(/^reply_(\d+)$/, async (ctx) => {
    const appealId = parseInt(ctx.match![1]);
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    session.step = 'admin_reply';
    session.adminAppealId = appealId;
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'enterReply'));
  });

  // Change status
  bot.action(/^chstatus_(\d+)$/, async (ctx) => {
    const appealId = parseInt(ctx.match![1]);
    await ctx.answerCbQuery();
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'selectStatus'), statusSelectKeyboard(lang, appealId));
  });

  // Set status
  bot.action(/^setstatus_(\d+)_(.+)$/, async (ctx) => {
    const appealId = parseInt(ctx.match![1]);
    const status = ctx.match![2];
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    const user = await apiService.getUserByTelegramId(userId.toString());
    if (!user) return ctx.answerCbQuery();

    try {
      await apiService.updateAppealStatus(appealId, status, user.id);
      await ctx.answerCbQuery();
      await ctx.reply(t(lang, 'statusUpdated'));
    } catch {
      await ctx.answerCbQuery();
      await ctx.reply(t(lang, 'error'));
    }
  });

  // Admin appeal pagination
  bot.action(/^adminappeals_page_(\d+)$/, async (ctx) => {
    const page = parseInt(ctx.match![1]);
    await ctx.answerCbQuery();
    await showAdminAppeals(ctx, undefined, page);
  });

  bot.action(/^adminappeal_(\d+)$/, async (ctx) => {
    const appealId = parseInt(ctx.match![1]);
    await ctx.answerCbQuery();
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);

    const appeal = await apiService.getAppealById(appealId);
    if (!appeal) {
      await ctx.reply(t(lang, 'appealNotFound'));
      return;
    }

    const text = t(lang, 'adminAppealDetail', {
      id: appeal.id,
      category: appeal.category,
      title: appeal.title,
      description: truncate(appeal.description, 500),
      status: appeal.status,
      priority: appeal.priority,
      applicant: appeal.youth?.fullName || '-',
      phone: appeal.youth?.phone || '-',
      region: appeal.region ? (lang === 'ru' ? appeal.region.nameRu : appeal.region.nameUz) : '-',
      date: formatDate(appeal.createdAt, lang),
    });

    await ctx.reply(text, appealActionsKeyboard(lang, appeal.id));
  });
}

export async function showAdminDashboard(ctx: BotContext) {
  const userId = ctx.from!.id;
  const lang = await sessionService.getLanguage(userId);
  const user = await apiService.getUserByTelegramId(userId.toString());
  if (!user) {
    await ctx.reply(t(lang, 'notRegistered'));
    return;
  }

  const dashboard = await apiService.getDashboard({
    regionId: user.regionId,
    districtId: user.districtId,
  });

  await ctx.reply(t(lang, 'dashboardInfo', {
    totalYouth: dashboard.totalYouth,
    totalAppeals: dashboard.totalAppeals,
    newAppeals: dashboard.newAppeals,
    resolvedAppeals: dashboard.resolvedAppeals,
    totalProblems: dashboard.totalProblems,
    totalTasks: dashboard.totalTasks,
    doneTasks: dashboard.doneTasks,
    overdueTasksCount: dashboard.overdueTasksCount,
  }));
}

export async function showAdminAppeals(ctx: BotContext, status?: string, page = 1) {
  const userId = ctx.from!.id;
  const lang = await sessionService.getLanguage(userId);
  const user = await apiService.getUserByTelegramId(userId.toString());
  if (!user) return;

  const result = await apiService.getAppeals({
    status,
    page,
    limit: 5,
    regionId: user.regionId,
  });

  if (result.data.length === 0) {
    await ctx.reply(t(lang, 'noAppeals'));
    return;
  }

  let message = `📋 ${status ? t(lang, 'adminNewAppeals') : t(lang, 'adminAllAppeals')} (${result.total})\n\n`;
  const buttons: any[] = [];

  for (const appeal of result.data) {
    message += `#${appeal.id} | ${appeal.category} | ${appeal.status}\n📝 ${truncate(appeal.title, 30)}\n👤 ${appeal.youth?.fullName || '-'}\n📅 ${formatDate(appeal.createdAt, lang)}\n\n`;
    buttons.push([Markup.button.callback(`#${appeal.id} ${t(lang, 'viewAppeal')}`, `adminappeal_${appeal.id}`)]);
  }

  const totalPages = Math.ceil(result.total / 5);
  const pagination = paginationKeyboard(page, totalPages, 'adminappeals', lang);
  if (pagination) {
    const paginationButtons = (pagination as any).reply_markup?.inline_keyboard?.[0];
    if (paginationButtons) buttons.push(paginationButtons);
  }

  await ctx.reply(message, buttons.length > 0 ? Markup.inlineKeyboard(buttons) : undefined);
}

export async function showKpi(ctx: BotContext) {
  const userId = ctx.from!.id;
  const lang = await sessionService.getLanguage(userId);
  const user = await apiService.getUserByTelegramId(userId.toString());
  if (!user) return;

  const kpi = await apiService.getKpi(user.id);
  if (!kpi) {
    await ctx.reply(t(lang, 'noKpi'));
    return;
  }

  await ctx.reply(t(lang, 'kpiInfo', {
    score: kpi.score,
    appeals: kpi.appeals,
    tasks: kpi.tasks,
    youth: kpi.youth,
    rank: kpi.rank,
  }));
}

export async function handleAdminText(ctx: BotContext, session: SessionData, lang: string): Promise<boolean> {
  const userId = ctx.from!.id;
  const text = (ctx.message as any)?.text;
  if (!text) return false;

  if (session.step === 'admin_reply' && session.adminAppealId) {
    const user = await apiService.getUserByTelegramId(userId.toString());
    if (!user) return false;

    try {
      await apiService.replyToAppeal(session.adminAppealId, user.id, text);
      session.step = undefined;
      session.adminAppealId = undefined;
      session.adminReplyText = undefined;
      await sessionService.setSession(userId, session);
      await ctx.reply(t(lang, 'replySent'));
    } catch {
      await ctx.reply(t(lang, 'error'));
    }
    return true;
  }

  if (session.step === 'admin_comment' && session.adminAppealId) {
    const user = await apiService.getUserByTelegramId(userId.toString());
    if (!user) return false;

    try {
      await apiService.addComment(session.adminAppealId, user.id, text);
      session.step = undefined;
      session.adminAppealId = undefined;
      await sessionService.setSession(userId, session);
      await ctx.reply(t(lang, 'commentAdded'));
    } catch {
      await ctx.reply(t(lang, 'error'));
    }
    return true;
  }

  return false;
}
