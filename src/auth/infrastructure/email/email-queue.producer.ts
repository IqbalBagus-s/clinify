// src/auth/infrastructure/email/email-queue.producer.ts
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Queue } from 'bullmq';
import { Request } from 'express';
import { IEmailService } from 'src/auth/domain/interfaces/email.service.interface';
import { EMAIL_QUEUE_NAME, EmailJobName, SendVerificationJobData } from './email-queue.constants';

// PERBAIKAN: provider ini sekarang Scope.REQUEST supaya bisa mengakses
// objek request Express secara langsung, dan membaca req.id yang sudah
// ditempel oleh pino-http lewat genReqId di LoggerModule.
@Injectable({ scope: Scope.REQUEST })
export class EmailQueueProducer implements IEmailService {
  constructor(
    @InjectPinoLogger(EmailQueueProducer.name) private readonly logger: PinoLogger,
    @InjectQueue(EMAIL_QUEUE_NAME) private readonly emailQueue: Queue,
    @Inject(REQUEST) private readonly request: Request & { id?: string },
  ) {}

  async sendVerificationEmail(to: string, rawToken: string): Promise<void> {
    const correlationId = this.request?.id;
    try {
      const jobData: SendVerificationJobData = { to, rawToken, correlationId };
      await this.emailQueue.add(EmailJobName.SEND_VERIFICATION, jobData, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: 100,
      });
      this.logger.info({ to, correlationId }, 'verification_email_job_enqueued');
    } catch (error) {
      this.logger.error({ to, correlationId, err: error }, 'verification_email_job_enqueue_failed');
    }
  }
}