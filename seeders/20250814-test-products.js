// seeders/20250814-test-products.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert("Product", [
      {
        name: "Private Car Comprehensive",
        coverage: JSON.stringify(["COMPREHENSIVE"]),
        vehicleClass: JSON.stringify(["PRIVATE_CAR"]),
        minAge: 18,
        maxAge: 70,
        minValue: 500000,
        maxValue: 2000000,
        ExcludedMakes: JSON.stringify(["Ferrari", "Lamborghini"]),
        premium: 20000,
        createdAt: now,
        updatedAt: now
      },
      {
        name: "PSV Matatu TPO",
        coverage: JSON.stringify(["THIRD_PARTY_ONLY"]),
        vehicleClass: JSON.stringify(["PSV_MATATU"]),
        passengers: 14,
        coverPeriod: 12,
        premium: 5000,
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Commercial Truck Fire & Theft",
        coverage: JSON.stringify(["THIRD_PARTY_FIRE_AND_THEFT"]),
        vehicleClass: JSON.stringify(["COMMERCIAL"]),
        tonnage: 10,
        minAge: 21,
        maxAge: 65,
        minValue: 1000000,
        maxValue: 5000000,
        ExcludedMakes: JSON.stringify(["Scania", "Volvo"]),
        premium: 35000,
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Product", null, {});
  }
};
