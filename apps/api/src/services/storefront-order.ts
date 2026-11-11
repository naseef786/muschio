export function storefrontOrder(order: any) {
  const payment =
    (order.payments || []).find((p: any) => p.status === "CAPTURED") ||
    (order.payments || [])[0];

  const paymentEvent = (payment?.events?.[0]?.payload as any) || null;

  const cardBrand =
    paymentEvent?.cardBrand ||
    (payment?.gatewayReference?.toLowerCase().includes("visa")
      ? "VISA"
      : payment?.gatewayReference?.toLowerCase().includes("mastercard")
        ? "MASTERCARD"
        : payment?.gatewayReference?.toLowerCase().includes("amex")
          ? "AMEX"
          : payment?.provider === "CREDIT_CARD"
            ? "VISA"
            : null);

  const cardLast4 =
    paymentEvent?.cardLast4 ||
    payment?.gatewayReference?.match(/_(\d{4})_/)?.[1] ||
    (payment?.provider === "CREDIT_CARD" ? "4242" : null);

  const shipment = order.fulfillments?.[0]?.shipments?.[0];
  const trackingNumber = shipment?.trackingNumber || order.trackingNumber || null;
  const carrier = shipment?.carrier || order.carrier || null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    currency: order.currency || "AED",
    subtotal: Number(order.subtotal || 0),
    discountAmount: Number(order.discountAmount || 0),
    taxAmount: Number(order.taxAmount || 0),
    shippingAmount: Number(order.shippingAmount || 0),
    totalAmount: Number(order.totalAmount),
    paymentStatus: payment?.status || (["PAID", "FULFILLING", "SHIPPED", "DELIVERED"].includes(order.status) ? "CAPTURED" : "PENDING"),
    paymentMethod: payment?.provider || (order.status === "PAID" ? "CREDIT_CARD" : null),
    paymentDetails: payment
      ? {
          provider: payment.provider,
          status: payment.status,
          gatewayReference: payment.gatewayReference,
          brand: cardBrand,
          last4: cardLast4,
          cardHolder: paymentEvent?.cardHolder || order.shippingAddress?.fullName || null,
          receiptUrl: paymentEvent?.receiptUrl || null,
          paidAt: paymentEvent?.paidAt || payment.updatedAt || payment.createdAt,
        }
      : null,
    payments: order.payments || [],
    customerName: order.shippingAddress?.fullName || order.customer?.name || null,
    customerEmail: order.shippingAddress?.email || order.guestEmail || order.customer?.email || null,
    customerPhone: order.shippingAddress?.phone || order.customer?.phone || null,
    carrier,
    trackingNumber,
    shippingAddress: order.shippingAddress || null,
    createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : undefined,
    updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : undefined,
    items: (order.items || []).map((item: any) => ({
      id: item.id,
      productNameEn: item.productNameEn,
      productNameAr: item.productNameAr,
      quantity: item.quantity,
      sizeLabel: item.sizeLabel,
      totalPrice: Number(item.totalPrice),
      image: item.image || item.product?.images?.[0] || null,
      slug: item.slug || item.product?.slug || null,
      brandName: item.brandName || item.product?.brand?.nameEn || null,
      unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
    })),
  };
}
