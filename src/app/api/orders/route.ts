import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function GET(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Filter based on role
    const whereClause: any = {};

    if (user.role === 'SALESMAN') {
        whereClause.salesmanId = user.id;
    }

    // Admin can filter by exhibition via query param
    const url = new URL(request.url);
    const exhibitionId = url.searchParams.get('exhibitionId');
    if (exhibitionId) {
        whereClause.exhibitionId = exhibitionId;
    }

    const orders = await prisma.order.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
            salesman: { select: { username: true } },
            exhibition: { select: { name: true } }
        }
    });

    return NextResponse.json(orders);
}

export async function POST(request: Request) {
    const user = await getUser();
    if (!user || user.role !== 'SALESMAN') {
        // Only Salesman creates orders (mostly). Admin could, but per design "Salesman creates Order".
        return NextResponse.json({ error: 'Only salesmen can create orders' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const {
            exhibitionId,
            customerName, customerPhone, customerAddress,
            productId, quantity, paymentRef
        } = body;

        // 1. Resolve Exhibition
        let targetExhibitionId = exhibitionId;

        // Fallback to assigned if not provided (optional)
        if (!targetExhibitionId) {
            const dbUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { assignedExhibitionId: true }
            });
            targetExhibitionId = dbUser?.assignedExhibitionId;
        }

        if (!targetExhibitionId) {
            return NextResponse.json({ error: 'Exhibition ID is required' }, { status: 400 });
        }

        const exhibition = await prisma.exhibition.findUnique({
            where: { id: targetExhibitionId }
        });

        if (!exhibition || exhibition.status !== 'LIVE') {
            return NextResponse.json({ error: 'Exhibition is not LIVE or not found' }, { status: 400 });
        }

        // Validate Input
        if (!customerName || !productId || !quantity || !paymentRef) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch Product for Snapshot
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product || !product.isActive) {
            return NextResponse.json({ error: 'Product not found or inactive' }, { status: 400 });
        }

        const qty = parseInt(quantity);
        const totalAmount = product.basePrice * qty;

        // Create Order with Snapshot
        const order = await prisma.order.create({
            data: {
                exhibitionId: exhibition.id,
                salesmanId: user.id,
                customerName,
                customerPhone,
                customerAddress,

                productSnapshotId: product.id,
                productName: product.name,
                productSku: product.sku,
                productPrice: product.basePrice,

                quantity: qty,
                totalAmount,
                paymentRef
            }
        });

        return NextResponse.json(order);

    } catch (error) {
        console.error('Create Order Error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
