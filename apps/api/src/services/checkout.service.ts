import { prisma } from "../prisma";
import { DeliveryService } from "./delivery.service";
import { DeliveryRequestSchema } from "@muschio/types";
import { ApiError } from "../middleware/error-handler";
import { CheckoutPayload } from "@muschio/types";
import { OrderStatus, PaymentMethodType, PaymentStatus, Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { InventoryService } from "./inventory.service";
import { LoyaltyService } from "./loyalty.service";
import { PromotionService } from "./promotion.service";

export class CheckoutService {
  static async processCheckout(
    payload: CheckoutPayload,
    sessionId: string,
    customerId?: string,
  ) {
    const {
      cartId,
      shippingAddress,
      currency = "AED",
      customerNotes,
      loyaltyCreditsRedeemed = 0,
      couponCode,
    } = payload;

    // The authenticated identity is authoritative. Never trust a customerId
    // supplied by a guest request body.
    const effectiveCustomerId = customerId;

    if (currency !== "AED") {
      throw new ApiError(
        400,
        "UNSUPPORTED_CURRENCY",
        "Checkout currently supports AED only",
      );
    }

    if (loyaltyCreditsRedeemed > 0 && !effectiveCustomerId) {
      throw new ApiError(
        401,
        "UNAUTHORIZED",
        "Muschio Privilege sign-in is required to redeem loyalty credits",
      );
    }

    if (!shippingAddress) {
      throw new ApiError(
        400,
        "INVALID_SHIPPING_ADDRESS",
        "Shipping address is required for checkout",
      );
    }

    if (!payload.deliveryServiceId && shippingAddress.country !== "AE") {
      throw new ApiError(
        400,
        "DELIVERY_UNAVAILABLE",
        "Configure delivery for this destination before checkout",
      );
    }

    return prisma.$transaction(async (tx) => {
      await LoyaltyService.releaseExpiredReservations(tx);
      // 0. Verify and sanitize customer ID (never accept guest-* session as a database foreign key)
      let verifiedCustomerId: string | null = null;
      if (effectiveCustomerId && !effectiveCustomerId.startsWith("guest-")) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(effectiveCustomerId);
        if (isUuid) {
          const existingCust = await tx.customer.findUnique({
            where: { id: effectiveCustomerId },
            select: { id: true, loyaltyPoints: true },
          });
          if (existingCust) {
            verifiedCustomerId = existingCust.id;
          }
        }
      }

      await tx.$queryRaw`SELECT id FROM "Cart" WHERE id = ${cartId} FOR UPDATE`;
      const cart = await tx.cart.findFirst({
        where: {
          id: cartId,
          OR: [
            { guestSessionId: sessionId },
            ...(verifiedCustomerId ? [{ customerId: verifiedCustomerId }] : []),
            { id: cartId },
          ],
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: { include: { brand: true } },
                  inventory: true,
                },
              },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "EMPTY_CART", "Cart is empty or not found");
      }

      // 1. Revalidate price & inventory server-side
      let subtotal = new Prisma.Decimal(0);
      const itemsToReserve: Array<{ variantId: string; quantity: number }> = [];

      for (const item of cart.items) {
        if (
          !item.variant.product.isPublished ||
          item.variant.isSampleVial ||
          item.quantity < 1 ||
          item.quantity > 99
        ) {
          throw new ApiError(
            409,
            "VARIANT_UNAVAILABLE",
            "An item in your bag is unavailable",
          );
        }
        const effectivePrice = item.variant.discountPrice && new Prisma.Decimal(item.variant.discountPrice).greaterThan(0) && new Prisma.Decimal(item.variant.discountPrice).lessThan(item.variant.price)
          ? item.variant.discountPrice
          : item.variant.price;
        subtotal = subtotal.plus(effectivePrice.times(item.quantity));
        itemsToReserve.push({
          variantId: item.variantId,
          quantity: item.quantity,
        });
      }

      let shippingAmount = subtotal.greaterThanOrEqualTo(500) ? 0 : 35;
      if (payload.deliveryServiceId) {
        const input = DeliveryRequestSchema.parse({
          country: shippingAddress.country,
          subtotal: subtotal.toNumber(),
          currency,
        });
        const quote = DeliveryService.quote(input);
        const service = quote.services.find(
          (service) => service.id === payload.deliveryServiceId,
        ) || quote.services[0];
        if (service) {
          shippingAmount = service.feeFils / 100;
        } else if (!quote.enabled) {
          throw new ApiError(
            409,
            "DELIVERY_UNAVAILABLE",
            "Selected delivery service is unavailable",
          );
        }
      }

      // Loyalty redemption is held against the order and only deducted after
      // verified payment. Active holds are included to prevent concurrent
      // checkouts from spending the same balance twice.
      let discountAmount = new Prisma.Decimal(0);
      let loyaltyReservationPoints = 0;
      if (loyaltyCreditsRedeemed > 0) {
        if (!verifiedCustomerId) {
          throw new ApiError(
            401,
            "UNAUTHORIZED",
            "Muschio Privilege sign-in is required to redeem loyalty credits",
          );
        }

        await tx.$queryRaw`SELECT id FROM "Customer" WHERE id = ${verifiedCustomerId} FOR UPDATE`;
        const customer = await tx.customer.findUnique({
          where: { id: verifiedCustomerId },
          select: { loyaltyPoints: true },
        });

        if (!customer) {
          throw new ApiError(404, "CUSTOMER_NOT_FOUND", "Customer not found");
        }

        const config = await LoyaltyService.getProgramConfig();
        if (!config.isEnabled) {
          throw new ApiError(409, "LOYALTY_DISABLED", "Loyalty redemption is currently unavailable");
        }
        const rate = Math.max(1, config.pointsRedemptionRate || 10);
        const activeHolds = await tx.loyaltyReservation.aggregate({
          where: {
            customerId: verifiedCustomerId,
            status: "HELD",
            expiresAt: { gt: new Date() },
          },
          _sum: { points: true },
        });
        const heldPoints = activeHolds._sum.points || 0;
        const availableCredits = Math.floor(Math.max(0, customer.loyaltyPoints - heldPoints) / rate);
        if (availableCredits <= 0) {
          throw new ApiError(
            400,
            "INSUFFICIENT_LOYALTY_POINTS",
            "No loyalty credits available to redeem",
          );
        }

        let maxApplicableDiscount = Math.min(
          loyaltyCreditsRedeemed,
          availableCredits,
          subtotal.toNumber(),
        );

        if (config.maxRedemptionAedPerOrder) {
          maxApplicableDiscount = Math.min(maxApplicableDiscount, Number(config.maxRedemptionAedPerOrder));
        }

        loyaltyReservationPoints = Math.floor(maxApplicableDiscount * rate);
        if (loyaltyReservationPoints < Math.max(1, config.minRedemptionPoints || 0)) {
          throw new ApiError(400, "MINIMUM_LOYALTY_REDEMPTION", "The requested loyalty redemption is below the configured minimum");
        }
        discountAmount = new Prisma.Decimal(loyaltyReservationPoints)
          .dividedBy(rate)
          .toDecimalPlaces(2);
      }

      // Centralized Promotion Engine Evaluation
      const cartItemsForPromo = cart.items.map((it) => ({
        variantId: it.variantId,
        productId: it.variant.productId,
        brandId: (it.variant.product as any).brandId,
        price: Number(it.variant.price),
        quantity: it.quantity,
      }));

      const promoEval = await PromotionService.evaluateCartPromotions(
        cartItemsForPromo,
        subtotal.minus(discountAmount).toNumber(),
        verifiedCustomerId || undefined,
        couponCode,
      );

      let appliedPromotionsToRecord: any[] = [];
      if (promoEval.totalDiscount > 0) {
        discountAmount = discountAmount.plus(promoEval.totalDiscount);
        appliedPromotionsToRecord = promoEval.appliedDiscounts;
      }

      // Dynamic GCC Country VAT: 15% for Saudi Arabia (ZATCA), 5% for UAE/BH/OM, 0% for KW/QA
      const destinationCountry = (shippingAddress.country || "AE").toUpperCase();
      let vatRate = 0.05;
      if (destinationCountry === "SA" || destinationCountry === "KSA") {
        vatRate = 0.15;
      } else if (destinationCountry === "KW" || destinationCountry === "QA") {
        vatRate = 0.0;
      } else if (destinationCountry === "BH" || destinationCountry === "OM" || destinationCountry === "AE") {
        vatRate = 0.05;
      }

      const taxableBase = subtotal.minus(discountAmount);
      const taxAmount = taxableBase.greaterThan(0) && vatRate > 0
        ? taxableBase.minus(taxableBase.dividedBy(1 + vatRate)).toDecimalPlaces(2)
        : new Prisma.Decimal(0);

      const totalAmount = subtotal
        .plus(shippingAmount)
        .minus(discountAmount);

      // Generate Luxury Order Number
      const orderNumber = `MSC-${new Date().getFullYear()}-${randomUUID().slice(0, 18).toUpperCase()}`;

      // 2. Create Address record (check if already saved to profile to prevent duplicate rows)
      let shouldLinkAddressToCustomer = false;

      if (payload.saveAddressToProfile && verifiedCustomerId) {
        const normStreet = (shippingAddress.addressLine1 || "").trim().toLowerCase();
        const normCity = (shippingAddress.city || "").trim().toLowerCase();
        const normCountry = (shippingAddress.country || "AE").trim().toUpperCase();

        const existingAddresses = await tx.address.findMany({
          where: { customerId: verifiedCustomerId },
          select: { streetAddress: true, city: true, countryCode: true },
        });

        const alreadyExists = existingAddresses.some(
          (addr) =>
            addr.streetAddress.trim().toLowerCase() === normStreet &&
            addr.city.trim().toLowerCase() === normCity &&
            addr.countryCode.trim().toUpperCase() === normCountry,
        );

        shouldLinkAddressToCustomer = !alreadyExists;
      }

      const address = await tx.address.create({
        data: {
          customerId: shouldLinkAddressToCustomer ? verifiedCustomerId : null,
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          streetAddress: shippingAddress.addressLine1 || "Dubai",
          apartment: shippingAddress.addressLine2,
          city: shippingAddress.city,
          emirateState: shippingAddress.stateOrEmirate,
          countryCode: shippingAddress.country || "AE",
          postalCode: shippingAddress.postalCode,
        },
      });

      // 3. Create Order (PENDING for COD, PAYMENT_PENDING for online card payments)
      const isCod = payload.paymentMethod === "CASH_ON_DELIVERY" || (payload as any).paymentMethod === "COD";
      const initialStatus = isCod ? OrderStatus.PENDING : OrderStatus.PAYMENT_PENDING;

      const order = await tx.order.create({
        data: {
          orderNumber,
          guestEmail: shippingAddress.email,
          customerId: verifiedCustomerId || null,
          status: initialStatus,
          currency,
          subtotal,
          discountAmount,
          taxAmount,
          shippingAmount,
          totalAmount,
          shippingAddressId: address.id,
          customerNotes,
          items: {
            create: cart.items.map((item) => ({
              variantId: item.variantId,
              productNameEn: item.variant.product.nameEn,
              productNameAr: item.variant.product.nameAr,
              brandName: item.variant.product.brand.name,
              sizeLabel: item.variant.sizeLabelEn,
              sku: item.variant.sku,
              unitPrice: item.variant.price,
              quantity: item.quantity,
              totalPrice: item.variant.price.times(item.quantity),
            })),
          },
        },
        include: {
          items: true,
          shippingAddress: true,
          payments: true,
        },
      });

      if (loyaltyReservationPoints > 0 && verifiedCustomerId) {
        await tx.loyaltyReservation.create({
          data: {
            customerId: verifiedCustomerId,
            orderId: order.id,
            points: loyaltyReservationPoints,
            expiresAt: new Date(Date.now() + 35 * 60 * 1000),
          },
        });
      }

      // 3b. Create initial Payment record in DB (Guarantees every order has an immutable payment ledger entry)
      const isTabby = payload.paymentMethod === "TABBY";
      const isTamara = payload.paymentMethod === "TAMARA";
      const isApplePay = payload.paymentMethod === "APPLE_PAY";
      const isGooglePay = payload.paymentMethod === "GOOGLE_PAY";

      const initialProvider = isCod
        ? PaymentMethodType.CASH_ON_DELIVERY
        : isTabby
          ? PaymentMethodType.TABBY
          : isTamara
            ? PaymentMethodType.TAMARA
            : isApplePay
              ? PaymentMethodType.APPLE_PAY
              : isGooglePay
                ? PaymentMethodType.GOOGLE_PAY
                : PaymentMethodType.CREDIT_CARD;

      const initialPaymentStatus = PaymentStatus.INITIATED;

      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          provider: initialProvider,
          status: initialPaymentStatus,
          amount: totalAmount,
          currency,
          gatewayReference: isCod ? `cod_${order.orderNumber}` : isTabby ? `tabby_${order.orderNumber}` : isTamara ? `tamara_${order.orderNumber}` : null,
        },
      });

      (order as any).payments = [payment];

      // A COD order is an accepted commercial order, so its held loyalty
      // redemption can be committed immediately. Prepaid orders remain held
      // until Stripe confirms capture.
      if (isCod && loyaltyReservationPoints > 0) {
        await LoyaltyService.commitOrderRedemption(order.id, tx);
      }

      // 3c. Record Promotion & Coupon Redemptions if applied
      if (appliedPromotionsToRecord && appliedPromotionsToRecord.length > 0) {
        await PromotionService.recordRedemptions(
          order.id,
          verifiedCustomerId || null,
          appliedPromotionsToRecord,
          tx,
        );
      }

      // 3d. Dynamic Discovery Set Voucher Creation (configurable via Promotion Engine)
      const hasDiscoverySet = cart.items.some(
        (item) =>
          item.variant.product.nameEn.toLowerCase().includes("discovery") ||
          item.variant.product.nameAr.includes("استكشاف") ||
          item.variant.product.slug?.toLowerCase().includes("discovery"),
      );

      if (hasDiscoverySet) {
        // Query if an active discovery promotion campaign overrides the voucher value
        const discPromo = await tx.promotion.findFirst({
          where: {
            isActive: true,
            OR: [
              { nameEn: { contains: "Discovery", mode: "insensitive" } },
              { descriptionEn: { contains: "Discovery", mode: "insensitive" } },
            ],
          },
        });
        // A voucher is issued only when an administrator has configured an
        // active Discovery promotion. There is intentionally no storefront
        // fallback amount for this business-controlled benefit.
        if (!discPromo) {
          console.info("No active Discovery promotion configured; no voucher issued");
        } else {
          const discValue = Number(discPromo.value);
          const discCode = `MSC-DISC-${randomUUID().slice(0, 8).toUpperCase()}`;

          await tx.voucher.create({
          data: {
            code: discCode,
            discountAmount: new Prisma.Decimal(discValue),
            currency: "AED",
            isDiscoveryVoucher: true,
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          },
          });

          await tx.businessEvent.create({
          data: {
            eventName: "DISCOVERY_VOUCHER_ISSUED",
            aggregateType: "Order",
            aggregateId: order.id,
            payload: {
              voucherCode: discCode,
              discountAmount: discValue,
              customerEmail: shippingAddress.email,
              orderNumber,
            },
          },
          });
        }
      }

      // 4. Reserve inventory for 35 minutes
      await InventoryService.reserveInventory(
        {
          items: itemsToReserve,
          sessionId: cart.guestSessionId || undefined,
          orderId: order.id,
          durationMinutes: 35,
        },
        tx,
      );

      // 6. Clear cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    }, { maxWait: 15000, timeout: 30000 });
  }

  static async getOrderById(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shippingAddress: true,
        payments: true,
      },
    });
  }

  static async getSessionOrders(sessionId: string, customerId?: string) {
    const reservations = await prisma.inventoryReservation.findMany({
      where: { sessionId, orderId: { not: null } },
      distinct: ["orderId"],
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { orderId: true },
    });

    const reservedOrderIds = reservations.flatMap((res) =>
      res.orderId ? [res.orderId] : [],
    );

    return prisma.order.findMany({
      where: {
        OR: [
          ...(reservedOrderIds.length > 0 ? [{ id: { in: reservedOrderIds } }] : []),
          ...(customerId ? [{ customerId }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        shippingAddress: true,
        payments: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  static async getOrderByNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        shippingAddress: true,
        payments: true,
      },
    });
  }
}
