import { Telegraf } from 'telegraf';
import { BotContext } from '../types';
import { t } from '../i18n';
import { sessionService } from '../services/session.service';
import { apiService } from '../services/api.service';
import { youthMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { adminMenuKeyboard } from '../keyboards/admin-menu.keyboard';
import { ADMIN_ROLES } from '../constants';
import { handleRegistrationText } from '../scenes/registration.scene';
import { handleAppealText, handleAppealFile, handleAppealLocation } from '../scenes/appeal-create.scene';
import { handleProfileEditText } from '../scenes/profile-edit.scene';
import { handleProblemText, handleProblemPhoto, handleProblemLocation } from '../scenes/problem-create.scene';
import { handleBroadcastText } from '../scenes/broadcast.scene';
import { handleAdminText } from './admin.handler';
import { handleSurveyText } from './surveys.handler';

export function registerMenuHandler(bot: Telegraf<BotContext>) {
  bot.command('menu', async (ctx) => {
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    const user = await apiService.getUserByTelegramId(userId.toString());
    if (!user) {
      await ctx.reply(t(lang, 'notRegistered'));
      return;
    }
    if (ADMIN_ROLES.includes(user.role as any)) {
      await ctx.reply(t(lang, 'adminMenu'), adminMenuKeyboard(lang, user.role));
    } else {
      await ctx.reply(t(lang, 'mainMenu'), youthMenuKeyboard(lang));
    }
  });

  bot.command('cancel', async (ctx) => {
    const userId = ctx.from!.id;
    await sessionService.clearSession(userId);
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'cancelled'));
  });

  bot.command('help', async (ctx) => {
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'help'));
  });

  bot.command('language', async (ctx) => {
    const { languageKeyboard } = require('../keyboards/main-menu.keyboard');
    await ctx.reply(t('uz', 'selectLanguage'), languageKeyboard());
  });

  bot.command('profile', async (ctx) => {
    const { showProfile } = require('./profile.handler');
    await showProfile(ctx);
  });

  bot.command('appeals', async (ctx) => {
    const { showMyAppeals } = require('./appeals.handler');
    await showMyAppeals(ctx);
  });

  bot.command('settings', async (ctx) => {
    const { showSettings } = require('./settings.handler');
    await showSettings(ctx);
  });

  // Main text router — handles all text messages based on session step or menu button text
  bot.on('text', async (ctx) => {
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    const session = await sessionService.getSession(userId);
    const text = ctx.message.text;

    // Handle active scene flows first
    if (session.step?.startsWith('reg_')) {
      if (await handleRegistrationText(ctx, session, lang)) return;
    }
    if (session.step?.startsWith('appeal_')) {
      if (await handleAppealText(ctx, session, lang)) return;
    }
    if (session.step?.startsWith('edit_')) {
      if (await handleProfileEditText(ctx, session, lang)) return;
    }
    if (session.step?.startsWith('problem_')) {
      if (await handleProblemText(ctx, session, lang)) return;
    }
    if (session.step?.startsWith('broadcast_')) {
      if (await handleBroadcastText(ctx, session, lang)) return;
    }
    if (session.step?.startsWith('survey_')) {
      if (await handleSurveyText(ctx, session, lang)) return;
    }
    if (session.step?.startsWith('admin_')) {
      if (await handleAdminText(ctx, session, lang)) return;
    }

    // Youth menu buttons
    if (text === t(lang, 'menuAppeal')) {
      session.step = 'appeal_category';
      await sessionService.setSession(userId, session);
      const { categoryKeyboard } = require('../keyboards/appeal.keyboard');
      await ctx.reply(t(lang, 'selectCategory'), categoryKeyboard(lang));
      return;
    }

    if (text === t(lang, 'menuMyAppeals')) {
      const { showMyAppeals } = require('./appeals.handler');
      await showMyAppeals(ctx);
      return;
    }

    if (text === t(lang, 'menuCheckStatus')) {
      session.step = 'check_status';
      await sessionService.setSession(userId, session);
      await ctx.reply(t(lang, 'enterAppealId'));
      return;
    }

    if (text === t(lang, 'menuProfile')) {
      const { showProfile } = require('./profile.handler');
      await showProfile(ctx);
      return;
    }

    if (text === t(lang, 'menuNews')) {
      const { showNews } = require('./notifications.handler');
      await showNews(ctx);
      return;
    }

    if (text === t(lang, 'menuNotifications')) {
      const { showNotifications } = require('./notifications.handler');
      await showNotifications(ctx);
      return;
    }

    if (text === t(lang, 'menuEvents')) {
      const { showEvents } = require('./events.handler');
      await showEvents(ctx);
      return;
    }

    if (text === t(lang, 'menuSurveys')) {
      const { showSurveys } = require('./surveys.handler');
      await showSurveys(ctx);
      return;
    }

    if (text === t(lang, 'menuContact')) {
      await ctx.reply(t(lang, 'contactInfo'));
      return;
    }

    if (text === t(lang, 'menuSettings')) {
      const { showSettings } = require('./settings.handler');
      await showSettings(ctx);
      return;
    }

    // Admin menu buttons
    if (text === t(lang, 'adminDashboard')) {
      const { showAdminDashboard } = require('./admin.handler');
      await showAdminDashboard(ctx);
      return;
    }

    if (text === t(lang, 'adminNewAppeals')) {
      const { showAdminAppeals } = require('./admin.handler');
      await showAdminAppeals(ctx, 'NEW');
      return;
    }

    if (text === t(lang, 'adminAllAppeals')) {
      const { showAdminAppeals } = require('./admin.handler');
      await showAdminAppeals(ctx);
      return;
    }

    if (text === t(lang, 'adminTasks')) {
      const { showAdminTasks } = require('./tasks.handler');
      await showAdminTasks(ctx);
      return;
    }

    if (text === t(lang, 'adminProblems')) {
      session.step = 'problem_category';
      await sessionService.setSession(userId, session);
      const { problemCategoryKeyboard } = require('../keyboards/settings.keyboard');
      await ctx.reply(t(lang, 'problemCreate'), problemCategoryKeyboard(lang));
      return;
    }

    if (text === t(lang, 'adminKpi')) {
      const { showKpi } = require('./admin.handler');
      await showKpi(ctx);
      return;
    }

    if (text === t(lang, 'adminBroadcast')) {
      session.step = 'broadcast_target';
      await sessionService.setSession(userId, session);
      const { broadcastTargetKeyboard } = require('../keyboards/settings.keyboard');
      await ctx.reply(t(lang, 'broadcastSelectTarget'), broadcastTargetKeyboard(lang));
      return;
    }

    if (text === t(lang, 'adminProfile')) {
      const { showProfile } = require('./profile.handler');
      await showProfile(ctx);
      return;
    }

    if (text === t(lang, 'back')) {
      session.step = undefined;
      await sessionService.setSession(userId, session);
      const user = await apiService.getUserByTelegramId(userId.toString());
      if (user && ADMIN_ROLES.includes(user.role as any)) {
        await ctx.reply(t(lang, 'adminMenu'), adminMenuKeyboard(lang, user.role));
      } else {
        await ctx.reply(t(lang, 'mainMenu'), youthMenuKeyboard(lang));
      }
      return;
    }

    // Check status flow
    if (session.step === 'check_status') {
      const id = parseInt(text);
      if (isNaN(id)) {
        await ctx.reply(t(lang, 'invalidInput'));
        return;
      }
      session.step = undefined;
      await sessionService.setSession(userId, session);
      const appeal = await apiService.getAppealById(id);
      if (!appeal) {
        await ctx.reply(t(lang, 'appealNotFound'));
        return;
      }
      const { formatAppealDetail } = require('./appeals.handler');
      await formatAppealDetail(ctx, appeal, lang);
      return;
    }
  });

  // File handlers for active scenes
  bot.on('photo', async (ctx) => {
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    const session = await sessionService.getSession(userId);
    if (await handleAppealFile(ctx, session, lang)) return;
    if (await handleProblemPhoto(ctx, session, lang)) return;
  });

  bot.on('document', async (ctx) => {
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    const session = await sessionService.getSession(userId);
    if (await handleAppealFile(ctx, session, lang)) return;
  });

  bot.on('video', async (ctx) => {
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    const session = await sessionService.getSession(userId);
    if (await handleAppealFile(ctx, session, lang)) return;
  });

  bot.on('location', async (ctx) => {
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    const session = await sessionService.getSession(userId);
    if (await handleAppealLocation(ctx, session, lang)) return;
    if (await handleProblemLocation(ctx, session, lang)) return;
  });
}
