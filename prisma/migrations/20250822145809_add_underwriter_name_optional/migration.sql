-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "underwriterName" TEXT;

-- CreateIndex
CREATE INDEX "Product_underwriterName_idx" ON "public"."Product"("underwriterName");
