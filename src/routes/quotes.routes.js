const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Utility to calculate premium
const calculatePremium = (basePremium, value, yearOfManufacture, period) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - yearOfManufacture;

  const ageFactor = age > 5 ? 1.1 : 1.0;
  const valueFactor = value / 1_000_000;
  const periodFactor = period / 12;

  return Math.round(basePremium * valueFactor * ageFactor * periodFactor);
};

// POST /api/quotes
router.post('/', async (req, res) => {
  const {
    vehicleClass,
    coverage,
    period,
    value,
    make,
    yearOfManufacture,
    userId,
  } = req.body;

  // Validate required fields
  const requiredFields = {
    vehicleClass,
    coverage,
    period,
    value,
    make,
    yearOfManufacture,
    userId,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, val]) => val === undefined || val === null || val === '')
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Missing required fields: ${missingFields.join(', ')}`,
    });
  }

  try {
    // Find a matching product
    const product = await prisma.product.findFirst({
      where: {
        vehicleClass,
        coverage,
        make,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'No matching insurance product found.' });
    }

    // Calculate premium
    const premium = calculatePremium(
      product.basePremium,
      value,
      yearOfManufacture,
      period
    );

    // Create the quote
    const quote = await prisma.quote.create({
      data: {
        productId: product.id,
        userId,
        price: premium,
        value,
        period,
        make,
        yearOfManufacture,
      },
      include: {
        product: true,
        user: true,
      },
    });

    return res.status(201).json(quote);
  } catch (error) {
    console.error('❌ Error creating quote:', error);
    return res.status(500).json({ error: 'Internal server error while creating quote.' });
  }
});

module.exports = router;
