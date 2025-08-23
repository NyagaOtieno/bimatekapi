const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const prismaClientPath = path.join(__dirname, 'node_modules', '.prisma', 'client');
const dllPath = path.join(prismaClientPath, 'query_engine-windows.dll.node');

async function main() {
  console.log('💡 Backfilling NULL underwriterName values using raw SQL...');
  await prisma.$executeRawUnsafe(
    `UPDATE "Product" SET "underwriterName" = 'DEFAULT_VALUE' WHERE "underwriterName" IS NULL;`
  );
  console.log('✅ Backfill complete');

  // 1️⃣ Rename the locked DLL if exists
  if (fs.existsSync(dllPath)) {
    const tempDll = path.join(prismaClientPath, `query_engine-windows.dll.node.bak_${Date.now()}`);
    try {
      fs.renameSync(dllPath, tempDll);
      console.log(`✅ Renamed locked DLL to ${tempDll}`);
    } catch (err) {
      console.warn('⚠️ Could not rename DLL. Make sure no Node processes are running.');
      console.error(err);
      process.exit(1);
    }
  }

  // 2️⃣ Apply migration
  console.log('🚀 Applying Prisma migration...');
  await new Promise((resolve, reject) => {
    const migrate = exec('npx prisma migrate dev --name make_underwriter_required', (err, stdout, stderr) => {
      if (err) reject(err);
      console.log(stdout);
      console.error(stderr);
      resolve();
    });
  });

  // 3️⃣ Generate Prisma client
  console.log('✨ Generating Prisma client...');
  await new Promise((resolve, reject) => {
    const generate = exec('npx prisma generate', (err, stdout, stderr) => {
      if (err) reject(err);
      console.log(stdout);
      console.error(stderr);
      resolve();
    });
  });

  console.log('🎉 Done! Backfill, migration, and Prisma client regeneration complete.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
