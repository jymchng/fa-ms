import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { CoreModule } from '../core/core.module';

async function bootstrap() {
  const app = await NestFactory.create(CoreModule, {
    // Add logger configuration
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  // Enable validation pipe with transform enabled
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Financial Assistance Scheme API')
    .setDescription(
      'API documentation for Financial Assistance Scheme Management System',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
