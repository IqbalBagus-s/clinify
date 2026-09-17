// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { USER_REPOSITORY } from './domain/interfaces/tokens';
import { UserRepositoryImpl } from './infrastructure/persistence/repositories/user.repository.impl';

@Module({
  imports: [PrismaModule],
  providers: [{ provide: USER_REPOSITORY, useClass: UserRepositoryImpl }],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}