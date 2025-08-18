/*
  Warnings:

  - A unique constraint covering the columns `[underwriterId,agentcode,vehicleClass,coverage,minAge,maxAge,minValue,maxValue,passengers,tonnage]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Product_coverage_coverPeriod_agentcode_underwriter_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Product_underwriterId_agentcode_vehicleClass_coverage_minAg_key" ON "public"."Product"("underwriterId", "agentcode", "vehicleClass", "coverage", "minAge", "maxAge", "minValue", "maxValue", "passengers", "tonnage");
