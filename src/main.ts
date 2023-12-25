import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express'
import {join} from 'path'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  app.use('/uploads', express.static(join(__dirname, '../..','uploads')))
  app.setGlobalPrefix('api');
  
  const config = new DocumentBuilder()
  .setTitle('Cats example')
  .setDescription('The cats API description')
  .setVersion('1.0')
  .addTag('cats')
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  app.enableCors({
    origin: ["https://test-d681d.web.app/", "https://4d4d-5-142-42-90.ngrok-free.app", "http://sitetest.na4u.ru/"],
    credentials: true,
  }); 
          
  await app.listen(process.env.APP_PORT || 4000);
}

bootstrap();
