const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const COVER_PERIOD_MAP = {
  ONE_WEEK: "premium_week",
  TWO_WEEKS: "premium_2weeks",
  ONE_MONTH: "premium_month",
  THREE_MONTHS: "premium_3months",
  SIX_MONTHS: "premium_6months",
  ONE_YEAR: "premium_annual",
};

function normalize(str) {
  return str ? str.toUpperCase().replace(/\s+/g, "_") : null;
}

// ========================
// Premium Calculation
// ========================
function calculatePremium(product, coverage, coverPeriod, vehicleValue, passengers) {
  let premium = null;

  // ✅ Comprehensive → rate * value (respect minPremium)
  if (coverage === "COMPREHENSIVE") {
    if (vehicleValue == null) return null;
    const calcPremium = (vehicleValue * (product.rate || 0)) / 100;
    premium = Math.max(calcPremium, product.minimumPremium || 0);
  }

  // ✅ PSV Matatu / PSV Bus (TPO only) → use seat count + coverPeriod
  else if (
    coverage === "THIRD_PARTY_ONLY" &&
    (product.vehicleClass.includes("PSV_MATATU") || product.vehicleClass.includes("PSV_BUS"))
  ) {
    if (passengers == null) return null;
    if (product.passengers !== passengers) return null; // only match exact seat product

    const premiumField = COVER_PERIOD_MAP[coverPeriod];
    premium = premiumField ? product[premiumField] : null;
  }

  // ✅ TPFT or other TPO (non-PSV) → just return premium for the period
  else {
    const premiumField = COVER_PERIOD_MAP[coverPeriod];
    premium = premiumField ? product[premiumField] : product.basePremium;
  }

  return premium;
}

// ========================
// Eligibility Check
// ========================
function checkEligibility(product, filters) {
  const { vehicleValue, vehicleAge, tonnage, agentCode } = filters;

  // ✅ Agent check
  if (product.agentcode && agentCode && product.agentcode !== agentCode) {
    return false;
  }

  // ✅ Vehicle value range
  if (vehicleValue != null) {
    if (
      (product.minValue != null && vehicleValue < product.minValue) ||
      (product.maxValue != null && vehicleValue > product.maxValue)
    ) {
      return false;
    }
  }

  // ✅ Vehicle age
  if (vehicleAge != null) {
    if (
      (product.minAge != null && vehicleAge < product.minAge) ||
      (product.maxAge != null && vehicleAge > product.maxAge)
    ) {
      return false;
    }
  }

  // ✅ Tonnage checks
  if (
    product.vehicleClass.includes("MOTORVEHICLE_OWN_GOODS") ||
    product.vehicleClass.includes("MOTORVEHICLE_GENERAL_CARTAGE")
  ) {
    if (
      tonnage != null &&
      ((product.minTonnage != null && tonnage < product.minTonnage) ||
        (product.maxTonnage != null && tonnage > product.maxTonnage))
    ) {
      return false;
    }
  }

  // ⚠️ NOTE: no passenger check here — handled in premium calculation
  return true;
}

// ========================
// Fetch Quote Controller
// ========================
exports.fetchQuote = async (req, res) => {
  try {
    let {
      vehicleClass,
      coverage,
      coverPeriod,
      vehicleValue,
      vehicleAge,
      tonnage,
      passengers,
      agentCode,
    } = req.body;

    vehicleClass = normalize(vehicleClass);
    coverage = normalize(coverage);
    coverPeriod = coverPeriod ? normalize(coverPeriod) : null;

    if (!vehicleClass || !coverage) {
      return res.status(400).json({
        message: "vehicleClass and coverage are required",
      });
    }

    // Fetch candidate products
    const products = await prisma.product.findMany({
      where: {
        vehicleClass: { has: vehicleClass },
        coverage,
      },
      include: { underwriter: true },
    });

    if (!products.length) {
      return res.status(404).json({ message: "No matching product found" });
    }

    // Filter and calculate
    const quotes = products
      .filter((product) =>
        checkEligibility(product, { vehicleValue, vehicleAge, tonnage, agentCode })
      )
      .map((product) => {
        const premium = calculatePremium(
          product,
          coverage,
          coverPeriod,
          vehicleValue,
          passengers
        );

        return {
          productId: product.id,
          productName: product.name,
          underwriter: product.underwriter?.name || "Unknown",
          vehicleClass,
          coverage,
          coverPeriod: coverPeriod || "BASE",
          passengers: product.passengers || null,
          rate: product.rate,
          minimumPremium: product.minimumPremium,
          premium,
        };
      })
      .filter((q) => q.premium != null);

    if (!quotes.length) {
      return res.status(404).json({ message: "No eligible product found" });
    }

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
