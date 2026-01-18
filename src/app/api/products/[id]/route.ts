import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    try {
        const updateData: any = {};

        if (body.name) updateData.name = body.name;
        if (body.sku) updateData.sku = body.sku;
        if (body.basePrice !== undefined) updateData.basePrice = parseFloat(body.basePrice);
        if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
        if (typeof body.isActive === 'boolean') updateData.isActive = body.isActive;

        const product = await prisma.product.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(product);
    } catch (error: any) {
        console.error('Update Product Error:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}
