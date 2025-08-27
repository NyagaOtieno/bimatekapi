// scripts/removeDuplicates.js
const mongoose = require("mongoose");
const Product = require("../models/Product"); // adjust path if needed

// ✅ MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jendiesure";
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

(async () => {
  try {
    console.log("🔍 Finding duplicate products...");

    // Step 1: Group by unique fields
    const duplicates = await Product.aggregate([
      {
        $group: {
          _id: {
            name: "$name",
            underwriter: "$underwriter",
            vehicleClass: "$vehicleClass",
            coverage: "$coverage",
          },
          ids: { $push: "$_id" },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    if (duplicates.length === 0) {
      console.log("✅ No duplicate products found.");
      process.exit(0);
    }

    console.log(`⚠️ Found ${duplicates.length} duplicate groups.`);

    // Step 2: Delete duplicates, keep first inserted
    for (const group of duplicates) {
      const { ids } = group;

      // Sort IDs (oldest first)
      const sorted = ids.sort((a, b) => a.getTimestamp() - b.getTimestamp());

      // Keep the first, delete the rest
      const [keep, ...remove] = sorted;

      if (remove.length > 0) {
        await Product.deleteMany({ _id: { $in: remove } });
        console.log(
          `🗑️ Removed ${remove.length} duplicates for product [${group._id.name}] underwriter: ${group._id.underwriter}, vehicleClass: ${group._id.vehicleClass}, coverage: ${group._id.coverage}`
        );
      }
    }

    console.log("🎉 Duplicate cleanup complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error removing duplicates:", err);
    process.exit(1);
  }
})();
