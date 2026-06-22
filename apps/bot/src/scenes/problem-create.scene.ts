import { Telegraf } from 'telegraf';
import { BotContext, SessionData } from '../types';
import { t } from '../i18n';
import { sessionService } from '../services/session.service';
import { apiService } from '../services/api.service';
import { problemCategoryKeyboard } from '../keyboards/settings.keyboard';
import { cancelKeyboard } from '../keyboards/main-menu.keyboard';

export function registerProblemCreateScene(bot: Telegraf<BotContext>) {
  bot.action(/^probcat_(.+)$/, async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    if (session.step !== 'problem_category') return ctx.answerCbQuery();

    session.problemCategory = ctx.match![1];
    session.step = 'problem_title';
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'enterProblemTitle'), cancelKeyboard(lang));
  });
}

export async function handleProblemText(ctx: BotContext, session: SessionData, lang: string): Promise<boolean> {
  const userId = ctx.from!.id;
  const text = (ctx.message as any)?.text;
  if (!text) return false;

  if (text === t(lang, 'cancel') || text === '/cancel') {
    session.step = undefined;
    await sessionService.setSession(userId, session);
    await ctx.reply(t(lang, 'cancelled'));
    return true;
  }

  switch (session.step) {
    case 'problem_title': {
      session.problemTitle = text;
      session.step = 'problem_description';
      await sessionService.setSession(userId, session);
      await ctx.reply(t(lang, 'enterProblemDescription'));
      return true;
    }

    case 'problem_description': {
      session.problemDescription = text;
      session.step = 'problem_photo';
      await sessionService.setSession(userId, session);
      await ctx.reply(t(lang, 'sendProblemPhoto'));
      return true;
    }

    case 'problem_photo': {
      if (text === '/skip') {
        session.step = 'problem_location';
        await sessionService.setSession(userId, session);
        await ctx.reply(t(lang, 'sendProblemLocation'));
        return true;
      }
      return true;
    }

    case 'problem_location': {
      if (text === '/skip') {
        return await submitProblem(ctx, session, lang);
      }
      return true;
    }

    default:
      return false;
  }
}

export async function handleProblemPhoto(ctx: BotContext, session: SessionData, lang: string): Promise<boolean> {
  if (session.step !== 'problem_photo') return false;
  const userId = ctx.from!.id;
  const message = ctx.message as any;

  if (message.photo) {
    session.problemFileId = message.photo[message.photo.length - 1].file_id;
    session.step = 'problem_location';
    await sessionService.setSession(userId, session);
    await ctx.reply(t(lang, 'fileReceived'));
    await ctx.reply(t(lang, 'sendProblemLocation'));
    return true;
  }
  return false;
}

export async function handleProblemLocation(ctx: BotContext, session: SessionData, lang: string): Promise<boolean> {
  if (session.step !== 'problem_location') return false;
  const message = ctx.message as any;

  if (message.location) {
    session.problemLatitude = message.location.latitude;
    session.problemLongitude = message.location.longitude;
    return await submitProblem(ctx, session, lang);
  }
  return false;
}

async function submitProblem(ctx: BotContext, session: SessionData, lang: string): Promise<boolean> {
  const userId = ctx.from!.id;
  const user = await apiService.getUserByTelegramId(userId.toString());
  if (!user) {
    await ctx.reply(t(lang, 'error'));
    return true;
  }

  try {
    const result = await apiService.createProblem({
      title: session.problemTitle!,
      description: session.problemDescription!,
      category: session.problemCategory!,
      reportedById: user.id,
      regionId: user.regionId,
      districtId: user.districtId,
      mahallaId: user.mahallaId,
      latitude: session.problemLatitude,
      longitude: session.problemLongitude,
      imageUrl: session.problemFileId,
    });

    session.step = undefined;
    session.problemTitle = undefined;
    session.problemDescription = undefined;
    session.problemCategory = undefined;
    session.problemFileId = undefined;
    session.problemLatitude = undefined;
    session.problemLongitude = undefined;
    await sessionService.setSession(userId, session);

    await ctx.reply(t(lang, 'problemCreated', { id: result.id }));
  } catch (error) {
    console.error('Problem create error:', error);
    await ctx.reply(t(lang, 'error'));
  }
  return true;
}
