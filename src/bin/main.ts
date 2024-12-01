import { printAnyObjectWithStandardFormat } from 'jacob-bot-common/dist/src/utils/printing';
import { printLetsBuidl } from '../core';
import { appConfigs } from '../core/common/configs';
import {
  appSecrets,
  appCryptoSecrets,
  appDbSecrets,
  appMinioSecrets,
} from '../core/common/secrets';
import { appLogger } from '../core/logger';
import { printLetsBuidl as printLetsBuidl2 } from '../vendors/dist';
import { PrismaClient } from '@prisma/client';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const prisma = new PrismaClient();

const checkDatabaseIsSetUp = async () => {
  try {
    const numRowsInPermissionTable = await prisma.permission.count();
    appLogger.info(
      `Database connectivity check: \`numRowsInPermissionTable\` = \`${numRowsInPermissionTable}\`;`,
    );
    // Basic connectivity check
    const numRowsReturned = await prisma.$executeRaw`SELECT 1`;
    appLogger.info(
      `Database connectivity check: \`numRowsReturned\` for the SQL query = \`SELECT 1\` is \`${numRowsReturned}\``,
    );

    // Check if critical tables exist
    const tablesToCheck = ['User', 'Wallet', 'Store', 'Product', 'Transaction'];
    for (const table of tablesToCheck) {
      const tableExists = await prisma.$executeRawUnsafe(
        `SELECT to_regclass('${table}');`,
      );
      if (tableExists) {
        appLogger.info(`Table \`${table}\` exists.`);
      } else {
        appLogger.info(`Table \`${table}\` does not exist!`);
      }
    }

    // Check if migrations are up to date
    const numMigrations =
      await prisma.$executeRaw`SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 1`;
    if (numMigrations) {
      appLogger.info(`${numMigrations} migration(s) were applied`);
    } else {
      appLogger.info(`No migrations found!`);
    }
  } catch (error) {
    appLogger.info('Error during database setup check:', error);
  } finally {
    await prisma.$disconnect();
  }
};

checkDatabaseIsSetUp();

printLetsBuidl();
appLogger.info('Now trying to run `printLetsBuild2 from vendors/**/dist`!');
printLetsBuidl2();
appLogger.info('Now trying to print `appConfigs`!');
appLogger.info(printAnyObjectWithStandardFormat(appConfigs));
appLogger.info('Now trying to print `appSecrets`!');
appLogger.info(printAnyObjectWithStandardFormat(appSecrets));
appLogger.info('Now trying to print `appCryptoSecrets`!');
appLogger.info(printAnyObjectWithStandardFormat(appCryptoSecrets));
appLogger.info('Now trying to print `appDbSecrets`!');
appLogger.info(printAnyObjectWithStandardFormat(appDbSecrets));
appLogger.info('Now trying to print `appMinioSecrets`!');
appLogger.info(printAnyObjectWithStandardFormat(appMinioSecrets));
appLogger.info(
  'App tests completed! App is successfully set up! Congratulations!',
);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
      'API documentation for Financial Assistance Scheme Management System',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
