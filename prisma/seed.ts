import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

function createPrismaClient() {
  return new PrismaClient();
}

const db = createPrismaClient();

async function main() {
  console.log("🌱 Seeding SkoolarPlay database...\n");

  // ==================== CLEAN UP ====================
  console.log("🧹 Cleaning existing data...");
  // Clean up data in reverse dependency order
  await db.waecQuestion.deleteMany();
  await db.investorPartner.deleteMany();
  await db.pushSubscription.deleteMany();
  await db.gemGift.deleteMany();
  await db.userReport.deleteMany();
  await db.payment.deleteMany();
  await db.teacherPayout.deleteMany();
  await db.courseReview.deleteMany();
  await db.mysteryBox.deleteMany();
  await db.bossBattleCompletion.deleteMany();
  await db.referral.deleteMany();
  await db.questCompletion.deleteMany();
  await db.quest.deleteMany();
  await db.spinResult.deleteMany();
  await db.loginReward.deleteMany();
  await db.teacherMessage.deleteMany();
  await db.motivationalQuote.deleteMany();
  await db.examAttempt.deleteMany();
  await db.examQuestion.deleteMany();
  await db.examSection.deleteMany();
  await db.exam.deleteMany();
  await db.storyLesson.deleteMany();
  await db.groupChallengeCompletion.deleteMany();
  await db.groupChallenge.deleteMany();
  await db.studyGroupMember.deleteMany();
  await db.studyGroup.deleteMany();
  await db.notification.deleteMany();
  await db.announcement.deleteMany();
  await db.dailyChallengeCompletion.deleteMany();
  await db.dailyChallenge.deleteMany();
  await db.leaderboardEntry.deleteMany();
  await db.certificate.deleteMany();
  await db.purchase.deleteMany();
  await db.shopItem.deleteMany();
  await db.userAchievement.deleteMany();
  await db.achievement.deleteMany();
  await db.lessonProgress.deleteMany();
  await db.enrollment.deleteMany();
  await db.videoContent.deleteMany();
  await db.question.deleteMany();
  await db.lesson.deleteMany();
  await db.module.deleteMany();
  await db.course.deleteMany();
  await db.category.deleteMany();
  await db.featureFlag.deleteMany();
  await db.adminSettings.deleteMany();
  await db.user.deleteMany();

  // ==================== ADMIN USER ====================
  console.log("👤 Creating admin user...");
  
  // Use environment variable for admin password or generate a random one
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || `admin_${Date.now()}`;
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await db.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || "admin@skoolar.com",
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
      gems: 999999,
      xp: 999999,
      streak: 365,
      longestStreak: 365,
      hearts: 99,
      maxHearts: 99,
      level: 99,
      avatar: null,
      bio: "Platform administrator for SkoolarPlay",
    },
  });
  
  console.log(`   ✅ Admin created: ${admin.email}`);
  if (process.env.ADMIN_DEFAULT_PASSWORD) {
    console.log(`   ⚠️  Using provided ADMIN_DEFAULT_PASSWORD`);
  } else {
    console.log(`   🔑 Admin password (hashed): ${adminPassword}`);
    console.log(`   ⚠️  IMPORTANT: Change this password immediately after first login!`);
  }
  console.log();

  // ==================== ADMIN SETTINGS ====================
  console.log("⚙️  Creating admin settings...");
  const settings = await db.adminSettings.create({
    data: {
      platformName: process.env.PLATFORM_NAME || "SkoolarPlay",
      dailyXpGoal: 50,
      maxHearts: 5,
      heartRefillHours: 1,
      gemEarnRate: 1.0,
      xpMultiplier: 1.0,
      maintenanceMode: false,
      allowRegistration: true,
      preloaderDurationSeconds: 3,
      aiEnabled: true,
    },
  });
  console.log(`   ✅ Settings created: ${settings.platformName}\n`);

  // ==================== FEATURE FLAGS ====================
  console.log("🚩 Creating feature flags...");
  const featureFlags = [
    { key: "VIDEO_LESSONS", name: "Video Lessons", enabled: true },
    { key: "CERTIFICATES", name: "Certificates", enabled: true },
    { key: "DAILY_CHALLENGES", name: "Daily Challenges", enabled: true },
    { key: "LEADERBOARD", name: "Leaderboard", enabled: true },
    { key: "SHOP", name: "Shop", enabled: true },
    { key: "SOCIAL_FEATURES", name: "Social Features", enabled: false },
  ];

  for (const flag of featureFlags) {
    await db.featureFlag.create({ data: flag });
    console.log(`   ✅ Flag: ${flag.name} (${flag.enabled ? "ON" : "OFF"})`);
  }
  console.log();

  // ==================== CATEGORIES ====================
  console.log("📂 Creating categories...");
  const categoriesData = [
    {
      name: "Languages",
      description: "Learn Nigerian and international languages",
      icon: "🌍",
      color: "#10B981",
      order: 1,
    },
    {
      name: "STEM",
      description: "Science, Technology, Engineering, and Mathematics",
      icon: "🔬",
      color: "#6366F1",
      order: 2,
    },
    {
      name: "Arts & Humanities",
      description: "Explore art, literature, music, and culture",
      icon: "🎨",
      color: "#F59E0B",
      order: 3,
    },
    {
      name: "Nigerian Studies",
      description: "Learn about Nigeria's history, geography, and civics",
      icon: "🇳🇬",
      color: "#059669",
      order: 4,
    },
    {
      name: "Business & Finance",
      description: "Master money management and entrepreneurship",
      icon: "💼",
      color: "#8B5CF6",
      order: 5,
    },
    {
      name: "Technology & Coding",
      description: "Learn programming and digital skills",
      icon: "💻",
      color: "#EC4899",
      order: 6,
    },
  ];

  const categories: any[] = [];
  for (const cat of categoriesData) {
    const created = await db.category.create({ data: cat });
    categories.push(created);
    console.log(`   ✅ Category: ${cat.icon} ${cat.name}`);
  }
  console.log();

  // ==================== NOTE TO ADMINS ====================
  console.log("📝 Important Notes:");
  console.log("   • No courses, lessons, or questions are pre-seeded");
  console.log("   • Use the admin panel to create and manage learning content");
  console.log("   • Achievements and shop items should be configured via admin UI");
  console.log("   • Daily challenges and announcements should be created dynamically");
  console.log("   • Boss battles are generated based on course content");
  console.log();
  console.log("✨ Minimal seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
