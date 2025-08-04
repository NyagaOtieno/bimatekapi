/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Policy` table. All the data in the column will be lost.
  - You are about to drop the column `agentcode` on the `Quote` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[vehicleClass,coverage,make,yearOfManufacture,period,agentcode]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `vehicleClass` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `agent_code` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cover` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverperiod` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_contact` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone_number` to the `Quote` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VehicleClassId" AS ENUM ('MOTORCYCLE_PRIVATE', 'MOTORCYCLE_PSV', 'MOTORCYCLE_COMMERCIAL', 'TRICYCLE_OWN_GOODS', 'TRICYCLE_PSV', 'MOTORVEHICLE_PRIVATE', 'MOTORVEHICLE_OWN_GOODS', 'MOTORVEHICLE_GENERAL_CARTAGE', 'MOTORVEHICLE_AGRICULTURE', 'MOTORVEHICLE_CHAUFFEUR', 'MOTOR_TRADE', 'MOTORVEHICLE_INSTITUTIONAL', 'MOTORVEHICLE_DRIVING_SCHOOL', 'MOTORVEHICLE_TOUR_SERVICE', 'PSV_MATATU', 'PSV_TAXI', 'PSV_BUS', 'AMBULANCE_FIRE', 'HEAVY_MACHINERY', 'UBER', 'TANKER_LIQUID', 'PRIME_MOVER');

-- DropForeignKey
ALTER TABLE "Policy" DROP CONSTRAINT "Policy_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Quote" DROP CONSTRAINT "Quote_userId_fkey";

-- AlterTable
ALTER TABLE "Policy" DROP COLUMN "createdAt",
ALTER COLUMN "clientId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "passengers" INTEGER,
ADD COLUMN     "period" TEXT,
ADD COLUMN     "tonnage" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "value" DOUBLE PRECISION,
ADD COLUMN     "yearOfManufacture" INTEGER,
DROP COLUMN "vehicleClass",
ADD COLUMN     "vehicleClass" "VehicleClassId" NOT NULL;

-- AlterTable
ALTER TABLE "Quote" DROP COLUMN "agentcode",
ADD COLUMN     "agent_code" INTEGER NOT NULL,
ADD COLUMN     "cover" TEXT NOT NULL,
ADD COLUMN     "coverperiod" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name_contact" TEXT NOT NULL,
ADD COLUMN     "passengers" INTEGER,
ADD COLUMN     "phone_number" TEXT NOT NULL,
ADD COLUMN     "tonnage" INTEGER,
ADD COLUMN     "vehicle_reg" TEXT,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "make" DROP NOT NULL,
ALTER COLUMN "value" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "yearOfManufacture" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_vehicleClass_coverage_make_yearOfManufacture_period_key" ON "Product"("vehicleClass", "coverage", "make", "yearOfManufacture", "period", "agentcode");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
