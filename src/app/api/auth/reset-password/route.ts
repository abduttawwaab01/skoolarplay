import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimiter, RATE_LIMITS } from "@/lib/rate-limiter";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { newPassword, accessToken } = body;

    if (!newPassword) {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 }
      );
    }

    // Validate password: min 8 chars, must contain letter + number
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    if (!/[a-zA-Z]/.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must contain at least one letter" },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must contain at least one number" },
        { status: 400 }
      );
    }

    // If Supabase is configured, use Supabase to update password
    if (isSupabaseConfigured) {
      if (accessToken) {
        // Set the session with the access token from URL hash
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: "",
        });

        if (sessionError) {
          console.error("Supabase setSession error:", sessionError);
          return NextResponse.json(
            { error: "Invalid or expired reset link" },
            { status: 400 }
          );
        }

        // Now update the password
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          console.error("Supabase password update error:", error);
          return NextResponse.json(
            { error: error.message || "Failed to reset password" },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Password has been reset successfully",
        });
      } else {
        // Need access token - redirect user to reset page with token
        return NextResponse.json(
          { error: "Access token required. Please use the link from your email." },
          { status: 400 }
        );
      }
    }

    // Fallback: Legacy DB-based reset (if Supabase not configured)
    const token = body.token;
    const identifier = token || "unknown";
    const rateLimitKey = `reset-password:${identifier.toString().slice(0, 20)}`;
    try {
      const result = await rateLimiter.checkLimit(rateLimitKey, RATE_LIMITS.REGISTER_PER_HOUR);
      if (!result.allowed) {
        return NextResponse.json(
          { error: "Too many password reset attempts. Please try again later." },
          { status: 429 }
        );
      }
    } catch (e) {
      // Continue without rate limiting
    }

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Find token in DB
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: "Token has already been used" },
        { status: 400 }
      );
    }

    if (new Date() > resetToken.expiresAt) {
      await db.passwordResetToken.delete({ where: { id: resetToken.id } });
      return NextResponse.json(
        { error: "Token has expired" },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Hash password (legacy - for non-Supabase users)
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    await db.passwordResetToken.delete({ where: { id: resetToken.id } });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
