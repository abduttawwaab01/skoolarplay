import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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

    console.log('[GoogleSheets] Teacher data submitted successfully:', userData.email)
  } catch (error) {
    console.error('[GoogleSheets] Submission failed:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, subjects, experience, bio } = body;

    if (!name || !email || !password || !subjects || !experience) {
      return NextResponse.json(
        { error: "Name, email, password, subjects, and experience are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Create user in Supabase Auth (if configured)
    let supabaseUser: { id: string } | null = null;
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: password,
        options: {
          data: {
            name,
            role: "TEACHER",
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

    // Create user with TEACHER role
    let user;
    try {
      user = await db.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: "", // Empty - Supabase handles auth
          role: "TEACHER",
          gems: 100,
          xp: 0,
          streak: 0,
          hearts: 5,
          maxHearts: 5,
          level: 1,
          bio: bio || null,
          supabaseId: supabaseUser?.id || null,
          emailVerified: new Date(),
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

    // Create TeacherProfile with APPROVED status
    await db.teacherProfile.create({
      data: {
        userId: user.id,
        bio: bio || `Passionate educator specializing in ${subjects}.`,
        subjects: typeof subjects === 'string' ? subjects : subjects.join(', '),
        experience: experience,
        status: "APPROVED",
        commissionRate: 0.15,
        isVerified: true,
      },
    });

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
      referralCode: '',
      createdAt: user.createdAt.toISOString(),
      emailVerified: true,
      registrationType: 'TEACHER'
    }).catch(err => console.error("Google Sheets error:", err));

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: "Educator account created successfully! Welcome to SkoolarPlay.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Teacher registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
