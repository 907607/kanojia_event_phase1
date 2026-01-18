import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  const exhibition = await prisma.exhibition.create({
    data: {
      name: body.name,
      city: body.city,
      venue: body.venue,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      status: "PLANNING",
    },
  });

  return NextResponse.json(exhibition);
}
