import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import winstonLogger from './utils/winston.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger(),
  });

  app.setGlobalPrefix('api');
  app.enableCors();

  // Enable URI versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Enable validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Craftify API')
    .setDescription('REST API for Craftify')
    .setVersion(process.env.npm_package_version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT || 4000);
}

bootstrap();
