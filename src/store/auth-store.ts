import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { signIn, signOut } from "next-auth/react";
import { getLevelInfo } from "@/lib/level-system";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useEffect, useState } from "react";

const AUTH_STORAGE_KEY = "skoolar-auth-storage";

function readPersistedAuthFromStorage(): { isAuthenticated: boolean; user: UserProfile | null } {
  if (typeof window === "undefined") return { isAuthenticated: false, user: null };
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        isAuthenticated: parsed.state?.isAuthenticated || false,
        user: parsed.state?.user || null,
      };
    }
  } catch {}
  return { isAuthenticated: false, user: null };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  gems: number;
  xp: number;
  streak: number;
  longestStreak: number;
  hearts: number;
  maxHearts: number;
  lastHeartRefillAt: string | null;
  level: number;
  isBanned: boolean;
  lastActiveAt: string;
  createdAt: string;
  // Premium fields
  isPremium: boolean;
  premiumExpiresAt: string | null;
  unlockedFeatures: string[];
  planTier: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, referralCode?: string) => Promise<boolean>;
  logout: () => void;
  fetchSession: () => Promise<void>;
  updateGems: (delta: number) => void;
  updateXP: (delta: number) => void;
  updateStreak: () => void;
  updateHearts: (hearts: number, maxHearts?: number) => void;
  updateLastHeartRefillAt: () => void;
  updateUser: (data: Partial<UserProfile>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // Always use lowercase email for login
      const result = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        // Show the actual error message from NextAuth
        const errorMessage = result.error.toLowerCase();
        
        // Check for specific verification errors (not just "email" keyword)
        if (errorMessage.includes("verify") || 
            errorMessage.includes("confirm") ||
            errorMessage.includes("not confirmed") ||
            (errorMessage.includes("email") && errorMessage.includes("confirm"))) {
          set({ isLoading: false, error: "Please verify your email first. Check your inbox for the verification link." });
        } else if (errorMessage.includes("suspended") || errorMessage.includes("banned")) {
          set({ isLoading: false, error: "This account has been suspended." });
        } else if (errorMessage.includes("no account")) {
          set({ isLoading: false, error: "No account found with this email." });
        } else {
          set({ isLoading: false, error: "Invalid email or password." });
        }
        return false;
      }

      // After successful signIn, fetch our enriched session
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();

      if (sessionData.user) {
        set({
          user: sessionData.user as UserProfile,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }

      set({ isLoading: false, error: "Failed to establish session" });
      return false;
    } catch (error: any) {
      set({ isLoading: false, error: error.message || "Login failed" });
      return false;
    }
  },

  register: async (name: string, email: string, password: string, referralCode?: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, referralCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ isLoading: false, error: data.error || "Registration failed" });
        return false;
      }

      // Registration successful - clear any previous auth state
      set({ 
        isLoading: false, 
        user: null, 
        isAuthenticated: false 
      });

      // Registration successful - return true to redirect to login
      // Users need to verify email and then login
      return true;
    } catch (error: any) {
      set({ isLoading: false, error: error.message || "Registration failed" });
      return false;
    }
  },

  logout: () => {
    signOut({ redirect: false }).catch(() => {});
    // Also sign out from Supabase if configured
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch(() => {});
    }
    set({ user: null, isAuthenticated: false, error: null });
  },

  fetchSession: async () => {
    // FIRST: Check localStorage SYNCHRONOUSLY - this is key!
    // Zustand hasn't rehydrated yet when this is first called on page refresh
    const persistedAuth = readPersistedAuthFromStorage();
    
    if (persistedAuth.isAuthenticated && persistedAuth.user) {
      // We have a persisted user from localStorage - keep them logged in
      // First set the state from localStorage
      set({ 
        user: persistedAuth.user, 
        isAuthenticated: true, 
        isLoading: true 
      });
      
      // Then try to refresh from server in background
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        
        if (data.user) {
          set({
            user: data.user as UserProfile,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Server session expired but we have local persistence - keep logged in
          set({ isLoading: false });
        }
      } catch {
        // Network error - keep using persisted data
        set({ isLoading: false });
      }
      return;
    }
    
    // Check Zustand state (in case it was rehydrated before this call)
    const currentState = get();
    
    if (currentState.isAuthenticated && currentState.user) {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        
        if (data.user) {
          set({
            user: data.user as UserProfile,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
        }
      } catch {
        set({ isLoading: false });
      }
      return;
    }
    
    // No persisted state - try to fetch session from server
    set({ isLoading: true });
    
    try {
      const res = await fetch("/api/auth/session");
      
      if (!res.ok) {
        set({ isLoading: false });
        return;
      }
      
      const data = await res.json();

      if (data.user) {
        set({
          user: data.user as UserProfile,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  updateGems: (delta: number) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, gems: Math.max(0, user.gems + delta) } });
    }
  },

  updateXP: (delta: number) => {
    const { user } = get();
    if (user) {
      const newXP = Math.max(0, user.xp + delta);
      const levelInfo = getLevelInfo(newXP);
      set({
        user: { ...user, xp: newXP, level: levelInfo.level },
      });
    }
  },

  updateStreak: () => {
    const { user } = get();
    if (user) {
      const newStreak = user.streak + 1;
      set({
        user: {
          ...user,
          streak: newStreak,
          longestStreak: Math.max(user.longestStreak, newStreak),
        },
      });
    }
  },

  updateHearts: (hearts: number, maxHearts?: number) => {
    const { user } = get();
    if (user) {
      set({
        user: {
          ...user,
          hearts,
          maxHearts: maxHearts ?? user.maxHearts,
        },
      });
    }
  },

  updateLastHeartRefillAt: () => {
    const { user } = get();
    if (user) {
      set({
        user: {
          ...user,
          hearts: Math.min(user.hearts + 1, user.maxHearts),
          lastHeartRefillAt: new Date().toISOString(),
        },
      });
    }
  },

  updateUser: (data: Partial<UserProfile>) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, ...data } });
    }
  },

  clearError: () => set({ error: null }),
    }),
    {
      name: "skoolar-auth-storage",
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return localStorage
      }),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          // Mark hydration complete
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth-store-hydrated'))
          }
        }
      },
    }
  )
);

// Helper to check if store has been hydrated
export const useAuthStoreHydrated = () => {
  const [hydrated, setHydrated] = useState(false)
  
  useEffect(() => {
    // Check if already hydrated by checking localStorage
    const stored = localStorage.getItem('skoolar-auth-storage')
    const checkHydration = () => {
      try {
        const parsed = JSON.parse(stored || '{}')
        if (parsed.state?.isAuthenticated && parsed.state?.user) {
          // Use timeout to avoid calling setState synchronously in effect
          setTimeout(() => setHydrated(true), 0)
        } else {
          setTimeout(() => setHydrated(true), 0)
        }
      } catch {
        setTimeout(() => setHydrated(true), 0)
      }
    }
    
    // Small delay to ensure store is ready
    const timeout = setTimeout(checkHydration, 100)
    
    const handleHydrated = () => setHydrated(true)
    window.addEventListener('auth-store-hydrated', handleHydrated)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('auth-store-hydrated', handleHydrated)
    }
  }, [])
  
  return hydrated
}
