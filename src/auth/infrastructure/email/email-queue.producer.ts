// src/auth/infrastructure/email/email-queue.producer.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { IEmailService } from 'src/auth/domain/interfaces/email.service.interface';
import { EMAIL_QUEUE_NAME, EmailJobName, SendVerificationJobData } from './email-queue.constants';

@Injectable()
export class EmailQueueProducer implements IEmailService {
  private readonly logger = new Logger(EmailQueueProducer.name);

  constructor(@InjectQueue(EMAIL_QUEUE_NAME) private readonly emailQueue: Queue) {}

  async sendVerificationEmail(to: string, rawToken: string): Promise<void> {
    try {
      const jobData: SendVerificationJobData = { to, rawToken };
      await this.emailQueue.add(EmailJobName.SEND_VERIFICATION, jobData, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: 100,
      });
    } catch (error) {
      // Konsisten dengan keputusan awal: kegagalan mendaftarkan job TIDAK
      // membatalkan data user yang sudah tersimpan -- cukup dicatat log.
      this.logger.error(`Gagal mendaftarkan job kirim email verifikasi untuk ${to}`, error);
    }
  }
}