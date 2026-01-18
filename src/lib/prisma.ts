// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
    // Prevent multiple instances during hot reload
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;

function createPrismaClient(): PrismaClient {
    if (!connectionString) {
        // During build time, DATABASE_URL might be missing. 
        // We throw an error here to prevent misconfiguration at runtime,
        // but the Proxy below will catch this only when the client is actually used.
        throw new Error('DATABASE_URL is not set. PrismaClient cannot be initialized.');
    }

    const pool = new Pool({
        connectionString,
    });

    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
    });
}

// Use a proxy to prevent instantiation until first use
// This prevents Prisma from crashing during Next.js build-time static analysis
export const prisma = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        if (!global.prisma) {
            global.prisma = createPrismaClient();
        }
        return (global.prisma as any)[prop];
    }
});

if (process.env.NODE_ENV !== 'production') {
    global.prisma = global.prisma;
}

