// src/auth/application/use-cases/login.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { randomBytes, createHash } from 'crypto';
import { LoginDto } from '../../presentation/dto/login.dto';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { AccountLockedException } from '../../domain/exceptions/account-locked.exception';
import { AccountDeactivatedException } from '../../domain/exceptions/account-deactivated.exception';
import { EmailNotVerifiedException } from '../../domain/exceptions/email-not-verified.exception';
import { AccountPendingVerificationException } from '../../domain/exceptions/account-pending-verification.exception';
import { AccountLockoutPolicy } from '../../domain/policies/account-lockout.policy';
import { PASSWORD_HASHER, TOKEN_SERVICE, REFRESH_TOKEN_REPOSITORY } from '../../domain/interfaces/tokens';
import type { IPasswordHasher } from '../../domain/interfaces/password-hasher.interface';
import type { ITokenService } from '../../domain/interfaces/token.service.interface';
import type { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface';
import { USER_REPOSITORY } from 'src/users/domain/interfaces/tokens';
import type { IUserRepository } from 'src/users/domain/interfaces/user.repository.interface';
import { PATIENT_REPOSITORY } from 'src/patients/domain/interfaces/tokens';
import type { IPatientRepository } from 'src/patients/domain/interfaces/patient.repository.interface';
import { DOCTOR_REPOSITORY } from 'src/doctors/domain/interfaces/tokens';
import type { IDoctorRepository } from 'src/doctors/domain/interfaces/doctor.repository.interface';
import { APOTHECARY_REPOSITORY } from 'src/apothecaries/domain/interfaces/tokens';
import type { IApothecaryRepository } from 'src/apothecaries/domain/interfaces/apothecary.repository.interface';

export interface LoginMetadata {
  deviceInfo?: string;
  ipAddress?: string;
}

export interface LoginResult {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class LoginUseCase {
  constructor(
    @InjectPinoLogger(LoginUseCase.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly lockoutPolicy: AccountLockoutPolicy,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PATIENT_REPOSITORY) private readonly patientRepository: IPatientRepository,
    @Inject(DOCTOR_REPOSITORY) private readonly doctorRepository: IDoctorRepository,
    @Inject(APOTHECARY_REPOSITORY) private readonly apothecaryRepository: IApothecaryRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(dto: LoginDto, metadata: LoginMetadata): Promise<LoginResult> {
    const user = await this.userRepository.findByIdentifier(dto.identifier);

    // CATATAN KEAMANAN: kalau user tidak ditemukan, langsung throw tanpa
    // bcrypt.compare() — ini membuat waktu respons "user tidak ada" sedikit
    // lebih cepat dibanding "password salah" (timing side-channel minor).
    // Untuk skala skripsi ini diterima; mitigasi penuh butuh dummy-hash
    // compare terhadap constant hash saat user tidak ditemukan.
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const passwordMatches = await this.passwordHasher.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      const newFailedAttempts = await this.userRepository.recordFailedLogin(user.id);
      if (this.lockoutPolicy.shouldLock(newFailedAttempts)) {
        const lockedUntil = this.lockoutPolicy.computeLockedUntil();
        await this.userRepository.lockAccount(user.id, lockedUntil);
        this.logger.warn(
          { userId: user.id, failedAttempts: newFailedAttempts },
          'account_locked_due_to_failed_attempts',
        );
      }
      throw new InvalidCredentialsException();
    }

    // Dicek SETELAH password terbukti benar — sesuai kontrak: percobaan
    // dengan password salah pada akun yang sedang terkunci tetap
    // menghasilkan INVALID_CREDENTIALS, bukan ACCOUNT_LOCKED, supaya
    // penyerang tidak bisa membedakan status lock lewat percobaan asal-asalan.
    if (this.lockoutPolicy.isCurrentlyLocked(user.lockedUntil)) {
      throw new AccountLockedException();
    }

    // Satu kali query status aktor, dipakai untuk dua pengecekan berbeda
    // di bawah (INACTIVE lebih dulu, PENDING_VERIFICATION belakangan)
    // supaya tidak query database dua kali untuk data yang sama.
    let actorStatus: string | null = null;
    if (user.role !== 'ADMIN') {
      actorStatus = await this.getActorStatus(user.id, user.role);
      if (actorStatus === 'INACTIVE') {
        throw new AccountDeactivatedException();
      }
    }

    if (user.emailVerifiedAt === null) {
      throw new EmailNotVerifiedException();
    }

    if ((user.role === 'DOCTOR' || user.role === 'APOTHECARY') && actorStatus === 'PENDING_VERIFICATION') {
      throw new AccountPendingVerificationException();
    }

    await this.userRepository.recordSuccessfulLogin(user.id);

    const rawRefreshToken = randomBytes(40).toString('hex');
    const refreshTokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');
    const refreshTokenTtlDays = dto.remember_me
      ? this.configService.get<number>('jwt.refreshTokenTtlDaysRememberMe', 30)
      : this.configService.get<number>('jwt.refreshTokenTtlDays', 7);
    const refreshTokenExpiresAt = new Date(Date.now() + refreshTokenTtlDays * 24 * 60 * 60 * 1000);

    const refreshTokenEntity = await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: refreshTokenHash,
      deviceInfo: metadata.deviceInfo?.slice(0, 255),
      ipAddress: metadata.ipAddress?.slice(0, 45),
      expiresAt: refreshTokenExpiresAt,
    });

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      role: user.role,
      sid: refreshTokenEntity.id,
    });

    this.logger.info({ userId: user.id, role: user.role }, 'user_logged_in');

    return {
      accessToken,
      expiresIn: this.configService.get<number>('jwt.accessTokenTtlSeconds', 900),
      refreshToken: rawRefreshToken,
      refreshTokenExpiresAt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  private async getActorStatus(userId: string, role: string): Promise<string | null> {
    switch (role) {
      case 'PATIENT':
        return this.patientRepository.findStatusByUserId(userId);
      case 'DOCTOR':
        return this.doctorRepository.findStatusByUserId(userId);
      case 'APOTHECARY':
        return this.apothecaryRepository.findStatusByUserId(userId);
      default:
        return null;
    }
  }
}