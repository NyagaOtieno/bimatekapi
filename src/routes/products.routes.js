const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ========================
// Helper: Normalize coverage strings
// ========================
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

// ========================
// Validation: Product-specific rules
// ========================
function validateProductFields(data) {
  const { coverage, yearOfManufacture, value, minAge, maxAge, minValue, maxValue, ExcludedMakes, tonnage, passengers, coverPeriod } = data;

  switch (coverage) {
    case "COMPREHENSIVE":
      if (!yearOfManufacture) throw new Error("yearOfManufacture is required for COMPREHENSIVE");
      if (minAge == null || maxAge == null) throw new Error("minAge and maxAge are required for COMPREHENSIVE");
      if (minValue == null || maxValue == null) throw new Error("minValue and maxValue are required for COMPREHENSIVE");
      if (!Array.isArray(ExcludedMakes)) throw new Error("ExcludedMakes must be an array for COMPREHENSIVE");
      break;

    case "THIRD_PARTY_FIRE_AND_THEFT":
      if (!yearOfManufacture) throw new Error("yearOfManufacture is required for THIRD_PARTY_FIRE_AND_THEFT");
      if (minAge == null || maxAge == null) throw new Error("minAge and maxAge are required for THIRD_PARTY_FIRE_AND_THEFT");
      if (minValue == null || maxValue == null) throw new Error("minValue and maxValue are required for THIRD_PARTY_FIRE_AND_THEFT");
      if (!Array.isArray(ExcludedMakes)) throw new Error("ExcludedMakes must be an array for THIRD_PARTY_FIRE_AND_THEFT");
      break;

    case "THIRD_PARTY_ONLY":
      if (!coverPeriod) throw new Error("coverPeriod is required for THIRD_PARTY_ONLY");
      if (data.vehicleClass.includes("COMMERCIAL") || data.vehicleClass.includes("GENERAL_CARTAGE")) {
        if (tonnage == null) throw new Error("tonnage is required for COMMERCIAL or GENERAL_CARTAGE TPO");
      }
      if (data.vehicleClass.includes("PSV_MATATU") || data.vehicleClass.includes("PSV_BUS")) {
        if (passengers == null) throw new Error("passengers is required for PSV_MATATU or PSV_BUS TPO");
      }
      break;

    default:
      throw new Error("Unsupported coverage type");
  }
}

// ========================
// CREATE a new product
// ========================
router.post("/", async (req, res) => {
  try {
    const vehicleClass = Array.isArray(req.body.vehicleClass)
      ? req.body.vehicleClass
      : [req.body.vehicleClass].filter(Boolean);

    const coverage = normalizeCoverage(req.body.coverage);
    const ExcludedMakes = Array.isArray(req.body.ExcludedMakes) ? req.body.ExcludedMakes : [];

    const normalizedData = {
      ...req.body,
      vehicleClass,
      coverage,
      ExcludedMakes
    };

    validateProductFields(normalizedData);

    const product = await prisma.product.create({ data: normalizedData });
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ message: error.message });
  }
});

// ========================
// GET all products (with optional query filtering)
// ========================
router.get("/", async (req, res) => {
  try {
    const { name, coverage, vehicleClass, underwriter, minValue, maxValue } = req.query;

    const where = {};

    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }
    if (coverage) {
      where.coverage = { equals: normalizeCoverage(coverage) };
    }
    if (vehicleClass) {
      where.vehicleClass = { has: vehicleClass }; // Matches array fields in Prisma
    }
    if (underwriter) {
      where.underwriter = { contains: underwriter, mode: "insensitive" };
    }
    if (minValue) {
      where.value = { ...where.value, gte: parseFloat(minValue) };
    }
    if (maxValue) {
      where.value = { ...where.value, lte: parseFloat(maxValue) };
    }

    const products = await prisma.product.findMany({ where });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
});

// ========================
// GET a single product by ID
// ========================
router.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
});

// ========================
// UPDATE a product by ID
// ========================
router.put("/:id", async (req, res) => {
  try {
    const coverage = normalizeCoverage(req.body.coverage);
    const ExcludedMakes = Array.isArray(req.body.ExcludedMakes) ? req.body.ExcludedMakes : [];
    const vehicleClass = Array.isArray(req.body.vehicleClass)
      ? req.body.vehicleClass
      : [req.body.vehicleClass].filter(Boolean);

    const updatedData = {
      ...req.body,
      coverage,
      ExcludedMakes,
      vehicleClass
    };

    validateProductFields(updatedData);

    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: updatedData
    });

    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(400).json({ message: error.message });
  }
});

// ========================
// DELETE a product by ID
// ========================
router.delete("/:id", async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
});

module.exports = router;
