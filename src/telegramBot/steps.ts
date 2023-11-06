import textHandler from './textHandlers';
import { Sessions } from './textHandlers';
import { BotContext } from './context';
import generateTextFromArr from 'src/utils/generateTextFromArr';
import { Markup } from 'telegraf';

export const steps = {
  regCustomerSteps: [
    {
      handler: textHandler[Sessions.REGISTRATION_NAME],
      endCallBack: (ctx: BotContext) => {
        ctx.reply('Введите Email:');
      },
    },
    {
      handler: textHandler[Sessions.REGISTRATION_EMAIL],
      endCallBack: (ctx: BotContext) => {
        ctx.reply('Укажите ваш возраст цифрами:');
      },
    },
    {
      handler: textHandler[Sessions.REGISTRATION_AGE],
      endCallBack: async (ctx: BotContext) => {
        ctx.reply(
          `${ctx.session.name} , пожалуйста проверьте свои данные: 
          Email: ${ctx.session.email};
          Роль: ${ctx.session.role};
          Возраст: ${ctx.session.role};
          `,
          Markup.keyboard([Markup.button.callback('Да все верно', 'yes')]),
        );
      },
    },
  ],

  regFreelancerSteps: [
    {
      handler: textHandler[Sessions.REGISTRATION_NAME],
      endCallBack: (ctx: BotContext) => {
        ctx.reply('Введите Email:');
      },
    },
    {
      handler: textHandler[Sessions.REGISTRATION_EMAIL],
      endCallBack: (ctx: BotContext) => {
        ctx.reply('Укажите Ваш возраст цифрами:');
      },
    },
    {
      handler: textHandler[Sessions.REGISTRATION_AGE],
      endCallBack: async (ctx: BotContext) => {
        ctx.reply(
          generateTextFromArr([
            'Расскажите о себе? Короткого описания в виде 1-2 предложений',
            'будет вполне достаточно. Постарайтесь указать описание,',
            'которое привлечет интерес потенциального заказчика.',
            'ВАЖНО: Не нужно приводить сторонних ссылок на портфолио.',
            'Портфолио Вы сможете разместить далее в нашей бирже',
          ]),
        );
      },
    },

    {
      handler: textHandler[Sessions.REGISTRATION_ABOUT],
      endCallBack: async (ctx: BotContext) => {
        ctx.reply(
          `Укажите категории товаров, на которых Вы специализируетесь: `,
          Markup.keyboard([
            Markup.button.callback('Любые', 'any'),
            Markup.button.callback('Продукты', 'products'),
            Markup.button.callback('Товары для отдыха', 'relax'),
          ]),
        );
      },
    },
    {
      handler: textHandler[Sessions.REGISTRATION_PRODUCT_CATEGORIES],
      endCallBack: async (ctx: BotContext) => {
        ctx.reply(
          `${ctx.session.name} , пожалуйста проверьте свои данные: 
          Email: ${ctx.session.email};
          Роль: ${ctx.session.role};
          Возраст: ${ctx.session.age};
          Категории: ${ctx.session.categories?.join('|')};
          `,
          Markup.keyboard([Markup.button.callback('Да все верно', 'yes')]),
        );
      },
    },
  ],
};
