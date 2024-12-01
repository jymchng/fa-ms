import { appConfigs } from './common/configs';

export type AppEnvEnum = {
  development: 'development';
  production: 'production';
};

export const AppEnvEnum: AppEnvEnum = {
  development: 'development',
  production: 'production',
} as const;

export const appConstants = {
  loggingRelated: {
    logFilesDirNameOnDisk: `${appConfigs.NODE_ENV}_logs`,
  },
} as const;
