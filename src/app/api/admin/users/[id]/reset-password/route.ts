import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";

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
    const { newPassword } = body;

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 }
      );
    }

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

    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Try Supabase Admin first if configured
    if (isSupabaseAdminConfigured && supabaseAdmin) {
      try {
        // Find the user in Supabase by email
        const { data: supabaseUser, error: findError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single()

        if (findError) {
          console.error('Supabase user lookup error:', findError)
        }

        if (supabaseUser?.id) {
          // Update password using Supabase Admin Auth
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            supabaseUser.id,
            { password: newPassword }
          )

          if (updateError) {
            console.error('Supabase password update error:', updateError)
            // Fall through to legacy method
          } else {
            // Successfully updated via Supabase Admin
            const hashedPassword = await bcrypt.hash(newPassword, 12)
            await db.user.update({
              where: { id },
              data: { password: hashedPassword },
            })

            await logAudit({
              actorId: admin.id,
              actorName: admin.name || admin.email,
              action: "RESET_PASSWORD",
              entity: "User",
              entityId: id,
              details: { targetUserName: user.name, targetUserEmail: user.email, method: 'supabase_admin' },
            })

            return NextResponse.json({
              success: true,
              message: `Password for user ${user.name} has been reset successfully. User can now login with the new password.`,
            })
          }
        }
      } catch (supabaseError) {
        console.error('Supabase admin error, falling back to legacy:', supabaseError)
        // Fall through to legacy method
      }
    }

    // Fallback: Update local database password (for legacy users or if Supabase fails)
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await db.user.update({
      where: { id },
      data: { password: hashedPassword },
    })

    await logAudit({
      actorId: admin.id,
      actorName: admin.name || admin.email,
      action: "RESET_PASSWORD",
      entity: "User",
      entityId: id,
      details: { targetUserName: user.name, targetUserEmail: user.email, method: 'legacy' },
    })

    return NextResponse.json({
      success: true,
      message: `Password for user ${user.name} has been reset. Note: If user logs in via Supabase, they may need to use 'Forgot Password' to update their Supabase password.`,
    })
  } catch (error: any) {
    console.error('Admin password reset error:', error)
    return NextResponse.json(
      { error: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
