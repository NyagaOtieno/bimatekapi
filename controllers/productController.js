// controllers/productController.js
const { PrismaClient, CoverageType } = require('@prisma/client');
const prisma = new PrismaClient();
const { productValidationSchema } = require("../validation/product.validation");

/**
 * Normalize coverage strings to match Prisma enum
 */
function normalizeCoverage(value) {
  if (!value) return undefined;
  const map = {
    "THIRD PARTY ONLY": CoverageType.THIRD_PARTY_ONLY,
    "THIRD PARTY FIRE AND THEFT": CoverageType.THIRD_PARTY_FIRE_AND_THEFT,
    "COMPREHENSIVE": CoverageType.COMPREHENSIVE
  };
  const key = value.trim().toUpperCase();
  return map[key] || undefined;
}

/**
 * Coverage-specific validation rules
 */
function validateProductRules(data) {
  const { coverage, vehicleClass, coverPeriod, passengers, tonnage, minAge, maxAge, minValue, maxValue, ExcludedMakes, minimumPremium } = data;

  switch (coverage) {
    case CoverageType.COMPREHENSIVE:
      if (minimumPremium == null) throw new Error("minimumPremium is required for COMPREHENSIVE cover");
      if (minAge == null || maxAge == null) throw new Error("minAge and maxAge are required for COMPREHENSIVE");
      if (minValue == null || maxValue == null) throw new Error("minValue and maxValue are required for COMPREHENSIVE");
      if (!Array.isArray(ExcludedMakes)) throw new Error("ExcludedMakes must be an array for COMPREHENSIVE");
      break;

    case CoverageType.THIRD_PARTY_FIRE_AND_THEFT:
      if (minAge == null || maxAge == null) throw new Error("minAge and maxAge are required for TPF&T");
      if (minValue == null || maxValue == null) throw new Error("minValue and maxValue are required for TPF&T");
      if (!Array.isArray(ExcludedMakes)) throw new Error("ExcludedMakes must be an array for TPF&T");
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

/**
 * CREATE product
 */
exports.createProduct = async (req, res) => {
  try {
    const { error, value } = productValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Normalize inputs
    const coverage = normalizeCoverage(value.coverage);
    const vehicleClass = Array.isArray(value.vehicleClass) ? value.vehicleClass : [value.vehicleClass].filter(Boolean);
    const ExcludedMakes = Array.isArray(value.ExcludedMakes) ? value.ExcludedMakes : [];

    const validatedData = { ...value, coverage, vehicleClass, ExcludedMakes };

    validateProductRules(validatedData);

    // Ensure underwriter exists
    const underwriter = await prisma.underwriter.findUnique({
      where: { name: validatedData.underwriter }
    });
    if (!underwriter) {
      return res.status(400).json({ message: `Underwriter '${validatedData.underwriter}' not found` });
    }

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        underwriter: { connect: { id: underwriter.id } },
        minimumPremium: coverage === CoverageType.COMPREHENSIVE ? validatedData.minimumPremium : null,
      },
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET all products
 */
exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { underwriter: true }
    });
    res.json({ products });
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

/**
 * GET product by ID
 */
exports.getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: { underwriter: true }
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    console.error("❌ Error fetching product:", err);
    res.status(500).json({ message: 'Failed to fetch product', error: err.message });
  }
};

/**
 * UPDATE product
 */
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

    let underwriterData = {};
    if (validatedData.underwriter) {
      const underwriter = await prisma.underwriter.findUnique({
        where: { name: validatedData.underwriter }
      });
      if (!underwriter) {
        return res.status(400).json({ message: `Underwriter '${validatedData.underwriter}' not found` });
      }
      underwriterData = { underwriter: { connect: { id: underwriter.id } } };
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...validatedData,
        ...underwriterData,
        minimumPremium: coverage === CoverageType.COMPREHENSIVE ? validatedData.minimumPremium : null,
      },
    });

    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (err) {
    console.error("❌ Error updating product:", err);
    if (err.code === 'P2025') return res.status(404).json({ message: 'Product not found' });
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE product
 */
exports.deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    if (err.code === 'P2025') return res.status(404).json({ message: 'Product not found' });
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
};
