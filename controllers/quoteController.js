const Quote = require("../models/Quote");
const Product = require("../models/Product");

// ========================
// FETCH QUOTE (calculate only, no ID needed)
// ========================
exports.fetchQuote = async (req, res) => {
  try {
    const { productId, vehicleValue, agentCode } = req.body;

    if (!productId || !vehicleValue) {
      return res.status(400).json({ message: "productId and vehicleValue are required" });
    }

    // Get the selected product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Calculate premium
    const rate = product.rate || 0.05; // default 5% if no rate
    let premium = vehicleValue * rate;

    // Apply minimum premium rule
    if (product.minimumPremium && premium < product.minimumPremium) {
      premium = product.minimumPremium;
    }

    // Adjust with agentCode (e.g., commission or discount logic)
    if (agentCode && agentCode.startsWith("VIP")) {
      premium = premium * 0.9; // 10% discount for VIP
    }

    // Return without saving
    return res.status(200).json({
      message: "Quote calculated successfully",
      product: product.name,
      underwriter: product.underwriter,
      coverage: product.coverage,
      vehicleClass: product.vehicleClass,
      premium,
    });
  } catch (error) {
    console.error("Error in fetchQuote:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========================
// CREATE QUOTE (save)
// ========================
exports.createQuote = async (req, res) => {
  try {
    const { productId, vehicleValue, clientName, agentCode } = req.body;

    if (!productId || !vehicleValue || !clientName) {
      return res.status(400).json({ message: "productId, vehicleValue and clientName are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Calculate premium
    const rate = product.rate || 0.05;
    let premium = vehicleValue * rate;
    if (product.minimumPremium && premium < product.minimumPremium) {
      premium = product.minimumPremium;
    }

    if (agentCode && agentCode.startsWith("VIP")) {
      premium = premium * 0.9;
    }

    // Save new quote
    const newQuote = new Quote({
      product: productId,
      clientName,
      vehicleValue,
      premium,
      agentCode,
    });

    await newQuote.save();

    res.status(201).json({
      message: "Quote created successfully",
      quote: newQuote,
    });
  } catch (error) {
    console.error("Error in createQuote:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========================
// DELETE QUOTE (needs ID)
// ========================
exports.deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Quote.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Quote not found" });
    }

    res.status(200).json({ message: "Quote deleted successfully" });
  } catch (error) {
    console.error("Error in deleteQuote:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
