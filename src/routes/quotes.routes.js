const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 🔁 Vehicle class mapping
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

// 🧠 Premium formula
const calculatePremium = (basePremium, value, yearOfManufacture, period) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - yearOfManufacture;
  const ageFactor = age > 5 ? 1.1 : 1.0;
  const valueFactor = value / 1_000_000;
  const periodFactor = period / 12;
  return Math.round(basePremium * valueFactor * ageFactor * periodFactor);
};

// 🚀 POST /api/quotes
router.post('/', async (req, res) => {
  const {
    vehicleClass, // as ID string
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

  // Parse and convert values
  const vehicleClassEnum = vehicleClassMap[vehicleClass];
  const parsedPeriod = parseInt(period);
  const parsedValue = parseFloat(value);
  const parsedYOM = parseInt(yearOfManufacture);
  const parsedAgentCode = agent_code?.toString();

  const requiredFields = {
    vehicleClass: vehicleClassEnum,
    coverage,
    period: parsedPeriod,
    value: parsedValue,
    make,
    yearOfManufacture: parsedYOM,
    agent_code: parsedAgentCode,
    name_contact,
    email,
    phone_number,
    cover,
    coverperiod
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, v]) => v === undefined || v === null || v === '')
    .map(([k]) => k);

  if (!vehicleClassEnum) missingFields.push('vehicleClass (invalid ID)');

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Missing or invalid fields: ${missingFields.join(', ')}`
    });
  }

  try {
    // 🔍 Look up product
    const product = await prisma.product.findFirst({
      where: {
        vehicleClass: vehicleClassEnum,
        coverage,
        make,
        agentcode: parsedAgentCode,
        yearOfManufacture: parsedYOM,
        period: parsedPeriod
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'No matching product found for the given agent and vehicle attributes.'
      });
    }

    const premium = calculatePremium(
      product.basePremium,
      parsedValue,
      parsedYOM,
      parsedPeriod
    );

    // 📝 Save quote
    const quote = await prisma.quote.create({
      data: {
        productId: product.id,
        value: parsedValue,
        period: parsedPeriod,
        make,
        yearOfManufacture: parsedYOM,
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
    res.status(500).json({
      error: 'Server error while creating quote.',
      detail: error.message
    });
  }
});

module.exports = router;
