const { PrismaClient, VehicleClass, CoverageType, CoverPeriod } = require("@prisma/client");
const prisma = new PrismaClient();

exports.fetchQuote = async (req, res) => {
  try {
    console.log("👉 Incoming request body:", req.body);

    const { vehicleClass, coverage, coverPeriod, agentcode, make, value, yearOfManufacture, passengers } = req.body;

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

    // ✅ Step 2: Fetch matching products
    const products = await prisma.product.findMany({
      where: {
        vehicleClass: enumVehicleClass,
        coverage: enumCoverage,
        coverPeriod: enumCoverPeriod,
      },
    });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No matching product found" });
    }

    // ✅ Step 3: Basic premium calculation (example logic)
    const product = products[0];
    let premium = Math.max(product.rate * value, product.minimumPremium || 15000);

    return res.json({
      message: "Quote fetched successfully",
      product: product.name,
      vehicleClass: enumVehicleClass,
      coverage: enumCoverage,
      coverPeriod: enumCoverPeriod,
      premium,
    });
  } catch (err) {
    console.error("❌ Error fetching quote:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
