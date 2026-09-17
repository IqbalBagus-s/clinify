// src/auth/application/use-cases/register.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaTransactionClient } from 'src/prisma/prisma.types';
import { RegisterDto } from '../../presentation/dto/register.dto';
import { RegisterableRole } from '../../domain/enums/registerable-role.enum';
import { Email } from '../../domain/value-objects/email.vo';
import { InvalidSpecializationException } from '../../domain/exceptions/invalid-specialization.exception';
import { EMAIL_SERVICE, EMAIL_VERIFICATION_TOKEN_REPOSITORY, PASSWORD_HASHER } from '../../domain/interfaces/tokens';
import type { IPasswordHasher } from '../../domain/interfaces/password-hasher.interface';
import type { IEmailService } from '../../domain/interfaces/email.service.interface';
import type { IEmailVerificationTokenRepository } from '../../domain/interfaces/email-verification-token.repository.interface';
import { USER_REPOSITORY } from 'src/users/domain/interfaces/tokens';
import type { IUserRepository } from 'src/users/domain/interfaces/user.repository.interface';
import { PATIENT_REPOSITORY } from 'src/patients/domain/interfaces/tokens';
import type { IPatientRepository } from 'src/patients/domain/interfaces/patient.repository.interface';
import { DOCTOR_REPOSITORY } from 'src/doctors/domain/interfaces/tokens';
import type { IDoctorRepository } from 'src/doctors/domain/interfaces/doctor.repository.interface';
import { APOTHECARY_REPOSITORY } from 'src/apothecaries/domain/interfaces/tokens';
import type { IApothecaryRepository } from 'src/apothecaries/domain/interfaces/apothecary.repository.interface';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PATIENT_REPOSITORY) private readonly patientRepository: IPatientRepository,
    @Inject(DOCTOR_REPOSITORY) private readonly doctorRepository: IDoctorRepository,
    @Inject(APOTHECARY_REPOSITORY) private readonly apothecaryRepository: IApothecaryRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
    @Inject(EMAIL_VERIFICATION_TOKEN_REPOSITORY) private readonly tokenRepository: IEmailVerificationTokenRepository,
  ) {}

  async execute(dto: RegisterDto) {
    const email = Email.create(dto.email);

    if (dto.role === RegisterableRole.DOCTOR) {
      const isActive = await this.doctorRepository.isSpecializationActive(dto.specialization_id!);
      if (!isActive) throw new InvalidSpecializationException();
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    const { userId, status } = await this.prisma.$transaction(async (rawTx) => {
      const tx = rawTx as unknown as PrismaTransactionClient;

      const user = await this.userRepository.createWithinTransaction(tx, {
        username: dto.username,
        email: email.toString(),
        passwordHash,
        role: dto.role,
        fullName: dto.full_name,
        phone: dto.phone,
        dateOfBirth: dto.date_of_birth ? new Date(dto.date_of_birth) : undefined,
        gender: dto.gender,
        address: dto.address,
      });

      let actorStatus = 'ACTIVE';

      if (dto.role === RegisterableRole.PATIENT) {
        const patient = await this.patientRepository.createWithinTransaction(tx, user.id);
        actorStatus = patient.status;
      } else if (dto.role === RegisterableRole.DOCTOR) {
        const doctor = await this.doctorRepository.createWithinTransaction(tx, {
          userId: user.id, sip: dto.sip!, specializationId: dto.specialization_id!,
        });
        actorStatus = doctor.status;
      } else if (dto.role === RegisterableRole.APOTHECARY) {
        const apothecary = await this.apothecaryRepository.createWithinTransaction(tx, {
          userId: user.id, licenseNumber: dto.license_number!,
        });
        actorStatus = apothecary.status;
      }

      return { userId: user.id, status: actorStatus };
    });

    await this.issueVerificationEmailBestEffort(userId, email.toString());

    return { id: userId, username: dto.username, email: email.toString(), role: dto.role, status };
  }

  private async issueVerificationEmailBestEffort(userId: string, email: string): Promise<void> {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const ttlHours = this.configService.get<number>('auth.emailVerificationTokenTtlHours', 24);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    await this.tokenRepository.create(userId, tokenHash, expiresAt);
    await this.emailService.sendVerificationEmail(email, rawToken);
  }
}