// src/auth/infrastructure/security/password-hasher.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IPasswordHasher } from 'src/auth/domain/interfaces/password-hasher.interface';

@Injectable()
export class PasswordHasherService implements IPasswordHasher {
  private readonly saltRounds = 12;

  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  async compare(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }
}