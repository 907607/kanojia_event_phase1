import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function GET(request: Request) {
    // Salesmen need to see products too?
    // "Product: Reference / master data only... Used for autofill"
    // Salesman can read. Admin can write.

    // We should check token for ANY role.
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Optional: Verify token validity specifically
    // const user = verifyToken(token);
    // if (!user) ...

    const products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    return NextResponse.json(products);
}

export async function POST(request: Request) {
    const admin = await checkAdmin();
    if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { name, sku, basePrice, imageUrl } = await request.json();

        const product = await prisma.product.create({
            data: {
                name,
                sku,
                basePrice: parseFloat(basePrice),
                imageUrl
            }
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Create Product Error:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
