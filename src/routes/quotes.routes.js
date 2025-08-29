// routes/quotes.routes.js 
const express = require("express");
const router = express.Router();
const quoteController = require("../../controllers/quoteController");

// ========================
// QUOTE ROUTES
// ========================

// Fetch quotes (calculate only, does not save)
router.post("/fetch", (req, res, next) => {
  if (typeof quoteController.fetchQuote === "function") {
    return quoteController.fetchQuote(req, res, next);
  }
  return res.status(500).json({ error: "fetchQuote not implemented" });
});

// Save a quote (persists to DB)
router.post("/save", (req, res, next) => {
  if (typeof quoteController.createQuote === "function") {
    return quoteController.createQuote(req, res, next);
  }
  return res.status(500).json({ error: "createQuote not implemented" });
});

// Get all saved quotes
router.get("/", (req, res, next) => {
  if (typeof quoteController.getQuotes === "function") {
    return quoteController.getQuotes(req, res, next);
  }
  return res.status(500).json({ error: "getQuotes not implemented" });
});

// Get a single saved quote by ID
router.get("/:id", (req, res, next) => {
  if (typeof quoteController.getQuoteById === "function") {
    return quoteController.getQuoteById(req, res, next);
  }
  return res.status(500).json({ error: "getQuoteById not implemented" });
});

// Update a saved quote by ID
router.put("/:id", (req, res, next) => {
  if (typeof quoteController.updateQuote === "function") {
    return quoteController.updateQuote(req, res, next);
  }
  return res.status(500).json({ error: "updateQuote not implemented" });
});

// Delete a saved quote by ID
router.delete("/:id", (req, res, next) => {
  if (typeof quoteController.deleteQuote === "function") {
    return quoteController.deleteQuote(req, res, next);
  }
  return res.status(500).json({ error: "deleteQuote not implemented" });
});

module.exports = router;
