import { prisma } from "@/app/lib/prisma";
import { verifyToken } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  const auth = verifyToken(req);

  const salesman = await prisma.salesman.findFirst({
    where: { userId: auth.userId },
    include: { exhibition: true },
  });

  return NextResponse.json(salesman);
}
