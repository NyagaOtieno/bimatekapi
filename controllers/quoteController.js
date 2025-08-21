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
  tonnage: Joi.number().integer().min(1).allow(null),
});

// ========================
// HELPERS
// ========================
function normalizeVehicleClass(vehicleClass, coverage) {
  if (vehicleClass === 'GENERAL_CARTAGE' && coverage === CoverageType.THIRD_PARTY_ONLY) {
    return 'MOTORVEHICLE_COMMERCIAL_OWN_GOODS';
  }
  return vehicleClass;
}

// Existing calculatePremium functions remain unchanged...

// ========================
// CONTROLLERS
// ========================

// FETCH QUOTE (calculate-only, no save, no ID!)
exports.fetchQuote = async (req, res) => {
  try {
    const { error, value } = searchValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    let { vehicleClass, coverage, coverPeriod, agentcode, make, value: vehicleValue, passengers, tonnage } = value;
    vehicleClass = normalizeVehicleClass(vehicleClass, coverage);

    // Convert coverPeriod string to enum
    if (!CoverPeriod[coverPeriod]) {
      return res.status(400).json({ message: 'Invalid coverPeriod value' });
    }
    const coverPeriodEnum = CoverPeriod[coverPeriod];

    const products = await prisma.product.findMany({
      where: {
        vehicleClass: { has: vehicleClass },
        coverage,
        coverPeriod: coverPeriodEnum, // ✅ match enum properly
        agentcode,
        NOT: make ? { ExcludedMakes: { has: make } } : undefined,
      },
      include: { underwriter: true },
    });

    if (!products.length) {
      return res.status(404).json({ message: 'No matching product found' });
    }

    const results = products.map((product) => {
      const premium = calculatePremium(product, coverage, vehicleClass, vehicleValue, tonnage, passengers);
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
        underwriter: product.underwriter,
      };
    });

    res.json({ message: 'Quote fetched successfully', products: results });
  } catch (err) {
    console.error('Failed to fetch quote:', err);
    res.status(500).json({ message: 'Failed to fetch quote', error: err.message });
  }
};

// SEARCH QUOTES (alias)
exports.searchQuotes = exports.fetchQuote;
