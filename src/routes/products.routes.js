const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
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
    minAge,
    maxAge,
    minValue,
    maxValue,
    confirmUpdate // ✅ for user confirmation
  } = req.body;

  // ✅ Basic validation
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
    agentcode
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
    // 🔍 Check for existing matching product by same agent + underwriter
    const existingProduct = await prisma.product.findFirst({
      where: {
        vehicleClass,
        coverage,
        period,
        make,
        yearOfManufacture,
        agentcode,
        underwriter,
      }
    });

    if (existingProduct && !confirmUpdate) {
      return res.status(409).json({
        warning: 'A similar product already exists for this agent and underwriter.',
        existingProduct,
        message: 'Set "confirmUpdate": true in the payload to update this product.'
      });
    }

    const data = {
      name,
      description,
      basePremium: parseFloat(basePremium),
      underwriter,
      vehicleClass,
      coverage,
      period,
      value: parseFloat(value),
      make,
      yearOfManufacture: parseInt(yearOfManufacture),
      tonnage: tonnage ? parseInt(tonnage) : null,
      passengers: passengers ? parseInt(passengers) : null,
      agentcode,
      minAge: minAge ? parseInt(minAge) : null,
      maxAge: maxAge ? parseInt(maxAge) : null,
      minValue: minValue ? parseFloat(minValue) : null,
      maxValue: maxValue ? parseFloat(maxValue) : null
    };

    let product;
    if (existingProduct && confirmUpdate) {
      product = await prisma.product.update({
        where: { id: existingProduct.id },
        data
      });
      return res.status(200).json({
        message: 'Product updated successfully.',
        product
      });
    } else {
      product = await prisma.product.create({ data });
      return res.status(201).json({
        message: 'Product created successfully.',
        product
      });
    }
  } catch (error) {
    console.error('❌ Error in product POST:', error);
    return res.status(500).json({
      error: 'Internal server error',
      detail: error.message,
    });
  }
});

module.exports = router;
