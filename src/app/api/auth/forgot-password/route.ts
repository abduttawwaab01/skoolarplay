import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimiter, RATE_LIMITS } from "@/lib/rate-limiter";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email as string;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateLimitKey = `forgot-password:${email.toLowerCase()}`;
    try {
      const result = await rateLimiter.checkLimit(rateLimitKey, RATE_LIMITS.REGISTER_PER_HOUR);
      if (!result.allowed) {
        return NextResponse.json(
          { error: "Too many password reset requests. Please try again later." },
          { status: 429 }
        );
      }
    } catch (e) {
      // Continue without rate limiting if it fails
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (user && isSupabaseConfigured) {
      // Send password reset email via Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
        redirectTo: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password`,
      });

      if (error) {
        console.error("Supabase password reset error:", error);
        // Don't reveal error to user
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
