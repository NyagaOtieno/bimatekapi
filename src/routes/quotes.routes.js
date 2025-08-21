// routes/quotes.routes.js
const express = require("express");
const router = express.Router();
const quoteController = require("../../controllers/quoteController");

// ========================
// Helper: safe route binder
// ========================
const safeRoute = (handlerName) => (req, res, next) => {
  if (typeof quoteController[handlerName] === "function") {
    return quoteController[handlerName](req, res, next);
  }
  res.status(500).json({ error: `${handlerName} not implemented` });
};

// ========================
// QUOTE ROUTES
// ========================

// Fetch a quote (does not save to DB, just calculates & returns)
router.post("/fetch", safeRoute("fetchQuote"));

// Save a quote (persists to DB)
router.post("/save", safeRoute("saveQuote"));

// Get all saved quotes (optional filtering)
router.get("/", safeRoute("getQuotes"));

// Get a single saved quote by ID
router.get("/:id", safeRoute("getQuoteById"));

// Update a saved quote by ID
router.put("/:id", safeRoute("updateQuote"));

// Delete a saved quote by ID
router.delete("/:id", safeRoute("deleteQuote"));

module.exports = router;
