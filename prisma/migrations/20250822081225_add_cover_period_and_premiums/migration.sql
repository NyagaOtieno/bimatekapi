/*
  Warnings:

  - The values [MOTORVEHICLE_COMMERCIAL_OWN_GOODS] on the enum `VehicleClass` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."VehicleClass_new" AS ENUM ('MOTORCYCLE_PRIVATE', 'MOTORCYCLE_PSV', 'MOTORCYCLE_COMMERCIAL', 'TRICYCLE_OWN_GOODS', 'TRICYCLE_PSV', 'MOTORVEHICLE_PRIVATE', 'MOTORVEHICLE_OWN_GOODS', 'MOTORVEHICLE_GENERAL_CARTAGE', 'MOTORVEHICLE_AGRICULTURE', 'MOTORVEHICLE_CHAUFFEUR', 'MOTOR_TRADE', 'MOTORVEHICLE_INSTITUTIONAL', 'MOTORVEHICLE_DRIVING_SCHOOL', 'MOTORVEHICLE_TOUR_SERVICE', 'PSV_MATATU', 'PSV_TAXI', 'PSV_BUS', 'AMBULANCE_FIRE', 'HEAVY_MACHINERY', 'UBER', 'TANKER_LIQUID', 'PRIME_MOVER');
ALTER TABLE "public"."Product" ALTER COLUMN "vehicleClass" TYPE "public"."VehicleClass_new"[] USING ("vehicleClass"::text::"public"."VehicleClass_new"[]);
ALTER TYPE "public"."VehicleClass" RENAME TO "VehicleClass_old";
ALTER TYPE "public"."VehicleClass_new" RENAME TO "VehicleClass";
DROP TYPE "public"."VehicleClass_old";
COMMIT;
