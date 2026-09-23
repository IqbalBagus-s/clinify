// src/auth/presentation/dto/reset-password.dto.ts
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString() @IsNotEmpty()
  token: string;

  @IsString()
  @MaxLength(72) // batas efektif bcrypt — byte di atas ini diam-diam diabaikan
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/, {
    message: 'Password minimal 8 karakter dan harus mengandung huruf besar, huruf kecil, angka, dan karakter spesial.',
  })
  new_password: string;
}