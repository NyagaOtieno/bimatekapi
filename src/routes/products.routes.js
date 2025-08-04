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
    tonnage,
    passengers,
    agentcode,
    minAge,
    maxAge,
    minValue,
    maxValue,
    premium_week,
    premium_2weeks,
    premium_month,
    premium_3months,
    premium_6months,
    premium_annual,
    ExcludedMakes,
    confirmUpdate // ✅ user confirmation to update existing product
  } = req.body;

  // ✅ Required fields check (adjusted)
  const requiredFields = {
    name,
    description,
    basePremium,
    underwriter,
    vehicleClass,
    coverage,
    period,
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
    // 🔍 Look for a product with same vehicleClass, coverage, period, agentcode, and underwriter
    const existingProduct = await prisma.product.findFirst({
      where: {
        vehicleClass,
        coverage,
        period,
        agentcode,
        underwriter
      }
    });

    const data = {
      name,
      description,
      basePremium: parseFloat(basePremium),
      underwriter,
      vehicleClass,
      coverage,
      period,
      tonnage: tonnage ? parseInt(tonnage) : null,
      passengers: passengers ? parseInt(passengers) : null,
      agentcode,
      minAge: minAge ? parseInt(minAge) : null,
      maxAge: maxAge ? parseInt(maxAge) : null,
      minValue: minValue ? parseFloat(minValue) : null,
      maxValue: maxValue ? parseFloat(maxValue) : null,
      premium_week: premium_week ? parseFloat(premium_week) : null,
      premium_2weeks: premium_2weeks ? parseFloat(premium_2weeks) : null,
      premium_month: premium_month ? parseFloat(premium_month) : null,
      premium_3months: premium_3months ? parseFloat(premium_3months) : null,
      premium_6months: premium_6months ? parseFloat(premium_6months) : null,
      premium_annual: premium_annual ? parseFloat(premium_annual) : null,
      ExcludedMakes
    };

    let product;

    if (existingProduct && confirmUpdate) {
      product = await prisma.product.update({
        where: { id: existingProduct.id },
        data
      });
      return res.status(200).json({
        message: '✅ Product updated successfully.',
        product
      });
    }

    if (existingProduct && !confirmUpdate) {
      return res.status(409).json({
        warning: 'A similar product already exists for this agent and underwriter.',
        existingProduct,
        message: 'Include "confirmUpdate": true in the request body to overwrite it.'
      });
    }

    product = await prisma.product.create({ data });

    return res.status(201).json({
      message: '✅ Product created successfully.',
      product
    });
  } catch (error) {
    console.error('❌ Error in product POST:', error);
    return res.status(500).json({
      error: 'Internal server error',
      detail: error.message
    });
  }
});

module.exports = router;
