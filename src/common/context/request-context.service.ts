// src/common/context/request-context.service.ts
import { AsyncLocalStorage } from 'node:async_hooks';

interface RequestContextStore {
  correlationId: string;
}

export class RequestContextService {
  private static readonly storage = new AsyncLocalStorage<RequestContextStore>();

  static run<T>(store: RequestContextStore, callback: () => T): T {
    return this.storage.run(store, callback);
  }

  static getCorrelationId(): string | undefined {
    return this.storage.getStore()?.correlationId;
  }
}