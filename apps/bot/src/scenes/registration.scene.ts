import { Telegraf } from 'telegraf';
import { BotContext, SessionData } from '../types';
import { t } from '../i18n';
import { sessionService } from '../services/session.service';
import { apiService } from '../services/api.service';
import { parseDate } from '../common/utils/helpers';
import { confirmKeyboard } from '../keyboards/main-menu.keyboard';
import { genderKeyboard, educationKeyboard, employmentKeyboard, socialStatusKeyboard } from '../keyboards/settings.keyboard';
import { regionSelectKeyboard, districtSelectKeyboard, mahallaSelectKeyboard } from '../keyboards/appeal.keyboard';
import { youthMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { adminMenuKeyboard } from '../keyboards/admin-menu.keyboard';
import { ADMIN_ROLES } from '../constants';

export function registerRegistrationScene(bot: Telegraf<BotContext>) {
  // Step: enter full name
  bot.action('start_registration', async (ctx) => {
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    const session = await sessionService.getSession(userId);
    session.step = 'reg_fullname';
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    await ctx.reply(t(lang, 'enterFullName'));
  });

  // Gender selection
  bot.action(/^gender_(MALE|FEMALE)$/, async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    if (session.step !== 'reg_gender') return;
    session.gender = ctx.match![1];
    session.step = 'reg_region';
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);
    const regions = await apiService.getRegions();
    await ctx.reply(t(lang, 'selectRegion'), regionSelectKeyboard(regions, lang));
  });

  // Region selection during registration
  bot.action(/^region_(\d+)$/, async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    if (session.step !== 'reg_region' && session.step !== 'appeal_region') return ctx.answerCbQuery();

    const regionId = parseInt(ctx.match![1]);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);

    if (session.step === 'reg_region') {
      session.regionId = regionId;
      session.step = 'reg_district';
      await sessionService.setSession(userId, session);
      const districts = await apiService.getDistricts(regionId);
      if (districts.length === 0) {
        session.step = 'reg_address';
        await sessionService.setSession(userId, session);
        await ctx.reply(t(lang, 'enterAddress'));
      } else {
        await ctx.reply(t(lang, 'selectDistrict'), districtSelectKeyboard(districts, lang));
      }
    }
  });

  // District selection during registration
  bot.action(/^district_(\d+)$/, async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    if (session.step !== 'reg_district' && session.step !== 'appeal_district') return ctx.answerCbQuery();

    const districtId = parseInt(ctx.match![1]);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);

    if (session.step === 'reg_district') {
      session.districtId = districtId;
      session.step = 'reg_mahalla';
      await sessionService.setSession(userId, session);
      const mahallas = await apiService.getMahallas(districtId);
      if (mahallas.length === 0) {
        session.step = 'reg_address';
        await sessionService.setSession(userId, session);
        await ctx.reply(t(lang, 'enterAddress'));
      } else {
        await ctx.reply(t(lang, 'selectMahalla'), mahallaSelectKeyboard(mahallas, lang));
      }
    }
  });

  // Mahalla selection during registration
  bot.action(/^mahalla_(\d+)$/, async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    if (session.step !== 'reg_mahalla') return ctx.answerCbQuery();

    session.mahallaId = parseInt(ctx.match![1]);
    session.step = 'reg_address';
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'enterAddress'));
  });

  // Education selection
  bot.action(/^edu_(.+)$/, async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    if (session.step !== 'reg_education' && session.step !== 'edit_education') return ctx.answerCbQuery();

    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);

    if (session.step === 'reg_education') {
      session.education = ctx.match![1];
      session.step = 'reg_employment';
      await sessionService.setSession(userId, session);
      await ctx.reply(t(lang, 'selectEmployment'), employmentKeyboard(lang));
    } else if (session.step === 'edit_education') {
      const user = await apiService.getUserByTelegramId(userId.toString());
      if (user) {
        await apiService.updateProfile(user.id, { education: ctx.match![1] });
        session.step = undefined;
        session.editField = undefined;
        await sessionService.setSession(userId, session);
        await ctx.reply(t(lang, 'profileUpdated'));
      }
    }
  });

  // Employment selection
  bot.action(/^emp_(.+)$/, async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    if (session.step !== 'reg_employment' && session.step !== 'edit_employment') return ctx.answerCbQuery();

    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);

    if (session.step === 'reg_employment') {
      session.employmentStatus = ctx.match![1];
      session.step = 'reg_social';
      await sessionService.setSession(userId, session);
      await ctx.reply(t(lang, 'selectSocialStatus'), socialStatusKeyboard(lang));
    } else if (session.step === 'edit_employment') {
      const user = await apiService.getUserByTelegramId(userId.toString());
      if (user) {
        await apiService.updateProfile(user.id, { employmentStatus: ctx.match![1] });
        session.step = undefined;
        session.editField = undefined;
        await sessionService.setSession(userId, session);
        await ctx.reply(t(lang, 'profileUpdated'));
      }
    }
  });

  // Social status selection
  bot.action(/^social_(.+)$/, async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    if (session.step !== 'reg_social') return ctx.answerCbQuery();

    session.socialStatus = ctx.match![1];
    session.step = 'reg_interests';
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'enterInterests'));
  });

  // Confirm registration
  bot.action('confirm_yes', async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    if (session.step !== 'reg_confirm') return ctx.answerCbQuery();

    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);

    try {
      const user = await apiService.register({
        fullName: session.fullName!,
        phone: session.phone!,
        telegramId: userId.toString(),
        birthDate: session.birthDate,
        gender: session.gender,
        regionId: session.regionId,
        districtId: session.districtId,
        mahallaId: session.mahallaId,
        address: session.address,
        education: session.education,
        employmentStatus: session.employmentStatus,
        socialStatus: session.socialStatus,
        interests: session.interests,
      });

      await sessionService.clearSession(userId);
      await ctx.reply(t(lang, 'profileCreated'));

      if (ADMIN_ROLES.includes(user.role as any)) {
        await ctx.reply(t(lang, 'adminMenu'), adminMenuKeyboard(lang, user.role));
      } else {
        await ctx.reply(t(lang, 'mainMenu'), youthMenuKeyboard(lang));
      }
    } catch (error) {
      console.error('Registration error:', error);
      await ctx.reply(t(lang, 'error'));
    }
  });

  // Cancel registration
  bot.action('confirm_no', async (ctx) => {
    const userId = ctx.from!.id;
    const session = await sessionService.getSession(userId);
    if (session.step !== 'reg_confirm') return ctx.answerCbQuery();

    session.step = 'reg_fullname';
    session.fullName = undefined;
    session.birthDate = undefined;
    session.gender = undefined;
    session.regionId = undefined;
    session.districtId = undefined;
    session.mahallaId = undefined;
    session.address = undefined;
    session.education = undefined;
    session.employmentStatus = undefined;
    session.socialStatus = undefined;
    session.interests = undefined;
    await sessionService.setSession(userId, session);
    await ctx.answerCbQuery();
    const lang = await sessionService.getLanguage(userId);
    await ctx.reply(t(lang, 'enterFullName'));
  });
}

export async function handleRegistrationText(ctx: BotContext, session: SessionData, lang: string): Promise<boolean> {
  const userId = ctx.from!.id;
  const text = (ctx.message as any)?.text;
  if (!text) return false;

  if (text === t(lang, 'cancel') || text === '/cancel') {
    await sessionService.clearSession(userId);
    await ctx.reply(t(lang, 'registrationCancelled'));
    return true;
  }

  switch (session.step) {
    case 'reg_fullname': {
      if (text.length < 3 || text.length > 100) {
        await ctx.reply(t(lang, 'invalidInput'));
        return true;
      }
      session.fullName = text;
      session.step = 'reg_birthdate';
      await sessionService.setSession(userId, session);
      await ctx.reply(t(lang, 'enterBirthDate'));
      return true;
    }

    case 'reg_birthdate': {
      const date = parseDate(text);
      if (!date) {
        await ctx.reply(t(lang, 'invalidDate'));
        return true;
      }
      session.birthDate = text;
      session.step = 'reg_gender';
      await sessionService.setSession(userId, session);
      await ctx.reply(t(lang, 'selectGender'), genderKeyboard(lang));
      return true;
    }

    case 'reg_address': {
      session.address = text;
      session.step = 'reg_education';
      await sessionService.setSession(userId, session);
      await ctx.reply(t(lang, 'selectEducation'), educationKeyboard(lang));
      return true;
    }

    case 'reg_interests': {
      session.interests = text === '/skip' ? '' : text;
      session.step = 'reg_confirm';
      await sessionService.setSession(userId, session);

      const genderMap: Record<string, string> = { MALE: t(lang, 'genderMale'), FEMALE: t(lang, 'genderFemale') };
      const confirmText = t(lang, 'confirmRegistration', {
        name: session.fullName || '',
        birthDate: session.birthDate || '-',
        gender: genderMap[session.gender || ''] || '-',
        region: [session.regionId, session.districtId, session.mahallaId].filter(Boolean).join(' / ') || '-',
        address: session.address || '-',
        education: session.education || '-',
        employment: session.employmentStatus || '-',
        social: session.socialStatus || '-',
        interests: session.interests || '-',
      });
      await ctx.reply(confirmText, confirmKeyboard(lang));
      return true;
    }

    default:
      return false;
  }
}
