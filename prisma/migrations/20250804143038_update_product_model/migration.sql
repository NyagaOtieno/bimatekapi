/*
  Warnings:

  - You are about to drop the column `coverperiod` on the `Quote` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Quote" DROP COLUMN "coverperiod",
ALTER COLUMN "period" SET DATA TYPE TEXT,
ALTER COLUMN "value" DROP NOT NULL,
ALTER COLUMN "agent_code" SET DATA TYPE TEXT;
