import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApplicantsController } from './applicants/applicants.controller';
import { ApplicantsService } from './applicants/applicants.service';
import { SchemesController } from './schemes/schemes.controller';
import { SchemesService } from './schemes/schemes.service';
import { ApplicationsController } from './applications/applications.controller';
import { ApplicationsService } from './applications/applications.service';
import { PrismaModule } from '../vendors/prisma/prisma.module';
import { PrismaService } from '../vendors/prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['secrets/.db.development', '.env.development'],
    }),
    PrismaModule,
  ],
  controllers: [
    ApplicantsController,
    SchemesController,
    ApplicationsController,
  ],
  providers: [
    PrismaService,
    ApplicantsService,
    SchemesService,
    ApplicationsService,
  ],
  exports: [PrismaService], // Export PrismaService if other modules need it
})
export class CoreModule {}
