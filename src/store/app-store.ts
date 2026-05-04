import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PageName =
  | "landing"
  | "login"
  | "register"
  | "dashboard"
  | "courses"
  | "course"
  | "lesson"
  | "video-lesson"
  | "shop"
  | "leaderboard"
  | "achievements"
  | "daily-challenge"
  | "profile"
  | "analytics"
  | "learning-paths"
  | "exam-hub"
  | "exam"
  | "ide"
  | "study-plan"
  | "vocabulary"
  | "vocabulary-practice"
  | "admin"
  | "support"
  | "admin-users"
  | "admin-courses"
  | "admin-categories"
  | "admin-questions"
  | "admin-videos"
  | "admin-video-quiz"
  | "admin-vocabulary"
  | "admin-shop"
  | "admin-analytics"
  | "admin-settings"
  | "admin-flags"
  | "admin-announcements"
  | "admin-achievements"
  | "admin-quotes"
  | "admin-challenges"
  | "admin-quests"
  | "admin-boss-battles"
  | "admin-exams"
  | "admin-teacher-apps"
  | "admin-teacher-payouts"
  | "admin-audit-logs"
  | "admin-logs"
  | "teacher-profile"
  | "teacher-dashboard"
  | "teacher-course-create"
  | "teacher-payout"
  | "notifications"
  | "study-groups"
  | "study-group"
  | "teacher-marketplace"
  | "teacher-application"
  | "spin-wheel"
  | "mystery-box"
  | "login-rewards"
  | "quests"
  | "boss-battle"
  | "certificate"
  | "referral"
  | "share-gems"
  | "messages"
  | "donate"
  | "refund-policy"
   | "admin-danger-zone"
   | "admin-profile"
   | "admin-investors"
   | "admin-sponsors"
   | "admin-donation-settings"
   | "admin-donations"
   | "teacher-register"
   | "teacher-login"
   | "forgot-password"
   | "reset-password"
   | "admin-support-agents"
   | "feed"
   | "admin-surveys"
   | "surveys"
   | "admin-study-paths"
   | "admin-lesson-notes"
   | "survey"
   | "admin-feed"
   | "admin-groups"
   | "admin-volunteers"
  | "admin-lesson-notes"
  | "lesson-note"
  | "vocabulary"
  | "vocabulary-practice"
  | "admin-subscription-tiers"
  | "admin-feature-tiers"
  | "admin-gift-codes"
  | "subscription"
  | "upgrade"
  | "gem-history"
  | "game-center"
  | "admin-games"
  | "admin-game-settings"
  | "admin-stories"
  | "verify-email";

interface AppState {
  currentPage: PageName;
  navigationHistory: PageName[];
  params: Record<string, any>;

  navigateTo: (page: PageName, params?: Record<string, any>) => void;
  goBack: () => void;
  replaceWith: (page: PageName, params?: Record<string, any>) => void;
  clearHistory: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentPage: "landing",
      navigationHistory: [],
      params: {},

      navigateTo: (page: PageName, params?: Record<string, any>) => {
        const { currentPage, navigationHistory } = get();
        set({
          currentPage: page,
          navigationHistory: [...navigationHistory, currentPage],
          params: params || {},
        });
      },

      goBack: () => {
        const { navigationHistory } = get();
        if (navigationHistory.length === 0) {
          set({ currentPage: "landing", params: {} });
          return;
        }
        const previousPage = navigationHistory[navigationHistory.length - 1];
        set({
          currentPage: previousPage,
          navigationHistory: navigationHistory.slice(0, -1),
          params: {},
        });
      },

      replaceWith: (page: PageName, params?: Record<string, any>) => {
        set({
          currentPage: page,
          params: params || {},
        });
      },

      clearHistory: () => {
        set({
          navigationHistory: [],
        });
      },
    }),
    {
      name: 'skoolar-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currentPage: state.currentPage }),
    }
  )
);
