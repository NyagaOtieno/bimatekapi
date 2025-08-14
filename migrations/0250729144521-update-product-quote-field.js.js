'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // ✅ Update Product table
    await queryInterface.addColumn('Product', 'description', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Product', 'period', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Product', 'value', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('Product', 'make', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Product', 'yearOfManufacture', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('Product', 'tonnage', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('Product', 'passengers', {
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
    await queryInterface.removeColumn('Product', 'description');
    await queryInterface.removeColumn('Product', 'period');
    await queryInterface.removeColumn('Product', 'value');
    await queryInterface.removeColumn('Product', 'make');
    await queryInterface.removeColumn('Product', 'yearOfManufacture');
    await queryInterface.removeColumn('Product', 'tonnage');
    await queryInterface.removeColumn('Product', 'passengers');

    // ❌ Remove added columns from Quote table
    await queryInterface.removeColumn('Quotes', 'vehicle_reg');
    await queryInterface.removeColumn('Quotes', 'cover');
    await queryInterface.removeColumn('Quotes', 'coverperiod');
    await queryInterface.removeColumn('Quotes', 'tonnage');
    await queryInterface.removeColumn('Quotes', 'passengers');
  }
};
