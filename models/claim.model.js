module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Claim = sequelize.define('Claim', {
    policyId: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'Pending' },
    amountClaimed: { type: DataTypes.FLOAT },
    amountApproved: { type: DataTypes.FLOAT }
  });

  return Claim;
};
