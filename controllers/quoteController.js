const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const COVER_PERIOD_MAP = {
  ONE_WEEK: "premium_week",
  TWO_WEEKS: "premium_2weeks",
  ONE_MONTH: "premium_month",
  THREE_MONTHS: "premium_3months",
  SIX_MONTHS: "premium_6months",
  ONE_YEAR: "basePremium",   // ✅ For TPO / TPFT
  ANNUAL: "premium_annual",  // ✅ For Comprehensive (rate %)
};

function normalize(str) {
  return str ? str.toUpperCase().replace(/\s+/g, "_") : null;
}

// ========================
// Premium Calculation
// ========================
function calculatePremium(product, coverage, coverPeriod, vehicleValue, passengers) {
  let premium = null;

  // ✅ Comprehensive
  if (coverage === "COMPREHENSIVE") {
    if (!(coverPeriod === "ANNUAL" || coverPeriod === "ONE_YEAR")) {
      throw new Error("Comprehensive only supports ANNUAL/ONE_YEAR cover");
    }
    if (vehicleValue == null) return null;

    const calcPremium = (vehicleValue * (product.premium_annual || 0)) / 100;
    premium = Math.max(calcPremium, product.minimumPremium || 0);
  }

  // ✅ PSV (Matatu / Bus) → per seat × coverPeriod premium
  else if (
    (coverage === "THIRD_PARTY_ONLY" || coverage === "THIRD_PARTY_FIRE_AND_THEFT") &&
    (product.vehicleClass.includes("PSV_MATATU") || product.vehicleClass.includes("PSV_BUS"))
  ) {
    if (!passengers) return null;
    const premiumField = COVER_PERIOD_MAP[coverPeriod];
    if (!premiumField) return null;
    premium = (product[premiumField] || 0) * passengers;
  }

  // ✅ All other TPO / TPFT
  else if (coverage === "THIRD_PARTY_ONLY" || coverage === "THIRD_PARTY_FIRE_AND_THEFT") {
    const premiumField = COVER_PERIOD_MAP[coverPeriod];
    premium = premiumField ? product[premiumField] : product.basePremium;
  }

  // ✅ fallback
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

  // ✅ Fixed ExcludedMakes field name
  if (make && product.ExcludedMakes && product.ExcludedMakes.includes(make.toUpperCase())) {
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

    const products = await prisma.product.findMany({
      where: {
        vehicleClass: { has: vehicleClass },
        coverage,
      },
      include: { underwriter: true },
    });

    console.log("Products fetched:", products.length);

    if (!products.length) return res.status(404).json({ message: "No matching product found" });

    const quotes = products
      .filter((product) => {
        const eligible = checkEligibility(product, { vehicleValue, vehicleAge, tonnage, agentCode, make });
        if (!eligible) console.log(`Product ${product.name} not eligible`);
        return eligible;
      })
      .map((product) => {
        let premium;
        try {
          premium = calculatePremium(product, coverage, coverPeriod, vehicleValue, passengers);
        } catch (err) {
          return { error: err.message, productId: product.id };
        }

        return {
          productId: product.id,
          productName: product.name,
          underwriter: product.underwriter?.name || "Unknown",
          vehicleClass,
          coverage,
          coverPeriod: coverPeriod || "BASE",
          passengers: passengers || null,
          rate: product.premium_annual,
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
exports.saveQuote = async (req, res) => {
  try {
    const {
      productId,
      userId,          // optional, if logged-in user exists
      vehicleReg,
      make,
      model,
      yearOfManufacture,
      value,
      tonnage,
      passengers,
      coverage,
      coverPeriod,
      agentCode,
      contactName,
      email,
      phoneNumber,
      price
    } = req.body;

    // Validate required fields
    if (!productId || !vehicleReg || !coverage || !coverPeriod || !contactName || !email || !phoneNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Ensure product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Save quote
    const quote = await prisma.quote.create({
      data: {
        productId,
        userId: userId || null,
        vehicleReg,
        make,
        model,
        yearOfManufacture,
        value,
        tonnage,
        passengers,
        cover: coverage,
        coverPeriod,
        agentCode,
        price,
        contactName,
        email,
        phoneNumber,
      },
    });

    return res.status(201).json({
      message: "Quote saved successfully. Valid for 30 days.",
      data: quote,
    });
  } catch (err) {
    console.error("❌ Error saving quote:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
