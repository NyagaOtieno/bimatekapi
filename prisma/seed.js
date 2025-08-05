const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upsertSafeProduct(data) {
  const {
    vehicleClass,
    coverage,
    coverPeriod,
    agentcode,
    underwriter,
    minAge,
    maxAge,
    minValue,
    maxValue,
    tonnage,
    passengers,
  } = data;

  // Build dynamic filter
  const conditions = [
    {
      minAge: { lte: maxAge ?? 99 },
      maxAge: { gte: minAge ?? 0 },
    },
    {
      minValue: { lte: maxValue ?? 99999999 },
      maxValue: { gte: minValue ?? 0 },
    },
  ];

  if (tonnage !== undefined && tonnage !== null) {
    conditions.push({ tonnage });
  }

  if (passengers !== undefined && passengers !== null) {
    conditions.push({ passengers });
  }

  const existing = await prisma.product.findFirst({
    where: {
      vehicleClass,
      coverage,
      coverPeriod,
      agentcode,
      underwriter,
      AND: conditions,
    },
  });

  if (existing) {
    console.log(`⚠️ Skipped duplicate: ${data.name}`);
    return existing;
  }

  const created = await prisma.product.create({ data });
  console.log(`✅ Created product: ${data.name}`);
  return created;
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'admin@bimatek.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@bimatek.com',
      password: 'hashed_password_here',
    },
  });

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

  const compProduct = await upsertSafeProduct({
    name: 'BodaBoda Comprehensive',
    description: 'Affordable comprehensive cover for boda boda.',
    basePremium: 0.03,
    underwriter: 'Xtra Insurance Co.',
    vehicleClass: 'MOTORCYCLE_PRIVATE',
    coverage: 'COMPREHENSIVE',
    coverPeriod: '12',
    ExcludedMakes: 'TOYOTA PROBOX',
    tonnage: 0,
    passengers: 1,
    agentcode: '31212',
    minAge: 5,
    maxAge: 10,
    minValue: 50000,
    maxValue: 300000,
  });

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
    await upsertSafeProduct({
      name: `${config.vehicleClass} TPO`,
      description: `TPO for ${config.vehicleClass} ${config.minTonnage}-${config.maxTonnage} tons.`,
      underwriter: 'Xtra Insurance Co.',
      vehicleClass: config.vehicleClass,
      coverage: 'TPO',
      coverPeriod: '1',
      agentcode: '31212',
      tonnage: config.maxTonnage,
      basePremium: 0,
      minAge: 1,
      maxAge: 20,
      minValue: 50000,
      maxValue: 800000,
      premium_week: 2000,
      premium_2weeks: 4000,
      premium_month: 8000,
      premium_3months: 15000,
      premium_6months: 28000,
      premium_annual: 50000,
    });
  }

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
    await upsertSafeProduct({
      name: `${config.vehicleClass} TPO`,
      description: `TPO for ${config.passengers}-seater ${config.vehicleClass}.`,
      underwriter: 'Xtra Insurance Co.',
      vehicleClass: config.vehicleClass,
      coverage: 'TPO',
      coverPeriod: '1',
      agentcode: '31212',
      passengers: config.passengers,
      basePremium: 0,
      minAge: 1,
      maxAge: 20,
      minValue: 80000,
      maxValue: 400000,
      premium_week: 1500,
      premium_2weeks: 3000,
      premium_month: 6000,
      premium_3months: 11000,
      premium_6months: 20000,
      premium_annual: 36000,
    });
  }

  const quote = await prisma.quote.create({
    data: {
      productId: compProduct.id,
      userId: user.id,
      price: 3600,
      value: 120000,
      coverPeriod: '12',
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

  const policy = await prisma.policy.create({
    data: {
      quoteId: quote.id,
      productId: compProduct.id,
      userId: user.id,
      clientId: client.id,
    },
  });

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
