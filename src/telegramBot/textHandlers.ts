import { BotContext } from './context';
import { Roles } from './action_buttons';
import botErrHandler from './botErrHandler';

import { validateEmail } from 'src/utils/validateEmail';
import generateTextFromArr from 'src/utils/generateTextFromArr';
import { Markup } from 'telegraf';
import { PrismaService } from 'src/prisma.service';

const prisma = new PrismaService();

export enum Sessions {
  REGISTRATION_ROLE = 'REGISTRATION',
  REGISTRATION_NAME = 'REGISTRATION_NAME',
  REGISTRATION_PROMO_CODE = 'REGISTRATION_PROMO_CODE',
  REGISTRATION_SPECIALIZATION = 'REGISTRATION_PROMO_SPECIALIZATION',
  REGISTRATION_EMAIL = 'REGISTRATION_EMAIL',
  REGISTRATION_AGE = 'REGISTRATION_AGE',
  REGISTRATION_ABOUT = 'REGISTRATION_ABOUT',
  REGISTRATION_PRODUCT_CATEGORIES = 'REGISTRATION_PRODUCT_CATEGORIES',
}

const textHandler = {
  // ROLE
  [Sessions.REGISTRATION_ROLE]: async (
    ctx: BotContext,
    endCallBack?: (ctx: BotContext, role: Roles) => void,
  ) => {
    const messageText = getMessage(ctx.message);

    if (!messageText) return botErrHandler.incorrectMessage(ctx);

    const isFreelancer = messageText.toLocaleLowerCase() === 'я фрилансер';
    const isCustomer = messageText.toLocaleLowerCase() === 'я заказчик';

    if (!isFreelancer && !isCustomer)
      return botErrHandler.incorrectMessage(ctx);

    const role = isFreelancer ? Roles.FREElANCER : Roles.CUSTOMER;

    endCallBack && endCallBack(ctx, role);
  },

  //ABOUT
  [Sessions.REGISTRATION_ABOUT]: async (
    ctx: BotContext,
    endCallBack: (ctx: BotContext) => void,
  ) => {
    const messageText = getMessage(ctx.message);

    if (!messageText) return botErrHandler.incorrectMessage(ctx);

    if (messageText.length < 100)
      return ctx.reply(
        generateTextFromArr([
          'Вы ввели слишком короткое описание своего',
          'профиля (минимум - 100 симв.). Постарайтесь указать описание,',
          'которое привлечет интерес потенциального заказчика.',
        ]),
      );

    ctx.session.about = messageText;
    endCallBack(ctx);
  },

  [Sessions.REGISTRATION_PRODUCT_CATEGORIES]: async (
    ctx: BotContext,
    endCallBack: (ctx: BotContext) => void,
  ) => {
    const messageText = String(getMessage(ctx.message));

    if (!messageText) return botErrHandler.incorrectMessage(ctx);

    if (messageText.toLocaleLowerCase() === 'далее') {
      return endCallBack(ctx);
    }

    let isInclude = false;
    if (!ctx.session.categories?.length) {
      ctx.session.categories = [];
    }

    ctx.session.categories.forEach((cat) => {
      if (cat === messageText) {
        isInclude = true;
      }
    });

    if (isInclude) {

      ctx.session.categories = ctx.session.categories.filter(
        (cat) => cat !== messageText,
      );

    } else {
      ctx.session.categories.push(messageText);
    }

    const styledArr = ctx.session.categories.map((cat) => `🔷${cat}`);

    const categories = await prisma.categorie.findMany();

    const keyboard = Markup.keyboard([
      ...categories.map((cat) => {
        return Markup.button.callback(cat.name, cat.name);
      }),
      Markup.button.callback('Далее', 'next'),
    ]);

    keyboard.reply_markup.resize_keyboard = true;

    ctx.reply(
      `
    Выбранные категории:\n${styledArr.join(
      '\n',
    )} \n\nВы можете указать еще категории или нажать Далее!
    `,
      keyboard,
    );
  },

  // NAME HANDLER
  [Sessions.REGISTRATION_NAME]: async (
    ctx: BotContext,
    endCallBack: (ctx: BotContext) => void,
  ) => {
    const messageText = String(getMessage(ctx.message));

    if (!messageText) return botErrHandler.incorrectMessage(ctx);

    if (messageText.toLocaleLowerCase() === 'оставить так') {
      ctx.session.name = ctx.message?.from.first_name as string;
    } else {
      ctx.session.name = messageText;
    }
    endCallBack(ctx);
  },

  // PROMO CODE HANDLER
  [Sessions.REGISTRATION_PROMO_CODE]: async (
    ctx: BotContext,
    endCallBack: (ctx: BotContext) => void,
  ) => {
    const messageText = getMessage(ctx.message);

    if (!messageText) return botErrHandler.incorrectMessage(ctx);

    if (messageText.toLocaleLowerCase() === 'нет промо-кода') {
      return ctx.reply(
        'Пожалуйста, свяжитесь с нами по email/тел/ссылка на телеграм. После того, как вам выдадут промокод, напишите его:',
      );
    }

    if (messageText.toLocaleLowerCase() === '1111') {
      return endCallBack(ctx);
    }

    return ctx.reply(
      generateTextFromArr([
        'Извините, промокод неверный или истек срок действия.',
        'Пожалуйста, свяжитесь с нами по email/тел/ссылка на телеграм.',
        'После того, как вам выдадут промокод, напишите его:',
      ]),
    );
  },

  // SPECIALIZATION CODE HANDLER
  [Sessions.REGISTRATION_SPECIALIZATION]: async (
    ctx: BotContext,
    endCallBack: (ctx: BotContext, specialization: string) => void,
  ) => {
    const messageText = getMessage(ctx.message);

    if (!messageText) return botErrHandler.incorrectMessage(ctx);
    let specialization = '';

    if (messageText.toLocaleLowerCase() === 'я контент-менеджер') {
      specialization = 'content_manager';
    }
    if (messageText.toLocaleLowerCase() === 'я дизайнер') {
      specialization = 'designer';
    }
    if (messageText.toLocaleLowerCase() === 'я менеджер аккаунтов') {
      specialization = 'account_manager';
    }

    ctx.session.specialization = specialization;
    endCallBack(ctx, specialization);
  },

  // AGE
  [Sessions.REGISTRATION_AGE]: async (
    ctx: BotContext,
    endCallBack: (ctx: BotContext) => void,
  ) => {
    const age = Number(getMessage(ctx.message));

    if (!age) return botErrHandler.incorrectMessage(ctx);

    if (age < 16 || age > 70)
      return ctx.reply(
        'Возраст должен быть в диапазоне 16 - 70. Введите значение цифрами без пробелов и лишних слов:',
      );

    ctx.session.age = age;
    endCallBack(ctx);
  },

  // EMAIL
  [Sessions.REGISTRATION_EMAIL]: async (
    ctx: BotContext,
    endCallBack: (ctx: BotContext) => void,
  ) => {
    const messageText = getMessage(ctx.message);

    if (!messageText) return;

    const isValidEmail = validateEmail(messageText);

    if (!isValidEmail)
      return ctx.reply(
        'Вы ввели некорректный E-mail. Пожалуйста, попробуйте еще раз',
      );

    ctx.session.email = messageText;
    endCallBack(ctx);
  },
};

export default textHandler;

function getMessage(object: any): string | null {
  if (typeof object !== 'object') return null;

  let messageText = '';

  for (const key in object) {
    if (key === 'text') {
      messageText = object[key];
      break;
    }
  }

  return messageText;
}
