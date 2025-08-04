/*
  Warnings:

  - You are about to drop the column `make` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `tonnage` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `yearOfManufacture` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[vehicleClass,coverage,period,agentcode]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Product_vehicleClass_coverage_make_yearOfManufacture_period_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "make",
DROP COLUMN "tonnage",
DROP COLUMN "value",
DROP COLUMN "yearOfManufacture",
ADD COLUMN     "ExcludedMakes" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_vehicleClass_coverage_period_agentcode_key" ON "Product"("vehicleClass", "coverage", "period", "agentcode");
