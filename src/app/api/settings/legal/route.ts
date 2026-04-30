import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const settings = await db.adminSettings.findFirst({
      select: { termsOfService: true, privacyPolicy: true }
    });
    return NextResponse.json({
      termsOfService: settings?.termsOfService || "Default Terms of Service.\n\nPlease update this in the admin panel.",
      privacyPolicy: settings?.privacyPolicy || "Default Privacy Policy.\n\nPlease update this in the admin panel."
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch legal settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { termsOfService, privacyPolicy } = await req.json();

    const settings = await db.adminSettings.findFirst();
    if (settings) {
      await db.adminSettings.update({
        where: { id: settings.id },
        data: { termsOfService, privacyPolicy }
      });
    } else {
      await db.adminSettings.create({
        data: { termsOfService, privacyPolicy }
      });
    }

    return NextResponse.json({ message: "Legal settings updated successfully" });
  } catch (error) {
    console.error("Failed to update legal settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
