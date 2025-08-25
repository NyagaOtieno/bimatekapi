-- CreateTable
CREATE TABLE "public"."PsvPremium" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "passengers" INTEGER NOT NULL,
    "premium_week" DOUBLE PRECISION,
    "premium_2weeks" DOUBLE PRECISION,
    "premium_month" DOUBLE PRECISION,
    "premium_3months" DOUBLE PRECISION,
    "premium_6months" DOUBLE PRECISION,
    "premium_annual" DOUBLE PRECISION,

    CONSTRAINT "PsvPremium_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PsvPremium_productId_idx" ON "public"."PsvPremium"("productId");

-- AddForeignKey
ALTER TABLE "public"."PsvPremium" ADD CONSTRAINT "PsvPremium_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
