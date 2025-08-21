// routes/quotes.routes.js
const express = require("express");
const router = express.Router();
const quoteController = require("../../controllers/quoteController");

// ========================
// QUOTE ROUTES
// ========================

// Fetch quotes (calculate only, does not save)
router.post(
  "/fetch",
  (req, res, next) =>
    typeof quoteController.searchQuotes === "function"
      ? quoteController.searchQuotes(req, res, next)
      : res.status(500).json({ error: "searchQuotes not implemented" })
);

// Save a quote (persists to DB)
router.post(
  "/save",
  (req, res, next) =>
    typeof quoteController.createQuote === "function"
      ? quoteController.createQuote(req, res, next)
      : res.status(500).json({ error: "createQuote not implemented" })
);

// Get all saved quotes
router.get(
  "/",
  (req, res, next) =>
    typeof quoteController.getQuotes === "function"
      ? quoteController.getQuotes(req, res, next)
      : res.status(500).json({ error: "getQuotes not implemented" })
);

// Get a single saved quote by ID
router.get(
  "/:id",
  (req, res, next) =>
    typeof quoteController.getQuoteById === "function"
      ? quoteController.getQuoteById(req, res, next)
      : res.status(500).json({ error: "getQuoteById not implemented" })
);

// Update a saved quote by ID
router.put(
  "/:id",
  (req, res, next) =>
    typeof quoteController.updateQuote === "function"
      ? quoteController.updateQuote(req, res, next)
      : res.status(500).json({ error: "updateQuote not implemented" })
);

// Delete a saved quote by ID
router.delete(
  "/:id",
  (req, res, next) =>
    typeof quoteController.deleteQuote === "function"
      ? quoteController.deleteQuote(req, res, next)
      : res.status(500).json({ error: "deleteQuote not implemented" })
);

module.exports = router;
