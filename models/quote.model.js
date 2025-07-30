module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Quote = sequelize.define('Quote', {
    vehicleClass: { type: DataTypes.STRING, allowNull: false },
    coverage: { type: DataTypes.STRING, allowNull: false },
    agentCode: { type: DataTypes.STRING, allowNull: false },
    premium: { type: DataTypes.FLOAT, allowNull: false }
  });

  return Quote;
};
