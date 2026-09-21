// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { PatientsModule } from 'src/patients/patients.module';
import { DoctorsModule } from 'src/doctors/doctors.module';
import { ApothecariesModule } from 'src/apothecaries/apothecaries.module';
import { RedisModule } from 'src/redis/redis.module';
import { AuthController } from './presentation/controllers/auth.controller';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.use-case';
import { ResendVerificationEmailUseCase } from './application/use-cases/resend-verification-email.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import {
  EMAIL_SERVICE,
  EMAIL_VERIFICATION_TOKEN_REPOSITORY,
  PASSWORD_HASHER,
  REFRESH_TOKEN_REPOSITORY,
  TOKEN_SERVICE,
} from './domain/interfaces/tokens';
import { EmailVerificationTokenRepositoryImpl } from './infrastructure/persistence/repositories/email-verification-token.repository.impl';
import { RefreshTokenRepositoryImpl } from './infrastructure/persistence/repositories/refresh-token.repository.impl';
import { PasswordHasherService } from './infrastructure/security/password-hasher.service';
import { JwtTokenService } from './infrastructure/jwt/jwt-token.service';
import { EmailServiceImpl } from './infrastructure/email/email.service.impl';
import { EmailQueueProducer } from './infrastructure/email/email-queue.producer';
import { EmailProcessor } from './infrastructure/email/email.processor';
import { EMAIL_QUEUE_NAME } from './infrastructure/email/email-queue.constants';
import { RateLimitGuard } from './presentation/guards/rate-limit.guard';
import { AccountLockoutPolicy } from './domain/policies/account-lockout.policy';

@Module({
  imports: [
    UsersModule,
    PatientsModule,
    DoctorsModule,
    ApothecariesModule,
    RedisModule,
    JwtModule.register({}),
    BullModule.registerQueue({ name: EMAIL_QUEUE_NAME }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    VerifyEmailUseCase,
    ResendVerificationEmailUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    AccountLockoutPolicy,
    RateLimitGuard,
    { provide: EMAIL_VERIFICATION_TOKEN_REPOSITORY, useClass: EmailVerificationTokenRepositoryImpl },
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: RefreshTokenRepositoryImpl },
    { provide: PASSWORD_HASHER, useClass: PasswordHasherService },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    EmailServiceImpl,
    EmailProcessor,
    { provide: EMAIL_SERVICE, useClass: EmailQueueProducer },
  ],
})
export class AuthModule {}