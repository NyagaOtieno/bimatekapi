const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Vehicle class mapping
const vehicleClassMap = {
  "1": "MOTORCYCLE_PRIVATE",
  "2": "MOTORCYCLE_PSV",
  "3": "MOTORCYCLE_COMMERCIAL",
  "4": "TRICYCLE_OWN_GOODS",
  "5": "TRICYCLE_PSV",
  "6": "MOTORVEHICLE_PRIVATE",
  "7": "MOTORVEHICLE_OWN_GOODS",
  "8": "MOTORVEHICLE_GENERAL_CARTAGE",
  "9": "MOTORVEHICLE_AGRICULTURE",
  "10": "MOTORVEHICLE_CHAUFFEUR",
  "11": "MOTOR_TRADE",
  "12": "MOTORVEHICLE_INSTITUTIONAL",
  "13": "MOTORVEHICLE_DRIVING_SCHOOL",
  "14": "MOTORVEHICLE_TOUR_SERVICE",
  "15": "PSV_MATATU",
  "16": "PSV_TAXI",
  "17": "PSV_BUS",
  "18": "AMBULANCE_FIRE",
  "19": "HEAVY_MACHINERY",
  "20": "UBER",
  "21": "TANKER_LIQUID",
  "22": "PRIME_MOVER"
};

// Premium calculator for comprehensive
const calculateComprehensivePremium = (rate, value) => {
  return Math.round(rate * value);
};

// Select TPO premium based on period
const getTpoPremium = (product, period) => {
  switch (period) {
    case 1: return product.premium_week;
    case 2: return product.premium_2weeks;
    case 4: return product.premium_month;
    case 3: return product.premium_3months;
    case 6: return product.premium_6months;
    case 12: return product.premium_annual;
    default: return null;
  }
};

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
    phone_number,
    tonnage,
    passengers,
    cover,
    coverperiod,
    vehicle_reg
  } = req.body;

  const vehicleClassEnum = vehicleClassMap[vehicleClass];
  const parsedPeriod = parseInt(period);
  const parsedValue = parseFloat(value);
  const parsedYOM = parseInt(yearOfManufacture);
  const parsedAgentCode = agent_code?.toString();

  // Basic field validation
  if (!vehicleClassEnum || !coverage || !parsedPeriod || !parsedAgentCode) {
    return res.status(400).json({
      error: 'Missing required vehicleClass, coverage, period, or agent_code.'
    });
  }

  try {
    const product = await prisma.product.findFirst({
      where: {
        vehicleClass: vehicleClassEnum,
        coverage,
        make,
        agentcode: parsedAgentCode,
        period: parsedPeriod
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'No matching product found for the given agent and vehicle attributes.'
      });
    }

    let premium;

    if (coverage.toLowerCase() === 'comprehensive') {
      if (!parsedValue || !parsedYOM) {
        return res.status(400).json({
          error: 'Comprehensive cover requires value and yearOfManufacture.'
        });
      }

      const currentYear = new Date().getFullYear();
      const vehicleAge = currentYear - parsedYOM;

      if (product.minAge && vehicleAge < product.minAge) {
        return res.status(400).json({
          error: 'Vehicle is too new for this cover.',
          vehicleAge,
          minAllowedAge: product.minAge
        });
      }

      if (product.maxAge && vehicleAge > product.maxAge) {
        return res.status(400).json({
          error: 'Vehicle exceeds maximum age limit.',
          vehicleAge,
          maxAllowedAge: product.maxAge
        });
      }

      if (product.minValue && parsedValue < product.minValue) {
        return res.status(400).json({
          error: 'Vehicle value below minimum allowed.',
          submittedValue: parsedValue,
          minAllowed: product.minValue
        });
      }

      if (product.maxValue && parsedValue > product.maxValue) {
        return res.status(400).json({
          error: 'Vehicle value exceeds maximum allowed.',
          submittedValue: parsedValue,
          maxAllowed: product.maxValue
        });
      }

      premium = calculateComprehensivePremium(product.basePremium, parsedValue);
    }

    else if (coverage.toLowerCase() === 'tpo') {
      premium = getTpoPremium(product, parsedPeriod);
      if (!premium) {
        return res.status(400).json({
          error: 'TPO premium not set for the selected period.',
          availablePeriods: {
            week: product.premium_week,
            twoWeeks: product.premium_2weeks,
            month: product.premium_month,
            threeMonths: product.premium_3months,
            sixMonths: product.premium_6months,
            annual: product.premium_annual
          }
        });
      }
    }

    const quote = await prisma.quote.create({
      data: {
        productId: product.id,
        value: parsedValue || null,
        period: parsedPeriod,
        make: make || null,
        yearOfManufacture: parsedYOM || null,
        agent_code: parsedAgentCode,
        name_contact,
        email,
        phone_number,
        price: premium,
        tonnage: tonnage ? parseInt(tonnage) : null,
        passengers: passengers ? parseInt(passengers) : null,
        cover,
        coverperiod,
        vehicle_reg
      }
    });

    return res.status(201).json({ message: 'Quote created successfully', quote });

  } catch (error) {
    console.error('❌ Error creating quote:', error);
    return res.status(500).json({
      error: 'Server error while creating quote.',
      detail: error.message
    });
  }
});

module.exports = router;
