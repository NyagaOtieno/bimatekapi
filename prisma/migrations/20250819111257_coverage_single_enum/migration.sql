-- DropIndex
DROP INDEX "public"."Product_underwriterId_agentcode_vehicleClass_coverage_minAg_key";

-- CreateIndex
CREATE INDEX "Product_vehicleClass_coverage_coverPeriod_agentcode_underwr_idx" ON "public"."Product"("vehicleClass", "coverage", "coverPeriod", "agentcode", "underwriterId");
