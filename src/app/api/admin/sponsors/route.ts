import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sponsors = await db.sponsor.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ sponsors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, logoUrl, website, tier, description, donatedAmount, displayOrder, isActive } = body as {
      name: string;
      logoUrl?: string;
      website?: string;
      tier?: string;
      description?: string;
      donatedAmount?: number;
      displayOrder?: number;
      isActive?: boolean;
    };

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const sponsor = await db.sponsor.create({
      data: {
        name,
        logoUrl: logoUrl || null,
        website: website || null,
        tier: tier || "BRONZE",
        description: description || null,
        donatedAmount: donatedAmount || 0,
        displayOrder: displayOrder || 0,
        isActive: isActive !== false,
      },
    });

    await logAudit({
      actorId: admin.id,
      actorName: admin.name || "Admin",
      action: "CREATE",
      entity: "Sponsor",
      entityId: sponsor.id,
      details: { name, tier, donatedAmount },
    });

    return NextResponse.json({ sponsor }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, logoUrl, website, tier, description, donatedAmount, displayOrder, isActive } = body as {
      id: string;
      name?: string;
      logoUrl?: string;
      website?: string;
      tier?: string;
      description?: string;
      donatedAmount?: number;
      displayOrder?: number;
      isActive?: boolean;
    };

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (website !== undefined) updateData.website = website;
    if (tier !== undefined) updateData.tier = tier;
    if (description !== undefined) updateData.description = description;
    if (donatedAmount !== undefined) updateData.donatedAmount = donatedAmount;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    const sponsor = await db.sponsor.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      actorId: admin.id,
      actorName: admin.name || "Admin",
      action: "UPDATE",
      entity: "Sponsor",
      entityId: id,
      details: updateData,
    });

    return NextResponse.json({ sponsor });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body as { id: string };

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db.sponsor.delete({
      where: { id },
    });

    await logAudit({
      actorId: admin.id,
      actorName: admin.name || "Admin",
      action: "DELETE",
      entity: "Sponsor",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
