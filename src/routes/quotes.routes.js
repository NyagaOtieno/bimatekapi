const express = require("express");
const router = express.Router();
const quoteController = require("../../controllers/quoteController");

// ========================
// QUOTE ROUTES
// ========================

// Fetch a quote (does not save to DB, just calculates & returns)
router.post("/fetch", quoteController.fetchQuote);

// Save a quote (persists to DB)
router.post("/save", quoteController.saveQuote);

// Get all saved quotes (optional filtering)
router.get("/", quoteController.getQuotes);

// Get a single saved quote by ID
router.get("/:id", quoteController.getQuoteById);

// Update a saved quote by ID
router.put("/:id", quoteController.updateQuote);

// Delete a saved quote by ID
router.delete("/:id", quoteController.deleteQuote);

module.exports = router;
