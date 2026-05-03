const fs = require('fs');
const path = require('path');

const levels = ['b2.ts', 'c1.ts', 'c2.ts'];

levels.forEach(f => {
  const filePath = path.join(process.cwd(), 'prisma', 'vocab-data', 'en', f);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const wordCount = (content.match(/word\":/g) || []).length + (content.match(/word:/g) || []).length;
  const setCount = (content.match(/title\":/g) || []).length + (content.match(/title:/g) || []).length;
  
  // Get last 3 titles and orders
  const sets = content.split(/title\":|title:/).slice(1);
  const lastSets = sets.slice(-3).map(s => {
    const title = s.split('\"')[1] || s.split('\'')[1];
    const order = s.match(/order\":\s*(\d+)/)?.[1] || s.match(/order:\s*(\d+)/)?.[1];
    return `${title} (order: ${order})`;
  });

  console.log(`--- ${f} ---`);
  console.log(`Total Sets: ${setCount}`);
  console.log(`Total Words: ${wordCount}`);
  console.log(`Last 3: ${lastSets.join(', ')}`);
});
