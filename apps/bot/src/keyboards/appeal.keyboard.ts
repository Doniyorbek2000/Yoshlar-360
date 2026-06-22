import { Markup } from 'telegraf';
import { t } from '../i18n';
import { APPEAL_CATEGORIES, PRIORITIES } from '../constants';

const categoryKeys: Record<string, string> = {
  EMPLOYMENT: 'catEmployment',
  EDUCATION: 'catEducation',
  CREDIT: 'catCredit',
  HOUSING: 'catHousing',
  HEALTHCARE: 'catHealthcare',
  SPORT: 'catSport',
  CULTURE: 'catCulture',
  LEGAL: 'catLegal',
  SOCIAL: 'catSocial',
  OTHER: 'catOther',
};

export function categoryKeyboard(lang: string) {
  const buttons = APPEAL_CATEGORIES.map((cat) => [
    Markup.button.callback(t(lang, categoryKeys[cat] || cat), `cat_${cat}`),
  ]);
  return Markup.inlineKeyboard(buttons);
}

export function priorityKeyboard(lang: string) {
  const labels: Record<string, string> = {
    LOW: '🟢 LOW',
    MEDIUM: '🟡 MEDIUM',
    HIGH: '🟠 HIGH',
    URGENT: '🔴 URGENT',
  };
  const buttons = PRIORITIES.map((p) => [
    Markup.button.callback(labels[p], `priority_${p}`),
  ]);
  return Markup.inlineKeyboard(buttons);
}

export function confidentialKeyboard(lang: string) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, 'confidentialYes'), 'confidential_yes')],
    [Markup.button.callback(t(lang, 'confidentialNo'), 'confidential_no')],
  ]);
}

export function sendConfirmKeyboard(lang: string) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, 'sendAppeal'), 'appeal_send')],
    [Markup.button.callback(t(lang, 'cancelAppeal'), 'appeal_cancel')],
  ]);
}

export function appealDetailKeyboard(lang: string, appealId: number) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, 'addComment'), `comment_${appealId}`)],
    [Markup.button.callback(t(lang, 'rateAppeal'), `rate_${appealId}`)],
    [Markup.button.callback(t(lang, 'back'), 'back_appeals')],
  ]);
}

export function regionSelectKeyboard(regions: { id: number; nameUz: string; nameRu: string }[], lang: string) {
  const buttons = regions.map((r) => [
    Markup.button.callback(lang === 'ru' ? r.nameRu : r.nameUz, `region_${r.id}`),
  ]);
  return Markup.inlineKeyboard(buttons);
}

export function districtSelectKeyboard(districts: { id: number; nameUz: string; nameRu: string }[], lang: string) {
  const buttons = districts.map((d) => [
    Markup.button.callback(lang === 'ru' ? d.nameRu : d.nameUz, `district_${d.id}`),
  ]);
  return Markup.inlineKeyboard(buttons);
}

export function mahallaSelectKeyboard(mahallas: { id: number; nameUz: string; nameRu: string }[], lang: string) {
  const buttons = mahallas.map((m) => [
    Markup.button.callback(lang === 'ru' ? m.nameRu : m.nameUz, `mahalla_${m.id}`),
  ]);
  return Markup.inlineKeyboard(buttons);
}
