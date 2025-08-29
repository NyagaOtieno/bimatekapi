const express = require("express");
const router = express.Router();
const underwriterController = require("../../controllers/underwriterController");

// ✅ Sync all underwriters from seed list
router.post("/seed", underwriterController.seedUnderwriters);

module.exports = router;
