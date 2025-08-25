/*
  Warnings:

  - You are about to drop the column `maxSeats` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `minSeats` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `tonnage` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "maxSeats",
DROP COLUMN "minSeats",
DROP COLUMN "tonnage",
ADD COLUMN     "Seats" INTEGER,
ADD COLUMN     "maxTonnage" INTEGER,
ADD COLUMN     "minTonnage" INTEGER;
