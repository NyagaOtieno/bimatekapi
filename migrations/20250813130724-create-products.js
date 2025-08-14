'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Product', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      underwriter: {
        type: Sequelize.STRING,
        allowNull: false
      },
      vehicleClass: {
        type: Sequelize.STRING,
        allowNull: false
      },
      coverage: {
        type: Sequelize.STRING,
        allowNull: false
      },
      agentCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      baseRate: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      minPremium: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      // Quote-specific fields
      discountRate: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      commissionRate: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      levy: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      trainingLevy: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      policyHolderFund: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Product');
  }
};
