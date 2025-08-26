// routes/product.routes.js
const express = require("express");
const router = express.Router();
const productController = require("../../controllers/productController");

// ✅ Import validation schema
const { productValidationSchema } = require("../../validation/product.validation");

// ========================
// Middleware (Reusable)
// ========================
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.details.map((d) => ({
            field: d.context?.key || "unknown",
            message: d.message,
          })),
        });
      }
      next();
    } catch (err) {
      console.error("Validation middleware error:", err);
      return res.status(500).json({ message: "Internal validation error" });
    }
  };
};

// ========================
// Product Routes
// ========================

// Create a new product
router.post("/", validateRequest(productValidationSchema), productController.createProduct);

// Get all products (with optional query filters)
router.get("/", productController.getProducts);

// Get a single product by ID
router.get("/:id", productController.getProductById);

// Update a product by ID
router.put("/:id", validateRequest(productValidationSchema), productController.updateProduct);

// Delete a product by ID
router.delete("/:id", productController.deleteProduct);

module.exports = router;
