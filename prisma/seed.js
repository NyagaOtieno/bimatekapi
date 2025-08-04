// File: prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // ✅ Upsert admin user
  const user = await prisma.user.upsert({
    where: { email: 'admin@bimatek.com' },
    update: {}, // you can add fields to update if needed
    create: {
      name: 'Admin User',
      email: 'admin@bimatek.com',
      password: 'hashed_password_here', // replace with hashed password
    },
  });

  // ✅ Upsert client
  const client = await prisma.client.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '0700123456',
      address: '123 Test Street',
      userId: user.id,
    },
  });

  // ✅ Create product
  const product = await prisma.product.create({
    data: {
      name: 'BodaBoda Insurance',
      description: 'Affordable cover for boda boda operators.',
      basePremium: 1500,
      underwriter: 'Xtra Insurance Co.',
      vehicleClass: 'MOTORCYCLE_PRIVATE',
      coverage: 'Comprehensive',
      period: '1 year',
      value: 120000,
      make: 'Boxer',
      yearOfManufacture: 2022,
      tonnage: 0,
      passengers: 1,
      agentcode: '31212',
    },
  });

  // ✅ Create quote
  const quote = await prisma.quote.create({
    data: {
      productId: product.id,
      userId: user.id,
      price: 1200,
      value: 120000,
      period: 12,
      make: 'Boxer',
      yearOfManufacture: 2022,
      agentcode: '31212',
      name_contact: 'Jane Doe',
      email: 'jane@example.com',
      phone_number: '0700123456',
      vehicle_reg: 'KDA123A',
      cover: 'Comprehensive',
      coverperiod: '1 year',
      tonnage: 0,
      passengers: 1,
    },
  });

  // ✅ Create policy
  const policy = await prisma.policy.create({
    data: {
      quoteId: quote.id,
      productId: product.id,
      userId: user.id,
    },
  });

  // ✅ Create claim
  await prisma.claim.create({
    data: {
      policyId: policy.id,
      reason: 'Accident repair',
      amount: 800,
      clientId: client.id,
    },
  });

  console.log('🌱 Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });