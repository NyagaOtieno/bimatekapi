// models/product.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const Product = sequelize.define(
    "Product",
    {
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.STRING },
      basePremium: { type: DataTypes.FLOAT, allowNull: false },
      underwriter: { type: DataTypes.STRING, allowNull: false },

      // Multiple vehicle classes (e.g., PRIVATE, PSV, TPO_CARTAGE)
      vehicleClass: {
        type: DataTypes.ARRAY(DataTypes.STRING), // Postgres only
        allowNull: false,
      },

      // Single coverage type - enum-like validation
      coverage: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [["THIRD_PARTY_ONLY", "COMPREHENSIVE"]],
        },
      },

      make: { type: DataTypes.STRING, allowNull: false },
      agentcode: { type: DataTypes.STRING, allowNull: false },
      coverPeriod: { type: DataTypes.STRING, allowNull: false },

      value: { type: DataTypes.FLOAT, allowNull: false },
      yearOfManufacture: { type: DataTypes.INTEGER, allowNull: false },

      // Optional tonnage for goods/cartage products
      tonnage: { type: DataTypes.INTEGER, allowNull: true },
      minTonnage: { type: DataTypes.INTEGER, allowNull: true },
      maxTonnage: { type: DataTypes.INTEGER, allowNull: true },

      passengers: { type: DataTypes.INTEGER, allowNull: true },

      // Age/Value ranges for premium determination
      minAge: { type: DataTypes.INTEGER, allowNull: true },
      maxAge: { type: DataTypes.INTEGER, allowNull: true },
      minValue: { type: DataTypes.FLOAT, allowNull: true },
      maxValue: { type: DataTypes.FLOAT, allowNull: true },

      // Excluded vehicle makes
      ExcludedMakes: {
        type: DataTypes.ARRAY(DataTypes.STRING), // Postgres only
        allowNull: true,
        defaultValue: [],
      },

      // Premiums for different periods
      premium_week: { type: DataTypes.FLOAT, allowNull: true },
      premium_2weeks: { type: DataTypes.FLOAT, allowNull: true },
      premium_month: { type: DataTypes.FLOAT, allowNull: true },
      premium_3months: { type: DataTypes.FLOAT, allowNull: true },
      premium_6months: { type: DataTypes.FLOAT, allowNull: true },
      premium_annual: { type: DataTypes.FLOAT, allowNull: true },
    },
    {
      indexes: [
        {
          unique: true,
          fields: [
            "underwriter",
            "coverPeriod",
            "agentcode",
            "vehicleClass",
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
