const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 🔁 GET all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products in GET /api/products:', error);
    res.status(500).json({
      error: 'Internal server error',
      detail: error.message
    });
  }
});


// 🚀 POST or UPSERT product
router.post('/', async (req, res) => {
  const {
    name,
    description,
    basePremium,
    underwriter,
    vehicleClass,
    coverage,
    period,
    value,
    make,
    yearOfManufacture,
    tonnage,
    passengers,
    agentcode,
  } = req.body;

  // ✅ Validate required fields
  const requiredFields = {
    name,
    description,
    basePremium,
    underwriter,
    vehicleClass,
    coverage,
    period,
    value,
    make,
    yearOfManufacture,
    agentcode,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, v]) => v === undefined || v === null || v === '')
    .map(([k]) => k);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Missing required fields: ${missingFields.join(', ')}`,
    });
  }

  try {
    const product = await prisma.product.upsert({
      where: {
        vehicleClass_coverage_make_yearOfManufacture_period_agentcode: {
          vehicleClass,
          coverage,
          make,
          yearOfManufacture,
          period,
          agentcode,
        },
      },
      update: {
        name,
        description,
        basePremium: parseFloat(basePremium),
        underwriter,
        value: parseFloat(value),
        tonnage: tonnage ? parseInt(tonnage) : null,
        passengers: passengers ? parseInt(passengers) : null,
      },
      create: {
        name,
        description,
        basePremium: parseFloat(basePremium),
        underwriter,
        vehicleClass,
        coverage,
        period,
        value: parseFloat(value),
        make,
        yearOfManufacture,
        tonnage: tonnage ? parseInt(tonnage) : null,
        passengers: passengers ? parseInt(passengers) : null,
        agentcode,
      },
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error in product POST:', error);
    return res.status(500).json({
      error: 'Internal server error',
      detail: error.message,
    });
  }
});

module.exports = router;
