const { PrismaClient, VehicleClass, CoverageType, CoverPeriod } = require("@prisma/client");
const prisma = new PrismaClient();

// -------------------------------
// Input definitions
// -------------------------------
const TPO_PERIODS = [
  CoverPeriod.ONE_WEEK,
  CoverPeriod.TWO_WEEKS,
  CoverPeriod.ONE_MONTH,
  CoverPeriod.SIX_MONTHS,
  CoverPeriod.ONE_YEAR,
];

// Tonnage bands represented by upper bound ints to fit schema (Int)
const TONNAGE_BANDS = [3, 6, 8, 10, 99]; // up to 3T, 3–6T, 6.1–8T, 8.1–10T, >10T

const productData = [
  // ---------------------------------
  // Comprehensive (ONE_YEAR only)
  // ---------------------------------
  {
    name: "bhttdfdtdtComprehensive Motor Insurance",
    description: "Private cars comprehensive cover",
    coverage: CoverageType.COMPREHENSIVE,
    vehicleClass: [VehicleClass.MOTORVEHICLE_OWN_GOODS], // kept as-is per your input
    minAge: 0,
    maxAge: 10,
    minValue: 500000,
    maxValue: 5000000,
    agentcode: "31212",
    minimumPremium: 15000, // applies only to comprehensive
    premium_annual: 3,     // rate/percent as per your field
    ExcludedMakes: [],
    coverPeriod: CoverPeriod.ONE_YEAR, // ONE_YEAR only
    underwriterName: "Takaful Insurance of Africa Ltd",
  },

  // ---------------------------------
  // TPO PSV Matatu (7–36 pax) with all TPO periods
  // ---------------------------------
  {
    name: "Third Party Only - PSV Matatu",
    description: "Third Party Only insurance cover for Matatu",
    coverage: CoverageType.THIRD_PARTY_ONLY,
    vehicleClass: [VehicleClass.PSV_MATATU],
    passengersRange: [7, 36], // exact rule: matatu starts from 7 to 36
    ExcludedMakes: ["TOYOTA HIACE"],
    agentcode: "31212",
    underwriterName: "APA Insurance Ltd",
  },

  // ---------------------------------
  // TPO PSV Bus (36–105 pax) with all TPO periods
  // ---------------------------------
  {
    name: "Third Party Only - PSV Bus",
    description: "Third Party Only insurance cover for Buses",
    coverage: CoverageType.THIRD_PARTY_ONLY,
    vehicleClass: [VehicleClass.PSV_BUS],
    passengersRange: [36, 105], // exact rule: bus starts from 36 to 105
    ExcludedMakes: ["ISUZU BUS"],
    agentcode: "31212",
    underwriterName: "APA Insurance Ltd",
  },

  // ---------------------------------
  // TPFT Own Goods (Annual only)
  // ---------------------------------
  {
    name: "Third Party Fire & Theft - Truck",
    description: "Third Party Fire & Theft insurance cover for trucks",
    coverage: CoverageType.THIRD_PARTY_FIRE_AND_THEFT,
    vehicleClass: [VehicleClass.MOTORVEHICLE_OWN_GOODS],
    tonnage: 10, // representative tonnage for this TPFT product
    ExcludedMakes: ["TATA LPT 1213", "ISUZU ELF"],
    minValue: 800000,
    maxValue: 4000000,
    agentcode: "31212",
    underwriterName: "Britam General Insurance Company (K) Ltd",
  },

  // ---------------------------------
  // TPO Own Goods (Annual only) — with tonnage bands
  // ---------------------------------
  {
    name: "Third Party Only - Own Goods",
    description: "Third Party Only insurance cover for Own Goods",
    coverage: CoverageType.THIRD_PARTY_ONLY,
    vehicleClass: [VehicleClass.MOTORVEHICLE_OWN_GOODS],
    tonnageBands: TONNAGE_BANDS, // seed multiple rows (annual only)
    ExcludedMakes: [],
    agentcode: "31212",
    underwriterName: "Directline Assurance Company Ltd",
  },

  // ---------------------------------
  // TPO General Cartage (Annual only) — with tonnage bands
  // ---------------------------------
  {
    name: "Third Party Only - General Cartage",
    description: "Third Party Only insurance cover for General Cartage",
    coverage: CoverageType.THIRD_PARTY_ONLY,
    vehicleClass: [VehicleClass.MOTORVEHICLE_GENERAL_CARTAGE],
    tonnageBands: TONNAGE_BANDS, // seed multiple rows (annual only)
    ExcludedMakes: ["MERCEDES BENZ ATEGO"],
    agentcode: "31212",
    underwriterName: "Directline Assurance Company Ltd",
  },
];

// -------------------------------
// Main seeding
// -------------------------------
async function main() {
  console.log("🌱 Seeding products...");

  // Map/Upsert underwriters once
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

  let count = 0;

  for (const product of productData) {
    const {
      underwriterName,
      passengersRange,
      tonnage,
      tonnageBands,
      minimumPremium,
      coverPeriod, // only used for Comprehensive
      ...rest
    } = product;

    // COMPREHENSIVE => ONE_YEAR only + minimumPremium applies
    if (product.coverage === CoverageType.COMPREHENSIVE) {
      await prisma.product.create({
        data: {
          ...rest,
          minimumPremium,
          coverPeriod,
          underwriterId: underwriterMap[underwriterName],
        },
      });
      count += 1;
      continue;
    }

    // PSV Matatu/Bus => TPO across all periods × passenger range
    if (passengersRange) {
      for (const period of TPO_PERIODS) {
        for (let pax = passengersRange[0]; pax <= passengersRange[1]; pax++) {
          await prisma.product.create({
            data: {
              ...rest,
              passengers: pax,
              coverPeriod: period,
              underwriterId: underwriterMap[underwriterName],
            },
          });
          count += 1;
        }
      }
      continue;
    }

    // TPO Own Goods / General Cartage (annual only) => seed multiple tonnage bands
    if (tonnageBands && Array.isArray(tonnageBands)) {
      for (const tUpper of tonnageBands) {
        await prisma.product.create({
          data: {
            ...rest,
            tonnage: tUpper, // store upper-bound int for the range
            coverPeriod: CoverPeriod.ONE_YEAR,
            underwriterId: underwriterMap[underwriterName],
          },
        });
        count += 1;
      }
      continue;
    }

    // TPFT or other TPO items without passengersRange/tonnageBands => annual only
    await prisma.product.create({
      data: {
        ...rest,
        tonnage: typeof tonnage === "number" ? tonnage : null,
        coverPeriod: CoverPeriod.ONE_YEAR,
        underwriterId: underwriterMap[underwriterName],
      },
    });
    count += 1;
  }

  console.log('✅ Seeded ${count} product rows (cover periods, passengers, tonnage bands all applied).');
}

main()
  .catch((err) => {
    console.error("❌ Error seeding products:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });