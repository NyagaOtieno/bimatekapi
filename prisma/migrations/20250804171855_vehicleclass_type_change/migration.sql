/*
  Warnings:

  - Changed the type of `coverage` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `vehicleClass` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "VehicleClass" AS ENUM ('MOTORCYCLE_PRIVATE', 'MOTORCYCLE_PSV', 'MOTORCYCLE_COMMERCIAL', 'TRICYCLE_OWN_GOODS', 'TRICYCLE_PSV', 'MOTORVEHICLE_PRIVATE', 'MOTORVEHICLE_OWN_GOODS', 'MOTORVEHICLE_GENERAL_CARTAGE', 'MOTORVEHICLE_AGRICULTURE', 'MOTORVEHICLE_CHAUFFEUR', 'MOTOR_TRADE', 'MOTORVEHICLE_INSTITUTIONAL', 'MOTORVEHICLE_DRIVING_SCHOOL', 'MOTORVEHICLE_TOUR_SERVICE', 'PSV_MATATU', 'PSV_TAXI', 'PSV_BUS', 'AMBULANCE_FIRE', 'HEAVY_MACHINERY', 'UBER', 'TANKER_LIQUID', 'PRIME_MOVER');

-- CreateEnum
CREATE TYPE "CoverageType" AS ENUM ('TPO', 'COMPREHENSIVE');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "coverage",
ADD COLUMN     "coverage" "CoverageType" NOT NULL,
DROP COLUMN "vehicleClass",
ADD COLUMN     "vehicleClass" "VehicleClass" NOT NULL;

-- DropEnum
DROP TYPE "VehicleClassId";

-- CreateIndex
CREATE UNIQUE INDEX "Product_vehicleClass_coverage_period_agentcode_key" ON "Product"("vehicleClass", "coverage", "period", "agentcode");
