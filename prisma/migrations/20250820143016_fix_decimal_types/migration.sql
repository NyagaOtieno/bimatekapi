/*
  Warnings:

  - You are about to drop the column `agentcode` on the `Quote` table. All the data in the column will be lost.
  - You are about to drop the column `name_contact` on the `Quote` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `Quote` table. All the data in the column will be lost.
  - You are about to drop the column `vehicle_reg` on the `Quote` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Quote` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `make` on the `Quote` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `value` on the `Quote` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `yearOfManufacture` on the `Quote` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `email` on the `Quote` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `passengers` on the `Quote` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `tonnage` on the `Quote` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `coverPeriod` on the `Quote` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - A unique constraint covering the columns `[vehicleReg]` on the table `Quote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `agentCode` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactName` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleReg` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `cover` on the `Quote` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."Quote" DROP CONSTRAINT "Quote_productId_fkey";

-- DropIndex
DROP INDEX "public"."Product_vehicleClass_coverage_coverPeriod_agentcode_underwr_idx";

-- AlterTable
ALTER TABLE "public"."Claim" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."Quote" DROP COLUMN "agentcode",
DROP COLUMN "name_contact",
DROP COLUMN "phone_number",
DROP COLUMN "vehicle_reg",
ADD COLUMN     "agentCode" VARCHAR(50) NOT NULL,
ADD COLUMN     "contactName" VARCHAR(120) NOT NULL,
ADD COLUMN     "model" VARCHAR(100),
ADD COLUMN     "phoneNumber" VARCHAR(30) NOT NULL,
ADD COLUMN     "vehicleReg" VARCHAR(50) NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "make" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "value" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "yearOfManufacture" SET DATA TYPE SMALLINT,
DROP COLUMN "cover",
ADD COLUMN     "cover" "public"."CoverageType" NOT NULL,
ALTER COLUMN "email" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "passengers" SET DATA TYPE SMALLINT,
ALTER COLUMN "tonnage" SET DATA TYPE SMALLINT,
ALTER COLUMN "coverPeriod" SET DATA TYPE VARCHAR(50);

-- CreateIndex
CREATE INDEX "Product_coverage_agentcode_underwriter_idx" ON "public"."Product"("coverage", "agentcode", "underwriterId");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_vehicleReg_key" ON "public"."Quote"("vehicleReg");

-- CreateIndex
CREATE INDEX "Quote_agentCode_idx" ON "public"."Quote"("agentCode");

-- CreateIndex
CREATE INDEX "Quote_cover_idx" ON "public"."Quote"("cover");

-- CreateIndex
CREATE INDEX "Quote_vehicleReg_idx" ON "public"."Quote"("vehicleReg");

-- CreateIndex
CREATE INDEX "Quote_createdAt_idx" ON "public"."Quote"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Quote" ADD CONSTRAINT "Quote_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
