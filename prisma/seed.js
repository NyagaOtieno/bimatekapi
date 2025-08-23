// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Seed Underwriters
  const underwriters = [
    "AAR Insurance (Kenya) Ltd",
    "Africa Merchant Assurance Company Ltd (AMACO)",
    "AIG Kenya Insurance Company Ltd",
    "APA Insurance Ltd",
    "Britam General Insurance Company (K) Ltd",
    "Cannon General Insurance Company Ltd",
    "CIC General Insurance Ltd",
    "Corporate Insurance Company Ltd",
    "Directline Assurance Company Ltd",
    "Fidelity Shield Insurance Company Ltd",
    "First Assurance Company Ltd",
    "GA Insurance Ltd",
    "ICEA LION General Insurance Company Ltd",
    "Intra Africa Assurance Company Ltd",
    "Jubilee General Insurance Ltd",
    "Kenindia Assurance Company Ltd",
    "Kenya Orient Insurance Ltd",
    "Madison Insurance Company Kenya Ltd",
    "Mayfair Insurance Company Ltd",
    "Occidental Insurance Company Ltd",
    "Old Mutual General Insurance Kenya Ltd",
    "PACIS Insurance Company Ltd",
    "Pioneer General Insurance Ltd",
    "Sanlam General Insurance Ltd",
    "Takaful Insurance of Africa Ltd",
    "Trident Insurance Company Ltd",
    "Definate Insurance Company Ltd"
  ];

  for (const name of underwriters) {
    await prisma.underwriter.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("✅ Underwriters seeded successfully");

  // 2. Seed sample products
  const products = [
    {
      underwriterName: "APA Insurance Ltd",
      name: "Comprehensive Motor Insurance",
      description: "Covers damage to your vehicle and third-party liabilities.",
      agentcode: "31212",
      vehicleClass: ["MOTORVEHICLE_PRIVATE"],
      coverage: "COMPREHENSIVE",
      minAge: 0,
      maxAge: 10,
      minValue: 500000,
      maxValue: 50000000,
      minimumPremium: 15000,
      premium_week: 5000,
      premium_2weeks: 9000,
      premium_month: 18000,
      premium_3months: 50000,
      premium_6months: 95000,
      premium_annual: 180000,
      passengers: null,
      tonnage: null,
      coverPeriod: null,
      ExcludedMakes: [],
    },
    {
      underwriterName: "APA Insurance Ltd",
      name: "PSV Matatu Insurance",
      description: "Covers matatus with period-based premiums.",
      agentcode: "31212",
      vehicleClass: ["PSV_MATATU"],
      coverage: "THIRD_PARTY_ONLY",
      minSeats: 7,
      maxSeats: 36,
      minimumPremium: 1000,
      premium_week: 1000,
      premium_2weeks: 1900,
      premium_month: 3600,
      premium_3months: 10500,
      premium_6months: 20000,
      premium_annual: 38000,
      passengers: null,
      tonnage: null,
      coverPeriod: null,
      ExcludedMakes: [],
    },
    {
      underwriterName: "APA Insurance Ltd",
      name: "PSV Bus Insurance",
      description: "Covers buses with period-based premiums.",
      agentcode: "31212",
      vehicleClass: ["PSV_BUS"],
      coverage: "THIRD_PARTY_ONLY",
      minSeats: 37,
      maxSeats: 105,
      minimumPremium: 2000,
      premium_week: 2000,
      premium_2weeks: 3800,
      premium_month: 7200,
      premium_3months: 21000,
      premium_6months: 40000,
      premium_annual: 76000,
      passengers: null,
      tonnage: null,
      coverPeriod: null,
      ExcludedMakes: [],
    }
  ];

  for (const p of products) {
    try {
      const underwriter = await prisma.underwriter.findUnique({
        where: { name: p.underwriterName },
      });

      if (!underwriter) {
        console.warn('⚠️ underwriter ${p.undewriterName} not found, skipping product ${p.name}');
        continue;
      }

      await prisma.product.upsert({
        where: {
          name_agentcode_underwriter: {
            name: p.name,
            agentcode: p.agentcode,
            underwriterId: underwriter.id,
          },
        },
        update: {},
        create: {
          name: p.name,
          description: p.description,
          underwriterId: underwriter.id,
          underwriterName: underwriter.name,
          agentcode: p.agentcode,
          vehicleClass: p.vehicleClass,
          coverage: p.coverage,
          minAge: p.minAge ?? null,
          maxAge: p.maxAge ?? null,
          minValue: p.minValue ?? null,
          maxValue: p.maxValue ?? null,
          minimumPremium: p.minimumPremium,
          premium_week: p.premium_week,
          premium_2weeks: p.premium_2weeks,
          premium_month: p.premium_month,
          premium_3months: p.premium_3months,
          premium_6months: p.premium_6months,
          premium_annual: p.premium_annual,
          passengers: p.passengers ?? null,
          tonnage: p.tonnage ?? null,
          minSeats: p.minSeats ?? null,
          maxSeats: p.maxSeats ?? null,
          coverPeriod: p.coverPeriod ?? null,
          ExcludedMakes: p.ExcludedMakes ?? [],
        },
      });

      console.log('✅ Product "${p.name}" seeded successfully');
    } catch (err) {
      console.error('⚠️ Product "${p.name}" seed skipped:, err.message');
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });