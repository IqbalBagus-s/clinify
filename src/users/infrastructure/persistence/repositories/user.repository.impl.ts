// src/users/infrastructure/persistence/repositories/user.repository.impl.ts
import { Injectable } from '@nestjs/common';
import { Role } from '../../../../generated/prisma/client';
import { PrismaTransactionClient } from 'src/prisma/prisma.types';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserInput, IUserRepository } from 'src/users/domain/interfaces/user.repository.interface';
import { UserEntity } from 'src/users/domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWithinTransaction(tx: PrismaTransactionClient, input: CreateUserInput): Promise<UserEntity> {
    const user = await tx.user.create({
      data: {
        username: input.username,
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role as Role,
        profile: {
          create: {
            fullName: input.fullName,
            phone: input.phone,
            dateOfBirth: input.dateOfBirth,
            gender: input.gender,
            address: input.address,
          },
        },
      },
    });
    return UserMapper.toDomain(user);
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? UserMapper.toDomain(user) : null;
  }
}