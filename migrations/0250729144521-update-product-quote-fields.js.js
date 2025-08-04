'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // ✅ Update Product table
    await queryInterface.addColumn('Products', 'description', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Products', 'period', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Products', 'value', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('Products', 'make', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Products', 'yearOfManufacture', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('Products', 'tonnage', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('Products', 'passengers', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // ✅ Update Quote table
    await queryInterface.addColumn('Quotes', 'vehicle_reg', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Quotes', 'cover', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('Quotes', 'coverperiod', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('Quotes', 'tonnage', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('Quotes', 'passengers', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // ❌ Remove added columns from Product table
    await queryInterface.removeColumn('Products', 'description');
    await queryInterface.removeColumn('Products', 'period');
    await queryInterface.removeColumn('Products', 'value');
    await queryInterface.removeColumn('Products', 'make');
    await queryInterface.removeColumn('Products', 'yearOfManufacture');
    await queryInterface.removeColumn('Products', 'tonnage');
    await queryInterface.removeColumn('Products', 'passengers');

    // ❌ Remove added columns from Quote table
    await queryInterface.removeColumn('Quotes', 'vehicle_reg');
    await queryInterface.removeColumn('Quotes', 'cover');
    await queryInterface.removeColumn('Quotes', 'coverperiod');
    await queryInterface.removeColumn('Quotes', 'tonnage');
    await queryInterface.removeColumn('Quotes', 'passengers');
  }
};
