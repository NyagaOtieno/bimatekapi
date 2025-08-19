const { PrismaClient, CoverageType } = require('@prisma/client');
const prisma = new PrismaClient();
const Joi = require('joi');

// Quote validation schema
const quoteValidationSchema = Joi.object({
  vehicleClass: Joi.string().required(),
  coverage: Joi.string().valid(...Object.values(CoverageType)).required(),
  coverPeriod: Joi.string().required(),
  agentcode: Joi.string().required(),
  make: Joi.string().allow(null, ''),
  model: Joi.string().allow(null, ''),
  value: Joi.number().positive().allow(null),
  yearOfManufacture: Joi.number().integer().allow(null),
  passengers: Joi.number().integer().allow(null),
  tonnage: Joi.number().integer().allow(null),
  name_contact: Joi.string().required(),
  email: Joi.string().email().required(),
  phone_number: Joi.string().required(),
});

// Helper: calculate premium for TPO classes
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

// Create a new quote
exports.createQuote = async (req, res) => {
  try {
    const { error, value } = quoteValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const {
      vehicleClass,
      coverage,
      coverPeriod,
      agentcode,
      make,
      model,
      value: vehicleValue,
      passengers,
      tonnage,
      name_contact,
      email,
      phone_number,
    } = value;

    // Fetch matching product
    const product = await prisma.product.findFirst({
      where: {
        vehicleClass: { has: vehicleClass },
        coverage: { has: coverage },
        coverPeriod,
        agentcode,
        NOT: make ? { ExcludedMakes: { has: make } } : undefined,
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'No matching product found' });
    }

    // Calculate premium
    let premium = 0;

    if (coverage === CoverageType.COMPREHENSIVE) {
      premium = vehicleValue
        ? vehicleValue * (product.premium_annual || 0)
        : product.premium_annual || product.basePremium || 0;
    }

    if (coverage === CoverageType.THIRD_PARTY_ONLY) {
      try {
        premium = calculateTpoPremium(vehicleClass, product.basePremium, tonnage, passengers);
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }
    }

    if (coverage === CoverageType.THIRD_PARTY_FIRE_AND_THEFT) {
      premium = product.premium_annual || product.basePremium || 0;
    }

    // Create quote
    const quote = await prisma.quote.create({
      data: {
        productId: product.id,
        agentcode,
        vehicle_reg: model || null,
        make: make || null,
        value: vehicleValue || null,
        yearOfManufacture: null, // optional now
        passengers: passengers || null,
        tonnage: tonnage || null,
        coverPeriod,
        cover: coverage,
        price: premium,
        name_contact,
        email,
        phone_number,
      },
    });

    res.status(201).json({ message: 'Quote created successfully', quote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create quote', error: err.message });
  }
};

// GET all quotes
exports.getQuotes = async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({ include: { product: true } });
    res.json({ quotes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch quotes', error: err.message });
  }
};

// GET quote by ID
exports.getQuoteById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    res.json({ quote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch quote', error: err.message });
  }
};

// UPDATE quote
exports.updateQuote = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { error, value } = quoteValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const updatedQuote = await prisma.quote.update({ where: { id }, data: value });
    res.json({ message: 'Quote updated successfully', quote: updatedQuote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update quote', error: err.message });
  }
};

// DELETE quote
exports.deleteQuote = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.quote.delete({ where: { id } });
    res.json({ message: 'Quote deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete quote', error: err.message });
  }
};
