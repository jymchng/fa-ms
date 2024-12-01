import { printAnyObjectWithStandardFormat } from 'jacob-bot-common/dist/src/utils/printing';
import { joinRelativeToPackageJson } from 'jacob-bot-common/dist/src/utils/path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

export function printLetsBuidl() {
  console.log(
    printAnyObjectWithStandardFormat({
      lets: 'buidl!',
      env: process.env.NODE_ENV,
      port: process.env.PORT,
      databaseAddress: process.env.DATABASE_ADDRESS,
      logsDirectoryExists: fs.existsSync(
        joinRelativeToPackageJson(
          `./${process.env.NODE_ENV?.toLowerCase()}_logs`,
        ),
      ),
    }),
  );
}

export function addOne(a: number): number {
  return ++a;
}
