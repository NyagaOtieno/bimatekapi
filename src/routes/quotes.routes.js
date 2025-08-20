// routes/quotes.routes.js
const express = require("express");
const router = express.Router();
const quoteController = require("../../controllers/quoteController");

// ========================
// QUOTE ROUTES
// ========================

// Fetch a quote (does not save to DB, just calculates & returns)
router.post(
  "/fetch",
  (req, res, next) =>
    typeof quoteController.fetchQuote === "function"
      ? quoteController.fetchQuote(req, res, next)
      : res.status(500).json({ error: "fetchQuote not implemented" })
);

// Save a quote (persists to DB)
router.post(
  "/save",
  (req, res, next) =>
    typeof quoteController.saveQuote === "function"
      ? quoteController.saveQuote(req, res, next)
      : res.status(500).json({ error: "saveQuote not implemented" })
);

// Get all saved quotes (optional filtering)
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
