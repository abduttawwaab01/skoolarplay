import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, reference } = body;

    if (!status || !["PROCESSING", "COMPLETED", "FAILED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Use PROCESSING, COMPLETED, or FAILED." },
        { status: 400 }
      );
    }

    const payout = await db.teacherPayout.findUnique({
      where: { id },
    });

    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    }

    // Look up the actual userId from the TeacherProfile
    const teacherProfile = await db.teacherProfile.findUnique({
      where: { id: payout.teacherProfileId },
      select: { userId: true },
    });

    const teacherUserId = teacherProfile?.userId;

    const updateData: Record<string, unknown> = {
      status,
    };

    // Set processedAt when completing or failing
    if (status === "COMPLETED" || status === "FAILED") {
      updateData.processedAt = new Date();
    }

    // Set admin reference if provided
    if (reference) {
      updateData.reference = reference;
    }

    // If payout failed, refund the teacher's available balance
    if (status === "FAILED" && payout.status === "PENDING") {
      updateData.processedAt = new Date();

      await db.$transaction(async (tx) => {
        // Update payout status
        await tx.teacherPayout.update({
          where: { id },
          data: updateData,
        });

        // Refund teacher balance
        await tx.teacherProfile.update({
          where: { id: payout.teacherProfileId },
          data: {
            availableBalance: { increment: payout.amount },
          },
        });
      });

      // Notify teacher about failed payout
      if (teacherUserId) {
        await db.notification.create({
          data: {
            userId: teacherUserId,
            title: "Payout Failed",
          message: `Your payout of ₦${payout.amount.toLocaleString()} could not be processed. The amount has been refunded to your available balance. Please verify your bank details and try again.`,
          type: "SYSTEM",
        },
      });
      }

      const updatedPayout = await db.teacherPayout.findUnique({ where: { id } });
      return NextResponse.json({ payout: updatedPayout });
    }

    // Standard status update
    const updatedPayout = await db.teacherPayout.update({
      where: { id },
      data: updateData,
    });

    // Notify teacher
    if (teacherUserId && status === "PROCESSING") {
      await db.notification.create({
        data: {
          userId: teacherUserId,
          title: "Payout Processing",
          message: `Your payout of ₦${payout.amount.toLocaleString()} is being processed and will be sent to your bank account shortly.`,
          type: "SYSTEM",
        },
      });
    } else if (teacherUserId && status === "COMPLETED") {
      await db.notification.create({
        data: {
          userId: teacherUserId,
          title: "Payout Completed! 💰",
          message: `Your payout of ₦${payout.amount.toLocaleString()} has been successfully sent to your bank account (${payout.bankName} - ****${payout.accountNumber.slice(-4)}).`,
          type: "SYSTEM",
        },
      });
    }

    return NextResponse.json({ payout: updatedPayout });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update payout" },
      { status: 500 }
    );
  }
}
