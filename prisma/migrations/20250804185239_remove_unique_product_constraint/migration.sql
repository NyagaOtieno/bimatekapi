-- DropIndex
DROP INDEX "Product_vehicleClass_coverage_period_agentcode_key";

-- CreateIndex
CREATE INDEX "Product_vehicleClass_coverage_period_agentcode_underwriter_idx" ON "Product"("vehicleClass", "coverage", "period", "agentcode", "underwriter");
