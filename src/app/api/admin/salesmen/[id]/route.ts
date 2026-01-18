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

        if (typeof body.isActive === 'boolean') {
            updateData.isActive = body.isActive;
        }

        if (body.assignedExhibitionId !== undefined) {
            updateData.assignedExhibitionId = body.assignedExhibitionId || null;
        }

        const salesman = await prisma.user.update({
            where: { id, role: 'SALESMAN' },
            data: updateData,
            include: {
                assignedExhibition: {
                    select: { name: true, id: true }
                }
            }
        });

        return NextResponse.json(salesman);
    } catch (error: any) {
        console.error('Update Salesman Error:', error);
        return NextResponse.json({ error: 'Failed to update salesman' }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = verifyToken(token);
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        const salesman = await prisma.user.findUnique({
            where: { id, role: 'SALESMAN' },
            include: {
                assignedExhibition: {
                    select: { name: true, city: true, status: true }
                },
                orders: {
                    select: {
                        id: true,
                        totalAmount: true,
                        createdAt: true,
                        customerName: true,
                        productName: true,
                        exhibition: {
                            select: { name: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });

        if (!salesman) {
            return NextResponse.json({ error: 'Salesman not found' }, { status: 404 });
        }

        // Calculate stats
        const allOrders = await prisma.order.findMany({
            where: { salesmanId: id },
            select: { totalAmount: true }
        });

        const stats = {
            totalRevenue: allOrders.reduce((sum, o) => sum + o.totalAmount, 0),
            totalOrders: allOrders.length,
            avgOrderValue: allOrders.length > 0 ? allOrders.reduce((sum, o) => sum + o.totalAmount, 0) / allOrders.length : 0
        };

        return NextResponse.json({ ...salesman, stats });
    } catch (error: any) {
        console.error('Get Salesman Error:', error);
        return NextResponse.json({ error: 'Failed to fetch salesman' }, { status: 500 });
    }
}
