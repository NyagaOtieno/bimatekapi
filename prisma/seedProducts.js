const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const productData = [
  {
    name: "Comprehensive Cover - Toyota",
    coverage: ["COMPREHENSIVE"],
    yearOfManufacture: 2021,
    minAge: 25,
    maxAge: 65,
    minValue: 500000,
    maxValue: 3000000,
    value: 1500000,
    vehicleClass: ["MOTORVEHICLE_PRIVATE", "SEDAN"],
    ExcludedMakes: ["LADA NIVA", "TRABANT 601", "TOYOTA PROBOX"],
    underwriterName: "AAR Insurance (Kenya) Ltd",
  },
  {
    name: "Third Party Only - PSV Matatu",
    coverage: ["THIRD_PARTY_ONLY"],
    coverPeriod: "ONE_YEAR",
    minAge: 21,
    maxAge: 70,
    vehicleClass: ["PSV_MATATU"],
    passengers: 14,
    ExcludedMakes: ["TOYOTA HIACE"],
    underwriterName: "APA Insurance Ltd",
  },
  {
    name: "Third Party Fire & Theft - Truck",
    coverage: ["THIRD_PARTY_FIRE_AND_THEFT"],
    yearOfManufacture: 2019,
    minAge: 30,
    maxAge: 60,
    minValue: 800000,
    maxValue: 4000000,
    value: 2500000,
    vehicleClass: ["MOTORVEHICLE_OWN_GOODS"],
    ExcludedMakes: ["TATA LPT 1213", "ISUZU ELF"],
    tonnage: 10,
    underwriterName: "Britam General Insurance Company (K) Ltd",
  },
  {
    name: "Comprehensive Cover - Luxury SUV",
    coverage: ["COMPREHENSIVE"],
    yearOfManufacture: 2022,
    minAge: 28,
    maxAge: 65,
    minValue: 2000000,
    maxValue: 8000000,
    value: 5000000,
    vehicleClass: ["MOTORVEHICLE_PRIVATE"],
    ExcludedMakes: ["GREAT WALL HAVAL", "TOYOTA LAND CRUISER"],
    underwriterName: "CIC General Insurance Ltd",
  },
  {
    name: "Third Party Only - General Cartage",
    coverage: ["THIRD_PARTY_ONLY"],
    coverPeriod: "ONE_YEAR",
    vehicleClass: ["MOTORVEHICLE_GENERAL_CARTAGE"],
    tonnage: 5,
    ExcludedMakes: ["MERCEDES BENZ ATEGO"],
    underwriterName: "Directline Assurance Company Ltd",
  },
];

async function main() {
  console.log("🌱 Seeding test products...");

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

  for (const product of productData) {
    const { underwriterName, ...rest } = product;
    await prisma.product.create({
      data: {
        ...rest,
        underwriterId: underwriterMap[underwriterName],
      },
    });
  }

  console.log(`✅ Seeded ${productData.length} products.`);
}

main()
  .catch((err) => {
    console.error("❌ Error seeding products:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
