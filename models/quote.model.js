module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Quote = sequelize.define('Quote', {
    productId: { type: DataTypes.INTEGER, allowNull: false },
    value: { type: DataTypes.FLOAT, allowNull: false },
    period: { type: DataTypes.INTEGER, allowNull: false },
    make: { type: DataTypes.STRING, allowNull: true },
    yearOfManufacture: { type: DataTypes.INTEGER, allowNull: true },
    agent_code: { type: DataTypes.INTEGER, allowNull: false },
    name_contact: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone_number: { type: DataTypes.STRING, allowNull: false },
    vehicle_reg: { type: DataTypes.STRING, allowNull: true },
    cover: { type: DataTypes.STRING, allowNull: false },
    coverperiod: { type: DataTypes.STRING, allowNull: false },
    tonnage: { type: DataTypes.INTEGER, allowNull: true },
    passengers: { type: DataTypes.INTEGER, allowNull: true },
    price: { type: DataTypes.FLOAT, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  });

  return Quote;
};
