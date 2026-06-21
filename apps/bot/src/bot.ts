import 'dotenv/config';
import { Telegraf, Context, session } from 'telegraf';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { t, setLanguage, getLanguage } from './i18n';
import {
  languageKeyboard, phoneKeyboard, mainMenuKeyboard,
  categoryKeyboard, regionKeyboard, districtKeyboard, mahallaKeyboard,
} from './keyboards';

const prisma = new PrismaClient();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

interface SessionData {
  step?: string;
  appealTitle?: string;
  appealCategory?: string;
  regionId?: number;
  districtId?: number;
  mahallaId?: number;
  fullName?: string;
  phone?: string;
}

interface BotContext extends Context {
  session: SessionData;
}

bot.use(session({ defaultSession: (): SessionData => ({}) }));

// /start command
bot.start(async (ctx: any) => {
  const userId = ctx.from!.id;
  await ctx.reply(t(userId, 'selectLanguage'), languageKeyboard);
});

// Language selection
bot.action('lang_uz', async (ctx: any) => {
  const userId = ctx.from!.id;
  setLanguage(userId, 'uz');
  await ctx.answerCbQuery();
  await checkUserAndProceed(ctx, userId);
});

bot.action('lang_ru', async (ctx: any) => {
  const userId = ctx.from!.id;
  setLanguage(userId, 'ru');
  await ctx.answerCbQuery();
  await checkUserAndProceed(ctx, userId);
});

async function checkUserAndProceed(ctx: any, telegramId: number) {
  const user = await prisma.user.findUnique({ where: { telegramId: telegramId.toString() } });
  if (user) {
    await ctx.reply(t(telegramId, 'alreadyRegistered'));
    await showMainMenu(ctx, telegramId);
  } else {
    await ctx.reply(t(telegramId, 'sharePhone'), phoneKeyboard(t(telegramId, 'sharePhoneButton')));
  }
}

// Phone contact handler
bot.on('contact', async (ctx: any) => {
  const userId = ctx.from!.id;
  const phone = ctx.message.contact.phone_number;
  ctx.session.phone = phone;

  const existingUser = await prisma.user.findUnique({ where: { phone } });
  if (existingUser) {
    if (!existingUser.telegramId) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { telegramId: userId.toString() },
      });
    }
    await ctx.reply(t(userId, 'alreadyRegistered'));
    await showMainMenu(ctx, userId);
    return;
  }

  ctx.session.step = 'enter_name';
  await ctx.reply(t(userId, 'enterFullName'));
});

// Text message handler for various steps
bot.on('text', async (ctx: any) => {
  const userId = ctx.from!.id;
  const text = ctx.message.text;
  const session = ctx.session;

  // Handle main menu buttons
  if (text === t(userId, 'menuAppeal')) {
    session.step = 'appeal_title';
    await ctx.reply(t(userId, 'enterAppealTitle'));
    return;
  }

  if (text === t(userId, 'menuMyAppeals')) {
    await showMyAppeals(ctx, userId);
    return;
  }

  if (text === t(userId, 'menuStatus')) {
    await showMyAppeals(ctx, userId);
    return;
  }

  if (text === t(userId, 'menuContact')) {
    await ctx.reply(t(userId, 'contactInfo'));
    return;
  }

  if (text === t(userId, 'menuProfile')) {
    await showProfile(ctx, userId);
    return;
  }

  // Step-based processing
  if (session.step === 'enter_name') {
    session.fullName = text;
    session.step = 'select_region';
    const regions = await prisma.region.findMany({ orderBy: { nameUz: 'asc' } });
    const lang = getLanguage(userId);
    await ctx.reply(t(userId, 'selectRegion'), regionKeyboard(regions, lang));
    return;
  }

  if (session.step === 'appeal_title') {
    session.appealTitle = text;
    session.step = 'appeal_description';
    await ctx.reply(t(userId, 'enterAppealDescription'));
    return;
  }

  if (session.step === 'appeal_description') {
    const user = await prisma.user.findUnique({ where: { telegramId: userId.toString() } });
    if (!user) {
      await ctx.reply(t(userId, 'error'));
      return;
    }

    const appeal = await prisma.appeal.create({
      data: {
        title: session.appealTitle!,
        description: text,
        category: session.appealCategory || 'other',
        youthId: user.id,
        regionId: user.regionId,
        districtId: user.districtId,
        mahallaId: user.mahallaId,
      },
    });

    session.step = undefined;
    session.appealTitle = undefined;
    session.appealCategory = undefined;
    await ctx.reply(t(userId, 'appealCreated') + appeal.id);

    // Notify admins
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['SUPER_ADMIN', 'REPUBLIC_ADMIN', 'REGION_ADMIN', 'DISTRICT_ADMIN', 'MAHALLA_LEADER'] },
        telegramId: { not: null },
        ...(user.regionId ? { regionId: user.regionId } : {}),
      },
    });

    for (const admin of admins) {
      if (admin.telegramId) {
        try {
          await bot.telegram.sendMessage(
            admin.telegramId,
            `Yangi murojaat!\n\n#${appeal.id} - ${appeal.title}\n${user.fullName}\n${user.phone}`,
          );
        } catch {}
      }
    }

    await showMainMenu(ctx, userId);
    return;
  }
});

// Region selection
bot.action(/^region_(\d+)$/, async (ctx: any) => {
  const userId = ctx.from!.id;
  const regionId = parseInt(ctx.match[1]);
  ctx.session.regionId = regionId;
  await ctx.answerCbQuery();

  const districts = await prisma.district.findMany({ where: { regionId }, orderBy: { nameUz: 'asc' } });
  if (districts.length === 0) {
    await completeRegistration(ctx, userId);
    return;
  }
  ctx.session.step = 'select_district';
  const lang = getLanguage(userId);
  await ctx.reply(t(userId, 'selectDistrict'), districtKeyboard(districts, lang));
});

// District selection
bot.action(/^district_(\d+)$/, async (ctx: any) => {
  const userId = ctx.from!.id;
  const districtId = parseInt(ctx.match[1]);
  ctx.session.districtId = districtId;
  await ctx.answerCbQuery();

  const mahallas = await prisma.mahalla.findMany({ where: { districtId }, orderBy: { nameUz: 'asc' } });
  if (mahallas.length === 0) {
    await completeRegistration(ctx, userId);
    return;
  }
  ctx.session.step = 'select_mahalla';
  const lang = getLanguage(userId);
  await ctx.reply(t(userId, 'selectMahalla'), mahallaKeyboard(mahallas, lang));
});

// Mahalla selection
bot.action(/^mahalla_(\d+)$/, async (ctx: any) => {
  const userId = ctx.from!.id;
  ctx.session.mahallaId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();
  await completeRegistration(ctx, userId);
});

// Category selection for appeals
bot.action(/^cat_(.+)$/, async (ctx: any) => {
  const userId = ctx.from!.id;
  ctx.session.appealCategory = ctx.match[1];
  ctx.session.step = 'appeal_title';
  await ctx.answerCbQuery();
  await ctx.reply(t(userId, 'enterAppealTitle'));
});

async function completeRegistration(ctx: any, telegramId: number) {
  const session = ctx.session;
  try {
    const passwordHash = await argon2.hash('TgUser' + telegramId);
    const email = `tg_${telegramId}@yoshlar360.uz`;

    await prisma.user.create({
      data: {
        fullName: session.fullName || 'Telegram User',
        email,
        phone: session.phone,
        passwordHash,
        role: 'YOUTH',
        telegramId: telegramId.toString(),
        regionId: session.regionId || null,
        districtId: session.districtId || null,
        mahallaId: session.mahallaId || null,
        youthProfile: { create: {} },
      },
    });

    await ctx.reply(t(telegramId, 'profileCreated'));
    await showMainMenu(ctx, telegramId);
  } catch (error) {
    console.error('Registration error:', error);
    await ctx.reply(t(telegramId, 'error'));
  }
}

async function showMainMenu(ctx: any, telegramId: number) {
  await ctx.reply(t(telegramId, 'mainMenu'), mainMenuKeyboard(telegramId));
}

async function showMyAppeals(ctx: any, telegramId: number) {
  const user = await prisma.user.findUnique({ where: { telegramId: telegramId.toString() } });
  if (!user) {
    await ctx.reply(t(telegramId, 'error'));
    return;
  }

  const appeals = await prisma.appeal.findMany({
    where: { youthId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  if (appeals.length === 0) {
    await ctx.reply(t(telegramId, 'noAppeals'));
    return;
  }

  const statusMap: Record<string, string> = {
    NEW: t(telegramId, 'statusNew'),
    IN_PROGRESS: t(telegramId, 'statusInProgress'),
    RESOLVED: t(telegramId, 'statusResolved'),
    REJECTED: t(telegramId, 'statusRejected'),
    CLOSED: t(telegramId, 'statusClosed'),
  };

  let message = '';
  for (const appeal of appeals) {
    message += t(telegramId, 'appealStatus')
      .replace('{id}', appeal.id.toString())
      .replace('{title}', appeal.title)
      .replace('{status}', statusMap[appeal.status] || appeal.status)
      .replace('{date}', appeal.createdAt.toLocaleDateString('uz-UZ'));
    message += '\n\n';
  }

  await ctx.reply(message);
}

async function showProfile(ctx: any, telegramId: number) {
  const user = await prisma.user.findUnique({
    where: { telegramId: telegramId.toString() },
    include: { region: true, district: true, mahalla: true },
  });

  if (!user) {
    await ctx.reply(t(telegramId, 'error'));
    return;
  }

  const regionText = [user.region?.nameUz, user.district?.nameUz, user.mahalla?.nameUz].filter(Boolean).join(' > ') || '-';
  const text = t(telegramId, 'profileInfo')
    .replace('{name}', user.fullName)
    .replace('{phone}', user.phone || '-')
    .replace('{region}', regionText);

  await ctx.reply(text);
}

// Start the bot
bot.launch().then(() => {
  console.log('Yoshlar 360 Telegram bot ishga tushdi!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
