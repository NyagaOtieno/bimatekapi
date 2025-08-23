// controllers/quoteController.js
const { PrismaClient, CoverageType, CoverPeriod } = require('@prisma/client');
const prisma = new PrismaClient();
const Joi = require('joi');

// ========================
// VALIDATION SCHEMAS
// ========================
const coverPeriods = Object.values(CoverPeriod);

const searchValidationSchema = Joi.object({
  vehicleClass: Joi.string().required(),
  coverage: Joi.string().valid(...Object.values(CoverageType)).required(),
  coverPeriod: Joi.string().valid(...coverPeriods).required(),
  agentcode: Joi.string().required(),
  make: Joi.string().allow(null, ''),
  model: Joi.string().allow(null, ''),
  vehicle_reg: Joi.string().allow(null, ''),
  value: Joi.number().positive().allow(null),
  yearOfManufacture: Joi.number().integer().min(1980).allow(null),
  passengers: Joi.number().integer().min(1).allow(null),
  tonnage: Joi.number().positive().allow(null),
});

// ========================
// HELPERS
// ========================
function normalizeVehicleClass(vehicleClass, coverage) {
  if (vehicleClass === 'GENERAL_CARTAGE' && coverage === CoverageType.THIRD_PARTY_ONLY) {
    return 'MOTORVEHICLE_OWN_GOODS';
  }
  return vehicleClass;
}

function getPremiumForPeriod(product, coverPeriod) {
  switch (coverPeriod) {
    case CoverPeriod.ONE_WEEK: return product.premium_week ?? product.minimumPremium ?? 0;
    case CoverPeriod.TWO_WEEKS: return product.premium_2weeks ?? product.minimumPremium ?? 0;
    case CoverPeriod.ONE_MONTH: return product.premium_month ?? product.minimumPremium ?? 0;
    case CoverPeriod.THREE_MONTHS: return product.premium_3months ?? product.minimumPremium ?? 0;
    case CoverPeriod.SIX_MONTHS: return product.premium_6months ?? product.minimumPremium ?? 0;
    case CoverPeriod.ONE_YEAR: return product.premium_annual ?? product.minimumPremium ?? 0;
    default: return product.minimumPremium ?? 0;
  }
}

function calculatePremium(product, vehicleClass, vehicleValue, tonnage, passengers, coverPeriod) {
  let premium = getPremiumForPeriod(product, coverPeriod);

  if (vehicleClass.includes("PSV") && passengers && product.maxSeats && passengers > product.maxSeats) return null;
  if ((vehicleClass.includes("OWN_GOODS") || vehicleClass.includes("GENERAL_CARTAGE")) && tonnage && product.tonnage && tonnage > product.tonnage) return null;
  if (product.coverage === CoverageType.COMPREHENSIVE && vehicleValue) premium = Math.max(premium, vehicleValue * 0.05);

  return premium;
}

// ========================
// CONTROLLERS
// ========================
exports.fetchQuote = async (req, res) => {
  try {
    const { error, value } = searchValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    let { vehicleClass, coverage, coverPeriod, agentcode, make, value: vehicleValue, passengers, tonnage, yearOfManufacture } = value;
    vehicleClass = normalizeVehicleClass(vehicleClass, coverage);

    if (!CoverPeriod[coverPeriod]) return res.status(400).json({ message: 'Invalid coverPeriod value' });
    const coverPeriodEnum = CoverPeriod[coverPeriod];

    // ========================
    // STRICT DB FILTER
    // ========================
    const where = {
      vehicleClass: { has: vehicleClass },
      coverage,
      agentcode,
      coverPeriod: coverPeriodEnum,
      minimumPremium: vehicleValue ? { lte: vehicleValue } : undefined,
      minAge: yearOfManufacture ? { lte: new Date().getFullYear() - yearOfManufacture } : undefined,
      maxAge: yearOfManufacture ? { gte: new Date().getFullYear() - yearOfManufacture } : undefined,
    };

    let products = await prisma.product.findMany({
      where,
      include: { underwriter: true },
    });

    // Exclude makes in JS (Prisma v6 safe)
    if (make) products = products.filter(p => !p.ExcludedMakes?.includes(make));

    // Business rules filtering
    products = products.filter(product => {
      if (vehicleClass.includes("PSV") && passengers) {
        if (product.minSeats && passengers < product.minSeats) return false;
        if (product.maxSeats && passengers > product.maxSeats) return false;
      }
      if ((vehicleClass.includes("OWN_GOODS") || vehicleClass.includes("GENERAL_CARTAGE")) && tonnage) {
        if (product.tonnage && tonnage > product.tonnage) return false;
      }
      if (yearOfManufacture && product.minAge && product.maxAge) {
        const age = new Date().getFullYear() - yearOfManufacture;
        if (age < product.minAge || age > product.maxAge) return false;
      }
      if (vehicleValue && product.minValue && product.maxValue) {
        if (vehicleValue < product.minValue || vehicleValue > product.maxValue) return false;
      }
      return true;
    });

    if (!products.length) return res.status(404).json({ message: 'No matching product found' });

    const results = products.map(product => {
      const premium = calculatePremium(product, vehicleClass, vehicleValue, tonnage, passengers, coverPeriodEnum);
      if (premium === null) return null;
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        agentcode: product.agentcode,
        vehicleClass: product.vehicleClass,
        coverage: product.coverage,
        coverPeriod: product.coverPeriod,
        minimumPremium: product.minimumPremium,
        calculatedPremium: premium,
        underwriter: { id: product.underwriter.id, name: product.underwriter.name },
      };
    }).filter(Boolean);

    if (!results.length) return res.status(404).json({ message: 'No matching product found after business rules check' });

    res.json({ message: 'Quote fetched successfully', products: results });
  } catch (err) {
    console.error('❌ Failed to fetch quote:', err);
    res.status(500).json({ message: 'Failed to fetch quote', error: err.message });
  }
};

// Alias
exports.searchQuotes = exports.fetchQuote;
