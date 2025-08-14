const { PrismaClient, CoverageType } = require('@prisma/client');
const prisma = new PrismaClient();

async function upsertSafeProduct(data) {
  const {
    name,
    vehicleClass,
    coverage,
    coverPeriod,
    agentcode,
    underwriterId,
    minAge,
    maxAge,
    minValue,
    maxValue,
    tonnage,
    passengers,
    description,
    basePremium,
    premium_annual,
    ExcludedMakes,
    premium_week,
    premium_2weeks,
    premium_month,
    premium_3months,
    premium_6months,
  } = data;

  const vcArray = Array.isArray(vehicleClass) ? vehicleClass : [vehicleClass];
  const covArray = Array.isArray(coverage) ? coverage : [coverage];

  const conditions = [];

  if (covArray.includes(CoverageType.COMPREHENSIVE) || covArray.includes(CoverageType.THIRD_PARTY_FIRE_AND_THEFT)) {
    if (minAge !== undefined && maxAge !== undefined) conditions.push({ minAge: { lte: maxAge ?? 99 }, maxAge: { gte: minAge ?? 0 } });
    if (minValue !== undefined && maxValue !== undefined) conditions.push({ minValue: { lte: maxValue ?? 999999999 }, maxValue: { gte: minValue ?? 0 } });
    if (ExcludedMakes && ExcludedMakes.length > 0) conditions.push({ ExcludedMakes: { hasSome: ExcludedMakes } });
  }

  if (!covArray.includes(CoverageType.COMPREHENSIVE) && !covArray.includes(CoverageType.THIRD_PARTY_FIRE_AND_THEFT)) {
    if (tonnage !== undefined && tonnage !== null) conditions.push({ tonnage });
    if (passengers !== undefined && passengers !== null) conditions.push({ passengers });
  }

  const existing = await prisma.product.findFirst({
    where: {
      vehicleClass: { hasSome: vcArray },
      coverage: { hasSome: covArray },
      coverPeriod,
      agentcode,
      underwriterId,
      AND: conditions,
    },
  });

  if (existing) {
    console.log(`⚠️ Skipped duplicate: ${name}`);
    return existing;
  }

  const created = await prisma.product.create({
    data: {
      name,
      description,
      basePremium: basePremium || null,
      premium_annual: premium_annual || null,
      premium_week: premium_week || null,
      premium_2weeks: premium_2weeks || null,
      premium_month: premium_month || null,
      premium_3months: premium_3months || null,
      premium_6months: premium_6months || null,
      underwriterId,
      vehicleClass: vcArray,
      coverage: covArray,
      agentcode,
      coverPeriod,
      tonnage: tonnage || null,
      passengers: passengers || null,
      minAge: minAge || null,
      maxAge: maxAge || null,
      minValue: minValue || null,
      maxValue: maxValue || null,
      ExcludedMakes: ExcludedMakes || null,
    },
  });

  console.log(`✅ Created product: ${name}`);
  return created;
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'admin@bimatek.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@bimatek.com', password: 'hashed_password_here' },
  });

  const client = await prisma.client.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: { name: 'Jane Doe', email: 'jane@example.com', phone: '0700123456', address: '123 Test Street', userId: user.id },
  });

  // -------------------------
  // Seed Underwriters
  // -------------------------
  const underwriterNames = [
    'AAR Insurance (Kenya) Ltd',
    'Africa Merchant Assurance Company Ltd (AMACO)',
    'AIG Kenya Insurance Company Ltd',
    'APA Insurance Ltd',
    'Britam General Insurance Company (K) Ltd',
    'Cannon General Insurance Company Ltd',
    'CIC General Insurance Ltd',
    'Corporate Insurance Company Ltd',
    'Directline Assurance Company Ltd',
    'Definite Assurance Company Ltd',
    'Equity General Insurance (Kenya) Ltd',
    'Fidelity Shield Insurance Co Ltd',
    'First Assurance Company Ltd',
    'GA Insurance Ltd',
    'Geminia Insurance Company Ltd',
    'ICEA LION General Insurance Company Ltd',
    'Intra Africa Assurance Company Ltd',
    'Jubilee Allianz General Insurance Ltd',
    'Jubilee Health Insurance Ltd',
    'Kenindia Assurance Company Ltd',
    'Kenya Orient Insurance Ltd',
    'Madison General Insurance Kenya Ltd',
    'Mayfair Insurance Company Ltd',
    'MUA Insurance (Kenya) Ltd',
    'Occidental Insurance Company Ltd',
    'Old Mutual General Insurance Kenya Ltd',
    'Pacis Insurance Company Ltd',
    'Pioneer General Insurance Ltd',
    'Sanlam General Insurance Company Ltd',
    'Star Discover Insurance Ltd',
    'Takaful Insurance of Africa Ltd',
    'Tausi Assurance Company Ltd',
    'The Heritage Insurance Company Ltd',
    'The Kenyan Alliance Insurance Company Ltd',
    'The Monarch Insurance Company Ltd',
    'Trident Insurance Company Ltd',
  ];

  const underwriters = {};
  for (const name of underwriterNames) {
    const uw = await prisma.underwriter.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    underwriters[name] = uw.id;
  }

  // -------------------------
  // Seed Products with underwriterId
  // -------------------------
  const sampleUnderwriterId = underwriters['AAR Insurance (Kenya) Ltd'];

  // Comprehensive
  await upsertSafeProduct({
    name: 'BodaBoda Comprehensive',
    description: 'Comprehensive cover for boda boda based on age/value/excluded makes.',
    premium_annual: 0.03,
    underwriterId: sampleUnderwriterId,
    vehicleClass: ['MOTORCYCLE_PRIVATE'],
    coverage: [CoverageType.COMPREHENSIVE],
    coverPeriod: '12',
    agentcode: '31212',
    passengers: 1,
    tonnage: 0,
    minAge: 5,
    maxAge: 10,
    minValue: 50000,
    maxValue: 300000,
    ExcludedMakes: ['TOYOTA PROBOX', 'HONDA WAVE', 'YAMAHA YBR'],
  });

  // TPO Commercial
  const tpoCommercialConfigs = [
    { vehicleClass: 'MOTORVEHICLE_OWN_GOODS', tonnage: 3 },
    { vehicleClass: 'MOTORVEHICLE_GENERAL_CARTAGE', tonnage: 8 },
  ];

  for (const config of tpoCommercialConfigs) {
    await upsertSafeProduct({
      name: `${config.vehicleClass} TPO`,
      description: `TPO for ${config.vehicleClass} up to ${config.tonnage} tons.`,
      underwriterId: sampleUnderwriterId,
      vehicleClass: [config.vehicleClass],
      coverage: [CoverageType.THIRD_PARTY_ONLY],
      coverPeriod: '1',
      agentcode: '31212',
      tonnage: config.tonnage,
      premium_week: config.tonnage * 500,
      premium_2weeks: config.tonnage * 1000,
      premium_month: config.tonnage * 2000,
      premium_3months: config.tonnage * 3500,
      premium_6months: config.tonnage * 6000,
      premium_annual: config.tonnage * 10000,
    });

    await upsertSafeProduct({
      name: `${config.vehicleClass} TPF&T`,
      description: `Third Party Fire & Theft for ${config.vehicleClass} up to ${config.tonnage} tons.`,
      underwriterId: sampleUnderwriterId,
      vehicleClass: [config.vehicleClass],
      coverage: [CoverageType.THIRD_PARTY_FIRE_AND_THEFT],
      coverPeriod: '1',
      agentcode: '31212',
      tonnage: config.tonnage,
      premium_week: config.tonnage * 600,
      premium_2weeks: config.tonnage * 1200,
      premium_month: config.tonnage * 2500,
      premium_3months: config.tonnage * 4000,
      premium_6months: config.tonnage * 7000,
      premium_annual: config.tonnage * 12000,
    });
  }

  // TPO PSV
  const tpoPsvConfigs = [
    { vehicleClass: 'PSV_MATATU', passengers: 14 },
    { vehicleClass: 'PSV_TAXI', passengers: 4 },
  ];

  for (const config of tpoPsvConfigs) {
    await upsertSafeProduct({
      name: `${config.vehicleClass} TPO`,
      description: `TPO for ${config.passengers}-seater ${config.vehicleClass}.`,
      underwriterId: sampleUnderwriterId,
      vehicleClass: [config.vehicleClass],
      coverage: [CoverageType.THIRD_PARTY_ONLY],
      coverPeriod: '1',
      agentcode: '31212',
      passengers: config.passengers,
      premium_week: config.passengers * 100,
      premium_2weeks: config.passengers * 200,
      premium_month: config.passengers * 400,
      premium_3months: config.passengers * 750,
      premium_6months: config.passengers * 1500,
      premium_annual: config.passengers * 3000,
    });

    await upsertSafeProduct({
      name: `${config.vehicleClass} TPF&T`,
      description: `Third Party Fire & Theft for ${config.passengers}-seater ${config.vehicleClass}.`,
      underwriterId: sampleUnderwriterId,
      vehicleClass: [config.vehicleClass],
      coverage: [CoverageType.THIRD_PARTY_FIRE_AND_THEFT],
      coverPeriod: '1',
      agentcode: '31212',
      passengers: config.passengers,
      premium_week: config.passengers * 120,
      premium_2weeks: config.passengers * 240,
      premium_month: config.passengers * 500,
      premium_3months: config.passengers * 900,
      premium_6months: config.passengers * 1800,
      premium_annual: config.passengers * 3500,
    });
  }

  console.log('🌱 Seed data including Underwriters and Products created successfully');
}

main()
  .catch((e) => { console.error('❌ Error seeding:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
