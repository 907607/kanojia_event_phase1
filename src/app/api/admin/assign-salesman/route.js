import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { salesmanId, exhibitionId } = await req.json();

  const updated = await prisma.salesman.update({
    where: { id: salesmanId },
    data: { exhibitionId },
  });

  return NextResponse.json(updated);
}
