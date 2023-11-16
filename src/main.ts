import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: ["https://test-d681d.web.app/", "https://8150-5-142-79-206.ngrok-free.app"],
    credentials: true,
  });
  await app.listen(process.env.APP_PORT || 4000);
}

bootstrap();
