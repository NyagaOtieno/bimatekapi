// controllers/quoteController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.fetchQuote = async (req, res) => {
  try {
    const {
      vehicleClass,
      coverage,
      coverPeriod,
      agentcode,
      value,
      passengers,
      yearOfManufacture,
      tonneage
    } = req.body;

    console.log("👉 Incoming request body:", req.body);

    // Step 1: Try to find product by strict required fields
    const products = await prisma.product.findMany({
      where: {
        vehicleClass: vehicleClass,
        coverage: coverage,
        coverPeriod: coverPeriod
      }
    });

    console.log("✅ Products fetched from DB:", products);

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found for class+coverage+period" });
    }

    // Step 2: Apply optional filters safely
    let matchingProduct = products.find((p) => {
      let isMatch = true;

      if (p.minValue && value && value < p.minValue) isMatch = false;
      if (p.maxValue && value && value > p.maxValue) isMatch = false;

      if (p.minPassengers && passengers && passengers < p.minPassengers) isMatch = false;
      if (p.maxPassengers && passengers && passengers > p.maxPassengers) isMatch = false;

      if (p.minYear && yearOfManufacture && yearOfManufacture < p.minYear) isMatch = false;
      if (p.maxYear && yearOfManufacture && yearOfManufacture > p.maxYear) isMatch = false;

      if (p.tonneage && tonneage && p.tonneage !== tonneage) isMatch = false;

      return isMatch;
    });

    if (!matchingProduct) {
      return res.status(404).json({ message: "No matching product found after optional filters" });
    }

    // Step 3: Calculate premium
    let premium = matchingProduct.basePremium;
    if (value) {
      premium = Math.max(matchingProduct.minimumPremium || 0, value * (matchingProduct.rate / 100));
    }

    return res.json({
      message: "Quote fetched successfully",
      product: matchingProduct,
      agentcode,
      premium
    });

  } catch (error) {
    console.error("❌ Error in fetchQuote:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
