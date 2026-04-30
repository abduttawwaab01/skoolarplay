import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validation-schemas";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { ZodError } from "zod";
import { rateLimiter, RATE_LIMITS } from "@/lib/rate-limiter";
import { sendEmailVerification } from "@/lib/email-service";

async function submitToGoogleSheets(userData: {
  name: string
  email: string
  userId: string
  planTier: string
  isPremium: boolean
  gems: number
  hearts: number
  streak: number
  referralCode?: string
  createdAt: string
  emailVerified: boolean
  registrationType: string
}) {
  const sheetUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL
  if (!sheetUrl || sheetUrl === 'your_google_sheets_webhook_url_here') {
    console.log('[GoogleSheets] Webhook URL not configured, skipping submission')
    return
  }

  try {
    const response = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      console.error(`[GoogleSheets] Submission failed with status ${response.status}`)
      return
    }

    console.log('[GoogleSheets] User data submitted successfully:', userData.email)
  } catch (error) {
    console.error('[GoogleSheets] Submission failed:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 registrations per hour per IP
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `register:${ip}`;
    
    let result;
    try {
      result = await rateLimiter.checkLimit(rateLimitKey, RATE_LIMITS.REGISTER_PER_HOUR);
    } catch (rateLimitError) {
      console.error("Rate limiter error:", rateLimitError);
    }

    if (result && !result.allowed) {
      return NextResponse.json(
        {
          error: "Too many registration attempts. Please try again later.",
          retryAfter: result.retryAfter,
        },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate request body with Zod
    let validatedData;
    try {
      validatedData = registerSchema.parse(body);
    } catch (zodError: any) {
      if (zodError && zodError.errors) {
        return NextResponse.json(
          { error: zodError.errors[0]?.message || "Validation failed", errors: zodError.errors },
          { status: 400 }
        );
      }
      throw zodError;
    }

    // Check if registration is allowed
    let settings: any = null;
    try {
      settings = await db.adminSettings.findFirst();
    } catch (dbError) {
      console.error("Failed to fetch settings:", dbError);
    }
    
    const allowRegistration = settings?.allowRegistration ?? true;

    if (!allowRegistration) {
      return NextResponse.json(
        { error: "Registration is currently disabled" },
        { status: 403 }
      );
    }

    // Check if user already exists in our DB
    let existingUser;
    try {
      existingUser = await db.user.findUnique({
        where: { email: validatedData.email.toLowerCase() },
      });
    } catch (dbError) {
      console.error("Database error checking user:", dbError);
      return NextResponse.json(
        { error: "Unable to verify email. Please try again." },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try logging in." },
        { status: 409 }
      );
    }

    // Create user in Supabase Auth (if configured)
    let supabaseUser: { id: string } | null = null;
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email.toLowerCase(),
        password: validatedData.password,
        options: {
          data: {
            name: validatedData.name,
          },
        },
      });

      if (error) {
        console.error("Supabase sign up error:", error);
        return NextResponse.json(
          { error: error.message || "Failed to create account" },
          { status: 400 }
        );
      }

      supabaseUser = data.user!;
    }

    // Generate referral code
    const referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user in our Postgres DB (with placeholder password for legacy)
    // We don't store password anymore since Supabase handles auth
    let user;
    try {
      user = await db.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email.toLowerCase(),
          password: "", // Empty - Supabase handles auth
          role: "STUDENT",
          gems: 50,
          xp: 0,
          streak: 0,
          hearts: 5,
          maxHearts: 5,
          level: 1,
          referralCode: referralCode,
          supabaseId: supabaseUser?.id || null,
          emailVerified: null, // Not verified - must verify via email
          verificationToken,
          verificationTokenExpiry: tokenExpiry,
        },
      });
    } catch (createError) {
      console.error("User creation error:", createError);
      
      // If Supabase user was created, try to clean it up
      if (supabaseUser && isSupabaseConfigured) {
        await supabase.auth.admin.deleteUser(supabaseUser.id).catch(console.error);
      }
      
      return NextResponse.json(
        { error: "Unable to create account. Email may already be registered." },
        { status: 500 }
      );
    }

    // Handle Referral Code (if provided)
    if (body.referralCode) {
      try {
        const referrer = await db.user.findFirst({
          where: {
            OR: [
              { email: body.referralCode.toLowerCase() },
              { id: body.referralCode },
            ]
          }
        })

        if (referrer && referrer.id !== user.id) {
          await db.referral.create({
            data: {
              referrerId: referrer.id,
              referredEmail: user.email,
              referredId: user.id,
              rewardClaimed: true,
              rewardGems: 25,
            }
          })
          
          await db.user.update({
             where: { id: referrer.id },
             data: { gems: { increment: 25 } }
          });
          
          await db.user.update({
             where: { id: user.id },
             data: { gems: { increment: 25 } }
          });
          
          user.gems += 25;
        }
      } catch (refError) {
        console.error("Referral creation failed:", refError);
      }
    }

    // Send email verification
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const emailSent = await sendEmailVerification(user.email, verificationToken, baseUrl)
      .catch(err => {
        console.error("Failed to send verification email:", err);
        return false;
      });

    if (!emailSent) {
      console.warn("Email verification could not be sent. User should request resend.");
    }

    // Submit to Google Sheets (non-blocking)
    submitToGoogleSheets({
      name: user.name,
      email: user.email,
      userId: user.id,
      planTier: user.planTier || 'FREE',
      isPremium: user.isPremium || false,
      gems: user.gems,
      hearts: user.hearts,
      streak: user.streak,
      referralCode: body.referralCode || '',
      createdAt: user.createdAt.toISOString(),
      emailVerified: false,
      registrationType: 'STUDENT'
    }).catch(err => console.error("Google Sheets error:", err));

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: emailSent 
          ? "Account created successfully! Please check your email to verify your account before logging in."
          : "Account created! Please verify your email. If you don't receive the email, check your spam folder or request a new verification link.",
        requireVerification: true,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    
    if (error.name === 'ZodError' || error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors?.[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
