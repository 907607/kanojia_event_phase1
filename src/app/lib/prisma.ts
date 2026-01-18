<<<<<<< HEAD
export { prisma } from '@/lib/prisma';

=======
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
>>>>>>> 3f5918a8b37bfd972de23b3f2ca9c00928deb663
