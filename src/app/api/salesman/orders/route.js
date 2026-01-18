import { prisma } from "@/app/lib/prisma";
import { verifyToken } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  const auth = verifyToken(req);
  const body = await req.json();

  const salesman = await prisma.salesman.findFirst({
    where: { userId: auth.userId },
    include: { exhibition: true },
  });

  if (salesman.exhibition.status !== "LIVE") {
    return NextResponse.json({ error: "Exhibition closed" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: body.productId },
  });

  const order = await prisma.exhibitionOrder.create({
    data: {
      exhibitionId: salesman.exhibitionId,
      salesmanId: salesman.id,

      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerCity: body.customerCity,

      productCategory: product.category,
      productName: product.name,
      customSpecs: body.customSpecs || product.defaultSpecs,

      quantity: body.quantity,
      orderValue: body.orderValue ?? product.basePrice,
      advancePaid: body.advancePaid,
      pendingAmount:
        (body.orderValue ?? product.basePrice) - body.advancePaid,
    },
  });

  return NextResponse.json(order);
}
