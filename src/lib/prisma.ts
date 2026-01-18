// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
    // Prevent multiple instances during hot reload
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

export const prisma =
    global.prisma ||
    new PrismaClient({
        adapter: {
            url: process.env.DATABASE_URL, // your Postgres URL
        },
        log: ['query', 'warn', 'error'], // optional
    });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
