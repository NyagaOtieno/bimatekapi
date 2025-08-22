-- AlterEnum
ALTER TYPE "public"."CoverPeriod" ADD VALUE 'THREE_MONTHS';

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "premium_2weeks" DOUBLE PRECISION,
ADD COLUMN     "premium_3months" DOUBLE PRECISION,
ADD COLUMN     "premium_6months" DOUBLE PRECISION,
ADD COLUMN     "premium_month" DOUBLE PRECISION,
ADD COLUMN     "premium_week" DOUBLE PRECISION;
