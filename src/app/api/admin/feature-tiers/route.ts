import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PREMIUM_FEATURES, PremiumFeatureKey } from "@/lib/premium";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const featureTiers = await db.featureTier.findMany({
      include: {
        overrides: true,
      },
    });

    const featuresWithDefaults = Object.entries(PREMIUM_FEATURES).map(([key, feature]) => {
      const dbFeature = featureTiers.find(f => f.featureKey === key);
      return {
        key,
        name: feature.name,
        description: feature.description,
        minTier: 'PREMIUM',
        minTierFromDb: dbFeature?.minTier || 'PREMIUM',
        isEnabled: dbFeature?.isEnabled ?? true,
        gemCost: dbFeature?.gemCost,
        overridesCount: dbFeature?.overrides?.length || 0,
        dbId: dbFeature?.id || null,
      };
    });

    return NextResponse.json(featuresWithDefaults);
  } catch (error) {
    console.error("Error fetching feature tiers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { featureKey, minTier, isEnabled, gemCost } = body;

    if (!featureKey) {
      return NextResponse.json({ error: "Feature key is required" }, { status: 400 });
    }

    const feature = PREMIUM_FEATURES[featureKey as PremiumFeatureKey];
    if (!feature) {
      return NextResponse.json({ error: "Invalid feature key" }, { status: 400 });
    }

    const existing = await db.featureTier.findUnique({
      where: { featureKey },
    });

    if (existing) {
      return NextResponse.json({ error: "Feature tier already exists" }, { status: 400 });
    }

    const featureTier = await db.featureTier.create({
      data: {
        featureKey,
        name: feature.name,
        description: feature.description,
        minTier: minTier || 'PREMIUM',
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        gemCost,
      },
    });

    return NextResponse.json(featureTier, { status: 201 });
  } catch (error) {
    console.error("Error creating feature tier:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { featureKey, minTier, isEnabled, gemCost } = body;

    if (!featureKey) {
      return NextResponse.json({ error: "Feature key is required" }, { status: 400 });
    }

    const feature = PREMIUM_FEATURES[featureKey as PremiumFeatureKey];
    if (!feature) {
      return NextResponse.json({ error: "Invalid feature key" }, { status: 400 });
    }

    let featureTier = await db.featureTier.findUnique({
      where: { featureKey },
    });

    if (!featureTier) {
      featureTier = await db.featureTier.create({
        data: {
          featureKey,
          name: feature.name,
          description: feature.description,
          minTier: minTier || 'PREMIUM',
          isEnabled: isEnabled !== undefined ? isEnabled : true,
          gemCost,
        },
      });
    } else {
      featureTier = await db.featureTier.update({
        where: { featureKey },
        data: {
          ...(minTier && { minTier }),
          ...(isEnabled !== undefined && { isEnabled }),
          ...(gemCost !== undefined && { gemCost }),
        },
      });
    }

    return NextResponse.json(featureTier);
  } catch (error) {
    console.error("Error updating feature tier:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
