const express = require("express");
const router = express.Router();
const quoteController = require("../../controllers/quoteController");
const { productValidationSchema } = require("../../validation/product.validation");

// ========================
// QUOTE ROUTES
// ========================

// Create a new quote
router.post("/", quoteController.createQuote);

// Get all quotes (optional filtering)
router.get("/", quoteController.getQuotes);

// Get a single quote by ID
router.get("/:id", quoteController.getQuoteById);

// Update a quote by ID
router.put("/:id", quoteController.updateQuote);

// Delete a quote by ID
router.delete("/:id", quoteController.deleteQuote);

module.exports = router;
