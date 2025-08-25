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

  if (coverage === "COMPREHENSIVE") {
    if (vehicleValue == null) return null;

    // ✅ Use rate derived from DB (already normalized below)
    const calcPremium = (vehicleValue * (product.rate || 0)) / 100;

    // ✅ Apply minimum premium rule
    premium = Math.max(calcPremium, product.minimumPremium || 0);
  } else if (
    coverage === "THIRD_PARTY_ONLY" &&
    (product.vehicleClass.includes("PSV_MATATU") || product.vehicleClass.includes("PSV_BUS"))
  ) {
    if (passengers == null) return null;
    if (product.passengers !== passengers) return null;
    const premiumField = COVER_PERIOD_MAP[coverPeriod];
    premium = premiumField ? product[premiumField] : null;
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
  const { vehicleValue, vehicleAge, tonnage, agentCode, make } = filters;

  if (product.agentcode && agentCode && product.agentcode !== agentCode) return false;

  if (vehicleValue != null) {
    if ((product.minValue != null && vehicleValue < product.minValue) ||
        (product.maxValue != null && vehicleValue > product.maxValue)) {
      return false;
    }
  }

  if (vehicleAge != null) {
    if ((product.minAge != null && vehicleAge < product.minAge) ||
        (product.maxAge != null && vehicleAge > product.maxAge)) {
      return false;
    }
  }

  if ((product.vehicleClass.includes("MOTORVEHICLE_OWN_GOODS") ||
       product.vehicleClass.includes("MOTORVEHICLE_GENERAL_CARTAGE")) &&
      tonnage != null) {
    if ((product.minTonnage != null && tonnage < product.minTonnage) ||
        (product.maxTonnage != null && tonnage > product.maxTonnage)) {
      return false;
    }
  }

  if (make && product.excludedMakes && product.excludedMakes.includes(make.toUpperCase())) {
    return false;
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
      yearOfManufacture,
      tonnage,
      passengers,
      agentCode,
      make,
    } = req.body;

    vehicleClass = normalize(vehicleClass);
    coverage = normalize(coverage);
    coverPeriod = coverPeriod ? normalize(coverPeriod) : null;

    if (!vehicleClass || !coverage) {
      return res.status(400).json({ message: "vehicleClass and coverage are required" });
    }

    const vehicleAge = yearOfManufacture ? new Date().getFullYear() - yearOfManufacture : null;

    let products = await prisma.product.findMany({
      where: {
        vehicleClass: { has: vehicleClass },
        coverage,
      },
      include: { underwriter: true },
    });

    console.log("Products fetched:", products.length);

    if (!products.length) return res.status(404).json({ message: "No matching product found" });

    // ✅ Map product.rate from premium fields (esp. premium_annual for COMPREHENSIVE)
    products = products.map((p) => {
      if (!p.rate) {
        const premiumField = COVER_PERIOD_MAP[coverPeriod || "ONE_YEAR"];
        if (premiumField && p[premiumField]) {
          p.rate = p[premiumField]; // e.g., 3 → meaning 3%
        }
      }
      return p;
    });

    const quotes = products
      .filter((product) => {
        const eligible = checkEligibility(product, { vehicleValue, vehicleAge, tonnage, agentCode, make });
        if (!eligible) console.log(`Product ${product.name} not eligible`);
        return eligible;
      })
      .map((product) => {
        const premium = calculatePremium(product, coverage, coverPeriod, vehicleValue, passengers);

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

    if (!quotes.length) return res.status(404).json({ message: "No eligible product found" });

    return res.json({ message: "Quotes fetched successfully", count: quotes.length, data: quotes });
  } catch (err) {
    console.error("❌ Error fetching quote:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
