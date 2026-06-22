import { BotContext } from '../types';
import { t } from '../i18n';
import { sessionService } from '../services/session.service';
import { apiService } from '../services/api.service';
import { Markup } from 'telegraf';

export async function showProfile(ctx: BotContext) {
  const userId = ctx.from!.id;
  const lang = await sessionService.getLanguage(userId);
  const user = await apiService.getUserByTelegramId(userId.toString());

  if (!user) {
    await ctx.reply(t(lang, 'notRegistered'));
    return;
  }

  const regionName = user.region ? (lang === 'ru' ? user.region.nameRu : user.region.nameUz) : '-';
  const districtName = user.district ? (lang === 'ru' ? user.district.nameRu : user.district.nameUz) : '-';
  const mahallaName = user.mahalla ? (lang === 'ru' ? user.mahalla.nameRu : user.mahalla.nameUz) : '-';

  const profile = user.youthProfile || {};

  const text = t(lang, 'profileInfo', {
    name: user.fullName,
    phone: user.phone || '-',
    birthDate: profile.birthDate || '-',
    gender: profile.gender || '-',
    region: regionName,
    district: districtName,
    mahalla: mahallaName,
    education: profile.education || '-',
    employment: profile.employmentStatus || '-',
    social: profile.socialStatus || '-',
    interests: profile.interests || '-',
  });

  await ctx.reply(text, Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, 'editProfile'), 'edit_profile')],
  ]));
}
