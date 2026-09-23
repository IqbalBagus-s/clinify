// src/auth/presentation/dto/change-password.dto.ts
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString() @IsNotEmpty()
  old_password: string;

  @IsString()
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/, {
    message: 'Password minimal 8 karakter dan harus mengandung huruf besar, huruf kecil, angka, dan karakter spesial.',
  })
  new_password: string;
}