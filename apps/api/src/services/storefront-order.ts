export function storefrontOrder(order: any) {
  const payment =
    (order.payments || []).find((p: any) => p.status === "CAPTURED") ||
    (order.payments || [])[0];
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    currency: order.currency,
    totalAmount: Number(order.totalAmount),
    paymentStatus: payment?.status || null,
    items: order.items.map((item: any) => ({
      id: item.id,
      productNameEn: item.productNameEn,
      productNameAr: item.productNameAr,
      quantity: item.quantity,
      sizeLabel: item.sizeLabel,
      totalPrice: Number(item.totalPrice),
    })),
  };
}
