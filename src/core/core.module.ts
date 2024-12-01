import { Module } from '@nestjs/common';
import { ApplicantsController } from './applicants/applicants.controller';
import { ApplicantsService } from './applicants/applicants.service';
import { SchemesController } from './schemes/schemes.controller';
import { SchemesService } from './schemes/schemes.service';
import { ApplicationsController } from './applications/applications.controller';
import { ApplicationsService } from './applications/applications.service';
import { PrismaModule } from '../vendors/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    ApplicantsController,
    SchemesController,
    ApplicationsController,
  ],
  providers: [
    ApplicantsService,
    SchemesService,
    ApplicationsService,
  ],
})
export class CoreModule {}
