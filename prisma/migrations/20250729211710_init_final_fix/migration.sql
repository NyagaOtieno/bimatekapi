/*
  Warnings:

  - You are about to drop the column `dateFiled` on the `Claim` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Policy` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Policy` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Policy` table. All the data in the column will be lost.
  - You are about to drop the column `premium` on the `Product` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Quote` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - A unique constraint covering the columns `[quoteId]` on the table `Policy` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amount` to the `Claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `Claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `Claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quoteId` to the `Policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `basePremium` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverage` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `make` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `underwriter` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleClass` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `make` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `period` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearOfManufacture` to the `Quote` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Client_email_key";

-- AlterTable
ALTER TABLE "Claim" DROP COLUMN "dateFiled",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "clientId" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reason" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Policy" DROP COLUMN "endDate",
DROP COLUMN "startDate",
DROP COLUMN "status",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "quoteId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "premium",
ADD COLUMN     "basePremium" INTEGER NOT NULL,
ADD COLUMN     "coverage" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "make" TEXT NOT NULL,
ADD COLUMN     "underwriter" TEXT NOT NULL,
ADD COLUMN     "vehicleClass" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "make" TEXT NOT NULL,
ADD COLUMN     "period" INTEGER NOT NULL,
ADD COLUMN     "value" INTEGER NOT NULL,
ADD COLUMN     "yearOfManufacture" INTEGER NOT NULL,
ALTER COLUMN "price" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Policy_quoteId_key" ON "Policy"("quoteId");

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
