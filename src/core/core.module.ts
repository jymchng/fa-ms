import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ApplicantsController } from './applicants/applicants.controller';
import { ApplicantsService } from './applicants/applicants.service';
import { SchemesController } from './schemes/schemes.controller';
import { SchemesService } from './schemes/schemes.service';
import { ApplicationsController } from './applications/applications.controller';
import { ApplicationsService } from './applications/applications.service';
import { PrismaModule } from '../vendors/prisma/prisma.module';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';
import { PasswordService } from './common/services/password.service';
import adminConfig from 'config/admin.config';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      load: [adminConfig],
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  controllers: [
    ApplicantsController,
    SchemesController,
    ApplicationsController,
  ],
  providers: [
    ApplicantsService,
    SchemesService,
    ApplicationsService,
    PasswordService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
