// controllers/quoteController.js
const { PrismaClient, VehicleClass, CoverageType, CoverPeriod } = require("@prisma/client");
const prisma = new PrismaClient();

exports.fetchQuote = async (req, res) => {
  try {
    console.log("👉 Incoming request body:", req.body);

    const { vehicleClass, coverage, coverPeriod, value } = req.body;

    // Normalize strings to match enum format
    const normalizedVehicleClass = vehicleClass?.toUpperCase().replace(/\s+/g, "_");
    const normalizedCoverage = coverage?.toUpperCase().replace(/\s+/g, "_");
    const normalizedCoverPeriod = coverPeriod?.toUpperCase().replace(/\s+/g, "_");

    // Validate enums
    if (!Object.values(VehicleClass).includes(normalizedVehicleClass)) {
      return res.status(400).json({ message: `Invalid vehicleClass: ${vehicleClass}` });
    }
    if (!Object.values(CoverageType).includes(normalizedCoverage)) {
      return res.status(400).json({ message: `Invalid coverage: ${coverage}` });
    }
    if (!Object.values(CoverPeriod).includes(normalizedCoverPeriod)) {
      return res.status(400).json({ message: `Invalid coverPeriod: ${coverPeriod}` });
    }

    // ✅ Query: vehicleClass is an array → use `has`
    const products = await prisma.product.findMany({
      where: {
        vehicleClass: { has: normalizedVehicleClass }, // ✅ array contains enum
        coverage: normalizedCoverage,
        coverPeriod: normalizedCoverPeriod,
      },
      include: { underwriter: true },
    });

    console.log("🔍 Products found:", products.length);

    if (!products.length) {
      // Helpful debug log
      const allProducts = await prisma.product.findMany({
        select: { id: true, vehicleClass: true, coverage: true, coverPeriod: true },
      });
      console.log("📦 All products in DB:", allProducts);

      return res.status(404).json({ message: "No matching product found" });
    }

    // Example premium calculation
    const product = products[0];
    let premium = Math.max(product.basePremium ?? 0, product.minimumPremium ?? 15000);
    if (value && product.coverage === "COMPREHENSIVE") {
      premium = Math.max(premium, value * 0.05);
    }

    return res.json({
      message: "Quote fetched successfully",
      product: {
        id: product.id,
        name: product.name,
        coverage: product.coverage,
        vehicleClass: product.vehicleClass,
        coverPeriod: product.coverPeriod,
        premium,
        underwriter: product.underwriter,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching quote:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
