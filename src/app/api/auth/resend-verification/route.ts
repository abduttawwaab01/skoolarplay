import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmailVerification } from "@/lib/email-service";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified" }, { status: 200 });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry: tokenExpiry,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    await sendEmailVerification(email.toLowerCase(), verificationToken, baseUrl);

    return NextResponse.json({
      message: "Verification email sent",
      expiresIn: "24 hours",
    });
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
