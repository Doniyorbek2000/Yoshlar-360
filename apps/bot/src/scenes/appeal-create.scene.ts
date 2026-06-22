import { Telegraf } from 'telegraf';
import { BotContext, SessionData } from '../types';
import { t } from '../i18n';
import { sessionService } from '../services/session.service';
import { apiService } from '../services/api.service';
import { config } from '../config';
import { categoryKeyboard, priorityKeyboard, confidentialKeyboard, sendConfirmKeyboard } from '../keyboards/appeal.keyboard';
import { cancelKeyboard } from '../keyboards/main-menu.keyboard';

export function registerAppealCreateScene(bot: Telegraf<BotContext>) {
  // Category selection
  bot.action(/^cat_(.+)$/, async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    if (session.step !== 'appeal_category') return ctx.answerCbQuery();

    session.appealCategory = ctx.match![1];
    session.step = 'appeal_title';
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'enterAppealTitle'), cancelKeyboard(lang));
  });

  // Priority selection
  bot.action(/^priority_(.+)$/, async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    if (session.step !== 'appeal_priority') return ctx.answerCbQuery();

    session.appealPriority = ctx.match![1];
    session.step = 'appeal_file';
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'sendFile'), cancelKeyboard(lang));
  });

  // Confidential selection
  bot.action(/^confidential_(yes|no)$/, async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    if (session.step !== 'appeal_confidential') return ctx.answerCbQuery();

    session.appealConfidential = ctx.match![1] === 'yes';
    session.step = 'appeal_confirm';
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);

    const confirmText = t(lang, 'confirmAppeal', {
      category: session.appealCategory || '-',
      title: session.appealTitle || '-',
      description: (session.appealDescription || '-').slice(0, 100),
      file: session.appealFileId ? '✅' : '❌',
      location: session.appealLatitude ? '✅' : '❌',
      confidential: session.appealConfidential ? t(lang, 'confidentialYes') : t(lang, 'confidentialNo'),
    });
    await ctx.reply(confirmText, sendConfirmKeyboard(lang));
  });

  // Confirm send appeal
  bot.action('appeal_send', async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    if (session.step !== 'appeal_confirm') return ctx.answerCbQuery();

    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);

    const user = await apiService.getUserByTelegramId(userId.toString());
    if (!user) {
      await ctx.reply(t(lang, 'error'));
      return;
    }

    try {
      const appeal = await apiService.createAppeal({
        title: session.appealTitle!,
        description: session.appealDescription!,
        category: session.appealCategory!,
        priority: session.appealPriority || 'MEDIUM',
        youthId: user.id,
        regionId: user.regionId,
        districtId: user.districtId,
        mahallaId: user.mahallaId,
        isConfidential: session.appealConfidential,
        contactPhone: session.appealContactPhone || user.phone,
        latitude: session.appealLatitude,
        longitude: session.appealLongitude,
        fileUrl: session.appealFileId,
        fileType: session.appealFileType,
      });

      // Clear appeal session fields
      session.step = undefined;
      session.appealTitle = undefined;
      session.appealDescription = undefined;
      session.appealCategory = undefined;
      session.appealPriority = undefined;
      session.appealConfidential = undefined;
      session.appealFileId = undefined;
      session.appealFileType = undefined;
      session.appealLatitude = undefined;
      session.appealLongitude = undefined;
      session.appealContactPhone = undefined;
      await sessionService.setSession(userId, session);

      await ctx.reply(t(lang, 'appealCreated', { id: appeal.id }));
    } catch (error) {
      console.error('Appeal create error:', error);
      await ctx.reply(t(lang, 'error'));
    }
  });

  // Cancel appeal
  bot.action('appeal_cancel', async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    session.step = undefined;
    session.appealTitle = undefined;
    session.appealDescription = undefined;
    session.appealCategory = undefined;
    session.appealPriority = undefined;
    session.appealConfidential = undefined;
    session.appealFileId = undefined;
    session.appealFileType = undefined;
    session.appealLatitude = undefined;
    session.appealLongitude = undefined;
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'appealCancelled'));
  });
}

export async function handleAppealText(ctx: BotContext, session: SessionData, lang: string): Promise<boolean> {
  const userId = ctx.from!.id;
  const text = (ctx.message as any)?.text;

  if (text === t(lang, 'cancel') || text === '/cancel') {
    session.step = undefined;
    await sessionService.setSession(userId, session);
    await ctx.reply(t(lang, 'cancelled'));
    return true;
  }

  switch (session.step) {
    case 'appeal_title': {
      if (!text || text.length < 3) {
        await ctx.reply(t(lang, 'invalidInput'));
        return true;
      }
      session.appealTitle = text;
      session.step = 'appeal_description';
      await sessionService.setSession(userId, session);
      await ctx.reply(t(lang, 'enterAppealDescription'));
      return true;
    }

    case 'appeal_description': {
      if (!text || text.length < 10) {
        await ctx.reply(t(lang, 'invalidInput'));
        return true;
      }
      session.appealDescription = text;
      session.step = 'appeal_priority';
      await sessionService.setSession(userId, session);
      await ctx.reply('⚡', priorityKeyboard(lang));
      return true;
    }

    case 'appeal_file': {
      if (text === '/skip') {
        session.step = 'appeal_location';
        await sessionService.setSession(userId, session);
        await ctx.reply(t(lang, 'sendLocation'));
        return true;
      }
      return true;
    }

    case 'appeal_location': {
      if (text === '/skip') {
        session.step = 'appeal_confidential';
        await sessionService.setSession(userId, session);
        await ctx.reply(t(lang, 'isConfidential'), confidentialKeyboard(lang));
        return true;
      }
      return true;
    }

    default:
      return false;
  }
}

export async function handleAppealFile(ctx: BotContext, session: SessionData, lang: string): Promise<boolean> {
  if (session.step !== 'appeal_file') return false;
  const userId = ctx.from!.id;

  const message = ctx.message as any;
  let fileId: string | undefined;
  let fileType = 'document';

  if (message.photo) {
    fileId = message.photo[message.photo.length - 1].file_id;
    fileType = 'photo';
  } else if (message.document) {
    if (message.document.file_size > config.maxFileSize) {
      await ctx.reply(t(lang, 'fileTooLarge'));
      return true;
    }
    fileId = message.document.file_id;
    fileType = 'document';
  } else if (message.video) {
    fileId = message.video.file_id;
    fileType = 'video';
  }

  if (fileId) {
    session.appealFileId = fileId;
    session.appealFileType = fileType;
    session.step = 'appeal_location';
    await sessionService.setSession(userId, session);
    await ctx.reply(t(lang, 'fileReceived'));
    await ctx.reply(t(lang, 'sendLocation'));
    return true;
  }

  return false;
}

export async function handleAppealLocation(ctx: BotContext, session: SessionData, lang: string): Promise<boolean> {
  if (session.step !== 'appeal_location') return false;
  const userId = ctx.from!.id;
  const message = ctx.message as any;

  if (message.location) {
    session.appealLatitude = message.location.latitude;
    session.appealLongitude = message.location.longitude;
    session.step = 'appeal_confidential';
    await sessionService.setSession(userId, session);
    await ctx.reply(t(lang, 'locationReceived'));
    await ctx.reply(t(lang, 'isConfidential'), confidentialKeyboard(lang));
    return true;
  }

  return false;
}
