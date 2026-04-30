import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const flags = await db.featureFlag.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ flags });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch feature flags" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { key, name, enabled } = body;

    if (!key || !name) {
      return NextResponse.json({ error: "Key and name are required" }, { status: 400 });
    }

    const flag = await db.featureFlag.create({
      data: {
        key,
        name,
        enabled: enabled || false,
      },
    });

    return NextResponse.json({ flag }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create feature flag" },
      { status: 500 }
    );
  }
}
