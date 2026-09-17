// src/auth/infrastructure/email/email.service.impl.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { IEmailService } from 'src/auth/domain/interfaces/email.service.interface';

@Injectable()
export class EmailServiceImpl implements IEmailService {
  private readonly logger = new Logger(EmailServiceImpl.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(to: string, rawToken: string): Promise<void> {
    const url = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${rawToken}`;
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM'),
        to,
        subject: 'Verifikasi Email Akun Klinik Anda',
        html: `<p>Klik tautan berikut untuk verifikasi email Anda:</p><a href="${url}">${url}</a>`,
      });
    } catch (error) {
      this.logger.error(`Gagal mengirim email verifikasi ke ${to}`, error);
    }
  }
}