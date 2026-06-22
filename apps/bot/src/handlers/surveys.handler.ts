import { Telegraf, Markup } from 'telegraf';
import { BotContext, SessionData } from '../types';
import { t } from '../i18n';
import { sessionService } from '../services/session.service';
import { apiService } from '../services/api.service';

export function registerSurveysHandler(bot: Telegraf<BotContext>) {
  bot.action(/^survey_view_(\d+)$/, async (ctx) => {
    const surveyId = parseInt(ctx.match![1]);
    await ctx.answerCbQuery();
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);

    const survey = await apiService.getSurveyById(surveyId);
    if (!survey) {
      await ctx.reply(t(lang, 'surveyNotFound'));
      return;
    }

    const questionsCount = survey.questions?.length || survey._count?.questions || 0;
    const endDate = survey.endsAt ? new Date(survey.endsAt).toLocaleDateString('uz-UZ') : '-';

    const text = t(lang, 'surveyDetail', {
      id: survey.id,
      title: survey.title,
      description: survey.description || '-',
      questions: questionsCount,
      endDate,
    });

    const buttons = [];
    if (survey.status === 'ACTIVE') {
      buttons.push([Markup.button.callback(t(lang, 'surveyStart'), `survey_start_${survey.id}`)]);
    }

    await ctx.reply(text, buttons.length > 0 ? Markup.inlineKeyboard(buttons) : undefined);
  });

  bot.action(/^survey_start_(\d+)$/, async (ctx) => {
    const surveyId = parseInt(ctx.match![1]);
    await ctx.answerCbQuery();
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    const session = await sessionService.getSession(userId);

    const survey = await apiService.getSurveyById(surveyId);
    if (!survey || !survey.questions || survey.questions.length === 0) {
      await ctx.reply(t(lang, 'surveyNotFound'));
      return;
    }

    session.step = 'survey_answer';
    (session as any).surveyId = surveyId;
    (session as any).surveyQuestions = survey.questions.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
    (session as any).surveyCurrentQ = 0;
    (session as any).surveyAnswers = [];
    await sessionService.setSession(userId, session);

    const q = (session as any).surveyQuestions[0];
    await sendQuestion(ctx, q, 0, survey.questions.length, lang);
  });

  bot.action(/^survey_opt_(\d+)_(.+)$/, async (ctx) => {
    const qIdx = parseInt(ctx.match![1]);
    const value = ctx.match![2];
    await ctx.answerCbQuery();
    const userId = ctx.from!.id;
    const lang = await sessionService.getLanguage(userId);
    const session = await sessionService.getSession(userId);

    if (session.step !== 'survey_answer') return;

    const questions = (session as any).surveyQuestions;
    const currentQ = (session as any).surveyCurrentQ;
    if (qIdx !== currentQ) return;

    (session as any).surveyAnswers.push({ questionId: questions[currentQ].id, value });
    const nextQ = currentQ + 1;

    if (nextQ >= questions.length) {
      const success = await apiService.submitSurveyResponse(
        (session as any).surveyId,
        (session as any).surveyAnswers
      );
      session.step = undefined;
      (session as any).surveyId = undefined;
      (session as any).surveyQuestions = undefined;
      (session as any).surveyCurrentQ = undefined;
      (session as any).surveyAnswers = undefined;
      await sessionService.setSession(userId, session);

      await ctx.reply(success ? t(lang, 'surveyCompleted') : t(lang, 'surveyFailed'));
    } else {
      (session as any).surveyCurrentQ = nextQ;
      await sessionService.setSession(userId, session);
      await sendQuestion(ctx, questions[nextQ], nextQ, questions.length, lang);
    }
  });

  bot.action(/^surveys_page_(\d+)$/, async (ctx) => {
    const page = parseInt(ctx.match![1]);
    await ctx.answerCbQuery();
    await showSurveys(ctx, page);
  });
}

async function sendQuestion(ctx: BotContext, question: any, idx: number, total: number, lang: string) {
  const text = t(lang, 'surveyQuestion', {
    current: idx + 1,
    total,
    text: question.text,
  });

  if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(question.type) && question.options) {
    const opts = Array.isArray(question.options) ? question.options : [];
    const buttons = opts.map((opt: string) => [Markup.button.callback(opt, `survey_opt_${idx}_${opt}`)]);
    await ctx.reply(text, Markup.inlineKeyboard(buttons));
  } else if (question.type === 'RATING') {
    const buttons = [1, 2, 3, 4, 5].map(n => Markup.button.callback(`${'⭐'.repeat(n)}`, `survey_opt_${idx}_${n}`));
    await ctx.reply(text, Markup.inlineKeyboard([buttons]));
  } else {
    await ctx.reply(text + '\n\nJavobingizni yozing:');
  }
}

export async function handleSurveyText(ctx: BotContext, session: SessionData, lang: string): Promise<boolean> {
  if (session.step !== 'survey_answer') return false;

  const userId = ctx.from!.id;
  const text = (ctx.message as any)?.text;
  if (!text) return false;

  if (text === t(lang, 'cancel') || text === '/cancel') {
    session.step = undefined;
    (session as any).surveyId = undefined;
    (session as any).surveyQuestions = undefined;
    (session as any).surveyCurrentQ = undefined;
    (session as any).surveyAnswers = undefined;
    await sessionService.setSession(userId, session);
    await ctx.reply(t(lang, 'cancelled'));
    return true;
  }

  const questions = (session as any).surveyQuestions;
  const currentQ = (session as any).surveyCurrentQ;
  const question = questions[currentQ];

  if (['TEXT', 'NUMBER'].includes(question.type)) {
    if (question.type === 'NUMBER' && isNaN(Number(text))) {
      await ctx.reply(t(lang, 'invalidInput'));
      return true;
    }

    (session as any).surveyAnswers.push({ questionId: question.id, value: text });
    const nextQ = currentQ + 1;

    if (nextQ >= questions.length) {
      const success = await apiService.submitSurveyResponse(
        (session as any).surveyId,
        (session as any).surveyAnswers
      );
      session.step = undefined;
      (session as any).surveyId = undefined;
      (session as any).surveyQuestions = undefined;
      (session as any).surveyCurrentQ = undefined;
      (session as any).surveyAnswers = undefined;
      await sessionService.setSession(userId, session);

      await ctx.reply(success ? t(lang, 'surveyCompleted') : t(lang, 'surveyFailed'));
    } else {
      (session as any).surveyCurrentQ = nextQ;
      await sessionService.setSession(userId, session);
      await sendQuestion(ctx, questions[nextQ], nextQ, questions.length, lang);
    }
    return true;
  }

  return false;
}

export async function showSurveys(ctx: BotContext, page = 1) {
  const userId = ctx.from!.id;
  const lang = await sessionService.getLanguage(userId);

  const surveys = await apiService.getActiveSurveys(page);
  if (!surveys.data || surveys.data.length === 0) {
    await ctx.reply(t(lang, 'noSurveys'));
    return;
  }

  let text = t(lang, 'surveysTitle', { count: surveys.total }) + '\n\n';
  const buttons: any[] = [];

  surveys.data.forEach((survey: any) => {
    const questionsCount = survey._count?.questions || 0;
    text += `📝 ${survey.title}\n📊 ${questionsCount} ta savol\n\n`;
    buttons.push([Markup.button.callback(`📋 ${survey.title.slice(0, 30)}`, `survey_view_${survey.id}`)]);
  });

  const navButtons = [];
  if (page > 1) navButtons.push(Markup.button.callback(t(lang, 'prev'), `surveys_page_${page - 1}`));
  if (surveys.data.length === 5) navButtons.push(Markup.button.callback(t(lang, 'next'), `surveys_page_${page + 1}`));
  if (navButtons.length > 0) buttons.push(navButtons);

  await ctx.reply(text, Markup.inlineKeyboard(buttons));
}
