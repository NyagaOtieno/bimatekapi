// controllers/quoteController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * POST /api/quotes/fetch
 * Fetches a matching product and calculates premium
 */
exports.fetchQuote = async (req, res) => {
  try {
    const {
      vehicleClass,
      coverage,
      coverPeriod,
      agentcode,
      make,
      value,
      yearOfManufacture,
      passengers,
      tonnage,
    } = req.body;

    if (!vehicleClass || !coverage || !coverPeriod) {
      return res.status(400).json({
        message: "vehicleClass, coverage, and coverPeriod are required",
      });
    }

    // Build dynamic query filters
    const whereClause = {
      vehicleClass,
      coverage,
      coverPeriod,
    };

    // Optional filters (only add if provided in body)
    if (tonnage) whereClause.tonnage = tonnage;
    if (passengers) whereClause.passengers = passengers;

    // Try find product with loose matching first
    const product = await prisma.product.findFirst({
      where: whereClause,
    });

    if (!product) {
      return res.status(404).json({ message: "No matching product found" });
    }

    // ===== Premium calculation logic =====
    let premium = product.baseRate || 0;

    if (value) {
      premium = (value * (product.ratePercentage || 0)) / 100;
      if (product.minimumPremium && premium < product.minimumPremium) {
        premium = product.minimumPremium;
      }
    }

    // Adjust for passengers (if defined in DB)
    if (passengers && product.perPassengerRate) {
      premium += passengers * product.perPassengerRate;
    }

    // Adjust for tonnage (if defined in DB)
    if (tonnage && product.perTonneRate) {
      premium += tonnage * product.perTonneRate;
    }

    return res.json({
      message: "Quote generated successfully",
      product: {
        id: product.id,
        name: product.name,
        underwriter: product.underwriter,
        coverage: product.coverage,
        vehicleClass: product.vehicleClass,
        coverPeriod: product.coverPeriod,
      },
      premium,
      agentcode,
      make,
      value,
      yearOfManufacture,
      passengers,
      tonnage,
    });
  } catch (error) {
    console.error("Error fetching quote:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
