import { Secret } from 'jacob-bot-common/dist/src/secret';
import { joinRelativeToPackageJson } from 'jacob-bot-common/dist/src/utils/path';

export type CryptoSecrets = {
  ENCRYPTION_SECRET_KEY: Secret<string>;
  TELEGRAM_BOT_KEY: Secret<string>;
  MNEMONIC_SEED_PHRASE: Secret<string>;
  MORALIS_SECRET: Secret<string>;
  COVALENT_API_KEY: Secret<string>;
  PRISMA_FIELD_ENCRYPTION_KEY: Secret<string>;
  CLOAK_KEYCHAIN: Secret<string>;
  EXPRESS_SESSION_SECRET: Secret<string>;
  ACCESS_TOKEN_SECRET: Secret<string>;
  REFRESH_TOKEN_SECRET: Secret<string>;
  PRIVATE_KEY: Secret<number>;
  JWT_SECRET: Secret<string>;
  INTERNAL_TELEGRAM_BOT_KEY: Secret<string>;
  WEBSITE_HOST_NAME: Secret<string>;
  WEBSITE_DOMAIN_NAME: Secret<string>;
};

export const appCryptoSecrets =
  Secret.parseKeyValueFileIntoObjectOfKeySecret<CryptoSecrets>(
    joinRelativeToPackageJson(`secrets/.crypto.${process.env.NODE_ENV}`),
  );

export type MinioSecrets = {
  MINIO_ROOT_PASSWORD: Secret<string>;
};

export const appMinioSecrets =
  Secret.parseKeyValueFileIntoObjectOfKeySecret<MinioSecrets>(
    joinRelativeToPackageJson(`secrets/.minio.${process.env.NODE_ENV}`),
  );

export type Secrets = {
  ENCRYPTION_SECRET_KEY: Secret<string>;
  TELEGRAM_BOT_KEY: Secret<string>;
  MNEMONIC_SEED_PHRASE: Secret<string>;
  MORALIS_SECRET: Secret<string>;
  COVALENT_API_KEY: Secret<string>;
  PRISMA_FIELD_ENCRYPTION_KEY: Secret<string>;
  CLOAK_KEYCHAIN: Secret<string>;
  EXPRESS_SESSION_SECRET: Secret<string>;
  ACCESS_TOKEN_SECRET: Secret<string>;
  REFRESH_TOKEN_SECRET: Secret<string>;
  PRIVATE_KEY: Secret<number>;
  JWT_SECRET: Secret<string>;
  INTERNAL_TELEGRAM_BOT_KEY: Secret<string>;
  WEBSITE_HOST_NAME: Secret<string>;
  WEBSITE_DOMAIN_NAME: Secret<string>;
};

export const appSecrets =
  Secret.parseKeyValueFileIntoObjectOfKeySecret<Secrets>(
    joinRelativeToPackageJson(`secrets/.secrets.${process.env.NODE_ENV}`),
  );

export type DbSecrets = {
  POSTGRESQL_POSTGRES_PASSWORD: Secret<string>;
  POSTGRESQL_PASSWORD: Secret<string>;
  DATABASE_IP_ADDRESS: Secret<string>;
};

export const appDbSecrets =
  Secret.parseKeyValueFileIntoObjectOfKeySecret<DbSecrets>(
    joinRelativeToPackageJson(`secrets/.db.${process.env.NODE_ENV}`),
  );
