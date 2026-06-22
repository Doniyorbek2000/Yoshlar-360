import { Telegraf } from 'telegraf';
import { BotContext, SessionData } from '../types';
import { t } from '../i18n';
import { sessionService } from '../services/session.service';
import { apiService } from '../services/api.service';
import { editFieldKeyboard, educationKeyboard, employmentKeyboard } from '../keyboards/settings.keyboard';

export function registerProfileEditScene(bot: Telegraf<BotContext>) {
  bot.action('edit_profile', async (ctx) => {
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    await ctx.answerCbQuery();
    await ctx.reply(t(lang, 'editSelectField'), editFieldKeyboard(lang));
  });

  bot.action('edit_phone', async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    session.step = 'edit_phone';
    session.editField = 'phone';
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'enterNewValue'));
  });

  bot.action('edit_address', async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    session.step = 'edit_address';
    session.editField = 'address';
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'enterNewValue'));
  });

  bot.action('edit_education', async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    session.step = 'edit_education';
    session.editField = 'education';
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'selectEducation'), educationKeyboard(lang));
  });

  bot.action('edit_employment', async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    session.step = 'edit_employment';
    session.editField = 'employment';
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'selectEmployment'), employmentKeyboard(lang));
  });

  bot.action('edit_interests', async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    session.step = 'edit_interests';
    session.editField = 'interests';
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'enterNewValue'));
  });

  bot.action('back_profile', async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    session.step = undefined;
    session.editField = undefined;
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
  });
}

export async function handleProfileEditText(ctx: BotContext, session: SessionData, lang: string): Promise<boolean> {
  const userId = ctx.from!.id;
  const text = (ctx.message as any)?.text;
  if (!text) return false;

  const user = await apiService.getUserByTelegramId(userId.toString());
  if (!user) return false;

  switch (session.step) {
    case 'edit_phone': {
      await apiService.updateProfile(user.id, { phone: text });
      session.step = undefined;
      session.editField = undefined;
      await sessionService.setSession(userId, session);
      await ctx.reply(t(lang, 'profileUpdated'));
      return true;
    }

    case 'edit_address': {
      await apiService.updateProfile(user.id, { address: text });
      session.step = undefined;
      session.editField = undefined;
      await sessionService.setSession(userId, session);
      await ctx.reply(t(lang, 'profileUpdated'));
      return true;
    }

    case 'edit_interests': {
      await apiService.updateProfile(user.id, { interests: text });
      session.step = undefined;
      session.editField = undefined;
      await sessionService.setSession(userId, session);
      await ctx.reply(t(lang, 'profileUpdated'));
      return true;
    }

    default:
      return false;
  }
}
