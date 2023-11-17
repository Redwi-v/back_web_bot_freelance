import { AppService } from './app.service';
import { InjectBot, Start, Update, On, Hears } from 'nestjs-telegraf';
import { Markup, Telegraf } from 'telegraf';
import { chooseRole } from './telegramBot/action_buttons';
import generateTextFromArr from './utils/generateTextFromArr';
import { BotContext } from './telegramBot/context';
import textHandler, { Sessions } from './telegramBot/textHandlers';
import { steps } from './telegramBot/steps';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma.service';
import { Get } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { ICreateUserData } from './auth/auth.types';

const getUserId = (message: any): Prisma.UserCreateInput => {
  if (message.reply_to_message) {
    return message.reply_to_message.from.id;
  }
  return message.from.id;
};
@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<BotContext>,
    private readonly appService: AppService,
    private auth: AuthService,
    private prisma: PrismaService,
  ) {}

  @Get('/')
  sayHello() {
    return {
      text: 'hello',
    };
  }

  @Start()
  async StartCommand(ctx: BotContext) {
    const text = generateTextFromArr([
      'Привет! Я - чатбот по бирже фрилансеров WB/OZON.',
      'Готов помочь Вам найти лучшее предложение на рынке сейчас, либо',
      'зарегистрироваться как аккредитованный фрилансер - дизайнер,',
      'контент-менеджер или менеджер аккаунтов.',
    ]);

    const telegramId = getUserId(ctx.message);

    const user = await this.prisma.user.findUnique({
      where: {
        telegramId: String(telegramId),
      },
    });

    if (user) {
      ctx.reply('Вы уже зарегистрированы💖');
    } else {
      ctx.session.type = 'chooseRole';
      ctx.session.step = 0;
      await ctx.reply(text, chooseRole());
    }
  }

  @Hears('Да все верно')
  async register(ctx: BotContext) {
    const name = ctx.session.name;
    const email = ctx.session.email;
    const roleIndex = ctx.session.role;
    const age = ctx.session.age;
    const specialization = ctx.session.specialization;
    const about = ctx.session.about;
    const categories = ctx.session.categories;

    const allActiveCategories = await this.prisma.categorie.findMany({
      where: {
        name: {
          in: categories
        }
      }
    })
    console.log(allActiveCategories);
    

    const telegramId = getUserId(ctx.message);

    const userProfilePhoto = await this.bot.telegram.getUserProfilePhotos(
      //@ts-ignore
      telegramId,
    );
    let file: any = null;

    if (userProfilePhoto.photos[0]) {
      file = await this.bot.telegram.getFile(
        userProfilePhoto.photos[0][0].file_id,
      );
    }

    const path = file
      ? `https://api.telegram.org/file/bot6579823661:AAElFdUNeI-XWx3UGAUr6eA48agqjeloWFQ/${file.file_path}`
      : '';


      console.log(ctx.message?.from);
      
    const newUserData: ICreateUserData = {
      telegramId: String(telegramId),
      about: about || null,
      age: age,
      email: email,
      name: name,
      avatarUrl: path,
      specializationIdentifiers: specialization,
      telegramLink: 'https://t.me/' + ctx.message?.from.username,

      activeRoleIndex: roleIndex,

      categoriesIdentifiers: allActiveCategories,
    };

    console.log(newUserData);

    const res = await this.auth.register(newUserData);

    // console.log(res);

    ctx.reply(
      'Мы занесли вас в базу, теперь можете пользоваться приложением 🎉',
      Markup.inlineKeyboard([
        Markup.button.webApp('Открыть бота', 'https://test-d681d.web.app'),
      ]),
    );
    ctx.session.categories = [];
  }

  @On('text')
  async registration(ctx: BotContext) {
    try {
      if (ctx.session.type === 'chooseRole') {
        textHandler[Sessions.REGISTRATION_ROLE](ctx, (ctx, role) => {
          ctx.session.role = role;

          if (role === 'customer') {
            ctx.session.type = 'regCustomerSteps';

            const userName = ctx.message?.from.first_name;

            const key = Markup.keyboard([
              Markup.button.callback('Оставить так', 'leave_a_name'),
            ]);

            key.reply_markup.resize_keyboard = true;

            ctx.reply(
              generateTextFromArr([
                `Я определил Ваше имя как ${userName}`,
                ' Подтвердите его, либо введите свое значение:',
              ]),
              key,
            );
          } else {
            ctx.session.type = 'chooseSpecialization';
            ctx.reply(
              'Отлично! Осталось определиться со специализацией:',
              Markup.keyboard([
                Markup.button.callback('Инфографика', 'designer'),
                Markup.button.callback('SEO', 'content_manager'),
                Markup.button.callback('Менеджеры', 'account_manager'),
                Markup.button.callback('Сертификации/декларации', 'dfkdkfj'),
                Markup.button.callback('Бухгалтерия', 'dfjdklfjk'),
                Markup.button.callback('Фотографы', 'photo'),
                Markup.button.callback('Обучение', 'work'),
              ]),
            );
          }
        });

        return;
      }

      if (ctx.session.type === 'chooseSpecialization') {
        console.log(ctx.session.type);
        textHandler[Sessions.REGISTRATION_SPECIALIZATION](
          ctx,
          (ctx, specialization) => {
            if (specialization === 'Инфографика') {
              ctx.session.type = 'promoCode';

              const key = Markup.keyboard([
                Markup.button.callback('Нет промо-кода', 'no_promo'),
              ]);

              key.reply_markup.resize_keyboard = true;

              ctx.reply(
                generateTextFromArr([
                  'Для регистрации в нашем боте как аккредитованный Дизайнер,',
                  'Вам необходимо написать промо-код, который Вам выдали в',
                  'онлайн-школе “Магия Инфографики” Оксаны Ивойловой.',
                  'Если такой промокод у вас есть, напишите его:',
                ]),
                key,
              );
            } else {
              ctx.session.type = 'regFreelancerSteps';
              const userName = ctx.message?.from.first_name;
              const key = Markup.keyboard([
                Markup.button.callback('Оставить так', 'leave_a_name'),
              ]);

              key.reply_markup.resize_keyboard = true;

              ctx.reply(
                generateTextFromArr([
                  `Я определил Ваше имя как ${userName}`,
                  ' Подтвердите его, либо введите свое значение:',
                ]),
                key,
              );
            }
          },
        );
        return;
      }

      if (ctx.session.type === 'promoCode') {
        textHandler[Sessions.REGISTRATION_PROMO_CODE](ctx, (ctx) => {
          ctx.session.type = 'regFreelancerSteps';

          const userName = ctx.message?.from.first_name;

          const key = Markup.keyboard([
            Markup.button.callback('Оставить так', 'leave_a_name'),
          ]);

          key.reply_markup.resize_keyboard = true;

          ctx.reply(
            generateTextFromArr([
              `Я определил Ваше имя как ${userName}`,
              ' Подтвердите его, либо введите свое значение:',
            ]),
            key,
          );
        });
        return;
      }

      const sessionType = ctx.session.type;
      const step = ctx.session.step || 0;

      if (sessionType) {
        const params = steps[sessionType][step];

        if (!params) return;

        const { handler, endCallBack } = steps[sessionType][step];

        handler(ctx, () => {
          endCallBack(ctx);
          ctx.session.step = step + 1;
        });

        if (step > steps[sessionType].length - 1) {
          ctx.session.type = '';
          ctx.session.step = 0;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}
