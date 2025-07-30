// File: prisma/seed.js
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@bimatek.com',
      password: 'hashed_password_here',
      role: 'admin',
    },
  });

  const client = await prisma.client.create({
    data: {
      name: 'Jane Doe',
      phone: '0700123456',
      nationalId: '12345678',
    },
  });

  const product = await prisma.product.create({
    data: {
      name: 'BodaBoda Insurance',
      description: 'Affordable cover for boda boda operators.',
      price: 1500,
    },
  });

  const quote = await prisma.quote.create({
    data: {
      productId: product.id,
      userId: user.id,
      premium: 1200,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  const policy = await prisma.policy.create({
    data: {
      clientId: client.id,
      productId: product.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      premium: 1500,
    },
  });

  await prisma.claim.create({
    data: {
      policyId: policy.id,
      reason: 'Accident repair',
      amount: 1000,
    },
  });

  console.log('🌱 Seed data created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
