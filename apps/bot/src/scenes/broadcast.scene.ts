import { Telegraf } from 'telegraf';
import { BotContext, SessionData } from '../types';
import { t } from '../i18n';
import { sessionService } from '../services/session.service';
import { apiService } from '../services/api.service';
import { broadcastTargetKeyboard } from '../keyboards/settings.keyboard';
import { regionSelectKeyboard, districtSelectKeyboard, mahallaSelectKeyboard } from '../keyboards/appeal.keyboard';
import { yesNoKeyboard, cancelKeyboard } from '../keyboards/main-menu.keyboard';
import { ROLES } from '../constants';

export function registerBroadcastScene(bot: Telegraf<BotContext>) {
  // Target selection
  bot.action(/^bcast_(.+)$/, async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    if (session.step !== 'broadcast_target') return ctx.answerCbQuery();

    const target = ctx.match![1];
    session.broadcastTarget = target;
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);

    if (target === 'ALL') {
      session.step = 'broadcast_text';
      await sessionService.setSession(userId, session);
      await ctx.reply(t(lang, 'broadcastEnterText'), cancelKeyboard(lang));
    } else if (target === 'ROLE') {
      session.step = 'broadcast_role';
      await sessionService.setSession(userId, session);
      const roleButtons = [
        { label: 'Youth', value: ROLES.YOUTH },
        { label: 'Mahalla Leader', value: ROLES.MAHALLA_LEADER },
        { label: 'District Admin', value: ROLES.DISTRICT_ADMIN },
        { label: 'Region Admin', value: ROLES.REGION_ADMIN },
      ];
      const { Markup } = require('telegraf');
      await ctx.reply(
        t(lang, 'broadcastSelectRole'),
        Markup.inlineKeyboard(roleButtons.map((r: any) => [Markup.button.callback(r.label, `bcastrole_${r.value}`)]))
      );
    } else if (target === 'REGION') {
      session.step = 'broadcast_region';
      await sessionService.setSession(userId, session);
      const regions = await apiService.getRegions();
      await ctx.reply(t(lang, 'selectRegion'), regionSelectKeyboard(regions, lang));
    } else if (target === 'DISTRICT') {
      session.step = 'broadcast_district_region';
      await sessionService.setSession(userId, session);
      const regions = await apiService.getRegions();
      await ctx.reply(t(lang, 'selectRegion'), regionSelectKeyboard(regions, lang));
    } else if (target === 'MAHALLA') {
      session.step = 'broadcast_mahalla_region';
      await sessionService.setSession(userId, session);
      const regions = await apiService.getRegions();
      await ctx.reply(t(lang, 'selectRegion'), regionSelectKeyboard(regions, lang));
    }
  });

  // Role selection for broadcast
  bot.action(/^bcastrole_(.+)$/, async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    if (session.step !== 'broadcast_role') return ctx.answerCbQuery();

    session.broadcastTarget = 'ROLE';
    session.broadcastTargetId = undefined;
    session.step = 'broadcast_text';
    (session as any).broadcastRoleValue = ctx.match![1];
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'broadcastEnterText'), cancelKeyboard(lang));
  });

  // Confirm broadcast
  bot.action('yes', async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    if (session.step !== 'broadcast_confirm') return;

    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'broadcastSending'));

    const user = await apiService.getUserByTelegramId(userId.toString());
    if (!user) {
      await ctx.reply(t(lang, 'error'));
      return;
    }

    const result = await apiService.sendBroadcast({
      target: session.broadcastTarget!,
      targetId: session.broadcastTargetId,
      text: session.broadcastText!,
      fileUrl: session.broadcastFileId,
      senderId: user.id,
    });

    session.step = undefined;
    session.broadcastTarget = undefined;
    session.broadcastTargetId = undefined;
    session.broadcastText = undefined;
    session.broadcastFileId = undefined;
    await sessionService.setSession(userId, session);

    await ctx.reply(t(lang, 'broadcastSent', { sent: result.sent, failed: result.failed }));
  });

  bot.action('no', async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    if (session.step !== 'broadcast_confirm') return;

    session.step = undefined;
    session.broadcastTarget = undefined;
    session.broadcastTargetId = undefined;
    session.broadcastText = undefined;
    session.broadcastFileId = undefined;
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'broadcastCancelled'));
  });
}

export async function handleBroadcastText(ctx: BotContext, session: SessionData, lang: string): Promise<boolean> {
  const userId = ctx.from!.id;
  const text = (ctx.message as any)?.text;
  if (!text) return false;

  if (text === t(lang, 'cancel') || text === '/cancel') {
    session.step = undefined;
    await sessionService.setSession(userId, session);
    await ctx.reply(t(lang, 'broadcastCancelled'));
    return true;
  }

  if (session.step === 'broadcast_text') {
    session.broadcastText = text;
    session.step = 'broadcast_confirm';
    await sessionService.setSession(userId, session);

    const targetLabel = session.broadcastTarget || 'ALL';
    await ctx.reply(
      t(lang, 'broadcastConfirm', { target: targetLabel, text: text.slice(0, 200) }),
      yesNoKeyboard(lang),
    );
    return true;
  }

  return false;
}
