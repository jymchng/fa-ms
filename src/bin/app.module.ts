import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../core/auth/auth.module';
import { ApplicantsModule } from '../core/applicants/applicants.module';
import { SchemesModule } from '../core/schemes/schemes.module';
import { PrismaModule } from '../core/prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, ApplicantsModule, SchemesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
