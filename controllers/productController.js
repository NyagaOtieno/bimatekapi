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
 * Helper: Check for duplicate product
 */
async function checkDuplicateProduct(validatedData, underwriterId, excludeId = null) {
  return prisma.product.findFirst({
    where: {
      underwriterId,
      agentcode: validatedData.agentcode,
      coverage: validatedData.coverage,
      vehicleClass: { hasSome: validatedData.vehicleClass },
      minAge: validatedData.minAge ?? null,
      maxAge: validatedData.maxAge ?? null,
      minValue: validatedData.minValue ?? null,
      maxValue: validatedData.maxValue ?? null,
      passengers: validatedData.passengers ?? null,
      tonnage: validatedData.tonnage ?? null,
      id: excludeId ? { not: excludeId } : undefined,
    },
  });
}

/**
 * CREATE product
 */
exports.createProduct = async (req, res) => {
  try {
    const { error, value } = productValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const coverage = normalizeCoverage(value.coverage);
    const vehicleClass = Array.isArray(value.vehicleClass) ? value.vehicleClass : [value.vehicleClass].filter(Boolean);
    const ExcludedMakes = Array.isArray(value.ExcludedMakes) ? value.ExcludedMakes : [];

    const validatedData = { ...value, coverage, vehicleClass, ExcludedMakes };

    validateProductRules(validatedData);

    // Ensure underwriter exists
    const underwriter = await prisma.underwriter.findUnique({ where: { name: validatedData.underwriter } });
    if (!underwriter) return res.status(400).json({ message: `Underwriter '${validatedData.underwriter}' not found` });

    // Check for duplicate
    const duplicate = await checkDuplicateProduct(validatedData, underwriter.id);
    if (duplicate) {
      return res.status(400).json({ message: "Duplicate product exists with the same underwriter, vehicle class, coverage, agent code, age/value range, passengers or tonnage" });
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

    // Ensure underwriter exists
    let underwriterData = {};
    let underwriterId;
    if (validatedData.underwriter) {
      const underwriter = await prisma.underwriter.findUnique({ where: { name: validatedData.underwriter } });
      if (!underwriter) return res.status(400).json({ message: `Underwriter '${validatedData.underwriter}' not found` });
      underwriterData = { underwriter: { connect: { id: underwriter.id } } };
      underwriterId = underwriter.id;
    }

    // Check for duplicate (excluding current product)
    const duplicate = await checkDuplicateProduct(validatedData, underwriterId, id);
    if (duplicate) {
      return res.status(400).json({ message: "Duplicate product exists with the same underwriter, vehicle class, coverage, agent code, age/value range, passengers or tonnage" });
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
