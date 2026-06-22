import { Telegraf } from 'telegraf';
import { BotContext } from '../types';
import { t } from '../i18n';
import { sessionService } from '../services/session.service';
import { apiService } from '../services/api.service';
import { languageKeyboard, phoneKeyboard, youthMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { adminMenuKeyboard } from '../keyboards/admin-menu.keyboard';
import { ADMIN_ROLES } from '../constants';

export function registerStartHandler(bot: Telegraf<BotContext>) {
  bot.start(async (ctx) => {
    const userId = ctx.from!.id;
    await ctx.reply(t('uz', 'selectLanguage'), languageKeyboard());
  });

  bot.action('lang_uz', async (ctx) => {
    const userId = ctx.from!.id;
    await sessionService.setLanguage(userId, 'uz');
    await ctx.answerCbQuery();
    await ctx.reply(t('uz', 'languageSet'));
    await checkUserAndProceed(ctx, userId);
  });

  bot.action('lang_ru', async (ctx) => {
    const userId = ctx.from!.id;
    await sessionService.setLanguage(userId, 'ru');
    await ctx.answerCbQuery();
    await ctx.reply(t('ru', 'languageSet'));
    await checkUserAndProceed(ctx, userId);
  });

  // Phone contact handler
  bot.on('contact', async (ctx) => {
    const userId = ctx.from!.id;
    const contact = ctx.message.contact;

    if (contact.user_id !== userId) {
      const lang = await sessionService.getLanguage(userId);
      await ctx.reply(t(lang, 'invalidInput'));
      return;
    }

    const phone = contact.phone_number.startsWith('+') ? contact.phone_number : '+' + contact.phone_number;
    const lang = await sessionService.getLanguage(userId);

    const existingUser = await apiService.verifyPhone(phone, userId.toString());
    if (existingUser) {
      await ctx.reply(t(lang, 'alreadyRegistered'));
      await showMainMenu(ctx, userId, existingUser.role, lang);
      return;
    }

    const session = await sessionService.getSession(userId);
    session.phone = phone;
    session.step = 'reg_fullname';
    await sessionService.setSession(userId, session);
    await ctx.reply(t(lang, 'registrationStart'));
  });
}

async function checkUserAndProceed(ctx: BotContext, userId: number) {
  const lang = await sessionService.getLanguage(userId);
  const user = await apiService.getUserByTelegramId(userId.toString());

  if (user) {
    await ctx.reply(t(lang, 'alreadyRegistered'));
    await showMainMenu(ctx, userId, user.role, lang);
  } else {
    await ctx.reply(t(lang, 'sharePhone'), phoneKeyboard(lang));
  }
}

async function showMainMenu(ctx: BotContext, userId: number, role: string, lang: string) {
  if (ADMIN_ROLES.includes(role as any)) {
    await ctx.reply(t(lang, 'adminMenu'), adminMenuKeyboard(lang, role));
  } else {
    await ctx.reply(t(lang, 'mainMenu'), youthMenuKeyboard(lang));
  }
}
