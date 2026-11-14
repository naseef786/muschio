-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'BUNDLE', 'TIERED_SPEND', 'FREE_SHIPPING');

-- CreateEnum
CREATE TYPE "GiftCardStatus" AS ENUM ('ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GiftCardTxType" AS ENUM ('ISSUANCE', 'REDEMPTION', 'REFUND', 'ADJUSTMENT', 'EXPIRATION');

-- CreateEnum
CREATE TYPE "LoyaltyTxType" AS ENUM ('EARN', 'REDEEM', 'REFUND', 'WELCOME_BONUS', 'MANUAL_ADJUSTMENT', 'EXPIRE');

-- CreateEnum
CREATE TYPE "BannerSlot" AS ENUM ('HERO_SLIDER', 'CAMPAIGN_MID', 'PROMO_STRIP', 'ANNOUNCEMENT_BAR');

-- CreateEnum
CREATE TYPE "HomepageSectionType" AS ENUM ('HERO_BANNER', 'DISCOVERY_STRIP', 'FEATURED_PRODUCTS', 'HOUSES_GRID', 'NOTES_GRID', 'DISCOVERY_SETS', 'JOURNAL_FEATURE', 'TRUST_INDICATORS', 'CUSTOM_BANNER');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordHash" TEXT;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "discountPrice" DECIMAL(10,2),
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "volume" TEXT,
ADD COLUMN     "warehouse" TEXT DEFAULT 'DXB-MAIN';

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "colorHex" TEXT DEFAULT '#171717',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTag" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "type" "PromotionType" NOT NULL DEFAULT 'PERCENTAGE',
    "value" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "stackable" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "minOrderAmount" DECIMAL(10,2),
    "maxDiscountAmount" DECIMAL(10,2),
    "customerUsageLimit" INTEGER,
    "totalUsageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "applicableProductIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "applicableBrandIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "applicableCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludedProductIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "firstOrderOnly" BOOLEAN NOT NULL DEFAULT false,
    "targetTier" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "assignedCustomerId" TEXT,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionRedemption" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "couponId" TEXT,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT,
    "discountAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCard" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "initialBalance" DECIMAL(10,2) NOT NULL,
    "remainingBalance" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "recipientEmail" TEXT,
    "recipientName" TEXT,
    "senderName" TEXT,
    "personalMessage" TEXT,
    "status" "GiftCardStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "issuedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCardTransaction" (
    "id" TEXT NOT NULL,
    "giftCardId" TEXT NOT NULL,
    "orderId" TEXT,
    "type" "GiftCardTxType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "balanceAfter" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftCardTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyProgramConfig" (
    "id" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "programNameEn" TEXT NOT NULL DEFAULT 'Muschio Privilege',
    "programNameAr" TEXT NOT NULL DEFAULT 'مسكيو بريفيلج',
    "pointsPerAedSpent" DECIMAL(6,2) NOT NULL DEFAULT 1.0,
    "pointsRedemptionRate" INTEGER NOT NULL DEFAULT 10,
    "welcomeBonusPoints" INTEGER NOT NULL DEFAULT 100,
    "minRedemptionPoints" INTEGER NOT NULL DEFAULT 100,
    "maxRedemptionAedPerOrder" DECIMAL(10,2),
    "pointsExpiryDays" INTEGER DEFAULT 365,
    "awardOnPaymentCapture" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyProgramConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyTier" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "minSpendAed" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "minPoints" INTEGER NOT NULL DEFAULT 0,
    "earningMultiplier" DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    "benefitsEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "benefitsAr" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyTransaction" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "LoyaltyTxType" NOT NULL,
    "points" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "orderId" TEXT,
    "reason" TEXT NOT NULL,
    "adminUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoyaltyTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "slot" "BannerSlot" NOT NULL DEFAULT 'HERO_SLIDER',
    "eyebrowEn" TEXT,
    "eyebrowAr" TEXT,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "subtitleEn" TEXT,
    "subtitleAr" TEXT,
    "ctaTextEn" TEXT,
    "ctaTextAr" TEXT,
    "ctaUrl" TEXT,
    "secondaryCtaTextEn" TEXT,
    "secondaryCtaTextAr" TEXT,
    "secondaryCtaUrl" TEXT,
    "imageUrl" TEXT NOT NULL,
    "mobileImageUrl" TEXT,
    "overlayLabelEn" TEXT,
    "overlayLabelAr" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageSection" (
    "id" TEXT NOT NULL,
    "sectionType" "HomepageSectionType" NOT NULL,
    "titleEn" TEXT,
    "titleAr" TEXT,
    "subtitleEn" TEXT,
    "subtitleAr" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_slug_idx" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_isFeatured_idx" ON "Tag"("isFeatured");

-- CreateIndex
CREATE INDEX "ProductTag_productId_idx" ON "ProductTag"("productId");

-- CreateIndex
CREATE INDEX "ProductTag_tagId_idx" ON "ProductTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTag_productId_tagId_key" ON "ProductTag"("productId", "tagId");

-- CreateIndex
CREATE INDEX "Promotion_isActive_isAutomatic_idx" ON "Promotion"("isActive", "isAutomatic");

-- CreateIndex
CREATE INDEX "Promotion_startsAt_endsAt_idx" ON "Promotion"("startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_code_isActive_idx" ON "Coupon"("code", "isActive");

-- CreateIndex
CREATE INDEX "Coupon_assignedCustomerId_idx" ON "Coupon"("assignedCustomerId");

-- CreateIndex
CREATE INDEX "PromotionRedemption_promotionId_idx" ON "PromotionRedemption"("promotionId");

-- CreateIndex
CREATE INDEX "PromotionRedemption_couponId_idx" ON "PromotionRedemption"("couponId");

-- CreateIndex
CREATE INDEX "PromotionRedemption_orderId_idx" ON "PromotionRedemption"("orderId");

-- CreateIndex
CREATE INDEX "PromotionRedemption_customerId_idx" ON "PromotionRedemption"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_code_key" ON "GiftCard"("code");

-- CreateIndex
CREATE INDEX "GiftCard_code_status_idx" ON "GiftCard"("code", "status");

-- CreateIndex
CREATE INDEX "GiftCard_recipientEmail_idx" ON "GiftCard"("recipientEmail");

-- CreateIndex
CREATE INDEX "GiftCardTransaction_giftCardId_idx" ON "GiftCardTransaction"("giftCardId");

-- CreateIndex
CREATE INDEX "GiftCardTransaction_orderId_idx" ON "GiftCardTransaction"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyTier_key_key" ON "LoyaltyTier"("key");

-- CreateIndex
CREATE INDEX "LoyaltyTier_key_isActive_idx" ON "LoyaltyTier"("key", "isActive");

-- CreateIndex
CREATE INDEX "LoyaltyTier_minPoints_sortOrder_idx" ON "LoyaltyTier"("minPoints", "sortOrder");

-- CreateIndex
CREATE INDEX "LoyaltyTransaction_customerId_createdAt_idx" ON "LoyaltyTransaction"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "LoyaltyTransaction_orderId_idx" ON "LoyaltyTransaction"("orderId");

-- CreateIndex
CREATE INDEX "Banner_slot_isActive_sortOrder_idx" ON "Banner"("slot", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "Banner_startsAt_endsAt_idx" ON "Banner"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "HomepageSection_isVisible_sortOrder_idx" ON "HomepageSection"("isVisible", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageSection_sectionType_key" ON "HomepageSection"("sectionType");

-- AddForeignKey
ALTER TABLE "ProductTag" ADD CONSTRAINT "ProductTag_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTag" ADD CONSTRAINT "ProductTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_assignedCustomerId_fkey" FOREIGN KEY ("assignedCustomerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionRedemption" ADD CONSTRAINT "PromotionRedemption_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionRedemption" ADD CONSTRAINT "PromotionRedemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCardTransaction" ADD CONSTRAINT "GiftCardTransaction_giftCardId_fkey" FOREIGN KEY ("giftCardId") REFERENCES "GiftCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
