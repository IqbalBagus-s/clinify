// src/users/infrastructure/persistence/mappers/user.mapper.ts
import { User as PrismaUser } from '../../../../generated/prisma/client';
import { UserEntity } from 'src/users/domain/entities/user.entity';

export class UserMapper {
  static toDomain(raw: PrismaUser): UserEntity {
    return new UserEntity(
      raw.id,
      raw.username,
      raw.email,
      raw.passwordHash,
      raw.role,
      raw.emailVerifiedAt,
      raw.failedLoginAttempts,
      raw.lockedUntil,
      raw.createdAt,
    );
  }
}