// routes/product.routes.js
const express = require("express");
const router = express.Router();
const productController = require("../../controllers/productController");

// ✅ Import validation schema
const { productValidationSchema } = require("../../validation/product.validation");

// ========================
// Middleware
// ========================
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

// ✅ Create a new product
router.post("/", validateProduct, productController.createProduct);

// ✅ Get all products (supports filtering, pagination, sorting via query params)
router.get("/", productController.getProducts);

// ✅ Get a single product by ID
router.get("/:id", productController.getProductById);

// ✅ Update a product by ID
router.put("/:id", validateProduct, productController.updateProduct);

// ✅ Delete a product by ID
router.delete("/:id", productController.deleteProduct);

// ✅ Bulk delete (optional - handles multiple product IDs at once)
router.delete("/", productController.deleteMultipleProducts);

module.exports = router;
