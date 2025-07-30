module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Product = sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false },
    underwriter: { type: DataTypes.STRING, allowNull: false },
    coverage: { type: DataTypes.STRING, allowNull: false },
    vehicleClass: { type: DataTypes.STRING }
  });

  return Product;
};
