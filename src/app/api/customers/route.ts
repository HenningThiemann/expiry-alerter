import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET all customers
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        _count: {
          select: { secrets: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(customers);
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, webhookUrl } = body;

    if (!name || !webhookUrl) {
      return NextResponse.json(
        { error: "Name and webhookUrl are required" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        webhookUrl,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Failed to create customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
