import { Module } from '@nestjs/common';
import { AppUpdate } from './app.update';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import * as LocalSession from 'telegraf-session-local';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { AuthService } from './auth/auth.service';
import { UtilsModule } from './utils/utils.module';
import { OrderModule } from './order/order.module';
import { ResponseModule } from './response/response.module';
import { ConnectsModule } from './connects/connects.module';
import { FilesModule } from './files/files.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProjectModule } from './project/project.module';

const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TelegrafModule.forRoot({
      middlewares: [sessions.middleware()],
      token: process.env.BOT_TOKEN || '',
    }),
    AuthModule,
    UtilsModule,
    OrderModule,
    ResponseModule,
    ConnectsModule,
    FilesModule,
    ProjectModule
  ],
  providers: [AppService, AppUpdate, PrismaService, AuthService],
})
export class AppModule {}
