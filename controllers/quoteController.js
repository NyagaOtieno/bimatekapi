// controllers/quoteController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const COVER_PERIOD_MAP = {
  WEEK: "premium_week",
  TWO_WEEKS: "premium_2weeks",
  MONTH: "premium_month",
  THREE_MONTHS: "premium_3months",
  SIX_MONTHS: "premium_6months",
  ANNUAL: "premium_annual",
};

function normalize(str) {
  return str ? str.toUpperCase().replace(/\s+/g, "_") : null;
}

// ========================
// Premium Calculation
// ========================
function calculatePremium(product, coverage, coverPeriod, vehicleValue) {
  let premium = null;

  if (coverage === "COMPREHENSIVE") {
    if (!vehicleValue) return null;
    const calcPremium = (vehicleValue * (product.rate || 0)) / 100;
    premium = Math.max(calcPremium, product.minimumPremium || 0);
  } else {
    const premiumField = COVER_PERIOD_MAP[coverPeriod];
    premium = premiumField ? product[premiumField] : product.basePremium;
  }

  return premium;
}

// ========================
// Eligibility Check
// ========================
function checkEligibility(product, filters) {
  const {
    vehicleValue,
    vehicleAge,
    tonnage,
    passengers,
    agentCode,
  } = filters;

  // ✅ Agent check
  if (product.agentCode && agentCode && product.agentCode !== agentCode) {
    return false;
  }

  // ✅ Vehicle value range
  if (vehicleValue) {
    if (
      (product.minValue && vehicleValue < product.minValue) ||
      (product.maxValue && vehicleValue > product.maxValue)
    ) {
      return false;
    }
  }

  // ✅ Vehicle age
  if (vehicleAge) {
    if (
      (product.minAge && vehicleAge < product.minAge) ||
      (product.maxAge && vehicleAge > product.maxAge)
    ) {
      return false;
    }
  }

  // ✅ Tonnage checks for OWN GOODS / GENERAL CARTAGE
  if (
    product.vehicleClass.includes("MOTORVEHICLE_OWN_GOODS") ||
    product.vehicleClass.includes("MOTORVEHICLE_GENERAL_CARTAGE")
  ) {
    if (
      tonnage &&
      ((product.minTonnage && tonnage < product.minTonnage) ||
        (product.maxTonnage && tonnage > product.maxTonnage))
    ) {
      return false;
    }
  }

  // ✅ Passenger capacity checks for PSV
  if (
    product.vehicleClass.includes("PSV_MATATU") ||
    product.vehicleClass.includes("PSV_BUS")
  ) {
    if (
      passengers &&
      ((product.minPassengers && passengers < product.minPassengers) ||
        (product.maxPassengers && passengers > product.maxPassengers))
    ) {
      return false;
    }
  }

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

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No matching product found" });
    }

    // Filter by eligibility and calculate premium
    const quotes = products
      .filter((product) =>
        checkEligibility(product, {
          vehicleValue,
          vehicleAge,
          tonnage,
          passengers,
          agentCode,
        })
      )
      .map((product) => {
        const premium = calculatePremium(
          product,
          coverage,
          coverPeriod,
          vehicleValue
        );

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
      })
      .filter((q) => q.premium !== null); // drop invalid premiums

    if (quotes.length === 0) {
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
