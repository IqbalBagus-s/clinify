// src/auth/infrastructure/email/email.processor.ts
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { randomUUID } from 'crypto';
import { EmailServiceImpl } from './email.service.impl';
import { EMAIL_QUEUE_NAME, EmailJobName, SendVerificationJobData } from './email-queue.constants';
import { RequestContextService } from 'src/common/context/request-context.service';

@Processor(EMAIL_QUEUE_NAME)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailServiceImpl: EmailServiceImpl) {
    super();
  }

  async process(job: Job<SendVerificationJobData>): Promise<void> {
    // Kalau job ini datang dari request HTTP, pakai correlationId yang sama.
    // Kalau tidak ada (mis. job lama sebelum fitur ini ada), generate baru.
    const correlationId = job.data.correlationId ?? randomUUID();

    return RequestContextService.run({ correlationId }, async () => {
      switch (job.name) {
        case EmailJobName.SEND_VERIFICATION:
          this.logger.log({
            message: 'processing_verification_email',
            to: job.data.to,
            jobId: job.id,
            attempt: job.attemptsMade + 1,
          });
          await this.emailServiceImpl.sendVerificationEmail(job.data.to, job.data.rawToken);
          break;
        default:
          this.logger.warn({ message: 'unknown_job_name', jobName: job.name });
      }
    });
  }

  // INI YANG SEBELUMNYA HILANG: setelah 3x attempt gagal, job diam-diam
  // dibuang. Sekarang minimal tercatat sebagai error level log yang bisa
  // dihubungkan ke sistem alerting (Slack/PagerDuty/email ke tim ops).
  @OnWorkerEvent('failed')
  onFailed(job: Job<SendVerificationJobData> | undefined, error: Error) {
    this.logger.error(
      {
        message: 'email_job_permanently_failed',
        jobId: job?.id,
        to: job?.data?.to,
        correlationId: job?.data?.correlationId,
        attemptsMade: job?.attemptsMade,
        reason: error.message,
      },
      error.stack,
    );
    // TODO: kirim notifikasi ke tim ops di sini (mis. webhook Slack)
    // supaya kegagalan pengiriman email verifikasi tidak baru diketahui
    // saat user komplain "kok saya tidak bisa login".
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<SendVerificationJobData>) {
    this.logger.log({
      message: 'email_job_completed',
      jobId: job.id,
      to: job.data.to,
      correlationId: job.data.correlationId,
    });
  }
}