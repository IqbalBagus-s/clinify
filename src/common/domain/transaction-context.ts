// src/common/domain/transaction-context.ts
// Tipe opaque: domain sengaja TIDAK tahu ini object apa secara konkret
// (bisa PrismaTransactionClient, bisa TypeORM QueryRunner, dst).
// Hanya infrastructure yang boleh melakukan cast ke tipe konkretnya.
export type TransactionContext = unknown;