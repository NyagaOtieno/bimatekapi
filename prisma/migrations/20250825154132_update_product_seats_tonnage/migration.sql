/*
  Warnings:

  - You are about to drop the column `Seats` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "Seats",
ADD COLUMN     "maxSeats" INTEGER,
ADD COLUMN     "minSeats" INTEGER;
