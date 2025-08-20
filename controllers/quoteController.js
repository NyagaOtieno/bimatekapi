const { PrismaClient, CoverageType } = require('@prisma/client');
const prisma = new PrismaClient();
const Joi = require('joi');

// ========================
// VALIDATION SCHEMAS
// ========================
const searchValidationSchema = Joi.object({
  vehicleClass: Joi.string().required(),
  coverage: Joi.string().valid(...Object.values(CoverageType)).required(),
  coverPeriod: Joi.string().required(),
  agentcode: Joi.string().required(),
  make: Joi.string().allow(null, ''),
  model: Joi.string().allow(null, ''),
  vehicle_reg: Joi.string().allow(null, ''),
  value: Joi.number().positive().allow(null),
  yearOfManufacture: Joi.number().integer().min(1980).allow(null),
  passengers: Joi.number().integer().min(1).allow(null),
  tonnage: Joi.number().integer().min(1).allow(null),
});

const saveQuoteValidationSchema = Joi.object({
  productId: Joi.number().required(),
  vehicle_reg: Joi.string().allow(null, ''),
  make: Joi.string().allow(null, ''),
  model: Joi.string().allow(null, ''),
  value: Joi.number().positive().allow(null),
  yearOfManufacture: Joi.number().integer().min(1980).allow(null),
  passengers: Joi.number().integer().min(1).allow(null),
  tonnage: Joi.number().integer().min(1).allow(null),
  coverPeriod: Joi.string().required(),
  coverage: Joi.string().valid(...Object.values(CoverageType)).required(),
  agentcode: Joi.string().required(),
  name_contact: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  phone_number: Joi.string().pattern(/^[0-9+\-() ]{7,20}$/).required(),
  price: Joi.number().positive().required(), // client sends chosen premium
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

function calculateTpoPremium(vehicleClass, basePremium, tonnage, passengers) {
  switch (vehicleClass) {
    case 'MOTORVEHICLE_PRIVATE':
      return basePremium || 7500;
    case 'MOTORVEHICLE_OWN_GOODS':
    case 'GENERAL_CARTAGE':
      if (!tonnage) throw new Error('Tonnage is required for Commercial/Cartage TPO');
      return (basePremium || 7500) + Math.ceil(tonnage / 1000) * 100;
    case 'PSV_MATATU':
    case 'PSV_BUS':
      if (!passengers) throw new Error('Number of passengers is required for PSV TPO');
      return (basePremium || 7500) + passengers * 200;
    default:
      throw new Error(`Unsupported vehicle class for TPO: ${vehicleClass}`);
  }
}

function calculatePremium(product, coverage, vehicleClass, vehicleValue, tonnage, passengers) {
  switch (coverage) {
    case CoverageType.COMPREHENSIVE:
      return vehicleValue
        ? vehicleValue * (product.premium_annual || 0)
        : product.premium_annual || product.basePremium || 0;
    case CoverageType.THIRD_PARTY_ONLY:
      return calculateTpoPremium(vehicleClass, product.basePremium, tonnage, passengers);
    case CoverageType.THIRD_PARTY_FIRE_AND_THEFT:
      return product.premium_annual || product.basePremium || 0;
    default:
      throw new Error(`Unsupported coverage type: ${coverage}`);
  }
}

// Compare premiums with tolerance
function premiumsMatch(clientPrice, serverPrice) {
  return Math.abs(clientPrice - serverPrice) < 1;
}

// Reusable error handler
function handleError(res, err, contextMessage) {
  console.error(`${contextMessage} error:`, err);
  return res.status(500).json({ message: contextMessage, error: err.message });
}

// ========================
// CONTROLLERS
// ========================

// SEARCH (no save)
exports.searchQuotes = async (req, res) => {
  try {
    const { error, value } = searchValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    let { vehicleClass, coverage, coverPeriod, agentcode, make, value: vehicleValue, passengers, tonnage } = value;
    vehicleClass = normalizeVehicleClass(vehicleClass, coverage);

    const products = await prisma.product.findMany({
      where: {
        vehicleClass: { has: vehicleClass },
        coverage,
        coverPeriod,
        agentcode,
        NOT: make ? { ExcludedMakes: { has: make } } : undefined,
      },
    });

    if (!products.length) {
      return res.status(404).json({ message: 'No matching product found' });
    }

    const results = products.map((product) => {
      const premium = calculatePremium(product, coverage, vehicleClass, vehicleValue, tonnage, passengers);
      return { ...product, calculatedPremium: premium };
    });

    res.json({ message: 'Matching products found', products: results });
  } catch (err) {
    return handleError(res, err, 'Failed to search quotes');
  }
};

// SAVE selected quote
exports.createQuote = async (req, res) => {
  try {
    const { error, value } = saveQuoteValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const {
      productId,
      agentcode,
      vehicle_reg,
      make,
      model,
      value: vehicleValue,
      yearOfManufacture,
      passengers,
      tonnage,
      coverPeriod,
      coverage,
      price,
      name_contact,
      email,
      phone_number,
    } = value;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const normalizedClass = normalizeVehicleClass(product.vehicleClass[0], coverage);
    const validatedPremium = calculatePremium(product, coverage, normalizedClass, vehicleValue, tonnage, passengers);

    if (!premiumsMatch(price, validatedPremium)) {
      return res.status(400).json({
        message: 'Premium mismatch. Please use server-calculated premium.',
        validatedPremium,
      });
    }

    const quote = await prisma.quote.create({
      data: {
        productId,
        agentcode,
        vehicle_reg: vehicle_reg || null,
        make: make || null,
        model: model || null,
        value: vehicleValue || null,
        yearOfManufacture: yearOfManufacture || null,
        passengers: passengers || null,
        tonnage: tonnage || null,
        coverPeriod,
        coverage,
        price: validatedPremium,
        name_contact,
        email,
        phone_number,
      },
      include: { product: true },
    });

    res.status(201).json({ message: 'Quote saved successfully', quote });
  } catch (err) {
    return handleError(res, err, 'Failed to save quote');
  }
};

// GET all quotes
exports.getQuotes = async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({ include: { product: true } });
    res.json({ quotes });
  } catch (err) {
    return handleError(res, err, 'Failed to fetch quotes');
  }
};

// GET by ID
exports.getQuoteById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Invalid quote ID' });
    }

    const quote = await prisma.quote.findUnique({
      where: { id: Number(id) },
      include: { product: true },
    });

    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    res.json({ quote });
  } catch (err) {
    return handleError(res, err, 'Failed to fetch quote');
  }
};

// DELETE
exports.deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Invalid quote ID' });
    }

    await prisma.quote.delete({ where: { id: Number(id) } });
    res.json({ message: 'Quote deleted successfully' });
  } catch (err) {
    return handleError(res, err, 'Failed to delete quote');
  }
};
