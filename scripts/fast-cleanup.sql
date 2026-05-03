-- Fast cleanup script using raw SQL
-- Run this in Prisma Studio or psql

-- Delete in correct order: questions -> lessons -> modules -> courses
DELETE FROM "Question";
DELETE FROM "Lesson";
DELETE FROM "Module";
DELETE FROM "Course";

-- Verify
SELECT COUNT(*) as courses FROM "Course";
SELECT COUNT(*) as modules FROM "Module";
SELECT COUNT(*) as lessons FROM "Lesson";
SELECT COUNT(*) as questions FROM "Question";
