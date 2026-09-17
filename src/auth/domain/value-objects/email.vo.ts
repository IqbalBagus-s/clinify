// src/auth/domain/value-objects/email.vo.ts
export class Email {
  private constructor(private readonly value: string) {}

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new Error('Format email tidak valid.');
    }
    return new Email(normalized);
  }

  toString(): string {
    return this.value;
  }
}