import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { ExhibitionStatus } from '@prisma/client';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await checkAdmin();
    if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const exhibition = await prisma.exhibition.findUnique({
        where: { id },
        include: {
            salesmen: { select: { username: true, id: true } },
            _count: { select: { orders: true } }
        }
    });

    if (!exhibition) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(exhibition);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await checkAdmin();
    // We should verify Role here too, but for brevity verifyToken usually returns role.
    if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    try {
        const updateData: any = {};

        if (body.status) {
            if (!Object.values(ExhibitionStatus).includes(body.status)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
            }
            updateData.status = body.status;
        }

        // Allow other updates? Phase 1: Name/Dates maybe.
        if (body.name) updateData.name = body.name;

        const exhibition = await prisma.exhibition.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(exhibition);
    } catch (error) {
        console.error('Update Exhibition Error:', error);
        return NextResponse.json({ error: 'Failed to update exhibition' }, { status: 500 });
    }
}
