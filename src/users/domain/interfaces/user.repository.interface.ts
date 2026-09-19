// src/users/domain/interfaces/user.repository.interface.ts
import { TransactionContext } from 'src/common/domain/transaction-context';
import { UserEntity } from '../entities/user.entity';

export interface CreateUserInput {
  username: string;
  email: string;
  passwordHash: string;
  role: 'PATIENT' | 'DOCTOR' | 'APOTHECARY';
  fullName: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'PRIA' | 'WANITA';
  address?: string;
}

export interface IUserRepository {
  createWithinTransaction(tx: TransactionContext, input: CreateUserInput): Promise<UserEntity>;
  markEmailVerified(userId: string): Promise<void>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
}