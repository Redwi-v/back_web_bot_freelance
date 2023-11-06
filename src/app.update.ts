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

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<BotContext>,
    private readonly appService: AppService,
    private auth: AuthService,
    private prisma: PrismaService,
  ) {}

  @Start()
  async StartCommand(ctx: BotContext) {
    const text = generateTextFromArr([
      'Привет! Я - чатбот по бирже фрилансеров WB/OZON.',
      'Готов помочь Вам найти лучшее предложение на рынке сейчас, либо',
      'зарегистрироваться как аккредитованный фрилансер - дизайнер,',
      'контент-менеджер или менеджер аккаунтов.',
    ]);

    ctx.session.type = 'chooseRole';
    ctx.session.step = 0;
    await ctx.reply(text, chooseRole());
  }

  @Hears('Да все верно')
  async register(ctx: BotContext) {
    const name = ctx.session.name;
    const email = ctx.session.email;
    const role = ctx.session.role;
    const age = ctx.session.age;
    const specialization = ctx.session.specialization;
    const about = ctx.session.about;
    const categories = ctx.session.categories;

    if (!name || !email || !role || !age) return;

    if (role === 'customer') {
      const res = await this.prisma.user.create({
        data: {
          name: name,
          email: email,
          role: role,
          age: age,
          specialization: '',
        },
      });
      console.log(res);
    } else {
      const res = await this.prisma.user.create({
        data: {
          name: name,
          email: email,
          role: role,
          age: age,
          specialization: specialization || '',
          about: about || 'about',
          categories: categories || [],
        },
      });
      console.log(res);
    }

    ctx.reply('Мы занесли вас в базу, теперь можете пользоваться приложением');
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

            ctx.reply(
              generateTextFromArr([
                `Я определил Ваше имя как ${userName}`,
                ' Подтвердите его, либо введите свое значение:',
              ]),
              Markup.keyboard([
                Markup.button.callback('Оставить так', 'leave_a_name'),
              ]),
            );
          } else {
            ctx.session.type = 'chooseSpecialization';
            ctx.reply(
              'Отлично! Осталось определиться со специализацией:',
              Markup.keyboard([
                Markup.button.callback('Я дизайнер', 'designer'),
                Markup.button.callback('Я контент-менеджер', 'content_manager'),
                Markup.button.callback(
                  'Я менеджер аккаунтов',
                  'account_manager',
                ),
              ]),
            );
          }
        });

        return;
      }

      if (ctx.session.type === 'chooseSpecialization') {
        textHandler[Sessions.REGISTRATION_SPECIALIZATION](
          ctx,
          (ctx, specialization) => {
            console.log(specialization);
            if (specialization === 'designer') {
              ctx.session.type = 'promoCode';

              ctx.reply(
                generateTextFromArr([
                  'Для регистрации в нашем боте как аккредитованный Дизайнер,',
                  'Вам необходимо написать промо-код, который Вам выдали в',
                  'онлайн-школе “Магия Инфографики” Оксаны Ивойловой.',
                  'Если такой промокод у вас есть, напишите его:',
                ]),
                Markup.keyboard([
                  Markup.button.callback('Нет промо-кода', 'no_promo'),
                ]),
              );
            } else {
              ctx.session.type = 'regFreelancerSteps';
              const userName = ctx.message?.from.first_name;
              ctx.reply(
                generateTextFromArr([
                  `Я определил Ваше имя как ${userName}`,
                  ' Подтвердите его, либо введите свое значение:',
                ]),
                Markup.keyboard([
                  Markup.button.callback('Оставить так', 'leave_a_name'),
                ]),
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

          ctx.reply(
            generateTextFromArr([
              `Я определил Ваше имя как ${userName}`,
              ' Подтвердите его, либо введите свое значение:',
            ]),
            Markup.keyboard([
              Markup.button.callback('Оставить так', 'leave_a_name'),
            ]),
          );
        });
        return;
      }

      const sessionType = ctx.session.type;
      const step = ctx.session.step || 0;

      if (sessionType) {
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
