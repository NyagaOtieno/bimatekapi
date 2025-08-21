module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Quote = sequelize.define('Quote', {
    productId: { type: DataTypes.INTEGER, allowNull: false },
    value: { type: DataTypes.FLOAT, allowNull: false },
    make: { type: DataTypes.STRING, allowNull: true },
    yearOfManufacture: { type: DataTypes.INTEGER, allowNull: true },
    agent_code: { type: DataTypes.STRING, allowNull: false }, 
    name_contact: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone_number: { type: DataTypes.STRING, allowNull: false },
    vehicle_reg: { type: DataTypes.STRING, allowNull: true },

    // Updated from STRING to ENUM for cover
    cover: {
      type: DataTypes.ENUM(
        'COMPREHENSIVE',
        'THIRD_PARTY_ONLY',
        'THIRD_PARTY_FIRE_AND_THEFT'
      ),
      allowNull: false,
    },

    // Updated from STRING to ENUM for coverPeriod
    coverPeriod: {
      type: DataTypes.ENUM(
        'ONE_WEEK',
        'TWO_WEEKS',
        'ONE_MONTH',
        'SIX_MONTHS',
        'ONE_YEAR'
      ),
      allowNull: false,
    },

    tonnage: { type: DataTypes.INTEGER, allowNull: true },
    passengers: { type: DataTypes.INTEGER, allowNull: true },

    // === NEW FIELD for minimum premium ===
    minimumPremium: { type: DataTypes.FLOAT, allowNull: true },

    price: { type: DataTypes.FLOAT, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  });

  return Quote;
};
