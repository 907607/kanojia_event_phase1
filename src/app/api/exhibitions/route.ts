import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Helper to check admin
async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    const user = verifyToken(token);
    if (!user || user.role !== 'ADMIN') return null;
    return user;
}

export async function GET() {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const exhibitions = await prisma.exhibition.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { orders: true, salesmen: true }
            }
        }
    });

    return NextResponse.json(exhibitions);
}

export async function POST(request: Request) {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { name, city, startDate, endDate, description, imageUrl } = await request.json();

        // Status defaults to PLANNING in schema
        const exhibition = await prisma.exhibition.create({
            data: {
                name,
                city,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                status: 'PLANNING',
                description,
                imageUrl
            }
        });

        return NextResponse.json(exhibition);
    } catch (error) {
        console.error('Create Exhibition Error:', error);
        return NextResponse.json({ error: 'Failed to create exhibition' }, { status: 500 });
    }
}
