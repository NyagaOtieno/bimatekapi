const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const productData = [
  {
    name: "Comprehensive Cover - Toyota",
    description: "Comprehensive insurance cover for Toyota vehicles",
    coverage: "COMPREHENSIVE",
    vehicleClass: ["MOTORVEHICLE_PRIVATE"],
    minValue: 500000,
    maxValue: 3000000,
    value: 1500000,
    underwriterName: "AAR Insurance (Kenya) Ltd",
    basePremium: 15000, // default base premium to calculate others if needed
    agentcode: "31212",
  },
  {
    name: "Third Party Only - PSV Matatu",
    description: "Comprehensive insurance cover for Toyota vehicles",
    coverage: "THIRD_PARTY_ONLY",
    vehicleClass: ["PSV_MATATU"],
    passengers: 14,
    underwriterName: "APA Insurance Ltd",
    basePremium: 5000,
    agentcode: "31212",
  },
  {
    name: "Third Party Fire & Theft - Truck",
    description: "Comprehensive insurance cover for Toyota vehicles",
    coverage: "THIRD_PARTY_FIRE_AND_THEFT",
    vehicleClass: ["MOTORVEHICLE_OWN_GOODS"],
    minValue: 800000,
    maxValue: 4000000,
    underwriterName: "Britam General Insurance Company (K) Ltd",
    basePremium: 20000,
    agentcode: "31212",
  },
];

// Map cover periods to premium fields
function getCoverPeriodsAndPremiums(product) {
  const coverage = product.coverage[0];
  const vehicleClass = product.vehicleClass[0];
  const base = product.basePremium || 10000;

  // Initialize all premiums to null
  const premiums = {
    premium_week: null,
    premium_2weeks: null,
    premium_month: null,
    premium_3months: null,
    premium_6months: null,
    premium_annual: null,
  };

  if (coverage === "COMPREHENSIVE" || coverage === "THIRD_PARTY_FIRE_AND_THEFT") {
    premiums.premium_annual = base;
    return { coverPeriods: ["ONE_YEAR"], premiums };
  }

  if (coverage === "THIRD_PARTY_ONLY") {
    if (vehicleClass.includes("MOTORCYCLE_PRIVATE") || vehicleClass.includes("MOTORCYCLE_PSV")) {
      premiums.premium_month = base;
      premiums.premium_6months = base * 6; // example scaling
      premiums.premium_annual = base * 12;
      return { coverPeriods: ["ONE_MONTH", "SIX_MONTHS", "ONE_YEAR"], premiums };
    }
    if (vehicleClass.includes("MOTORVEHICLE_PRIVATE")) {
      premiums.premium_month = base;
      premiums.premium_annual = base * 12;
      return { coverPeriods: ["ONE_MONTH", "ONE_YEAR"], premiums };
    }
    if (vehicleClass.includes("PSV_MATATU") || vehicleClass.includes("MATATU_BUS")) {
      premiums.premium_week = base / 4;
      premiums.premium_2weeks = base / 2;
      premiums.premium_month = base;
      premiums.premium_annual = base * 12;
      return { coverPeriods: ["ONE_WEEK", "TWO_WEEKS", "ONE_MONTH", "ONE_YEAR"], premiums };
    }
  }

  // Default fallback
  premiums.premium_annual = base;
  return { coverPeriods: ["ONE_YEAR"], premiums };
}

async function main() {
  console.log("🌱 Seeding products with cover periods and premiums...");

  const underwriterMap = {};
  for (const product of productData) {
    if (!underwriterMap[product.underwriterName]) {
      const uw = await prisma.underwriter.upsert({
        where: { name: product.underwriterName },
        update: {},
        create: { name: product.underwriterName },
      });
      underwriterMap[product.underwriterName] = uw.id;
    }
  }

  let totalCount = 0;

  for (const product of productData) {
    const { underwriterName, ...rest } = product;
    const { coverPeriods, premiums } = getCoverPeriodsAndPremiums(product);

    for (const period of coverPeriods) {
      await prisma.product.create({
        data: {
          ...rest,
          coverPeriod: period,
          ...premiums,
          underwriterId: underwriterMap[underwriterName],
        },
      });
      totalCount++;
    }
  }

  console.log(`✅ Seeded ${totalCount} products with coverPeriod and premiums.`);
}

main()
  .catch((err) => {
    console.error("❌ Error seeding products:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
