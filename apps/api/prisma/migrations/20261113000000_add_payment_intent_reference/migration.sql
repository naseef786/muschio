ALTER TABLE "Payment" ADD COLUMN "gatewayPaymentIntentId" TEXT;

CREATE UNIQUE INDEX "Payment_gatewayPaymentIntentId_key" ON "Payment"("gatewayPaymentIntentId");
