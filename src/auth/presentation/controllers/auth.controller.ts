// src/auth/presentation/controllers/auth.controller.ts
import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { RegisterDto } from '../dto/register.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendVerificationDto } from '../dto/resend-verification.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { VerifyEmailUseCase } from '../../application/use-cases/verify-email.use-case';
import { ResendVerificationEmailUseCase } from '../../application/use-cases/resend-verification-email.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { LogoutAllDevicesUseCase } from '../../application/use-cases/logout-all-devices.use-case';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import { RefreshTokenInvalidException } from '../../domain/exceptions/refresh-token-invalid.exception';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../../domain/interfaces/token.service.interface';

const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';
const REFRESH_TOKEN_COOKIE_PATH = '/api/v1/auth';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationEmailUseCase: ResendVerificationEmailUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly logoutAllDevicesUseCase: LogoutAllDevicesUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  @Post('register')
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const result = await this.registerUseCase.execute(dto);
    return { ...result, message: 'Registrasi berhasil. Silakan cek email untuk verifikasi.' };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.verifyEmailUseCase.execute(dto.token);
    return { message: 'Email berhasil diverifikasi.' };
  }

  @Post('resend-verification')
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    await this.resendVerificationEmailUseCase.execute(dto.email);
    return { message: 'Jika email terdaftar dan belum terverifikasi, tautan verifikasi baru telah dikirim.' };
  }

  @Post('login')
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.loginUseCase.execute(dto, {
      deviceInfo: this.extractUserAgent(request),
      ipAddress: request.ip,
    });

    this.setRefreshTokenCookie(response, result.refreshToken, result.refreshTokenExpiresAt);

    return {
      access_token: result.accessToken,
      expires_in: result.expiresIn,
      user: result.user,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const rawRefreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
    if (!rawRefreshToken) {
      throw new RefreshTokenInvalidException();
    }

    const result = await this.refreshTokenUseCase.execute(rawRefreshToken, {
      deviceInfo: this.extractUserAgent(request),
      ipAddress: request.ip,
    });

    this.setRefreshTokenCookie(response, result.refreshToken, result.refreshTokenExpiresAt);

    return {
      access_token: result.accessToken,
      expires_in: result.expiresIn,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: AccessTokenPayload, @Res({ passthrough: true }) response: Response) {
    await this.logoutUseCase.execute(user.sid);
    this.clearRefreshTokenCookie(response);
    return { message: 'Logout berhasil.' };
  }

  @Post('logout-all-devices')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAllDevices(@CurrentUser() user: AccessTokenPayload, @Res({ passthrough: true }) response: Response) {
    const revokedSessions = await this.logoutAllDevicesUseCase.execute(user.sub);
    this.clearRefreshTokenCookie(response);
    return {
      message: 'Berhasil logout dari semua perangkat.',
      revoked_sessions: revokedSessions,
    };
  }

  @Post('forgot-password')
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.forgotPasswordUseCase.execute(dto.email);
    // Pesan identik terlepas kondisi internal — lihat forgot-password.use-case.ts
    return { message: 'Jika email terdaftar, instruksi lebih lanjut telah dikirim ke email Anda.' };
  }

  @Post('reset-password')
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.resetPasswordUseCase.execute(dto.token, dto.new_password);
    return { message: 'Password berhasil direset. Semua sesi aktif telah diakhiri — silakan login kembali.' };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(@CurrentUser() user: AccessTokenPayload, @Body() dto: ChangePasswordDto) {
    await this.changePasswordUseCase.execute(user.sub, user.sid, dto.old_password, dto.new_password);
    return { message: 'Password berhasil diubah. Semua sesi lain telah diakhiri.' };
  }

  private extractUserAgent(request: Request): string | undefined {
    const header = request.headers['user-agent'];
    return Array.isArray(header) ? header[0] : header;
  }

  private setRefreshTokenCookie(response: Response, token: string, expiresAt: Date) {
    response.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: REFRESH_TOKEN_COOKIE_PATH,
      expires: expiresAt,
    });
  }

  private clearRefreshTokenCookie(response: Response) {
    response.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      path: REFRESH_TOKEN_COOKIE_PATH,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }
}