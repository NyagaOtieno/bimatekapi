const express = require('express');
const router = express.Router();
const { Quote, Product } = require('../../models'); // Sequelize models

// 🔁 Map vehicle class ID to string enum
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

// 💡 Premium calculator
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
    vehicleClass, // as ID
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

  // Convert & validate
  const parsedAgentCode = parseInt(agent_code);
  const parsedYOM = parseInt(yearOfManufacture);
  const parsedValue = parseFloat(value);
  const parsedPeriod = parseInt(period);
  const vehicleClassEnum = vehicleClassMap[vehicleClass];

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
    phone_number,
    cover,
    coverperiod
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, val]) => val === undefined || val === null || val === '')
    .map(([key]) => key);

  if (!vehicleClassEnum) missingFields.push('vehicleClass (invalid ID)');

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Missing or invalid required fields: ${missingFields.join(', ')}`
    });
  }

  try {
    // 🔍 Find product match
    const product = await Product.findOne({
      where: {
        vehicleClass: vehicleClassEnum,
        coverage,
        make,
        agentcode: parsedAgentCode.toString()
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'No matching insurance product found for this agent and vehicle class.'
      });
    }

    const premium = calculatePremium(
      product.basePremium,
      parsedValue,
      parsedYOM,
      parsedPeriod
    );

    // 📝 Create quote
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
      price: premium,
      tonnage,
      passengers,
      cover,
      coverperiod,
      vehicle_reg
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
