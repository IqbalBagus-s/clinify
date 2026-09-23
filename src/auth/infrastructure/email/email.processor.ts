// src/auth/infrastructure/email/email.processor.ts
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Job } from 'bullmq';
import { EmailServiceImpl } from './email.service.impl';
import {
  EMAIL_QUEUE_NAME,
  EmailJobData,
  EmailJobName,
  SendPasswordResetJobData,
  SendVerificationJobData,
} from './email-queue.constants';

@Processor(EMAIL_QUEUE_NAME)
export class EmailProcessor extends WorkerHost {
  constructor(
    @InjectPinoLogger(EmailProcessor.name) private readonly logger: PinoLogger,
    private readonly emailServiceImpl: EmailServiceImpl,
  ) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    const logContext = { jobId: job.id, correlationId: job.data.correlationId, to: job.data.to };

    switch (job.name) {
      case EmailJobName.SEND_VERIFICATION: {
        const data = job.data as SendVerificationJobData;
        this.logger.info(logContext, 'processing_verification_email');
        await this.emailServiceImpl.sendVerificationEmail(data.to, data.rawToken);
        break;
      }
      case EmailJobName.SEND_PASSWORD_RESET: {
        const data = job.data as SendPasswordResetJobData;
        this.logger.info(logContext, 'processing_password_reset_email');
        await this.emailServiceImpl.sendPasswordResetEmail(data.to, data.rawToken);
        break;
      }
      default:
        this.logger.warn({ jobName: job.name }, 'unknown_job_name');
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<EmailJobData> | undefined, error: Error) {
    this.logger.error(
      {
        jobId: job?.id,
        jobName: job?.name,
        to: job?.data?.to,
        correlationId: job?.data?.correlationId,
        attemptsMade: job?.attemptsMade,
      },
      `email_job_permanently_failed: ${error.message}`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<EmailJobData>) {
    this.logger.info(
      { jobId: job.id, jobName: job.name, to: job.data.to, correlationId: job.data.correlationId },
      'email_job_completed',
    );
  }
}