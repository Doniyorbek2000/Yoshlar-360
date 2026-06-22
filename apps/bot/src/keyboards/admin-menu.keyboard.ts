import { Markup } from 'telegraf';
import { t } from '../i18n';
import { ROLES } from '../constants';

export function adminMenuKeyboard(lang: string, role: string) {
  const rows = [
    [t(lang, 'adminDashboard'), t(lang, 'adminNewAppeals')],
    [t(lang, 'adminAllAppeals'), t(lang, 'adminTasks')],
  ];

  if (role !== ROLES.MAHALLA_LEADER) {
    rows.push([t(lang, 'adminProblems'), t(lang, 'adminKpi')]);
  }

  if ([ROLES.SUPER_ADMIN, ROLES.REPUBLIC_ADMIN, ROLES.REGION_ADMIN].includes(role as any)) {
    rows.push([t(lang, 'adminBroadcast'), t(lang, 'adminStats')]);
  }

  rows.push([t(lang, 'adminProfile'), t(lang, 'menuSettings')]);

  return Markup.keyboard(rows).resize();
}

export function appealActionsKeyboard(lang: string, appealId: number) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(t(lang, 'acceptAppeal'), `accept_${appealId}`),
      Markup.button.callback(t(lang, 'rejectAppeal'), `reject_${appealId}`),
    ],
    [
      Markup.button.callback(t(lang, 'replyAppeal'), `reply_${appealId}`),
      Markup.button.callback(t(lang, 'changeStatus'), `chstatus_${appealId}`),
    ],
    [
      Markup.button.callback(t(lang, 'closeAppeal'), `close_${appealId}`),
    ],
  ]);
}

export function statusSelectKeyboard(lang: string, appealId: number) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, 'statusNew'), `setstatus_${appealId}_NEW`)],
    [Markup.button.callback(t(lang, 'statusInProgress'), `setstatus_${appealId}_IN_PROGRESS`)],
    [Markup.button.callback(t(lang, 'statusResolved'), `setstatus_${appealId}_RESOLVED`)],
    [Markup.button.callback(t(lang, 'statusRejected'), `setstatus_${appealId}_REJECTED`)],
    [Markup.button.callback(t(lang, 'statusClosed'), `setstatus_${appealId}_CLOSED`)],
  ]);
}
