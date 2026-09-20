// src/auth/infrastructure/email/email.processor.ts
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Job } from 'bullmq';
import { EmailServiceImpl } from './email.service.impl';
import { EMAIL_QUEUE_NAME, EmailJobName, SendVerificationJobData } from './email-queue.constants';

@Processor(EMAIL_QUEUE_NAME)
export class EmailProcessor extends WorkerHost {
  constructor(
    @InjectPinoLogger(EmailProcessor.name) private readonly logger: PinoLogger,
    private readonly emailServiceImpl: EmailServiceImpl,
  ) {
    super();
  }

  async process(job: Job<SendVerificationJobData>): Promise<void> {
    // Karena job ini di luar konteks HTTP, correlationId TIDAK otomatis
    // muncul di log seperti request biasa — harus disertakan manual di sini.
    const logContext = { jobId: job.id, correlationId: job.data.correlationId, to: job.data.to };

    switch (job.name) {
      case EmailJobName.SEND_VERIFICATION:
        this.logger.info(logContext, 'processing_verification_email');
        await this.emailServiceImpl.sendVerificationEmail(job.data.to, job.data.rawToken);
        break;
      default:
        this.logger.warn({ jobName: job.name }, 'unknown_job_name');
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<SendVerificationJobData> | undefined, error: Error) {
    this.logger.error(
      {
        jobId: job?.id,
        to: job?.data?.to,
        correlationId: job?.data?.correlationId,
        attemptsMade: job?.attemptsMade,
      },
      `email_job_permanently_failed: ${error.message}`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<SendVerificationJobData>) {
    this.logger.info(
      { jobId: job.id, to: job.data.to, correlationId: job.data.correlationId },
      'email_job_completed',
    );
  }
}