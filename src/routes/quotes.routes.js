const express = require("express");
const router = express.Router();
const quoteController = require("../../controllers/quoteController");

// Fetch quote (calculate only)
router.post("/fetch", quoteController.fetchQuote);

// Create & save quote
router.post("/", quoteController.createQuote);

// Delete quote by ID
router.delete("/:id", quoteController.deleteQuote);

module.exports = router;
