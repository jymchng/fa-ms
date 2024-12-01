import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { appConstants, AppEnvEnum } from './app.constants';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { appConfigs } from './common/configs';

export const winstonDailyRotatingFileTransport: DailyRotateFile =
  new DailyRotateFile({
    frequency:
      appConfigs.NODE_ENV === AppEnvEnum.development ? '1m' : undefined,
    maxSize: appConfigs.NODE_ENV === AppEnvEnum.development ? '50k' : undefined,
    dirname: appConstants.loggingRelated.logFilesDirNameOnDisk,
    filename: `%DATE%`,
    // zippedArchive: true,
    datePattern: 'YYYY-MM-DD',
    extension: '.log',
    // maxSize: '500000',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      nestWinstonModuleUtilities.format.nestLike('App', {
        colors: false,
        prettyPrint: true,
      }),
    ),
  });

export const appLogger = winston.createLogger({
  transports: winstonDailyRotatingFileTransport,
});
