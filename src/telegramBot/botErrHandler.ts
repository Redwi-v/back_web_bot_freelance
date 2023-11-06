import generateTextFromArr from 'src/utils/generateTextFromArr';
import { BotContext } from './context';

const botErrHandler = {
  incorrectMessage: (ctx: BotContext) => {
    return ctx.reply(
      generateTextFromArr([
        'Извините, я Вас не понял. Пожалуйста, воспользуйтесь кнопками',
        'ниже. Если Вы их не видите, у Telegram есть кнопка сворачивания',
        'и разворачивания клавиатуры кнопок, - это иконка с 4-мя',
        'квадратиками',
      ]),
    );
  },
};

export default botErrHandler;
