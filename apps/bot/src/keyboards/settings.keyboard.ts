import { Markup } from 'telegraf';
import { t } from '../i18n';
import { GENDERS, EDUCATION_LEVELS, EMPLOYMENT_STATUSES, SOCIAL_STATUSES, PROBLEM_CATEGORIES } from '../constants';

export function settingsKeyboard(lang: string) {
  return Markup.keyboard([
    [t(lang, 'changeLanguage'), t(lang, 'toggleNotifications')],
    [t(lang, 'deleteProfile'), t(lang, 'logout')],
    [t(lang, 'back')],
  ]).resize();
}

export function genderKeyboard(lang: string) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, 'genderMale'), 'gender_MALE')],
    [Markup.button.callback(t(lang, 'genderFemale'), 'gender_FEMALE')],
  ]);
}

export function educationKeyboard(lang: string) {
  const keys: Record<string, string> = {
    NONE: 'educationNone', SECONDARY: 'educationSecondary',
    VOCATIONAL: 'educationVocational', HIGHER: 'educationHigher',
    MASTERS: 'educationMasters', PHD: 'educationPhd',
  };
  return Markup.inlineKeyboard(
    EDUCATION_LEVELS.map((e) => [Markup.button.callback(t(lang, keys[e]), `edu_${e}`)])
  );
}

export function employmentKeyboard(lang: string) {
  const keys: Record<string, string> = {
    EMPLOYED: 'employmentEmployed', UNEMPLOYED: 'employmentUnemployed',
    STUDENT: 'employmentStudent', SELF_EMPLOYED: 'employmentSelfEmployed',
    OTHER: 'employmentOther',
  };
  return Markup.inlineKeyboard(
    EMPLOYMENT_STATUSES.map((e) => [Markup.button.callback(t(lang, keys[e]), `emp_${e}`)])
  );
}

export function socialStatusKeyboard(lang: string) {
  const keys: Record<string, string> = {
    NORMAL: 'socialNormal', ORPHAN: 'socialOrphan',
    DISABLED: 'socialDisabled', LOW_INCOME: 'socialLowIncome',
    SINGLE_PARENT: 'socialSingleParent', OTHER: 'socialOther',
  };
  return Markup.inlineKeyboard(
    SOCIAL_STATUSES.map((s) => [Markup.button.callback(t(lang, keys[s]), `social_${s}`)])
  );
}

export function editFieldKeyboard(lang: string) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, 'editPhone'), 'edit_phone')],
    [Markup.button.callback(t(lang, 'editAddress'), 'edit_address')],
    [Markup.button.callback(t(lang, 'editEducation'), 'edit_education')],
    [Markup.button.callback(t(lang, 'editEmployment'), 'edit_employment')],
    [Markup.button.callback(t(lang, 'editInterests'), 'edit_interests')],
    [Markup.button.callback(t(lang, 'back'), 'back_profile')],
  ]);
}

export function problemCategoryKeyboard(lang: string) {
  const labels: Record<string, string> = {
    INFRASTRUCTURE: '🏗 Infrastructure', SOCIAL: '🤝 Social',
    EDUCATION: '🎓 Education', HEALTHCARE: '🏥 Healthcare',
    EMPLOYMENT: '💼 Employment', ENVIRONMENT: '🌿 Environment',
    SECURITY: '🔒 Security', OTHER: '📌 Other',
  };
  return Markup.inlineKeyboard(
    PROBLEM_CATEGORIES.map((c) => [Markup.button.callback(labels[c], `probcat_${c}`)])
  );
}

export function broadcastTargetKeyboard(lang: string) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, 'broadcastAll'), 'bcast_ALL')],
    [Markup.button.callback(t(lang, 'broadcastByRole'), 'bcast_ROLE')],
    [Markup.button.callback(t(lang, 'broadcastByRegion'), 'bcast_REGION')],
    [Markup.button.callback(t(lang, 'broadcastByDistrict'), 'bcast_DISTRICT')],
    [Markup.button.callback(t(lang, 'broadcastByMahalla'), 'bcast_MAHALLA')],
  ]);
}

export function confirmDeleteKeyboard(lang: string) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, 'yes'), 'delete_confirm')],
    [Markup.button.callback(t(lang, 'no'), 'delete_cancel')],
  ]);
}
