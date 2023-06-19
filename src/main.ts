import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors();

  // Enable URI versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Enable validation pipe
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT || 4000);
}

bootstrap();
