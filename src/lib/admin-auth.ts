import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getAdminUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  const user = session.user as any;
  if (user.role !== "ADMIN") {
    return null;
  }

  return user;
}

export async function getSupportOrAdminUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return null;
  if (user.role !== "ADMIN" && user.role !== "SUPPORT") return null;
  return user;
}

// Permission types for support agent delegation
export type Permission = 
  | 'users.view' | 'users.edit' | 'users.ban' | 'users.delete'
  | 'courses.manage' | 'questions.manage' | 'videos.manage'
  | 'exams.manage' | 'results.view' | 'announcements.send'
  | 'sponsors.manage' | 'investors.manage' | 'volunteers.manage'
  | 'donations.manage' | 'analytics.view' | 'feed.manage' | 'groups.manage'
  | 'settings.manage' | 'reports.view' | 'surveys.manage'

// All available permissions
export const ALL_PERMISSIONS: Permission[] = [
  'users.view', 'users.edit', 'users.ban', 'users.delete',
  'courses.manage', 'questions.manage', 'videos.manage',
  'exams.manage', 'results.view', 'announcements.send',
  'sponsors.manage', 'investors.manage', 'volunteers.manage',
  'donations.manage', 'analytics.view', 'feed.manage', 'groups.manage',
  'settings.manage', 'reports.view', 'surveys.manage'
];

// Permission categories for UI grouping
export const PERMISSION_CATEGORIES = {
  Users: ['users.view', 'users.edit', 'users.ban', 'users.delete'],
  Content: ['courses.manage', 'questions.manage', 'videos.manage', 'exams.manage', 'results.view', 'announcements.send'],
  Community: ['sponsors.manage', 'investors.manage', 'volunteers.manage', 'donations.manage', 'feed.manage', 'groups.manage'],
  Analytics: ['analytics.view', 'reports.view', 'surveys.manage'],
  Settings: ['settings.manage']
};

// Permission labels for UI display
export const PERMISSION_LABELS: Record<Permission, string> = {
  'users.view': 'View Users',
  'users.edit': 'Edit Users',
  'users.ban': 'Ban Users',
  'users.delete': 'Delete Users',
  'courses.manage': 'Manage Courses',
  'questions.manage': 'Manage Questions',
  'videos.manage': 'Manage Videos',
  'exams.manage': 'Manage Exams',
  'results.view': 'View Results',
  'announcements.send': 'Send Announcements',
  'sponsors.manage': 'Manage Sponsors',
  'investors.manage': 'Manage Investors',
  'volunteers.manage': 'Manage Volunteers',
  'donations.manage': 'Manage Donations',
  'analytics.view': 'View Analytics',
  'feed.manage': 'Manage Feed',
  'groups.manage': 'Manage Groups',
  'settings.manage': 'Manage Settings',
  'reports.view': 'View Reports',
  'surveys.manage': 'Manage Surveys'
};

// Get user's permissions (admin has all, support agent has delegated)
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const user = await db.user.findUnique({ 
    where: { id: userId },
    select: { role: true, delegatedPermissions: true }
  });
  
  if (!user) return [];
  
  // Admin has all permissions
  if (user.role === 'ADMIN') {
    return ALL_PERMISSIONS;
  }
  
  // Support agent has delegated permissions or default set
  if (user.role === 'SUPPORT') {
    const perms = user.delegatedPermissions ? JSON.parse(user.delegatedPermissions as string) : [];
    // Default permissions if none delegated
    if (perms.length === 0) {
      return ['users.view', 'announcements.send', 'reports.view'];
    }
    return perms as Permission[];
  }
  
  return [];
}

// Check if user has specific permission
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  const perms = await getUserPermissions(userId);
  return perms.includes(permission);
}

// Check if user has any of the specified permissions
export async function hasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean> {
  const userPerms = await getUserPermissions(userId);
  return permissions.some(p => userPerms.includes(p));
}

// Check if user has all of the specified permissions
export async function hasAllPermissions(userId: string, permissions: Permission[]): Promise<boolean> {
  const userPerms = await getUserPermissions(userId);
  return permissions.every(p => userPerms.includes(p));
}

// Create a response for unauthorized access
export function unauthorizedResponse(message = "Unauthorized access") {
  return NextResponse.json({ error: message }, { status: 403 });
}

// Create a response for not found
export function notFoundResponse(message = "Resource not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

// Middleware-style function to require specific permission
export async function requirePermission(permission: Permission) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { authorized: false, response: unauthorizedResponse("Authentication required") };
  }
  
  const hasPerm = await hasPermission(session.user.id, permission);
  if (!hasPerm) {
    return { authorized: false, response: unauthorizedResponse(`Permission denied: ${permission}`) };
  }
  
  return { authorized: true, userId: session.user.id };
}

// Middleware-style function to require admin or specific permission
export async function requireAdminOrPermission(permission: Permission) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { authorized: false, response: unauthorizedResponse("Authentication required") };
  }
  
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });
  
  if (!user) {
    return { authorized: false, response: unauthorizedResponse("User not found") };
  }
  
  // Admins have access to everything
  if (user.role === 'ADMIN') {
    return { authorized: true, userId: session.user.id, isAdmin: true };
  }
  
  // Support agents need specific permission
  if (user.role === 'SUPPORT') {
    const hasPerm = await hasPermission(session.user.id, permission);
    if (!hasPerm) {
      return { authorized: false, response: unauthorizedResponse(`Permission denied: ${permission}`) };
    }
    return { authorized: true, userId: session.user.id, isAdmin: false };
  }
  
  return { authorized: false, response: unauthorizedResponse("Access denied") };
}
