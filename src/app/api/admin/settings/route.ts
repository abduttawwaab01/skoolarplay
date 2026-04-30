import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await db.adminSettings.findFirst();
    if (!settings) {
      settings = await db.adminSettings.create({
        data: {},
      });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Whitelist allowed fields to prevent arbitrary field injection
    const ALLOWED_FIELDS = [
      'platformName',
      'dailyXpGoal',
      'maxHearts',
      'heartRefillHours',
      'gemEarnRate',
      'xpMultiplier',
      'maintenanceMode',
      'allowRegistration',
      'dangerZonePassphrase',
      'inactivityReminders',
      'refundPolicyDays',
      'teacherRefundEnabled',
      // Branding Settings
      'loginPageLogoUrl',
      'navBarLogoUrl',
      'footerLogoUrl',
      'faviconUrl',
      // AI Settings
      'aiRateLimitPerMinute',
      'aiRateLimitPerDay',
      'aiMaxContextMessages',
      'aiModel',
      'aiEnabled',
      'enforceLessonOrder',
      'allowLessonSkip',
      'requireCompletionExam',
      'completionExamPassMark',
      'completionExamAttempts',
      'cacheTTLMinutes',
      'enableOfflineMode',
      'batchSyncInterval',
      'defaultCutoffScore',
      'preloaderDurationSeconds',
      // Email Verification Settings
      'requireEmailVerification',
      'autoVerifyNewUsers',
      // Group Settings
      'freeMaxGroupsCreate',
      'freeMaxGroupsJoin',
      'premiumMaxGroupsCreate',
      'premiumMaxGroupsJoin',
      'freeGroupCreateEnabled',
      'defaultGroupMaxMembers',
      // Video Settings
      'maxVideoSizeMb',
      'allowedVideoFormats',
      // Certificate Settings
      'founderName',
      'founderTitle',
      'founderSignatureUrl',
      'certificatePlatformUrl',
      'certificateTemplate',
      'premiumCertificateEnabled',
      'premiumCertificateBadge',
    ];
    const sanitizedData: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in body) {
        sanitizedData[key] = body[key];
      }
    }

    let settings = await db.adminSettings.findFirst();
    if (!settings) {
      settings = await db.adminSettings.create({
        data: sanitizedData,
      });
    } else {
      settings = await db.adminSettings.update({
        where: { id: settings.id },
        data: sanitizedData,
      });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
