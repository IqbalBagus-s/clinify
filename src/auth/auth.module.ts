// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { UsersModule } from 'src/users/users.module';
import { PatientsModule } from 'src/patients/patients.module';
import { DoctorsModule } from 'src/doctors/doctors.module';
import { ApothecariesModule } from 'src/apothecaries/apothecaries.module';
import { RedisModule } from 'src/redis/redis.module';
import { AuthController } from './presentation/controllers/auth.controller';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.use-case';
import { ResendVerificationEmailUseCase } from './application/use-cases/resend-verification-email.use-case';
import { EMAIL_SERVICE, EMAIL_VERIFICATION_TOKEN_REPOSITORY, PASSWORD_HASHER } from './domain/interfaces/tokens';
import { EmailVerificationTokenRepositoryImpl } from './infrastructure/persistence/repositories/email-verification-token.repository.impl';
import { PasswordHasherService } from './infrastructure/security/password-hasher.service';
import { EmailServiceImpl } from './infrastructure/email/email.service.impl';
import { EmailQueueProducer } from './infrastructure/email/email-queue.producer';
import { EmailProcessor } from './infrastructure/email/email.processor';
import { EMAIL_QUEUE_NAME } from './infrastructure/email/email-queue.constants';
import { RateLimitGuard } from './presentation/guards/rate-limit.guard';

@Module({
  imports: [
    UsersModule,
    PatientsModule,
    DoctorsModule,
    ApothecariesModule,
    RedisModule,
    BullModule.registerQueue({ name: EMAIL_QUEUE_NAME }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    VerifyEmailUseCase,
    ResendVerificationEmailUseCase,
    RateLimitGuard,
    { provide: EMAIL_VERIFICATION_TOKEN_REPOSITORY, useClass: EmailVerificationTokenRepositoryImpl },
    { provide: PASSWORD_HASHER, useClass: PasswordHasherService },
    EmailServiceImpl,
    EmailProcessor,
    { provide: EMAIL_SERVICE, useClass: EmailQueueProducer },
  ],
})
export class AuthModule {}