import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    credentials: true,
    origin: ['http://localhost:3000', 'https://test-d681d.web.app/'],
  });
  await app.listen(process.env.APP_PORT || 4000);
}

bootstrap();
