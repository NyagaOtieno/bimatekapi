const Joi = require('joi');

const vehicleClasses = [
  "MOTORCYCLE_PRIVATE",
  "MOTORCYCLE_PSV",
  "MOTORCYCLE_COMMERCIAL",
  "TRICYCLE_OWN_GOODS",
  "TRICYCLE_PSV",
  "MOTORVEHICLE_PRIVATE",
  "MOTORVEHICLE_OWN_GOODS",
  "MOTORVEHICLE_GENERAL_CARTAGE",
  "MOTORVEHICLE_AGRICULTURE",
  "MOTORVEHICLE_CHAUFFEUR",
  "MOTOR_TRADE",
  "MOTORVEHICLE_INSTITUTIONAL",
  "MOTORVEHICLE_DRIVING_SCHOOL",
  "MOTORVEHICLE_TOUR_SERVICE",
  "PSV_MATATU",
  "PSV_TAXI",
  "PSV_BUS",
  "AMBULANCE_FIRE",
  "HEAVY_MACHINERY",
  "UBER",
  "TANKER_LIQUID",
  "PRIME_MOVER"
];

const coverageTypes = [
  'THIRD_PARTY_ONLY',
  'THIRD_PARTY_FIRE_AND_THEFT',
  'COMPREHENSIVE'
];

const quoteValidationSchema = Joi.object({
  productId: Joi.number().integer().required(),
  userId: Joi.number().integer().optional(),
  price: Joi.number().positive().required(),
  make: Joi.string().allow(null, ''),
  value: Joi.number().positive().allow(null),
  yearOfManufacture: Joi.when('coverage', {
    is: 'COMPREHENSIVE',
    then: Joi.number().integer().required(),
    otherwise: Joi.any().optional()
  }),
  agentcode: Joi.string().required(),
  cover: Joi.string().valid(...coverageTypes).required(),
  email: Joi.string().email().required(),
  name_contact: Joi.string().required(),
  passengers: Joi.number().integer().allow(null),
  phone_number: Joi.string().required(),
  tonnage: Joi.number().integer().allow(null),
  vehicle_reg: Joi.string().allow(null, ''),
  coverPeriod: Joi.string().allow(null, ''),
});

module.exports = quoteValidationSchema;
