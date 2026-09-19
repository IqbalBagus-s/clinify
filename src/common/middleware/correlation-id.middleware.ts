// src/common/middleware/correlation-id.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { RequestContextService } from '../context/request-context.service';

const HEADER_NAME = 'x-request-id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Hormati correlation ID dari upstream (mis. API gateway) kalau ada,
    // supaya jejak lintas-service tetap satu ID yang sama.
    const correlationId = (req.headers[HEADER_NAME] as string) || randomUUID();
    res.setHeader(HEADER_NAME, correlationId);
    RequestContextService.run({ correlationId }, () => next());
  }
}