// controllers/quoteController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ========================
// COVER PERIOD → PREMIUM MAP
// ========================
const COVER_PERIOD_MAP = {
  WEEK: "premium_week",
  TWO_WEEKS: "premium_2weeks",
  MONTH: "premium_month",
  THREE_MONTHS: "premium_3months",
  SIX_MONTHS: "premium_6months",
  ANNUAL: "premium_annual",
};

// ========================
// Helper: normalize strings
// ========================
function normalize(str) {
  if (!str) return null;
  return str.toUpperCase().replace(/\s+/g, "_");
}

// ========================
// Fetch Quote
// ========================
exports.fetchQuote = async (req, res) => {
  try {
    let { vehicleClass, coverage, coverPeriod } = req.body;

    // Normalize inputs
    vehicleClass = normalize(vehicleClass);
    coverage = normalize(coverage);
    coverPeriod = coverPeriod ? normalize(coverPeriod) : null;

    if (!vehicleClass || !coverage) {
      return res.status(400).json({
        message: "vehicleClass and coverage are required",
      });
    }

    // Fetch matching product
    const product = await prisma.product.findFirst({
      where: {
        vehicleClass: {
          has: vehicleClass, // vehicleClass is stored as array[]
        },
        coverage: coverage,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "No matching product found" });
    }

    // ========================
    // Determine premium
    // ========================
    let selectedPremium = null;

    if (coverPeriod) {
      const premiumField = COVER_PERIOD_MAP[coverPeriod];
      if (premiumField && product[premiumField] != null) {
        selectedPremium = product[premiumField];
      }
    }

    // If no coverPeriod provided, or premium not found → fallback to basePremium
    if (!selectedPremium) {
      selectedPremium = product.basePremium || null;
    }

    return res.json({
      message: "Quote fetched successfully",
      data: {
        productId: product.id,
        vehicleClass,
        coverage,
        coverPeriod: coverPeriod || "BASE",
        premium: selectedPremium,
      },
    });
  } catch (err) {
    console.error("Error fetching quote:", err);
    res.status(500).json({ message: "Server error" });
  }
};
