module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Product = sequelize.define('Product', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    basePremium: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    underwriter: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vehicleClass: {
      type: DataTypes.STRING,
      allowNull: false
    },
    coverage: {
      type: DataTypes.STRING,
      allowNull: false
    },
    period: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    make: {
      type: DataTypes.STRING,
      allowNull: false
    },
    yearOfManufacture: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tonnage: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    passengers: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    agentcode: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['vehicleClass', 'coverage', 'make', 'yearOfManufacture', 'period', 'agentcode']
      }
    ]
  });

  return Product;
};
