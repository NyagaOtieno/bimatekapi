-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "maxAge" INTEGER,
ADD COLUMN     "maxValue" DOUBLE PRECISION,
ADD COLUMN     "minAge" INTEGER,
ADD COLUMN     "minValue" DOUBLE PRECISION,
ADD COLUMN     "premium_2weeks" DOUBLE PRECISION,
ADD COLUMN     "premium_3months" DOUBLE PRECISION,
ADD COLUMN     "premium_6months" DOUBLE PRECISION,
ADD COLUMN     "premium_annual" DOUBLE PRECISION,
ADD COLUMN     "premium_month" DOUBLE PRECISION,
ADD COLUMN     "premium_week" DOUBLE PRECISION;
