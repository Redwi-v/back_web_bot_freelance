import { Context } from 'telegraf';
import { Sessions } from './textHandlers';

export interface BotContext extends Context {
  session: {
    type?: string;
    step?: number;
    role: string;
    name: string;
    age: number;
    email: string;
    specialization: [{id: number}];
    about?: string;
    categories?: string[];
  };
}
