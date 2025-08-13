const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// POST /api/quotes
router.post("/", async (req, res) => {
  try {
    const {
      vehicleClass,
      coverage,       // might be provided
      cover,          // alternative name for coverage
      coverPeriod,
      agent_code,
      make,
      model
    } = req.body;

    // Allow either "coverage" or "cover"
    const normalizedCoverage = (coverage || cover)?.toUpperCase();

    // Validation
    if (!vehicleClass || !normalizedCoverage || !coverPeriod || !agent_code) {
      return res.status(400).json({
        error: "Missing required field: vehicleClass, coverage/cover, coverPeriod, or agent_code."
      });
    }

    const vehicleClassEnum = vehicleClass.toUpperCase();

    // Fetch product that matches parameters
    const product = await prisma.product.findFirst({
      where: {
        vehicleClass: { has: vehicleClassEnum },
        coverage: { has: normalizedCoverage },
        coverPeriod: coverPeriod,
        agent_code: agent_code,
        // Apply ExcludedMakes filter only if make is given
        NOT: make
          ? { ExcludedMakes: { contains: make, mode: "insensitive" } }
          : undefined
      }
    });

    if (!product) {
      return res.status(404).json({
        error: "No matching product found for the given criteria."
      });
    }

    // Premium calculation (simple example)
    const basePremium = product.basePremium || 0;
    const rate = product.rate || 1;
    const premium = basePremium * rate;

    res.json({
      success: true,
      data: {
        productId: product.id,
        underwriter: product.underwriter,
        vehicleClass: vehicleClassEnum,
        coverage: normalizedCoverage,
        coverPeriod,
        agent_code,
        make,
        model,
        premium
      }
    });

  } catch (err) {
    console.error("Error generating quote:", err);
    res.status(500).json({
      error: "Internal server error"
    });
  }
});

module.exports = router;
