import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [
        totalOrders,
        activeExhibitions,
        orders
    ] = await Promise.all([
        prisma.order.count(),
        prisma.exhibition.count({ where: { status: 'LIVE' } }),
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                salesman: { select: { username: true } },
                exhibition: { select: { name: true } }
            }
        })
    ]);

    // Calculate total revenue (aggregation)
    const revenueAgg = await prisma.order.aggregate({
        _sum: { totalAmount: true }
    });
    const totalRevenue = revenueAgg._sum.totalAmount || 0;

    return NextResponse.json({
        totalOrders,
        activeExhibitions,
        totalRevenue,
        recentOrders: orders
    });
}
