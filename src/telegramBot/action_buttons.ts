import { Markup } from 'telegraf';

export enum Roles {
  FREElANCER = 'freelancer',
  CUSTOMER = 'customer',
}

export const chooseRole = () => {
  const key = Markup.keyboard(
    [
      Markup.button.callback('Я фрилансер', Roles.FREElANCER),
      Markup.button.callback('Я заказчик', Roles.CUSTOMER),
    ],
    {
      columns: 2,
    },
  );

  key.reply_markup.resize_keyboard = true;

  return key;
};
