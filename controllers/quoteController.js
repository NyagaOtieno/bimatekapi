// controllers/quoteController.js
const { PrismaClient, VehicleClass, CoverageType, CoverPeriod } = require("@prisma/client");
const prisma = new PrismaClient();

exports.fetchQuote = async (req, res) => {
  try {
    console.log("👉 Incoming request body:", req.body);

    const {
      vehicleClass,
      coverage,
      coverPeriod,
      agentcode,
      make,
      value,
      yearOfManufacture,
      passengers
    } = req.body;

    // ✅ Step 1: Map inputs safely to Prisma enums
    const enumVehicleClass = VehicleClass[vehicleClass];
    const enumCoverage = CoverageType[coverage];
    const enumCoverPeriod = CoverPeriod[coverPeriod];

    if (!enumVehicleClass || !enumCoverage || !enumCoverPeriod) {
      return res.status(400).json({
        message: "Invalid enum values",
        details: {
          vehicleClass,
          coverage,
          coverPeriod,
        },
      });
    }

    // ✅ Step 2: Fetch matching products (vehicleClass is an enum[])
    const products = await prisma.product.findMany({
      where: {
        vehicleClass: { has: enumVehicleClass }, // ✅ FIX: handle enum[]
        coverage: enumCoverage,
        coverPeriod: enumCoverPeriod,
        agentcode: agentcode || undefined,
      },
      include: { underwriter: true },
    });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No matching product found" });
    }

    // ✅ Step 3: Calculate premium (simple example)
    const product = products[0];
    let premium = product.minimumPremium || 15000;

    if (value && product.rate) {
      premium = Math.max(product.rate * value, premium);
    }

    // Apply passenger / age checks if present
    if (passengers && product.maxSeats && passengers > product.maxSeats) {
      return res.status(400).json({ message: "Too many passengers for this product" });
    }
    if (yearOfManufacture) {
      const age = new Date().getFullYear() - yearOfManufacture;
      if (product.maxAge && age > product.maxAge) {
        return res.status(400).json({ message: "Vehicle too old for this product" });
      }
    }

    return res.json({
      message: "Quote fetched successfully",
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        vehicleClass: product.vehicleClass,
        coverage: product.coverage,
        coverPeriod: product.coverPeriod,
        agentcode: product.agentcode,
        underwriter: product.underwriter?.name,
      },
      premium,
    });
  } catch (err) {
    console.error("❌ Error fetching quote:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
