import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const application = await db.teacherProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, createdAt: true } },
        _count: {
          select: { reviews: true, payouts: true },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Get courses by this teacher
    const courses = await db.course.findMany({
      where: { teacherId: application.userId },
      select: { id: true, title: true, status: true, createdAt: true },
    });

    return NextResponse.json({ application: { ...application, courses } });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch application" },
      { status: 500 }
    );
  }
}

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
    const { action } = body;

    const profile = await db.teacherProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (action === "approve") {
      // Set status to APPROVED and isVerified to true
      const updated = await db.teacherProfile.update({
        where: { id },
        data: { status: "APPROVED", isVerified: true },
        include: { user: true },
      });

      // Update user role to TEACHER
      await db.user.update({
        where: { id: profile.userId },
        data: { role: "TEACHER" },
      });

      // Create notification for the teacher
      await db.notification.create({
        data: {
          userId: profile.userId,
          title: "Teacher Application Approved! 🎉",
          message: "Congratulations! Your teacher application has been approved. You can now create and publish courses.",
          type: "ACHIEVEMENT",
        },
      });

      return NextResponse.json({ profile: updated });
    }

    if (action === "reject") {
      // Set status to REJECTED, don't delete
      const updated = await db.teacherProfile.update({
        where: { id },
        data: { status: "REJECTED" },
      });

      // Create notification for the teacher
      await db.notification.create({
        data: {
          userId: profile.userId,
          title: "Teacher Application Update",
          message: "Your teacher application was not approved at this time. You may reapply after reviewing the requirements.",
          type: "SYSTEM",
        },
      });

      return NextResponse.json({ profile: updated, message: "Application rejected" });
    }

    return NextResponse.json({ error: "Invalid action. Use 'approve' or 'reject'." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update teacher application" },
      { status: 500 }
    );
  }
}
