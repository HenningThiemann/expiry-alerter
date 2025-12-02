import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single secret
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const secret = await prisma.secret.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true },
        },
      },
    });

    if (!secret) {
      return NextResponse.json({ error: "Secret not found" }, { status: 404 });
    }

    return NextResponse.json(secret);
  } catch (error) {
    console.error("Failed to fetch secret:", error);
    return NextResponse.json(
      { error: "Failed to fetch secret" },
      { status: 500 }
    );
  }
}

// PUT update secret
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, expiryDate, customerId } = body;

    // If customerId is provided, verify it exists
    if (customerId) {
      const customerExists = await prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customerExists) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }
    }

    const secret = await prisma.secret.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        ...(customerId && { customerId }),
      },
      include: {
        customer: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(secret);
  } catch (error) {
    console.error("Failed to update secret:", error);
    return NextResponse.json(
      { error: "Failed to update secret" },
      { status: 500 }
    );
  }
}

// DELETE secret
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.secret.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete secret:", error);
    return NextResponse.json(
      { error: "Failed to delete secret" },
      { status: 500 }
    );
  }
}
