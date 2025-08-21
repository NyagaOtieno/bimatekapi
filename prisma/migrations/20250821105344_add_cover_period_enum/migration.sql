/*
  Warnings:

  - The values [MOTORVEHICLE_OWN_GOODS] on the enum `VehicleClass` will be removed. If these variants are still used in the database, this will fail.
  - The `coverPeriod` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `coverPeriod` on the `Quote` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."CoverPeriod" AS ENUM ('ONE_WEEK', 'TWO_WEEKS', 'ONE_MONTH', 'SIX_MONTHS', 'ONE_YEAR');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."VehicleClass_new" AS ENUM ('MOTORCYCLE_PRIVATE', 'MOTORCYCLE_PSV', 'MOTORCYCLE_COMMERCIAL', 'TRICYCLE_OWN_GOODS', 'TRICYCLE_PSV', 'MOTORVEHICLE_PRIVATE', 'MOTORVEHICLE_COMMERCIAL_OWN_GOODS', 'MOTORVEHICLE_GENERAL_CARTAGE', 'MOTORVEHICLE_AGRICULTURE', 'MOTORVEHICLE_CHAUFFEUR', 'MOTOR_TRADE', 'MOTORVEHICLE_INSTITUTIONAL', 'MOTORVEHICLE_DRIVING_SCHOOL', 'MOTORVEHICLE_TOUR_SERVICE', 'PSV_MATATU', 'PSV_TAXI', 'PSV_BUS', 'AMBULANCE_FIRE', 'HEAVY_MACHINERY', 'UBER', 'TANKER_LIQUID', 'PRIME_MOVER');
ALTER TABLE "public"."Product" ALTER COLUMN "vehicleClass" TYPE "public"."VehicleClass_new"[] USING ("vehicleClass"::text::"public"."VehicleClass_new"[]);
ALTER TYPE "public"."VehicleClass" RENAME TO "VehicleClass_old";
ALTER TYPE "public"."VehicleClass_new" RENAME TO "VehicleClass";
DROP TYPE "public"."VehicleClass_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "coverPeriod",
ADD COLUMN     "coverPeriod" "public"."CoverPeriod";

-- AlterTable
ALTER TABLE "public"."Quote" DROP COLUMN "coverPeriod",
ADD COLUMN     "coverPeriod" "public"."CoverPeriod" NOT NULL;
