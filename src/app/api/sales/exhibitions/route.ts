import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Both Admin and Salesman can see active exhibitions
        const exhibitions = await prisma.exhibition.findMany({
            where: {
                status: 'LIVE'
            },
            orderBy: { startDate: 'desc' },
            select: {
                id: true,
                name: true,
                city: true,
                startDate: true,
                endDate: true,
                description: true,
                imageUrl: true
            }
        });

        return NextResponse.json(exhibitions);
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
}
