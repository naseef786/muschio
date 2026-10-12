import { prisma } from "../prisma";
import { ShipmentCarrier } from "@prisma/client";

export class FulfillmentService {
  /**
   * Create fulfillment for an order (supports split multi-shipments)
   */
  static async createFulfillment(data: {
    orderId: string;
    warehouseId: string;
    items: Array<{ orderItemId: string; quantity: number }>;
  }) {
    const fulfillmentNumber = `FUL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return prisma.fulfillment.create({
      data: {
        orderId: data.orderId,
        warehouseId: data.warehouseId,
        fulfillmentNumber,
        status: "PROCESSING",
        items: {
          create: data.items.map((item) => ({
            orderItemId: item.orderItemId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: { include: { orderItem: true } },
        warehouse: true,
      },
    });
  }

  /**
   * Create shipment with courier tracking (DHL Express, Aramex, SMSA)
   */
  static async dispatchShipment(params: {
    fulfillmentId: string;
    carrier: ShipmentCarrier;
    trackingNumber: string;
    trackingUrl?: string;
    labelUrl?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Create Shipment
      const shipment = await tx.shipment.create({
        data: {
          fulfillmentId: params.fulfillmentId,
          carrier: params.carrier,
          trackingNumber: params.trackingNumber,
          trackingUrl: params.trackingUrl || `https://www.dhl.com/ae-en/home/tracking/tracking-express.html?submit=1&tracking-id=${params.trackingNumber}`,
          labelUrl: params.labelUrl,
          status: "IN_TRANSIT",
          shippedAt: new Date(),
        },
      });

      // 2. Update Fulfillment status
      const fulfillment = await tx.fulfillment.update({
        where: { id: params.fulfillmentId },
        data: { status: "DISPATCHED" },
        include: { order: true },
      });

      // 3. Update Order status to SHIPPED
      await tx.order.update({
        where: { id: fulfillment.orderId },
        data: {
          status: "SHIPPED",
        },
      });

      return shipment;
    });
  }

  /**
   * Track order fulfillments and active shipments
   */
  static async getOrderFulfillments(orderId: string) {
    return prisma.fulfillment.findMany({
      where: { orderId },
      include: {
        shipments: true,
        items: { include: { orderItem: true } },
        warehouse: true,
      },
    });
  }
}
