import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  const product = await prisma.product.create({
    data: body,
  });

  return NextResponse.json(product);
}
