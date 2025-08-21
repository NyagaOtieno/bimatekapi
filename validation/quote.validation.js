const Joi = require('joi');

const vehicleClasses = [
  "MOTORCYCLE_PRIVATE",
  "MOTORCYCLE_PSV",
  "MOTORCYCLE_COMMERCIAL",
  "TRICYCLE_OWN_GOODS",
  "TRICYCLE_PSV",
  "MOTORVEHICLE_PRIVATE",
  "MOTORVEHICLE_COMMERCIAL_OWN_GOODS",
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

const coverPeriods = [
  'ONE_WEEK',
  'TWO_WEEKS',
  'ONE_MONTH',
  'SIX_MONTHS',
  'ONE_YEAR'
];

const quoteValidationSchema = Joi.object({
  productId: Joi.number().integer().required(),
  userId: Joi.number().integer().optional(),
  price: Joi.number().positive().required(),

  // vehicle details
  vehicleClass: Joi.string().valid(...vehicleClasses).required(),
  make: Joi.string().allow(null, ''),
  value: Joi.number().positive().allow(null),

  yearOfManufacture: Joi.when('cover', {
    is: 'COMPREHENSIVE',
    then: Joi.number().integer().required(),
    otherwise: Joi.number().integer().allow(null)
  }),

  vehicle_reg: Joi.string().allow(null, ''),

  // insurance details
  agent_code: Joi.string().required(),   // <-- changed for consistency with model
  cover: Joi.string().valid(...coverageTypes).required(),
  coverPeriod: Joi.string().valid(...coverPeriods).required(),

  // contact details
  email: Joi.string().email().required(),
  name_contact: Joi.string().required(),
  phone_number: Joi.string().pattern(/^[0-9+\-() ]{7,20}$/).required(),

  // special cases
  passengers: Joi.when('vehicleClass', {
    is: Joi.valid("PSV_MATATU", "PSV_BUS", "PSV_TAXI"),
    then: Joi.number().integer().min(1).required(),
    otherwise: Joi.number().integer().allow(null)
  }),

  tonnage: Joi.when('vehicleClass', {
    is: Joi.valid("MOTORVEHICLE_COMMERCIAL_OWN_GOODS", "MOTORVEHICLE_GENERAL_CARTAGE", "TANKER_LIQUID", "PRIME_MOVER"),
    then: Joi.number().integer().min(1).required(),
    otherwise: Joi.number().integer().allow(null)
  }),
});

module.exports = quoteValidationSchema;
