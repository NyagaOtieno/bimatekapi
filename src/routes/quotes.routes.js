const express = require('express');
const router = express.Router();
const { Quote, Product } = require('../../models'); // Make sure these are correct paths

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
    agent_code,
    name_contact,
    email,
    phone_number
  } = req.body;

  const parsedAgentCode = parseInt(agent_code);
  const parsedYOM = parseInt(yearOfManufacture);
  const parsedValue = parseFloat(value);
  const parsedPeriod = parseInt(period);

  // Validate required fields
  const requiredFields = {
    vehicleClass,
    coverage,
    period: parsedPeriod,
    value: parsedValue,
    make,
    yearOfManufacture: parsedYOM,
    agent_code: parsedAgentCode,
    name_contact,
    email,
    phone_number
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, val]) => !val && val !== 0)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Missing or invalid required fields: ${missingFields.join(', ')}`
    });
  }

  try {
    // Match product
    const product = await Product.findOne({
      where: {
        vehicleClass,
        coverage,
        make,
        agentcode: parsedAgentCode.toString()
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'No matching insurance product found for this agent.'
      });
    }

    const premium = calculatePremium(
      product.basePremium,
      parsedValue,
      parsedYOM,
      parsedPeriod
    );

    const quote = await Quote.create({
      productId: product.id,
      value: parsedValue,
      period: parsedPeriod,
      make,
      yearOfManufacture: parsedYOM,
      agent_code: parsedAgentCode,
      name_contact,
      email,
      phone_number,
      price: premium
    });

    res.status(201).json({ message: 'Quote created successfully', quote });
  } catch (error) {
    console.error('❌ Error creating quote:', error);
    res.status(500).json({
      error: 'Internal server error while creating quote.',
      detail: error.message
    });
  }
});

module.exports = router;
