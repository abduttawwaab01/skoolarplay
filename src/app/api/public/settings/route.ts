import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    let settings = await db.adminSettings.findFirst({
      select: {
        platformName: true,
        loginPageLogoUrl: true,
        navBarLogoUrl: true,
        footerLogoUrl: true,
        faviconUrl: true,
      },
    });

    if (!settings) {
      settings = {
        platformName: "SkoolarPlay",
        loginPageLogoUrl: null,
        navBarLogoUrl: null,
        footerLogoUrl: null,
        faviconUrl: null,
      };
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
