const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const products = [
  {
    name: "Comprehensive Cover - Toyota",
    coverage: "COMPREHENSIVE",
    yearOfManufacture: 2021,
    minAge: 25,
    maxAge: 65,
    minValue: 500000,
    maxValue: 3000000,
    value: 1500000,
    vehicleClass: ["PRIVATE", "SEDAN"],
    ExcludedMakes: ["Lada", "Trabant"],
    underwriter: "ABC Insurance",
    coverPeriod: null,
    tonnage: null,
    passengers: null
  },
  {
    name: "Third Party Only - PSV Matatu",
    coverage: "THIRD_PARTY_ONLY",
    coverPeriod: 12,
    minAge: 21,
    maxAge: 70,
    vehicleClass: ["PSV_MATATU"],
    passengers: 14,
    ExcludedMakes: [],
    underwriter: "XYZ Insurance",
    tonnage: null,
    value: null
  },
  {
    name: "Third Party Fire & Theft - Truck",
    coverage: "THIRD_PARTY_FIRE_AND_THEFT",
    yearOfManufacture: 2019,
    minAge: 30,
    maxAge: 60,
    minValue: 800000,
    maxValue: 4000000,
    value: 2500000,
    vehicleClass: ["COMMERCIAL"],
    ExcludedMakes: ["Tata"],
    underwriter: "DEF Insurance",
    tonnage: 10,
    passengers: null,
    coverPeriod: null
  },
  {
    name: "Comprehensive Cover - Luxury SUV",
    coverage: "COMPREHENSIVE",
    yearOfManufacture: 2022,
    minAge: 28,
    maxAge: 65,
    minValue: 2000000,
    maxValue: 8000000,
    value: 5000000,
    vehicleClass: ["PRIVATE", "SUV"],
    ExcludedMakes: ["Great Wall"],
    underwriter: "Luxury Insure Co",
    coverPeriod: null,
    tonnage: null,
    passengers: null
  },
  {
    name: "Third Party Only - General Cartage",
    coverage: "THIRD_PARTY_ONLY",
    coverPeriod: 12,
    minAge: 23,
    maxAge: 65,
    vehicleClass: ["GENERAL_CARTAGE"],
    tonnage: 5,
    passengers: null,
    ExcludedMakes: [],
    underwriter: "Haulage Insurance Ltd",
    value: null
  }
];

async function main() {
  console.log("🌱 Seeding test products...");

  for (const product of products) {
    await prisma.product.create({
      data: product
    });
  }

  console.log(`✅ Seeded ${products.length} products.`);
}

main()
  .catch((err) => {
    console.error("❌ Error seeding products:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
