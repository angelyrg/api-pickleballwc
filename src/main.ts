import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  /*
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );*/

  app.enableCors({
    origin: configService.get('cors.origins'),
    methods: configService.get('cors.methods'),
    // exposedHeaders: ['Content-Disposition'],
  });

  await app.listen(configService.get('port'));
}
bootstrap();
