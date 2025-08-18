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

  // 2. Seed one sample product (linked to APA Insurance Ltd)
  const apa = await prisma.underwriter.findUnique({
    where: { name: "APA Insurance Ltd" },
  });

  if (apa) {
    await prisma.product.upsert({
      where: { name: "Comprehensive Motor Insurance" },
      update: {},
      create: {
        name: "Comprehensive Motor Insurance",
        description: "Covers damage to your vehicle and third-party liabilities.",
        underwriter: {
          connect: { id: apa.id }
        },
        vehicleClass: ["MOTORVEHICLE_PRIVATE"],
        coverage: ["COMPREHENSIVE"],
        minAge: 0,
        maxAge: 10,
        minValue: 500000,
        maxValue: 50000000,
        agentcode: "31212",
        minimumPremium: 15000, // only applicable for comprehensive
        premium_annual: 3, // percent
        ExcludedMakes: []
      },
    });

    console.log("✅ Sample product seeded successfully");
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
