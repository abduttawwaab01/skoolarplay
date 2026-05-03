/**
 * Smart Vocabulary Migration Script (AST-based)
 * Uses Babel parser to properly transform vocab files to v2 format
 * Adds: difficulty (EASY/MEDIUM/HARD), languageCode, translation, exampleTranslation
 *
 * Usage: npx ts-node scripts/migrate-vocab-ast.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import parser from '@babel/parser';
import traverse from '@babel/traverse';
import { WORD_DIFFICULTY_MAP } from '../prisma/vocab-data/types';

const VOCAB_DATA_DIR = path.join(__dirname, '..', 'prisma', 'vocab-data');

/**
 * Get word difficulty based on CEFR level
 */
function getWordDifficulty(level: string): "EASY" | "MEDIUM" | "HARD" {
  return WORD_DIFFICULTY_MAP[level as keyof typeof WORD_DIFFICULTY_MAP] || "MEDIUM";
}

/**
 * Migrate a single vocab file using AST parsing
 */
async function migrateFileWithAST(
  filePath: string,
  languageCode: string,
  level: string
): Promise<void> {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Parse the file as TypeScript
  const ast = parser.parse(content, {
    sourceType: 'module',
    plugins: ['typescript'],
  });

  let exportName = '';
  let needsUpdate = false;
  const newContentParts: string[] = [];
  let lastIndex = 0;

  // Traverse AST to find the export and word objects
  traverse(ast, {
    ExportNamedDeclaration(path) {
      const decl = path.node.declaration;
      if (decl?.type === 'VariableDeclaration') {
        const varDecl = decl as any;
        varDecl.declarations.forEach((decl: any) => {
          if (decl.id.type === 'Identifier') {
            exportName = decl.id.name;
          }
        });
      }
    },
    ObjectExpression(path) {
      // Check if this is a word object (has 'word' property)
      const props = path.node.properties;
      const hasWordProp = props.some((p: any) => 
        p.type === 'ObjectProperty' && 
        p.key.type === 'Identifier' && 
        p.key.name === 'word'
      );

      if (!hasWordProp) return;

      const wordObj = path.node;
      const start = (wordObj as any).start;
      const end = (wordObj as any).end;

      if (start == null || end == null) return;

      // Extract the original word object text
      const originalText = content.substring(start, end);
      
      // Build new properties
      const difficulty = getWordDifficulty(level);
      const newProps = [
        originalText.replace(/\}\s*$/, '').replace(/\{\s*$/, ''),
        `  translation: ""`,
        `  exampleTranslation: ""`,
        `  difficulty: "${difficulty}"`,
        `  languageCode: "${languageCode}"`,
        `}`
      ].join('\n');

      // Replace in content
      newContentParts.push(content.substring(lastIndex, start));
      newContentParts.push(newProps);
      lastIndex = end + 1;
      needsUpdate = true;
    },
  });

  if (!needsUpdate) {
    console.log(`   ⚠️  No word objects found in ${filePath}`);
    return;
  }

  newContentParts.push(content.substring(lastIndex));

  // Add import from types at the top
  let finalContent = newContentParts.join('');
  if (!finalContent.includes('from "../types"')) {
    finalContent = `import { VocabSet } from "../types";\n` + finalContent;
  }

  // Remove old interface definitions
  finalContent = finalContent.replace(
    /export interface VocabWord \{[\s\S]*?\}\s*export interface VocabSet \{[\s\S]*?\}\s*/g,
    ''
  );

  // Write back
  fs.writeFileSync(filePath, finalContent, 'utf-8');
  console.log(`   ✅ Migrated (AST): ${path.basename(filePath)}`);
}

/**
 * Main migration function
 */
async function migrateAllWithAST(): Promise<void> {
  console.log("🚀 Starting AST-based vocabulary migration...\n");

  const languages = [
    { code: 'en', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
    { code: 'yo', levels: ['A1'] },
    { code: 'fr', levels: ['A1'] },
  ];

  for (const lang of languages) {
    const langDir = path.join(VOCAB_DATA_DIR, lang.code);
    if (!fs.existsSync(langDir)) {
      console.log(`   ⚠️  Directory not found: ${langDir}`);
      continue;
    }

    console.log(`📁 Processing ${lang.code}...`);
    
    for (const level of lang.levels) {
      const fileName = `${level.toLowerCase()}.ts`;
      const filePath = path.join(langDir, fileName);
      
      if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️  File not found: ${fileName}`);
        continue;
      }

      await migrateFileWithAST(filePath, lang.code, level);
    }
  }

  console.log("\n✨ AST migration complete!");
  console.log("⚠️  Note: Verify the output files manually.");
  console.log("   The 'translation' and 'exampleTranslation' fields are empty.");
  console.log("   Run the translation population script next.");
}

migrateAllWithAST().catch(e => {
  console.error("❌ Migration failed:", e);
  process.exit(1);
});
