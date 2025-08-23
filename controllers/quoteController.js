// controllers/quoteController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ========================
// COVER PERIOD → PREMIUM FIELD MAP
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
// Helpers
// ========================
function normalize(str) {
  if (!str) return null;
  return str.toUpperCase().replace(/\s+/g, "_");
}

function calculatePremium(product, coverage, coverPeriod, vehicleValue) {
  let premium = null;

  if (coverage === "COMPREHENSIVE") {
    if (!vehicleValue) {
      throw new Error("vehicleValue is required for COMPREHENSIVE cover");
    }

    // Premium = rate × value, enforce minimumPremium
    const calcPremium = (vehicleValue * (product.rate || 0)) / 100;
    premium = Math.max(calcPremium, product.minimumPremium || 0);
  } else {
    // Third party → select fixed premium from DB
    const premiumField = COVER_PERIOD_MAP[coverPeriod];
    premium = premiumField ? product[premiumField] : product.basePremium;
  }

  return premium;
}

// ========================
// Fetch Quote Controller
// ========================
exports.fetchQuote = async (req, res) => {
  try {
    let { vehicleClass, coverage, coverPeriod, vehicleValue } = req.body;

    // Normalize inputs
    vehicleClass = normalize(vehicleClass);
    coverage = normalize(coverage);
    coverPeriod = coverPeriod ? normalize(coverPeriod) : null;

    if (!vehicleClass || !coverage) {
      return res.status(400).json({
        message: "vehicleClass and coverage are required",
      });
    }

    // Fetch all matching products
    const products = await prisma.product.findMany({
      where: {
        vehicleClass: { has: vehicleClass },
        coverage: coverage,
      },
      include: { underwriter: true },
    });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No matching product found" });
    }

    // Compute premium for each product
    const quotes = products.map((product) => {
      let premium = null;

      try {
        premium = calculatePremium(product, coverage, coverPeriod, vehicleValue);
      } catch (err) {
        premium = null; // skip if invalid (e.g., missing vehicleValue)
      }

      return {
        productId: product.id,
        productName: product.name,
        underwriter: product.underwriter?.name || "Unknown",
        vehicleClass,
        coverage,
        coverPeriod: coverPeriod || "BASE",
        rate: product.rate,
        minimumPremium: product.minimumPremium,
        premium,
      };
    });

    return res.json({
      message: "Quotes fetched successfully",
      count: quotes.length,
      data: quotes,
    });
  } catch (err) {
    console.error("❌ Error fetching quote:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
