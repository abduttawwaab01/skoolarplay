import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const DEFAULT_QUOTE = {
  text: "Education is the most powerful weapon which you can use to change the world.",
  author: "Nelson Mandela",
  category: "GENERAL",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get("category") || "";

    let where: any = { isActive: true };

    // Support comma-separated categories (e.g., LEARNING,MOTIVATION)
    if (categoryParam) {
      const categories = categoryParam
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean);

      if (categories.length === 1) {
        where.category = categories[0];
      } else if (categories.length > 1) {
        where.category = { in: categories };
      }
    }

    const quotes = await db.motivationalQuote.findMany({
      where,
    });

    if (quotes.length === 0) {
      return NextResponse.json({ quote: DEFAULT_QUOTE });
    }

    // Return a random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    return NextResponse.json({
      quote: {
        text: quote.text,
        author: quote.author,
        category: quote.category,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ quote: DEFAULT_QUOTE });
  }
}
