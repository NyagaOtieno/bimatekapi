// File: prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create an admin user
  const user = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@bimatek.com',
      password: 'hashed_password_here', // Replace with real hash if needed
    },
  });

  // Create a client
  const client = await prisma.client.create({
    data: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '0700123456',
      address: '123 Test Street',
      userId: user.id,
    },
  });

  // Create a product with full parameters
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
      agentcode: 'BODA123',
    },
  });

  // Create a quote linked to product and user
  const quote = await prisma.quote.create({
    data: {
      productId: product.id,
      userId: user.id,
      price: 1200,
      value: 120000,
      period: 12,
      make: 'Boxer',
      yearOfManufacture: 2022,
      agent_code: 123456,
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

  // Create a policy
  const policy = await prisma.policy.create({
    data: {
      quoteId: quote.id,
      productId: product.id,
      userId: user.id,
    },
  });

  // Create a claim
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
