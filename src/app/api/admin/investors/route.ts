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

    const investors = await db.investorPartner.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ investors });
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
    const { name, logoUrl, website, tier, description, displayOrder, isActive } = body as {
      name: string;
      logoUrl?: string;
      website?: string;
      tier?: string;
      description?: string;
      displayOrder?: number;
      isActive?: boolean;
    };

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const investor = await db.investorPartner.create({
      data: {
        name,
        logoUrl: logoUrl || null,
        website: website || null,
        tier: tier || "BRONZE",
        description: description || null,
        displayOrder: displayOrder || 0,
        isActive: isActive !== false,
      },
    });

    await logAudit({
      actorId: admin.id,
      actorName: admin.name || "Admin",
      action: "CREATE",
      entity: "InvestorPartner",
      entityId: investor.id,
      details: { name, tier },
    });

    return NextResponse.json({ investor }, { status: 201 });
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
    const { id, name, logoUrl, website, tier, description, displayOrder, isActive } = body as {
      id: string;
      name?: string;
      logoUrl?: string;
      website?: string;
      tier?: string;
      description?: string;
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
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    const investor = await db.investorPartner.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      actorId: admin.id,
      actorName: admin.name || "Admin",
      action: "UPDATE",
      entity: "InvestorPartner",
      entityId: id,
      details: updateData,
    });

    return NextResponse.json({ investor });
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

    await db.investorPartner.delete({
      where: { id },
    });

    await logAudit({
      actorId: admin.id,
      actorName: admin.name || "Admin",
      action: "DELETE",
      entity: "InvestorPartner",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
