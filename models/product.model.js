// models/product.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const Product = sequelize.define(
    "Product",
    {
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },

      basePremium: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

      underwriter: { type: DataTypes.STRING, allowNull: false },

      // Multiple vehicle classes stored as JSON array
      vehicleClass: { type: DataTypes.JSONB, allowNull: false },

      // Coverage type as ENUM
      coverage: {
        type: DataTypes.ENUM(
          "THIRD_PARTY_ONLY",
          "THIRD_PARTY_FIRE_AND_THEFT",
          "COMPREHENSIVE"
        ),
        allowNull: false,
      },

      make: { type: DataTypes.STRING, allowNull: false },
      agentcode: { type: DataTypes.STRING, allowNull: false },
      coverPeriod: { type: DataTypes.STRING, allowNull: false },

      value: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      yearOfManufacture: { type: DataTypes.INTEGER, allowNull: false },

      // Optional tonnage for goods/cartage products
      tonnage: { type: DataTypes.INTEGER },
      minTonnage: { type: DataTypes.INTEGER },
      maxTonnage: { type: DataTypes.INTEGER },

      passengers: { type: DataTypes.INTEGER },

      // Age/Value ranges for premium determination
      minAge: { type: DataTypes.INTEGER },
      maxAge: { type: DataTypes.INTEGER },
      minValue: { type: DataTypes.DECIMAL(15, 2) },
      maxValue: { type: DataTypes.DECIMAL(15, 2) },

      // Excluded vehicle makes as JSON array
      excludedMakes: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },

      // Premiums for different periods
      premium_week: { type: DataTypes.DECIMAL(10, 2) },
      premium_2weeks: { type: DataTypes.DECIMAL(10, 2) },
      premium_month: { type: DataTypes.DECIMAL(10, 2) },
      premium_3months: { type: DataTypes.DECIMAL(10, 2) },
      premium_6months: { type: DataTypes.DECIMAL(10, 2) },
      premium_annual: { type: DataTypes.DECIMAL(10, 2) },
    },
    {
      indexes: [
        {
          unique: true,
          fields: [
            "underwriter",
            "coverPeriod",
            "agentcode",
            "coverage",
            "minAge",
            "maxAge",
            "minValue",
            "maxValue",
            "minTonnage",
            "maxTonnage",
          ],
          name: "unique_product_constraint",
        },
      ],
    }
  );

  return Product;
};
