// src/auth/infrastructure/email/email-queue.producer.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { IEmailService } from 'src/auth/domain/interfaces/email.service.interface';
import { RequestContextService } from 'src/common/context/request-context.service';
import { EMAIL_QUEUE_NAME, EmailJobName, SendVerificationJobData } from './email-queue.constants';

@Injectable()
export class EmailQueueProducer implements IEmailService {
  private readonly logger = new Logger(EmailQueueProducer.name);

  constructor(@InjectQueue(EMAIL_QUEUE_NAME) private readonly emailQueue: Queue) {}

  async sendVerificationEmail(to: string, rawToken: string): Promise<void> {
    // Correlation ID dari request HTTP yang memicu ini diteruskan ke job,
    // supaya bisa ditelusuri sampai ke worker BullMQ.
    const correlationId = RequestContextService.getCorrelationId();
    try {
      const jobData: SendVerificationJobData = { to, rawToken, correlationId };
      await this.emailQueue.add(EmailJobName.SEND_VERIFICATION, jobData, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: 100,
      });
      this.logger.log({ message: 'verification_email_job_enqueued', to, correlationId });
    } catch (error) {
      this.logger.error(
        { message: 'verification_email_job_enqueue_failed', to, correlationId },
        (error as Error).stack,
      );
    }
  }
}