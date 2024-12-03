import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class PasswordService {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateSecurePassword(): Promise<string> {
    const length = 32;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';

    try {
      // Use Node.js crypto module
      const bytes = crypto.randomBytes(length);
      for (let i = 0; i < length; i++) {
        password += charset[bytes[i]! % charset.length];
      }
    } catch (error) {
      // Fallback to less secure random generation
      for (let i = 0; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
      }
    }

    return password;
  }
}
