-- CreateEnum
CREATE TYPE "LoyaltyReservationStatus" AS ENUM ('HELD', 'COMMITTED', 'RELEASED');

-- CreateTable
CREATE TABLE "LoyaltyReservation" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "status" "LoyaltyReservationStatus" NOT NULL DEFAULT 'HELD',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyReservation_orderId_key" ON "LoyaltyReservation"("orderId");
CREATE INDEX "LoyaltyReservation_customerId_status_idx" ON "LoyaltyReservation"("customerId", "status");
CREATE INDEX "LoyaltyReservation_expiresAt_status_idx" ON "LoyaltyReservation"("expiresAt", "status");

-- AddForeignKey
ALTER TABLE "LoyaltyReservation" ADD CONSTRAINT "LoyaltyReservation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LoyaltyReservation" ADD CONSTRAINT "LoyaltyReservation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
