module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Client = sequelize.define('Client', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    idNumber: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING, defaultValue: 'Individual' }
  });

  return Client;
};
