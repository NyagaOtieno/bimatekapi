// controllers/productController.js
const Product = require("../models/Product");

/**
 * ===========================
 * CREATE NEW PRODUCT
 * ===========================
 */
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      underwriter,
      vehicleClass,
      coverage,
      agentcode,
      coverPeriod,
      premium_week,
      premium_2weeks,
      premium_month,
      premium_3months,
      premium_6months,
      basePremium,
      minValue,
      maxValue,
      minAge,
      maxAge,
      minTonnage,
      maxTonnage,
      Seats,
      minimumPremium,
    } = req.body;

    // Check for duplicate product based on rules
    const existingProduct = await Product.findOne({
      underwriter,
      vehicleClass,
      coverage,
      agentcode,
      Seats,
      minValue,
      maxValue,
      minAge,
      maxAge,
      minTonnage,
      maxTonnage,
    });

    if (existingProduct) {
      return res.status(400).json({
        message:
          "Duplicate product exists with same underwriter, vehicle class, coverage, agent code, age/value range, tonnage, or seats",
      });
    }

    const newProduct = new Product({
      name,
      description,
      underwriter,
      vehicleClass,
      coverage,
      agentcode,
      coverPeriod,
      premium_week,
      premium_2weeks,
      premium_month,
      premium_3months,
      premium_6months,
      basePremium,
      minValue,
      maxValue,
      minAge,
      maxAge,
      minTonnage,
      maxTonnage,
      Seats,
      minimumPremium,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * ===========================
 * GET ALL PRODUCTS
 * ===========================
 */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * ===========================
 * GET SINGLE PRODUCT BY ID
 * ===========================
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * ===========================
 * UPDATE PRODUCT
 * ===========================
 */
exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      underwriter,
      vehicleClass,
      coverage,
      agentcode,
      coverPeriod,
      premium_week,
      premium_2weeks,
      premium_month,
      premium_3months,
      premium_6months,
      basePremium,
      minValue,
      maxValue,
      minAge,
      maxAge,
      minTonnage,
      maxTonnage,
      Seats,
      minimumPremium,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    // Update fields
    product.name = name;
    product.description = description;
    product.underwriter = underwriter;
    product.vehicleClass = vehicleClass;
    product.coverage = coverage;
    product.agentcode = agentcode;
    product.coverPeriod = coverPeriod;
    product.premium_week = premium_week;
    product.premium_2weeks = premium_2weeks;
    product.premium_month = premium_month;
    product.premium_3months = premium_3months;
    product.premium_6months = premium_6months;
    product.basePremium = basePremium;
    product.minValue = minValue;
    product.maxValue = maxValue;
    product.minAge = minAge;
    product.maxAge = maxAge;
    product.minTonnage = minTonnage;
    product.maxTonnage = maxTonnage;
    product.Seats = Seats;
    product.minimumPremium = minimumPremium;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * ===========================
 * DELETE PRODUCT
 * ===========================
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * ===========================
 * FETCH QUOTE
 * ===========================
 */
exports.fetchQuote = async (req, res) => {
  try {
    const { underwriter, vehicleClass, coverage, agentcode, value, age, tonnage, Seats, coverPeriod } =
      req.body;

    // Find matching product
    const product = await Product.findOne({
      underwriter,
      vehicleClass,
      coverage,
      agentcode,
      Seats,
      minValue: { $lte: value || Number.MAX_SAFE_INTEGER },
      maxValue: { $gte: value || 0 },
      minAge: { $lte: age || Number.MAX_SAFE_INTEGER },
      maxAge: { $gte: age || 0 },
      minTonnage: { $lte: tonnage || Number.MAX_SAFE_INTEGER },
      maxTonnage: { $gte: tonnage || 0 },
    });

    if (!product) {
      return res.status(404).json({
        message: "No eligible product found",
      });
    }

    // Pick premium field by coverPeriod
    const COVER_PERIOD_MAP = {
      ONE_WEEK: "premium_week",
      TWO_WEEKS: "premium_2weeks",
      ONE_MONTH: "premium_month",
      THREE_MONTHS: "premium_3months",
      SIX_MONTHS: "premium_6months",
      ONE_YEAR: "basePremium",
    };

    const premiumField = COVER_PERIOD_MAP[coverPeriod];
    const premium = product[premiumField] || product.basePremium;

    // Ensure minimum premium
    const finalPremium = Math.max(
      premium,
      product.minimumPremium || 0
    );

    res.json({
      productId: product._id,
      underwriter: product.underwriter,
      vehicleClass: product.vehicleClass,
      coverage: product.coverage,
      agentcode: product.agentcode,
      Seats: product.Seats,
      tonnage: tonnage,
      coverPeriod,
      premium: finalPremium,
    });
  } catch (error) {
    console.error("Error fetching quote:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
