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
    const { enabled, name } = body;

    const flag = await db.featureFlag.update({
      where: { id },
      data: {
        ...(enabled !== undefined && { enabled }),
        ...(name !== undefined && { name }),
      },
    });

    return NextResponse.json({ flag });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update feature flag" },
      { status: 500 }
    );
  }
}
