import { BotContext } from '../../types';
import { apiService } from '../../services/api.service';
import { sessionService } from '../../services/session.service';
import { ADMIN_ROLES } from '../../constants';
import { t } from '../../i18n';

export function requireRole(...roles: string[]) {
  return async (ctx: BotContext, next: () => Promise<void>): Promise<void> => {
    if (!ctx.from) return;

    const user = await apiService.getUserByTelegramId(ctx.from.id.toString());
    if (!user || !roles.includes(user.role)) {
      const lang = await sessionService.getLanguage(ctx.from.id);
      await ctx.reply(t(lang, 'noPermission'));
      return;
    }

    return next();
  };
}

export function requireAdmin() {
  return requireRole(...ADMIN_ROLES);
}
