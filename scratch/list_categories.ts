import { db } from '../src/lib/db'

async function listCategories() {
  const categories = await db.category.findMany();
  console.log(JSON.stringify(categories, null, 2));
  await db.$disconnect();
}

listCategories().catch(console.error);
