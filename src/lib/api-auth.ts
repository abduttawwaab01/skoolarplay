import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Permission, getUserPermissions, hasPermission } from "@/lib/admin-auth";

export type AuthUser = {
  id: string;
  role: string;
  email?: string;
  name?: string;
};

export type AuthResult = 
  | { authorized: true; user: AuthUser; isAdmin: boolean }
  | { authorized: false; response: NextResponse };

/**
 * Get authenticated admin or support agent user
 */
export async function getAuthUser(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Authentication required" }, { status: 401 })
    };
  }
  
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, email: true, name: true }
  });
  
  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "User not found" }, { status: 404 })
    };
  }
  
  if (user.role !== "ADMIN" && user.role !== "SUPPORT") {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Access denied. Admin or support agent required." }, { status: 403 })
    };
  }
  
  return {
    authorized: true,
    user: user as AuthUser,
    isAdmin: user.role === "ADMIN"
  };
}

/**
 * Require specific permission(s) - returns user if authorized, error response otherwise
 */
export async function requirePermissions(
  permissions: Permission[] | Permission
): Promise<AuthResult & { permissions: Permission[] }> {
  const authResult = await getAuthUser();
  
  if (!authResult.authorized) {
    return { ...authResult, permissions: [] };
  }
  
  const requiredPerms = Array.isArray(permissions) ? permissions : [permissions];
  const userPermissions = await getUserPermissions(authResult.user.id);
  
  // Admins bypass permission checks
  if (authResult.isAdmin) {
    return {
      ...authResult,
      permissions: requiredPerms
    };
  }
  
  // Check if user has all required permissions
  const hasAllPerms = requiredPerms.every(p => userPermissions.includes(p));
  
  if (!hasAllPerms) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: `Permission denied. Required: ${requiredPerms.join(", ")}` },
        { status: 403 }
      ),
      permissions: requiredPerms
    };
  }
  
  return {
    ...authResult,
    permissions: requiredPerms
  };
}

/**
 * Require admin role only (no permission check)
 */
export async function requireAdmin(): Promise<AuthResult> {
  const authResult = await getAuthUser();
  
  if (!authResult.authorized) {
    return authResult;
  }
  
  if (!authResult.isAdmin) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Admin access required" }, { status: 403 })
    };
  }
  
  return authResult;
}

/**
 * Higher-order function to wrap API handlers with permission checks
 * Usage:
 *   export const POST = withAuth(['users.view'], async (req, { user }) => {
 *     // Your handler code here
 *   });
 */
export function withAuth(
  permissions: Permission[] | Permission,
  handler: (req: NextRequest, context: { user: AuthUser; isAdmin: boolean }) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authResult = await requirePermissions(permissions);
    
    if (!authResult.authorized) {
      return authResult.response;
    }
    
    return handler(req, {
      user: authResult.user,
      isAdmin: authResult.isAdmin
    });
  };
}

/**
 * Higher-order function for admin-only handlers
 */
export function withAdminAuth(
  handler: (req: NextRequest, context: { user: AuthUser }) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authResult = await requireAdmin();
    
    if (!authResult.authorized) {
      return authResult.response;
    }
    
    return handler(req, { user: authResult.user });
  };
}
