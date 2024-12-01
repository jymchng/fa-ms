import { joinRelativeToPackageJson } from 'jacob-bot-common/dist/src/utils/path';
import { parseKeyValueFileIntoConfiguration } from 'jacob-bot-common/dist/src/configuration';

export type Config = {
  NODE_ENV: string;
  PORT: number;
  NO_COLOR: string;
  POSTGRESQL_DATABASE: string;
  POSTGRESQL_USERNAME: string;
  DATABASE_SCHEMA: string;
  DATABASE_ADDRESS: string;
  DATABASE_PORT: number;
  DATABASE_URL: string;
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: number;
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: number;
  REDIS_HOST: string;
  REDIS_PORT: number;
  PUBLIC_KEY: number;
  MINIO_URL: string;
  MINIO_ROOT_USER: string;
  MINIO_PORT_FIRST: number;
  MINIO_PORT_SECOND: number;
  MINIO_PORT_CONSOLE: number;
  TELEGRAM_ADMIN_GROUP_GROUPID: number;
};

export const appConfigs = parseKeyValueFileIntoConfiguration<Config>(
  joinRelativeToPackageJson(`.env.${process.env.NODE_ENV}`),
);
