const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper to normalize coverage strings
function normalizeCoverage(value) {
  if (!value) return undefined;

  const map = {
    "THIRD PARTY ONLY": "THIRD_PARTY_ONLY",
    "THIRD_PARTY_ONLY": "THIRD_PARTY_ONLY",
    "THIRD PARTY FIRE AND THEFT": "THIRD_PARTY_ONLY", // 🔄 treat as THIRD_PARTY_ONLY
    "THIRD_PARTY_FIRE_AND_THEFT": "THIRD_PARTY_ONLY", // 🔄 treat as THIRD_PARTY_ONLY
    "COMPREHENSIVE": "COMPREHENSIVE"
  };

  const key = value.trim().toUpperCase();
  return map[key] || undefined;
}

// ========================
// CREATE a new product
// ========================
router.post("/", async (req, res) => {
  try {
    // Normalize enum values before sending to Prisma
    const normalizedData = {
      ...req.body,
      coverage: normalizeCoverage(req.body.coverage),
    };

    const product = await prisma.product.create({
      data: normalizedData,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res
      .status(500)
      .json({ message: "Failed to create product", error: error.message });
  }
});

// ========================
// GET all products
// ========================
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
});

// ========================
// GET a single product by ID
// ========================
router.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: error.message });
  }
});

// ========================
// UPDATE a product by ID
// ========================
router.put("/:id", async (req, res) => {
  try {
    const normalizedData = {
      ...req.body,
      coverage: normalizeCoverage(req.body.coverage),
    };

    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: normalizedData,
    });

    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Product not found" });
    }
    res
      .status(500)
      .json({ message: "Failed to update product", error: error.message });
  }
});

// ========================
// DELETE a product by ID
// ========================
router.delete("/:id", async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Product not found" });
    }
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
});

module.exports = router;
