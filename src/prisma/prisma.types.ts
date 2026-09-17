// src/prisma/prisma.types.ts
import { PrismaClient } from '../generated/prisma/client';

type PrismaMethodKeys = {
  [K in keyof PrismaClient]: K extends `$${string}` ? K : never;
}[keyof PrismaClient];

export type PrismaTransactionClient = Omit<PrismaClient, PrismaMethodKeys>;