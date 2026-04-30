# SkoolarPlay Course Enhancement Plan

## Phase 1: Analysis Completed ✅

**Database Status:**
- Total Courses: 44
- Total Lessons: 304
- Lessons needing enhancement (<10 questions): 240

## Phase 2: Enhancement Priority Order

Based on learners and impact, we prioritize:

### Priority 1: Languages with Most Learners
1. **English** - Current courses: A1, A2, B1 Mastery, Absolute Beginner
   - ESL files available but not seeded
   - Enhancement needed: Check A1, A2 for gaps

2. **Yoruba** - 13 courses (A1-B2, C1-C2, Levels 1-5)
   - Most lessons have exactly 10 questions (good)
   - B2 and C1-C2 need enhancement

3. **Hausa** - Similar structure to Yoruba

4. **Igbo** - Similar structure

5. **Swahili** - Similar structure

6. **French** - Similar structure

## Phase 3: Enhancement Strategy

### Option A: Run Existing Enhancement Script
The `enhance-lesson-questions.ts` script already exists and can auto-generate questions.

### Option B: Research-Based Questions (Recommended)
For quality learning, we need to:
1. Identify topics for each lesson
2. Research appropriate questions
3. Manually add 10-15 well-structured questions

### Option C: Hybrid Approach
1. Run auto-enhancement for quick fixes
2. Manually enhance high-priority courses

## Phase 4: Seed Files Organization

### English Seeds (Not Yet Seeded)
- seed-english-c2-mastery.ts
- seed-english-c1-mastery.ts  
- seed-english-b2-mastery.ts
- seed-english-b1_mastery.ts
- seed-english-a2-mastery.ts
- seed-english-a1_mastery.ts
- seed-english-esl-a2.ts
- seed-english-esl-a1.ts

### Other Language Seeds
All language mastery and level files are present but need to be checked for:
- Duplicate seeding
- Question quality
- Completion status

## Phase 5: Vocabulary Enhancement

### Target: Thousands of words per language
Current vocabulary structure:
- VocabularyCategory
- VocabularySet (with words)
- VocabularyWord

### Priority for Vocabulary:
1. English: Expand from current sets to thousands
2. Other languages: Build comprehensive vocabulary sets

## Next Steps

1. [ ] Run enhancement on French A2 (most need - 19 lessons)
2. [ ] Seed missing English mastery courses
3. [ ] Enhance remaining languages systematically
4. [ ] Expand vocabulary sets

---
Generated: April 2026