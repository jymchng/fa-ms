import { registerAs } from '@nestjs/config';
import * as crypto from 'crypto';

export default registerAs('admin', () => ({
  defaultEmail: process.env.DEFAULT_ADMIN_EMAIL || 'admin@default.com',
  defaultName: process.env.DEFAULT_ADMIN_NAME || 'Default Administrator',
  defaultPassword:
    process.env.DEFAULT_ADMIN_PASSWORD ||
    crypto.randomBytes(32).toString('hex'),
}));
