import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { hash } from 'bcryptjs';

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const salesmen = await prisma.user.findMany({
        where: { role: 'SALESMAN' },
        select: {
            id: true,
            username: true,
            isActive: true,
            createdAt: true,
            assignedExhibition: {
                select: { name: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(salesmen);
}

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const hashedPassword = await hash(password, 10);

        const newSalesman = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: 'SALESMAN'
            }
        });

        return NextResponse.json(newSalesman);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
