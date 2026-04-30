import { NextResponse } from "next/server";
import { getSupportOrAdminUser, getUserPermissions } from "@/lib/admin-auth";

export async function GET() {
  try {
    const user = await getSupportOrAdminUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissions = await getUserPermissions(user.id);

    return NextResponse.json({
      permissions,
      role: user.role
    });
  } catch (error) {
    console.error("Support agent permissions error:", error);
    return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 });
  }
}
