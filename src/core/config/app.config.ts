import { ConfigModule } from '@nestjs/config';

export const AppConfig = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: ['secrets/.db.development', '.env.development'],
});
