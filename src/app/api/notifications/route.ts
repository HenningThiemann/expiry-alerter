import { prisma } from "@/lib/prisma";
import { sendTeamsNotification } from "@/lib/teams";
import { NextResponse } from "next/server";

// POST - trigger notifications for secrets expiring within 2 weeks
export async function POST() {
  try {
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    // Get all customers with secrets expiring within 2 weeks
    const customersWithExpiringSecrets = await prisma.customer.findMany({
      where: {
        secrets: {
          some: {
            expiryDate: {
              lte: twoWeeksFromNow,
              gte: new Date(), // Only future dates (not already expired)
            },
          },
        },
      },
      include: {
        secrets: {
          where: {
            expiryDate: {
              lte: twoWeeksFromNow,
              gte: new Date(),
            },
          },
          orderBy: { expiryDate: "asc" },
        },
      },
    });

    const results: {
      customerId: string;
      customerName: string;
      secretsCount: number;
      success: boolean;
    }[] = [];

    for (const customer of customersWithExpiringSecrets) {
      if (customer.secrets.length > 0) {
        const success = await sendTeamsNotification(
          customer.webhookUrl,
          customer.name,
          customer.secrets
        );

        results.push({
          customerId: customer.id,
          customerName: customer.name,
          secretsCount: customer.secrets.length,
          success,
        });
      }
    }

    return NextResponse.json({
      message: "Notifications processed",
      notificationsSent: results.filter((r) => r.success).length,
      totalCustomers: results.length,
      details: results,
    });
  } catch (error) {
    console.error("Failed to process notifications:", error);
    return NextResponse.json(
      { error: "Failed to process notifications" },
      { status: 500 }
    );
  }
}

// GET - check which secrets are expiring soon (for preview)
export async function GET() {
  try {
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    const expiringSecrets = await prisma.secret.findMany({
      where: {
        expiryDate: {
          lte: twoWeeksFromNow,
          gte: new Date(),
        },
      },
      include: {
        customer: {
          select: { id: true, name: true },
        },
      },
      orderBy: { expiryDate: "asc" },
    });

    return NextResponse.json({
      count: expiringSecrets.length,
      secrets: expiringSecrets,
    });
  } catch (error) {
    console.error("Failed to fetch expiring secrets:", error);
    return NextResponse.json(
      { error: "Failed to fetch expiring secrets" },
      { status: 500 }
    );
  }
}
