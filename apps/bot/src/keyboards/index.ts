import { Markup } from 'telegraf';

export const languageKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("O'zbek tili", 'lang_uz')],
  [Markup.button.callback('Русский язык', 'lang_ru')],
]);

export function phoneKeyboard(text: string) {
  return Markup.keyboard([
    [Markup.button.contactRequest(text)],
  ]).oneTime().resize();
}

export function mainMenuKeyboard(userId: number) {
  const { t: translate } = require('../i18n');
  return Markup.keyboard([
    [translate(userId, 'menuAppeal'), translate(userId, 'menuMyAppeals')],
    [translate(userId, 'menuStatus'), translate(userId, 'menuProfile')],
    [translate(userId, 'menuContact')],
  ]).resize();
}

export function categoryKeyboard(userId: number) {
  const { t: translate } = require('../i18n');
  return Markup.inlineKeyboard([
    [Markup.button.callback(translate(userId, 'categoryEmployment'), 'cat_employment')],
    [Markup.button.callback(translate(userId, 'categoryEducation'), 'cat_education')],
    [Markup.button.callback(translate(userId, 'categoryHousing'), 'cat_housing')],
    [Markup.button.callback(translate(userId, 'categoryHealth'), 'cat_health')],
    [Markup.button.callback(translate(userId, 'categorySocial'), 'cat_social')],
    [Markup.button.callback(translate(userId, 'categoryOther'), 'cat_other')],
  ]);
}

export function regionKeyboard(regions: { id: number; nameUz: string; nameRu: string }[], lang: string) {
  const buttons = regions.map((r) => [
    Markup.button.callback(lang === 'ru' ? r.nameRu : r.nameUz, `region_${r.id}`),
  ]);
  return Markup.inlineKeyboard(buttons);
}

export function districtKeyboard(districts: { id: number; nameUz: string; nameRu: string }[], lang: string) {
  const buttons = districts.map((d) => [
    Markup.button.callback(lang === 'ru' ? d.nameRu : d.nameUz, `district_${d.id}`),
  ]);
  return Markup.inlineKeyboard(buttons);
}

export function mahallaKeyboard(mahallas: { id: number; nameUz: string; nameRu: string }[], lang: string) {
  const buttons = mahallas.map((m) => [
    Markup.button.callback(lang === 'ru' ? m.nameRu : m.nameUz, `mahalla_${m.id}`),
  ]);
  return Markup.inlineKeyboard(buttons);
}
