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
    confirmUpdate
  } = req.body;

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

  try {
    // Build duplicate detection filter
    const filterConditions = [
      {
        minAge: { lte: data.maxAge || 100 },
        maxAge: { gte: data.minAge || 0 }
      },
      {
        minValue: { lte: data.maxValue || 99999999 },
        maxValue: { gte: data.minValue || 0 }
      }
    ];

    if (data.tonnage !== null && data.tonnage !== undefined) {
      filterConditions.push({ tonnage: data.tonnage });
    }

    if (data.passengers !== null && data.passengers !== undefined) {
      filterConditions.push({ passengers: data.passengers });
    }

    const potentialConflict = await prisma.product.findFirst({
      where: {
        vehicleClass,
        coverage,
        period,
        agentcode,
        underwriter,
        AND: filterConditions
      }
    });

    if (potentialConflict && !confirmUpdate) {
      return res.status(409).json({
        error: 'Duplicate or overlapping product exists for this agent and underwriter.',
        existingProduct: potentialConflict,
        message: 'Include "confirmUpdate": true to overwrite the existing product.'
      });
    }

    if (potentialConflict && confirmUpdate) {
      const updated = await prisma.product.update({
        where: { id: potentialConflict.id },
        data
      });
      return res.status(200).json({
        message: '✅ Product updated successfully.',
        product: updated
      });
    }

    const product = await prisma.product.create({ data });

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
