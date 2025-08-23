const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');

const prisma = new PrismaClient();

async function main() {
  console.log('💡 Backfilling NULL underwriterName values using raw SQL...');
  
  // Raw SQL to update NULLs
  const result = await prisma.$executeRawUnsafe(
    `UPDATE "Product" SET "underwriterName" = 'DEFAULT_VALUE' WHERE "underwriterName" IS NULL;`
  );
  console.log(`✅ Backfill complete`);

  console.log('🚀 Applying Prisma migration...');
  await new Promise((resolve, reject) => {
    const migrate = exec('npx prisma migrate dev --name make_underwriter_required', (err, stdout, stderr) => {
      if (err) reject(err);
      console.log(stdout);
      console.error(stderr);
      resolve();
    });
  });

  console.log('✨ Regenerating Prisma client...');
  await new Promise((resolve, reject) => {
    const generate = exec('npx prisma generate', (err, stdout, stderr) => {
      if (err) reject(err);
      console.log(stdout);
      console.error(stderr);
      resolve();
    });
  });

  console.log('🎉 Done! Migration applied and Prisma client regenerated.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
