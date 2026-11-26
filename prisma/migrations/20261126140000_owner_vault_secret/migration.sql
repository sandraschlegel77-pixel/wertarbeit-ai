CREATE TABLE "OwnerVaultSecret" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OwnerVaultSecret_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OwnerVaultSecret_shop_createdAt_idx" ON "OwnerVaultSecret"("shop", "createdAt");
