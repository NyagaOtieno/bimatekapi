const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // ✅ Create or update admin user
  const user = await prisma.user.upsert({
    where: { email: 'admin@bimatek.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@bimatek.com',
      password: 'hashed_password_here', // Replace with hashed version
    },
  });

  // ✅ Create or update client
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

  // ✅ Comprehensive product
  const compProduct = await prisma.product.upsert({
    where: {
      vehicleClass_coverage_period_agentcode: {
        vehicleClass: 'MOTORCYCLE_PRIVATE',
        coverage: 'COMPREHENSIVE',
        period: '12',
        agentcode: '31212',
      },
    },
    update: {},
    create: {
      name: 'BodaBoda Comprehensive',
      description: 'Affordable comprehensive cover for boda boda.',
      basePremium: 0.03,
      underwriter: 'Xtra Insurance Co.',
      vehicleClass: 'MOTORCYCLE_PRIVATE',
      coverage: 'COMPREHENSIVE',
      period: '12',
      ExcludedMakes: 'TOYOTA PROBOX',
      tonnage: 0,
      passengers: 1,
      agentcode: '31212',
      minAge: 5,
      maxAge: 10,
      minValue: 50000,
      maxValue: 300000,
    },
  });

  // ✅ TPO for commercial vehicles (tonnage-based)
  const tpoCommercialConfigs = [
    {
      vehicleClass: 'MOTORVEHICLE_OWN_GOODS',
      minTonnage: 0,
      maxTonnage: 3,
    },
    {
      vehicleClass: 'MOTORVEHICLE_GENERAL_CARTAGE',
      minTonnage: 3,
      maxTonnage: 8,
    },
  ];

  for (const config of tpoCommercialConfigs) {
    await prisma.product.create({
      data: {
        name: `${config.vehicleClass} TPO`,
        description: `TPO for ${config.vehicleClass} ${config.minTonnage}-${config.maxTonnage} tons.`,
        underwriter: 'Xtra Insurance Co.',
        vehicleClass: config.vehicleClass,
        coverage: 'TPO',
        period: '1',
        agentcode: '31212',
        minValue: 50000,
        maxValue: 800000,
        minAge: 1,
        maxAge: 20,
        tonnage: config.maxTonnage,
        basePremium: 0,
        premium_week: 2000,
        premium_2weeks: 4000,
        premium_month: 8000,
        premium_3months: 15000,
        premium_6months: 28000,
        premium_annual: 50000,
      },
    });
  }

  // ✅ TPO for PSV based on passengers
  const tpoPsvConfigs = [
    {
      vehicleClass: 'PSV_MATATU',
      passengers: 14,
    },
    {
      vehicleClass: 'PSV_TAXI',
      passengers: 4,
    },
  ];

  for (const config of tpoPsvConfigs) {
    await prisma.product.upsert({
      where: {
        vehicleClass_coverage_period_agentcode: {
          vehicleClass: config.vehicleClass,
          coverage: 'TPO',
          period: '1',
          agentcode: '31212',
        },
      },
      update: {},
      create: {
        name: `${config.vehicleClass} TPO`,
        description: `TPO for ${config.passengers}-seater ${config.vehicleClass}.`,
        underwriter: 'Xtra Insurance Co.',
        vehicleClass: config.vehicleClass,
        coverage: 'TPO',
        period: '1',
        agentcode: '31212',
        passengers: config.passengers,
        basePremium: 0,
        premium_week: 1500,
        premium_2weeks: 3000,
        premium_month: 6000,
        premium_3months: 11000,
        premium_6months: 20000,
        premium_annual: 36000,
      },
    });
  }

  // ✅ Quote from comprehensive product
  const quote = await prisma.quote.create({
    data: {
      productId: compProduct.id,
      userId: user.id,
      price: 3600,
      value: 120000,
      period: '12',
      make: 'Boxer',
      yearOfManufacture: 2022,
      agent_code: '31212',
      name_contact: 'Jane Doe',
      email: 'jane@example.com',
      phone_number: '0700123456',
      vehicle_reg: 'KDA123A',
      cover: 'COMPREHENSIVE',
      tonnage: 0,
      passengers: 1,
    },
  });

  // ✅ Policy from quote
  const policy = await prisma.policy.create({
    data: {
      quoteId: quote.id,
      productId: compProduct.id,
      userId: user.id,
      clientId: client.id,
    },
  });

  // ✅ Claim for policy
  await prisma.claim.create({
    data: {
      policyId: policy.id,
      reason: 'Accident repair',
      amount: 800,
      clientId: client.id,
      status: 'Pending',
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
