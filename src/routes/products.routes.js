const express = require("express");
const router = express.Router();
const productController = require("../../controllers/productController");

// ✅ Import validation schema
const { productValidationSchema } = require("../../validation/product.validation");

// ✅ Middleware for validating request body
const validateProduct = (req, res, next) => {
  try {
    const { error } = productValidationSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details.map((d) => d.message),
      });
    }
    next();
  } catch (err) {
    console.error("Validation middleware error:", err);
    return res.status(500).json({ message: "Internal validation error" });
  }
};

// ========================
// Product Routes
// ========================

// Create a new product (with validation)
router.post("/", validateProduct, productController.createProduct);

// Get all products (with optional query filtering)
router.get("/", productController.getProducts);

// Get a single product by ID
router.get("/:id", productController.getProductById);

// Update a product by ID (with validation)
router.put("/:id", validateProduct, productController.updateProduct);

// Delete a product by ID
router.delete("/:id", productController.deleteProduct);

module.exports = router;
