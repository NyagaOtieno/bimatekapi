/*
  Warnings:

  - You are about to drop the column `passengers` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "passengers",
ADD COLUMN     "maxSeats" INTEGER,
ADD COLUMN     "minSeats" INTEGER,
ALTER COLUMN "underwriterName" SET DEFAULT 'UNKNOWN';
