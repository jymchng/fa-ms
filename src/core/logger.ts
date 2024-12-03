import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

export const winstonDailyRotatingFileTransport: DailyRotateFile =
  new DailyRotateFile({
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
