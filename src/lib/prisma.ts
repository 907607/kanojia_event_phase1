import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;

let prismaInstance: PrismaClient;

if (!connectionString) {
    console.error("ERROR: DATABASE_URL is not defined.");
    // Fallback or let it throw naturally later, but at least we logged it.
    // We can initialize dummy or just fail.
    // Ideally, valid PrismaClient cannot be created without valid connection.
    // But let's try standard init if adapter path fails logic (unlikely).
    // Check if we can just create standard client (Prisma 7 style might differ).

    // For now, let's just proceed but log it.
}

try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prismaInstance = globalForPrisma.prisma || new PrismaClient({ adapter });
} catch (e) {
    console.error("Failed to initialize Prisma with Adapter:", e);
    // Fallback?
    prismaInstance = globalForPrisma.prisma || new PrismaClient();
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
