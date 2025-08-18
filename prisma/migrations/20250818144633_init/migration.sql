/*
  Warnings:

  - You are about to drop the column `maxTonnage` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `minTonnage` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `premium_2weeks` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `premium_3months` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `premium_6months` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `premium_month` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `premium_week` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `underwriter` on the `Product` table. All the data in the column will be lost.
  - The `vehicleClass` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `agent_code` on the `Quote` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `underwriterId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `agentcode` to the `Quote` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Product_vehicleClass_coverage_coverPeriod_agentcode_underwr_idx";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "maxTonnage",
DROP COLUMN "minTonnage",
DROP COLUMN "premium_2weeks",
DROP COLUMN "premium_3months",
DROP COLUMN "premium_6months",
DROP COLUMN "premium_month",
DROP COLUMN "premium_week",
DROP COLUMN "underwriter",
ADD COLUMN     "minimumPremium" DOUBLE PRECISION,
ADD COLUMN     "underwriterId" INTEGER NOT NULL,
ALTER COLUMN "basePremium" DROP NOT NULL,
DROP COLUMN "vehicleClass",
ADD COLUMN     "vehicleClass" "public"."VehicleClass"[];

-- AlterTable
ALTER TABLE "public"."Quote" DROP COLUMN "agent_code",
ADD COLUMN     "agentcode" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Underwriter" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Underwriter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Underwriter_name_key" ON "public"."Underwriter"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "public"."Product"("name");

-- CreateIndex
CREATE INDEX "Product_coverage_coverPeriod_agentcode_underwriter_idx" ON "public"."Product"("coverage", "coverPeriod", "agentcode", "underwriterId");

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_underwriterId_fkey" FOREIGN KEY ("underwriterId") REFERENCES "public"."Underwriter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
