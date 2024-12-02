import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { PrismaService } from '../vendors/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(CoreModule);
  
  // Enable CORS
  app.enableCors();
  
  // Enable validation pipe with useful defaults
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    transform: true, // Transform payloads to DTO instances
    forbidNonWhitelisted: true, // Throw errors if non-whitelisted values are provided
  }));

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Financial Assistance Scheme API')
    .setDescription('API documentation for Financial Assistance Scheme Management System')
    .setVersion('1.0')
    .addTag('applicants', 'Manage applicant information')
    .addTag('schemes', 'Manage financial assistance schemes')
    .addTag('applications', 'Manage assistance applications')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable Prisma shutdown hook
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // Start the application
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API documentation available at: http://localhost:${port}/api`);
}

bootstrap();
