const Joi = require("joi");

// Approved vehicle classes
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

// Kenyan underwriters (names only — must exist in DB)
const underwriters = [
  'AAR Insurance (Kenya) Ltd',
  'Africa Merchant Assurance Company Ltd (AMACO)',
  'AIG Kenya Insurance Company Ltd',
  'APA Insurance Ltd',
  'Britam General Insurance Company (K) Ltd',
  'Cannon General Insurance Company Ltd',
  'CIC General Insurance Ltd',
  'Corporate Insurance Company Ltd',
  'Directline Assurance Company Ltd',
  'Definite Assurance Company Ltd',
  'Equity General Insurance (Kenya) Ltd',
  'Fidelity Shield Insurance Co Ltd',
  'First Assurance Company Ltd',
  'GA Insurance Ltd',
  'Geminia Insurance Company Ltd',
  'ICEA LION General Insurance Company Ltd',
  'Intra Africa Assurance Company Ltd',
  'Jubilee Allianz General Insurance Ltd',
  'Jubilee Health Insurance Ltd',
  'Kenindia Assurance Company Ltd',
  'Kenya Orient Insurance Ltd',
  'Madison General Insurance Kenya Ltd',
  'Mayfair Insurance Company Ltd',
  'MUA Insurance (Kenya) Ltd',
  'Occidental Insurance Company Ltd',
  'Old Mutual General Insurance Kenya Ltd',
  'Pacis Insurance Company Ltd',
  'Pioneer General Insurance Ltd',
  'Sanlam General Insurance Company Ltd',
  'Star Discover Insurance Ltd',
  'Takaful Insurance of Africa Ltd',
  'Tausi Assurance Company Ltd',
  'The Heritage Insurance Company Ltd',
  'The Kenyan Alliance Insurance Company Ltd',
  'The Monarch Insurance Company Ltd',
  'Trident Insurance Company Ltd',
];

const coverageTypes = [
  "THIRD_PARTY_ONLY",
  "THIRD_PARTY_FIRE_AND_THEFT",
  "COMPREHENSIVE"
];

const productValidationSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow("", null).optional(),

  // ✅ validate as string (client provides name),
  // later in controller we map it to { connect: { name } }
  underwriter: Joi.string().valid(...underwriters).required(),

  agentcode: Joi.string().required(),
  basePremium: Joi.number().positive().optional(),
  premium_annual: Joi.number().positive().optional(),
  coverPeriod: Joi.string().allow("", null).optional(),

  // ✅ allow either one string OR array of strings
  vehicleClass: Joi.alternatives().try(
    Joi.string().valid(...vehicleClasses),
    Joi.array().items(Joi.string().valid(...vehicleClasses))
  ).required(),

  coverage: Joi.string().valid(...coverageTypes).required(),

  minimumPremium: Joi.number().positive().when("coverage", {
    is: "COMPREHENSIVE",
    then: Joi.required(),
    otherwise: Joi.optional().allow(null)
  }),

  passengers: Joi.number().integer().optional(),
  tonnage: Joi.number().integer().optional(),
  minAge: Joi.number().integer().optional(),
  maxAge: Joi.number().integer().optional(),
  minValue: Joi.number().positive().optional(),
  maxValue: Joi.number().positive().optional(),
  ExcludedMakes: Joi.array().items(Joi.string()).optional(),

  // ✅ PSV-specific premium fields
  premium_week: Joi.number().positive().when("vehicleClass", {
    is: Joi.alternatives().try("PSV_MATATU", "PSV_BUS"),
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }),
  premium_2weeks: Joi.number().positive().when("vehicleClass", {
    is: Joi.alternatives().try("PSV_MATATU", "PSV_BUS"),
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }),
  premium_month: Joi.number().positive().when("vehicleClass", {
    is: Joi.alternatives().try("PSV_MATATU", "PSV_BUS"),
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }),
  premium_3months: Joi.number().positive().when("vehicleClass", {
    is: Joi.alternatives().try("PSV_MATATU", "PSV_BUS"),
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }),
  premium_6months: Joi.number().positive().when("vehicleClass", {
    is: Joi.alternatives().try("PSV_MATATU", "PSV_BUS"),
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }),
  Seats: Joi.number().integer().positive().when("vehicleClass", {
    is: Joi.alternatives().try("PSV_MATATU", "PSV_BUS"),
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }),

  yearOfManufacture: Joi.any().forbidden() // ✅ not allowed on product
});

module.exports = {
  productValidationSchema,
  vehicleClasses,
  underwriters
};
