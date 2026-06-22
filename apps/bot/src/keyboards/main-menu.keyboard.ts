import { Markup } from 'telegraf';
import { t } from '../i18n';

export function languageKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🇺🇿 O'zbek tili", 'lang_uz')],
    [Markup.button.callback('🇷🇺 Русский язык', 'lang_ru')],
  ]);
}

export function phoneKeyboard(lang: string) {
  return Markup.keyboard([
    [Markup.button.contactRequest(t(lang, 'sharePhoneButton'))],
  ]).oneTime().resize();
}

export function youthMenuKeyboard(lang: string) {
  return Markup.keyboard([
    [t(lang, 'menuAppeal'), t(lang, 'menuMyAppeals')],
    [t(lang, 'menuCheckStatus'), t(lang, 'menuProfile')],
    [t(lang, 'menuNews'), t(lang, 'menuNotifications')],
    [t(lang, 'menuContact'), t(lang, 'menuSettings')],
  ]).resize();
}

export function confirmKeyboard(lang: string) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, 'confirmYes'), 'confirm_yes')],
    [Markup.button.callback(t(lang, 'confirmNo'), 'confirm_no')],
  ]);
}

export function yesNoKeyboard(lang: string) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, 'yes'), 'yes'), Markup.button.callback(t(lang, 'no'), 'no')],
  ]);
}

export function backKeyboard(lang: string) {
  return Markup.keyboard([
    [t(lang, 'back')],
  ]).resize();
}

export function cancelKeyboard(lang: string) {
  return Markup.keyboard([
    [t(lang, 'cancel')],
  ]).resize();
}

export function paginationKeyboard(page: number, totalPages: number, prefix: string, lang: string) {
  const buttons = [];
  if (page > 1) {
    buttons.push(Markup.button.callback(t(lang, 'prev'), `${prefix}_page_${page - 1}`));
  }
  if (page < totalPages) {
    buttons.push(Markup.button.callback(t(lang, 'next'), `${prefix}_page_${page + 1}`));
  }
  return buttons.length > 0 ? Markup.inlineKeyboard([buttons]) : undefined;
}
