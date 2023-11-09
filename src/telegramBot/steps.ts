import textHandler from './textHandlers';
import { Sessions } from './textHandlers';
import { BotContext } from './context';
import generateTextFromArr from 'src/utils/generateTextFromArr';
import { Markup } from 'telegraf';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

const prisma = new PrismaService();

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
          Возраст: ${ctx.session.age};
          `,
          (() => {
            const key = Markup.keyboard([
              Markup.button.callback('Да все верно', 'yes'),
            ]);
            key.reply_markup.resize_keyboard = true;
            return key;
          })(),
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
        const categories = await prisma.categorie.findMany();

        const keyboard = Markup.keyboard(
          categories.map((cat) => {
            return Markup.button.callback(cat.name, cat.name);
          }),
        );

        keyboard.reply_markup.resize_keyboard = true;

        ctx.reply(
          `Укажите категории товаров, на которых Вы специализируетесь: `,
          keyboard,
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
          (() => {
            const key = Markup.keyboard([
              Markup.button.callback('Да все верно', 'yes'),
            ]);
            key.reply_markup.resize_keyboard = true;
            return key;
          })(),
        );
      },
    },
  ],
};
