import "next-auth";
import { DefaultSession } from "next-auth";
import { PlanTier } from "@/components/shared/plan-badge";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      planTier: PlanTier;
      isPremium: boolean;
      premiumExpiresAt: string | null;
      unlockedFeatures: string[];
      gemMultiplier: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    planTier: PlanTier;
    isPremium: boolean;
    premiumExpiresAt: string | null;
    unlockedFeatures: string[];
    gemMultiplier: number;
  }
}

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";

const isProduction = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email.toLowerCase();

        // Authenticate with Supabase
        const { data: supabaseUser, error: supabaseError } = await supabase.auth.signInWithPassword({
          email,
          password: credentials.password,
        });

        if (supabaseError || !supabaseUser.user) {
          throw new Error("Invalid email or password");
        }

        // Get user from our Postgres DB
        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error("User not found. Please contact support.");
        }

        if (user.isBanned) {
          throw new Error("This account has been suspended");
        }

        // Block unverified users (except admins who are auto-verified)
        if (!user.emailVerified && user.role !== 'ADMIN') {
          throw new Error("Please verify your email first. Check your inbox for the verification link.");
        }

        // Auto-verify admin users if not already verified
        if (user.role === 'ADMIN' && !user.emailVerified) {
          await db.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          });
        }

        // Update last active
        await db.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar,
          planTier: (user.planTier || "FREE") as PlanTier,
          isPremium: user.isPremium,
          premiumExpiresAt: user.premiumExpiresAt?.toISOString() || null,
          unlockedFeatures: JSON.parse(user.unlockedFeatures || "[]"),
          gemMultiplier: user.gemMultiplier || 1.0,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.planTier = (user as any).planTier || "FREE";
        token.isPremium = (user as any).isPremium || false;
        token.premiumExpiresAt = (user as any).premiumExpiresAt || null;
        token.unlockedFeatures = (user as any).unlockedFeatures || [];
        token.gemMultiplier = (user as any).gemMultiplier || 1.0;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.planTier = token.planTier || "FREE";
        session.user.isPremium = token.isPremium || false;
        session.user.premiumExpiresAt = token.premiumExpiresAt || null;
        session.user.unlockedFeatures = token.unlockedFeatures || [];
        session.user.gemMultiplier = token.gemMultiplier || 1.0;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-fallback-change-in-prod",
  useSecureCookies: isProduction,
  cookies: isProduction
    ? {
        sessionToken: {
          name: `__Secure-next-auth.session-token`,
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: true,
          },
        },
        callbackUrl: {
          name: `__Secure-next-auth.callback-url`,
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: true,
          },
        },
        csrfToken: {
          name: `__Host-next-auth.csrf-token`,
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: true,
          },
        },
        pkceCodeVerifier: {
          name: `__Secure-next-auth.pkce.code_verifier`,
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: true,
          },
        },
      }
    : {},
};
