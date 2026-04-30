import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, code, email } = body;

    // Verify by token OR by code (with optional email)
    let foundUser: { id: string } | null = null;
    
    if (token) {
      // Verify via link token
      foundUser = await db.user.findFirst({
        where: {
          verificationToken: token,
          verificationTokenExpiry: {
            gt: new Date(),
          },
        },
        select: { id: true }
      });
    } else if (code && email) {
      // Verify via 6-digit code + email
      foundUser = await db.user.findFirst({
        where: {
          email: email.toLowerCase(),
          verificationToken: code,
          verificationTokenExpiry: {
            gt: new Date(),
          },
        },
        select: { id: true }
      });
    } else if (code) {
      // Verify via code only (fallback)
      foundUser = await db.user.findFirst({
        where: {
          verificationToken: code,
          verificationTokenExpiry: {
            gt: new Date(),
          },
        },
        select: { id: true }
      });
    }

    if (!foundUser) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id: foundUser.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
