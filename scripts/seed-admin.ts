import 'dotenv/config';
import { Role } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';
import { prisma } from '../src/lib/prisma';

async function main() {
    const adminUsername = 'admin';
    const adminPassword = 'password123'; // Change this in production!

    const existing = await prisma.user.findUnique({
        where: { username: adminUsername }
    });

    if (existing) {
        console.log('Admin user already exists.');
        return;
    }

    const hashedPassword = await hashPassword(adminPassword);

    await prisma.user.create({
        data: {
            username: adminUsername,
            password: hashedPassword,
            role: Role.ADMIN,
            isActive: true,
        }
    });

    console.log(`Admin user created: ${adminUsername} / ${adminPassword}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
