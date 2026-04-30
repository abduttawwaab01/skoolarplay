import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { operation, passphrase } = body as {
      operation: string;
      passphrase?: string;
    };

    const validOperations = [
      "setPassphrase",
      "deleteStudents",
      "deleteTeachers",
      "deleteCourses",
      "deleteProgress",
      "resetSystem",
    ];

    if (!operation || !validOperations.includes(operation)) {
      return NextResponse.json(
        {
          error: `Invalid operation. Allowed: ${validOperations.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // setPassphrase does not require existing passphrase verification
    if (operation === "setPassphrase") {
      const { newPassphrase } = body as { newPassphrase: string };
      if (!newPassphrase || newPassphrase.length < 8) {
        return NextResponse.json(
          { error: "Passphrase must be at least 8 characters" },
          { status: 400 }
        );
      }

      let settings = await db.adminSettings.findFirst();
      if (!settings) {
        settings = await db.adminSettings.create({
          data: { dangerZonePassphrase: newPassphrase },
        });
      } else {
        settings = await db.adminSettings.update({
          where: { id: settings.id },
          data: { dangerZonePassphrase: newPassphrase },
        });
      }

      await logAudit({
        actorId: admin.id,
        actorName: admin.name || "Admin",
        action: "DANGER_SET_PASSPHRASE",
        entity: "DangerZone",
        entityId: "PASSPHRASE",
        details: { message: "Danger zone passphrase set/updated" },
      });

      return NextResponse.json({
        success: true,
        message: "Danger zone passphrase set successfully",
      });
    }

    // All other operations require passphrase verification
    const settings = await db.adminSettings.findFirst();
    const storedPassphrase = settings?.dangerZonePassphrase;

    if (!storedPassphrase) {
      return NextResponse.json(
        { error: "No danger zone passphrase set. Set one first." },
        { status: 400 }
      );
    }

    if (passphrase !== storedPassphrase) {
      return NextResponse.json({ error: "Invalid passphrase" }, { status: 403 });
    }

    let details: Record<string, number | string> = {};

    switch (operation) {
      case "deleteStudents": {
        const count = await db.user.count({ where: { role: "STUDENT" } });
        await db.user.deleteMany({ where: { role: "STUDENT" } });
        details = { deletedStudents: count };

        await logAudit({
          actorId: admin.id,
          actorName: admin.name || "Admin",
          action: "DANGER_DELETE_STUDENTS",
          entity: "DangerZone",
          entityId: "STUDENTS",
          details: { deletedCount: count },
        });
        break;
      }

      case "deleteTeachers": {
        const count = await db.user.count({ where: { role: "TEACHER" } });
        await db.user.deleteMany({ where: { role: "TEACHER" } });
        details = { deletedTeachers: count };

        await logAudit({
          actorId: admin.id,
          actorName: admin.name || "Admin",
          action: "DANGER_DELETE_TEACHERS",
          entity: "DangerZone",
          entityId: "TEACHERS",
          details: { deletedCount: count },
        });
        break;
      }

      case "deleteCourses": {
        // Count courses first
        const courseCount = await db.course.count();
        // Deleting courses will cascade to modules, lessons, questions
        await db.course.deleteMany();
        details = { deletedCourses: courseCount };

        await logAudit({
          actorId: admin.id,
          actorName: admin.name || "Admin",
          action: "DANGER_DELETE_COURSES",
          entity: "DangerZone",
          entityId: "COURSES",
          details: { deletedCount: courseCount },
        });
        break;
      }

      case "deleteProgress": {
        const counts: Record<string, number> = {};

        // Lesson progress
        counts.lessonProgress = await db.lessonProgress.count();
        await db.lessonProgress.deleteMany();

        // Enrollments
        counts.enrollments = await db.enrollment.count();
        await db.enrollment.deleteMany();

        // Certificates
        counts.certificates = await db.certificate.count();
        await db.certificate.deleteMany();

        // Achievements earned
        counts.achievements = await db.userAchievement.count();
        await db.userAchievement.deleteMany();

        // Exam attempts
        counts.examAttempts = await db.examAttempt.count();
        await db.examAttempt.deleteMany();

        // Spin results
        counts.spinResults = await db.spinResult.count();
        await db.spinResult.deleteMany();

        // Quest completions
        counts.questCompletions = await db.questCompletion.count();
        await db.questCompletion.deleteMany();

        // Login rewards
        counts.loginRewards = await db.loginReward.count();
        await db.loginReward.deleteMany();

        // Boss battle completions
        counts.bossBattleCompletions = await db.bossBattleCompletion.count();
        await db.bossBattleCompletion.deleteMany();

        // Daily challenge completions
        counts.dailyChallengeCompletions = await db.dailyChallengeCompletion.count();
        await db.dailyChallengeCompletion.deleteMany();

        // Leaderboard entries
        counts.leaderboardEntries = await db.leaderboardEntry.count();
        await db.leaderboardEntry.deleteMany();

        details = counts;

        await logAudit({
          actorId: admin.id,
          actorName: admin.name || "Admin",
          action: "DANGER_DELETE_PROGRESS",
          entity: "DangerZone",
          entityId: "PROGRESS",
          details: counts,
        });
        break;
      }

      case "resetSystem": {
        const counts: Record<string, number> = {};

        // Progress data
        counts.lessonProgress = await db.lessonProgress.count();
        await db.lessonProgress.deleteMany();

        counts.enrollments = await db.enrollment.count();
        await db.enrollment.deleteMany();

        counts.certificates = await db.certificate.count();
        await db.certificate.deleteMany();

        counts.achievements = await db.userAchievement.count();
        await db.userAchievement.deleteMany();

        counts.purchases = await db.purchase.count();
        await db.purchase.deleteMany();

        counts.payments = await db.payment.count();
        await db.payment.deleteMany();

        counts.notifications = await db.notification.count();
        await db.notification.deleteMany();

        counts.examAttempts = await db.examAttempt.count();
        await db.examAttempt.deleteMany();

        counts.spinResults = await db.spinResult.count();
        await db.spinResult.deleteMany();

        counts.questCompletions = await db.questCompletion.count();
        await db.questCompletion.deleteMany();

        counts.loginRewards = await db.loginReward.count();
        await db.loginReward.deleteMany();

        counts.mysteryBoxes = await db.mysteryBox.count();
        await db.mysteryBox.deleteMany();

        counts.bossBattleCompletions = await db.bossBattleCompletion.count();
        await db.bossBattleCompletion.deleteMany();

        counts.groupChallengeCompletions = await db.groupChallengeCompletion.count();
        await db.groupChallengeCompletion.deleteMany();

        counts.dailyChallengeCompletions = await db.dailyChallengeCompletion.count();
        await db.dailyChallengeCompletion.deleteMany();

        counts.leaderboardEntries = await db.leaderboardEntry.count();
        await db.leaderboardEntry.deleteMany();

        counts.referrals = await db.referral.count();
        await db.referral.deleteMany();

        counts.gemGifts = await db.gemGift.count();
        await db.gemGift.deleteMany();

        counts.teacherMessages = await db.teacherMessage.count();
        await db.teacherMessage.deleteMany();

        counts.studyGroupMembers = await db.studyGroupMember.count();
        await db.studyGroupMember.deleteMany();

        counts.courseReviews = await db.courseReview.count();
        await db.courseReview.deleteMany();

        counts.teacherPayouts = await db.teacherPayout.count();
        await db.teacherPayout.deleteMany();

        counts.userReports = await db.userReport.count();
        await db.userReport.deleteMany();

        // Courses (modules, lessons, questions cascade)
        counts.courses = await db.course.count();
        await db.course.deleteMany();

        // Non-admin users
        const nonAdminCount = await db.user.count({
          where: { role: { not: "ADMIN" } },
        });
        counts.nonAdminUsers = nonAdminCount;
        await db.user.deleteMany({ where: { role: { not: "ADMIN" } } });

        // Reset admin user game stats (keep admin account)
        await db.user.updateMany({
          where: { role: "ADMIN" },
          data: {
            gems: 50,
            xp: 0,
            streak: 0,
            hearts: 5,
            level: 1,
          },
        });

        details = counts;

        await logAudit({
          actorId: admin.id,
          actorName: admin.name || "Admin",
          action: "DANGER_SYSTEM_RESET",
          entity: "DangerZone",
          entityId: "FULL_RESET",
          details: counts,
        });
        break;
      }

      default: {
        return NextResponse.json({ error: "Unknown operation" }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      operation,
      details,
      message: `Operation "${operation}" completed successfully.`,
    });
  } catch (error: any) {
    console.error("Danger zone operation error:", error);
    return NextResponse.json(
      { error: error.message || "Danger zone operation failed" },
      { status: 500 }
    );
  }
}
