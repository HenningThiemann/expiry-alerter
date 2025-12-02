import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET all secrets (optionally filtered by customerId)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId");

    const secrets = await prisma.secret.findMany({
      where: customerId ? { customerId } : undefined,
      include: {
        customer: {
          select: { id: true, name: true },
        },
      },
      orderBy: { expiryDate: "asc" },
    });

    return NextResponse.json(secrets);
  } catch (error) {
    console.error("Failed to fetch secrets:", error);
    return NextResponse.json(
      { error: "Failed to fetch secrets" },
      { status: 500 }
    );
  }
}

// POST create new secret
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, expiryDate, customerId } = body;

    if (!name || !expiryDate || !customerId) {
      return NextResponse.json(
        { error: "Name, expiryDate, and customerId are required" },
        { status: 400 }
      );
    }

    // Verify customer exists
    const customerExists = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customerExists) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const secret = await prisma.secret.create({
      data: {
        name,
        description,
        expiryDate: new Date(expiryDate),
        customerId,
      },
      include: {
        customer: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(secret, { status: 201 });
  } catch (error) {
    console.error("Failed to create secret:", error);
    return NextResponse.json(
      { error: "Failed to create secret" },
      { status: 500 }
    );
  }
}
