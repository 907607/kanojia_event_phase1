import 'dotenv/config';
import { Role, ExhibitionStatus } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';
import { prisma } from '../src/lib/prisma';

async function main() {
    // 1. Create a dummy Exhibition if none exists
    let exhibition = await prisma.exhibition.findFirst();
    if (!exhibition) {
        exhibition = await prisma.exhibition.create({
            data: {
                name: 'Demo Expo 2024',
                city: 'Mumbai',
                startDate: new Date(),
                status: ExhibitionStatus.LIVE
            }
        });
        console.log('Created Demo Exhibition:', exhibition.name);
    } else {
        // Ensure it is LIVE for testing
        if (exhibition.status !== ExhibitionStatus.LIVE) {
            await prisma.exhibition.update({
                where: { id: exhibition.id },
                data: { status: ExhibitionStatus.LIVE }
            });
            console.log('Updated Exhibition to LIVE:', exhibition.name);
        }
    }

    // 1.5 Seed Products
    const count = await prisma.product.count();
    if (count === 0) {
        await prisma.product.createMany({
            data: [
                { name: 'Luxury Sofa', sku: 'SOFA-001', basePrice: 25000, imageUrl: 'https://placehold.co/600x400' },
                { name: 'Dining Table', sku: 'TABLE-002', basePrice: 15000, imageUrl: 'https://placehold.co/600x400' },
                { name: 'Office Chair', sku: 'CHAIR-003', basePrice: 5000, imageUrl: 'https://placehold.co/600x400' }
            ]
        });
        console.log('Seeded 3 demo products');
    }

    // 2. Create Salesman
    const username = 'sales1';
    const existing = await prisma.user.findUnique({ where: { username } });

    if (existing) {
        if (existing.assignedExhibitionId !== exhibition.id) {
            await prisma.user.update({
                where: { id: existing.id },
                data: { assignedExhibitionId: exhibition.id }
            });
            console.log('Re-assigned salesman to exhibition');
        }
    } else {
        await prisma.user.create({
            data: {
                username,
                password: await hashPassword('password123'),
                role: Role.SALESMAN,
                assignedExhibitionId: exhibition.id
            }
        });
        console.log(`Created salesman: ${username} / password123`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
