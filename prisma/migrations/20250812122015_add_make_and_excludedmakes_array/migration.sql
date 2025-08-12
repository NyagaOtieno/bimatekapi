/*
  Warnings:

  - The values [TPO] on the enum `CoverageType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `period` on the `Product` table. All the data in the column will be lost.
  - The `ExcludedMakes` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `period` on the `Quote` table. All the data in the column will be lost.
  - Added the required column `coverPeriod` to the `Quote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."CoverageType_new" AS ENUM ('THIRD_PARTY_ONLY', 'THIRD_PARTY_FIRE_AND_THEFT', 'COMPREHENSIVE');
ALTER TABLE "public"."Product" ALTER COLUMN "coverage" TYPE "public"."CoverageType_new" USING ("coverage"::text::"public"."CoverageType_new");
ALTER TYPE "public"."CoverageType" RENAME TO "CoverageType_old";
ALTER TYPE "public"."CoverageType_new" RENAME TO "CoverageType";
DROP TYPE "public"."CoverageType_old";
COMMIT;

-- DropIndex
DROP INDEX "public"."Product_vehicleClass_coverage_period_agentcode_underwriter_idx";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "period",
ADD COLUMN     "coverPeriod" TEXT,
ADD COLUMN     "make" TEXT,
DROP COLUMN "ExcludedMakes",
ADD COLUMN     "ExcludedMakes" TEXT[];

-- AlterTable
ALTER TABLE "public"."Quote" DROP COLUMN "period",
ADD COLUMN     "coverPeriod" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Product_vehicleClass_coverage_coverPeriod_agentcode_underwr_idx" ON "public"."Product"("vehicleClass", "coverage", "coverPeriod", "agentcode", "underwriter");
