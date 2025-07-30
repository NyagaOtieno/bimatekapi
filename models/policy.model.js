module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Policy = sequelize.define('Policy', {
    clientName: { type: DataTypes.STRING, allowNull: false },
    product: { type: DataTypes.STRING, allowNull: false },
    premium: { type: DataTypes.FLOAT, allowNull: false },
    agentCode: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'Active' }
  });

  return Policy;
};
