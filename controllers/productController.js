const { PrismaClient, CoverageType } = require('@prisma/client');
const prisma = new PrismaClient();
const { productSchema } = require('../validations/productValidation');


// Normalize coverage strings
function normalizeCoverage(value) {
  if (!value) return undefined;
  const map = {
    "THIRD PARTY ONLY": "THIRD_PARTY_ONLY",
    "THIRD_PARTY_ONLY": "THIRD_PARTY_ONLY",
    "THIRD PARTY FIRE AND THEFT": "THIRD_PARTY_FIRE_AND_THEFT",
    "THIRD_PARTY_FIRE_AND_THEFT": "THIRD_PARTY_FIRE_AND_THEFT",
    "COMPREHENSIVE": "COMPREHENSIVE"
  };
  const key = value.trim().toUpperCase();
  return map[key] || undefined;
}

// Validate coverage-specific fields
function validateProductRules(data) {
  const { coverage, vehicleClass, coverPeriod, passengers, tonnage, minAge, maxAge, minValue, maxValue, ExcludedMakes } = data;

  switch (coverage) {
    case CoverageType.COMPREHENSIVE:
    case CoverageType.THIRD_PARTY_FIRE_AND_THEFT:
      // Remove mandatory yearOfManufacture
      if (minAge == null || maxAge == null) throw new Error("minAge and maxAge are required for this coverage");
      if (minValue == null || maxValue == null) throw new Error("minValue and maxValue are required for this coverage");
      if (!Array.isArray(ExcludedMakes)) throw new Error("ExcludedMakes must be an array for this coverage");
      break;

    case CoverageType.THIRD_PARTY_ONLY:
      if (!coverPeriod) throw new Error("coverPeriod is required for THIRD_PARTY_ONLY");
      if (vehicleClass.some(vc => vc.includes("COMMERCIAL") || vc.includes("GENERAL_CARTAGE"))) {
        if (tonnage == null) throw new Error("tonnage is required for COMMERCIAL or GENERAL_CARTAGE vehicles");
      }
      if (vehicleClass.some(vc => vc.includes("PSV"))) {
        if (passengers == null) throw new Error("passengers is required for PSV vehicles");
      }
      break;

    default:
      throw new Error("Unsupported coverage type");
  }
}

// CREATE product
exports.createProduct = async (req, res) => {
  try {
    const { error, value } = productValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Normalize coverage and array fields
    const coverage = normalizeCoverage(value.coverage);
    const vehicleClass = Array.isArray(value.vehicleClass) ? value.vehicleClass : [value.vehicleClass].filter(Boolean);
    const ExcludedMakes = Array.isArray(value.ExcludedMakes) ? value.ExcludedMakes : [];

    const validatedData = { ...value, coverage, vehicleClass, ExcludedMakes };

    validateProductRules(validatedData);

    const product = await prisma.product.create({ data: validatedData });
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// GET all products
exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

// GET product by ID
exports.getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch product', error: err.message });
  }
};

// UPDATE product
exports.updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { error, value } = productValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const coverage = normalizeCoverage(value.coverage);
    const vehicleClass = Array.isArray(value.vehicleClass) ? value.vehicleClass : [value.vehicleClass].filter(Boolean);
    const ExcludedMakes = Array.isArray(value.ExcludedMakes) ? value.ExcludedMakes : [];

    const validatedData = { ...value, coverage, vehicleClass, ExcludedMakes };

    validateProductRules(validatedData);

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: validatedData,
    });
    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') return res.status(404).json({ message: 'Product not found' });
    res.status(400).json({ message: err.message });
  }
};

// DELETE product
exports.deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') return res.status(404).json({ message: 'Product not found' });
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
};
