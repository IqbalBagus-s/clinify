// src/auth/presentation/dto/verify-email.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsString() @IsNotEmpty()
  token: string;
}