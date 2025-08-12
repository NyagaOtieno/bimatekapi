/*
  Warnings:

  - The `vehicleClass` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "vehicleClass",
ADD COLUMN     "vehicleClass" TEXT[];

-- CreateIndex
CREATE INDEX "Product_vehicleClass_coverage_coverPeriod_agentcode_underwr_idx" ON "public"."Product"("vehicleClass", "coverage", "coverPeriod", "agentcode", "underwriter");
