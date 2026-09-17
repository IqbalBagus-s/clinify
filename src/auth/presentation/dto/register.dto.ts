// src/auth/presentation/dto/register.dto.ts
import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';
import { RegisterableRole } from 'src/auth/domain/enums/registerable-role.enum';
import { IsRegisterableRole } from '../validators/is-registerable-role.validator';

export class RegisterDto {
  @IsString() @IsNotEmpty() @MaxLength(50)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/, {
    message: 'Password minimal 8 karakter dan harus mengandung huruf besar, huruf kecil, angka, dan karakter spesial.',
  })
  password: string;

  @IsEnum(RegisterableRole)
  @IsRegisterableRole()
  role: RegisterableRole;

  @IsString() @IsNotEmpty()
  full_name: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsDateString()
  date_of_birth?: string;

  @IsOptional() @IsEnum(['PRIA', 'WANITA'])
  gender?: 'PRIA' | 'WANITA';

  @IsOptional() @IsString()
  address?: string;

  @ValidateIf((dto: RegisterDto) => dto.role === RegisterableRole.DOCTOR)
  @IsString() @IsNotEmpty()
  sip?: string;

  @ValidateIf((dto: RegisterDto) => dto.role === RegisterableRole.DOCTOR)
  @IsString() @IsNotEmpty()
  specialization_id?: string;

  @ValidateIf((dto: RegisterDto) => dto.role === RegisterableRole.APOTHECARY)
  @IsString() @IsNotEmpty()
  license_number?: string;
}