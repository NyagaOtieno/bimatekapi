/*
  Warnings:

  - Added the required column `agentcode` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `agentcode` to the `Quote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "agentcode" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "agentcode" INTEGER NOT NULL;
