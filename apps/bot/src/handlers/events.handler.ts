import { Telegraf, Markup } from 'telegraf';
import { BotContext } from '../types';
import { t } from '../i18n';
import { sessionService } from '../services/session.service';
import { apiService } from '../services/api.service';

export function registerEventsHandler(bot: Telegraf<BotContext>) {
  bot.action(/^event_view_(\d+)$/, async (ctx) => {
    const eventId = parseInt(ctx.match![1]);
    await ctx.answerCbQuery();
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);

    const event = await apiService.getEventById(eventId);
    if (!event) {
      await ctx.reply(t(lang, 'eventNotFound'));
      return;
    }

    const typeLabels: Record<string, string> = {
      SEMINAR: 'Seminar', WORKSHOP: 'Ustaxona', CONFERENCE: 'Konferensiya',
      SPORT: 'Sport', CULTURAL: 'Madaniy', VOLUNTEERING: 'Volontyorlik', OTHER: 'Boshqa',
    };
    const statusLabels: Record<string, string> = {
      DRAFT: 'Qoralama', UPCOMING: 'Rejalashtirilgan', ONGOING: 'Davom etmoqda',
      COMPLETED: 'Yakunlangan', CANCELLED: 'Bekor qilingan',
    };

    const startDate = event.startDate ? new Date(event.startDate).toLocaleDateString('uz-UZ') : '-';
    const endDate = event.endDate ? new Date(event.endDate).toLocaleDateString('uz-UZ') : '-';
    const participantsCount = event._count?.participants || event.participants?.length || 0;
    const maxStr = event.maxParticipants ? ` / ${event.maxParticipants}` : '';

    const text = t(lang, 'eventDetail', {
      id: event.id,
      title: event.title,
      description: event.description || '-',
      type: typeLabels[event.type] || event.type,
      status: statusLabels[event.status] || event.status,
      startDate,
      endDate,
      location: event.location || '-',
      participants: `${participantsCount}${maxStr}`,
      organizer: event.organizer?.fullName || '-',
      region: event.region?.nameUz || '-',
    });

    const buttons = [];
    if (event.status === 'UPCOMING') {
      buttons.push([Markup.button.callback(t(lang, 'eventRegister'), `event_register_${event.id}`)]);
    }

    await ctx.reply(text, buttons.length > 0 ? Markup.inlineKeyboard(buttons) : undefined);
  });

  bot.action(/^event_register_(\d+)$/, async (ctx) => {
    const eventId = parseInt(ctx.match![1]);
    await ctx.answerCbQuery();
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);

    const user = await apiService.getUserByTelegramId(userId.toString());
    if (!user) {
      await ctx.reply(t(lang, 'notRegistered'));
      return;
    }

    const result = await apiService.registerForEvent(eventId);
    if (result) {
      await ctx.reply(t(lang, 'eventRegistered'));
    } else {
      await ctx.reply(t(lang, 'eventRegisterFailed'));
    }
  });

  bot.action(/^events_page_(\d+)$/, async (ctx) => {
    const page = parseInt(ctx.match![1]);
    await ctx.answerCbQuery();
    await showEvents(ctx, page);
  });
}

export async function showEvents(ctx: BotContext, page = 1) {
  const userId = ctx.from!.id;
  const lang = await sessionService.getLanguage(userId);

  const events = await apiService.getEvents(page);
  if (!events.data || events.data.length === 0) {
    await ctx.reply(t(lang, 'noEvents'));
    return;
  }

  let text = t(lang, 'eventsTitle', { count: events.total }) + '\n\n';
  const buttons: any[] = [];

  events.data.forEach((event: any) => {
    const date = event.startDate ? new Date(event.startDate).toLocaleDateString('uz-UZ') : '-';
    const statusEmoji: Record<string, string> = {
      UPCOMING: '🟢', ONGOING: '🔵', COMPLETED: '✅', CANCELLED: '❌', DRAFT: '📝',
    };
    text += `${statusEmoji[event.status] || '📅'} ${event.title}\n📅 ${date} | 📍 ${event.location || '-'}\n\n`;
    buttons.push([Markup.button.callback(`📋 ${event.title.slice(0, 30)}`, `event_view_${event.id}`)]);
  });

  const navButtons = [];
  if (page > 1) navButtons.push(Markup.button.callback(t(lang, 'prev'), `events_page_${page - 1}`));
  if (events.data.length === 5) navButtons.push(Markup.button.callback(t(lang, 'next'), `events_page_${page + 1}`));
  if (navButtons.length > 0) buttons.push(navButtons);

  await ctx.reply(text, Markup.inlineKeyboard(buttons));
}
