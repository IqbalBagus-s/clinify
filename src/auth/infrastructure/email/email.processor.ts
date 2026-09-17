// src/auth/infrastructure/email/email.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailServiceImpl } from './email.service.impl';
import { EMAIL_QUEUE_NAME, EmailJobName, SendVerificationJobData } from './email-queue.constants';

@Processor(EMAIL_QUEUE_NAME)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailServiceImpl: EmailServiceImpl) {
    super();
  }

  async process(job: Job<SendVerificationJobData>): Promise<void> {
    switch (job.name) {
      case EmailJobName.SEND_VERIFICATION:
        this.logger.log(`Memproses job kirim email verifikasi ke ${job.data.to}`);
        await this.emailServiceImpl.sendVerificationEmail(job.data.to, job.data.rawToken);
        break;
      default:
        this.logger.warn(`Job dengan nama tidak dikenal: ${job.name}`);
    }
  }
}