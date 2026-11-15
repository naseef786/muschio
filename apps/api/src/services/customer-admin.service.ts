import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

const PAGE_SIZE_MAX = 50;
function pagination(pageValue: unknown, limitValue: unknown) {
  const page = Math.max(1, Math.floor(Number(pageValue) || 1));
  const limit = Math.min(PAGE_SIZE_MAX, Math.max(1, Math.floor(Number(limitValue) || 20)));
  return { page, limit, skip: (page - 1) * limit };
}

function normalizeSearch(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 120) : "";
}

export class CustomerAdminService {
  static async listCustomers(input: { search?: unknown; page?: unknown; limit?: unknown }) {
    const { page, limit, skip } = pagination(input.page, input.limit);
    const search = normalizeSearch(input.search);
    const where: Prisma.CustomerWhereInput = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
            { orders: { some: { orderNumber: { contains: search, mode: "insensitive" } } } },
          ],
        }
      : {};

    const [customers, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          emailVerified: true,
          passwordHash: true,
          firstName: true,
          lastName: true,
          phone: true,
          isVip: true,
          loyaltyPoints: true,
          createdAt: true,
        },
      }),
      prisma.customer.count({ where }),
    ]);

    const customerIds = customers.map((customer) => customer.id);
    const capturedPayments = customerIds.length
      ? await prisma.payment.findMany({
          where: {
            status: "CAPTURED",
            order: { customerId: { in: customerIds } },
          },
          select: {
            orderId: true,
            amount: true,
            currency: true,
            order: { select: { customerId: true, createdAt: true, orderNumber: true } },
          },
        })
      : [];

    const summaries = new Map<string, { orderIds: Set<string>; amount: Prisma.Decimal; lastOrder: { orderNumber: string; createdAt: Date } | null }>();
    for (const payment of capturedPayments) {
      const customerId = payment.order.customerId;
      if (!customerId) continue;
      const summary = summaries.get(customerId) || { orderIds: new Set<string>(), amount: new Prisma.Decimal(0), lastOrder: null };
      summary.orderIds.add(payment.orderId);
      if (payment.currency === "AED") summary.amount = summary.amount.plus(payment.amount);
      if (!summary.lastOrder || payment.order.createdAt > summary.lastOrder.createdAt) {
        summary.lastOrder = { orderNumber: payment.order.orderNumber, createdAt: payment.order.createdAt };
      }
      summaries.set(customerId, summary);
    }

    return {
      items: customers.map((customer) => {
        const summary = summaries.get(customer.id);
        const { passwordHash, ...safeCustomer } = customer;
        return {
          ...safeCustomer,
          name: [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email.split("@")[0],
          accountType: passwordHash ? "REGISTERED" : "PASSWORDLESS",
          capturedOrderCount: summary?.orderIds.size || 0,
          capturedAmountAED: summary?.amount.toFixed(2) ?? "0.00",
          amountLabel: "Captured payment total; refunds not netted",
          lastPaidOrder: summary?.lastOrder
            ? { orderNumber: summary.lastOrder.orderNumber, createdAt: summary.lastOrder.createdAt.toISOString() }
            : null,
        };
      }),
      pagination: { page, limit, total, pageCount: Math.ceil(total / limit) },
    };
  }

  static async findCustomerByEmail(email: string) {
    const customer = await prisma.customer.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, lastName: true },
    });
    if (!customer) return null;
    return {
      id: customer.id,
      email: customer.email,
      name: [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email.split("@")[0],
    };
  }

  static async listGuestOrders(input: { search?: unknown; page?: unknown; limit?: unknown }) {
    const { page, limit, skip } = pagination(input.page, input.limit);
    const search = normalizeSearch(input.search);
    const where: Prisma.OrderWhereInput = {
      customerId: null,
      ...(search
        ? {
            OR: [
              { orderNumber: { contains: search, mode: "insensitive" } },
              { guestEmail: { contains: search, mode: "insensitive" } },
              { shippingAddress: { is: { fullName: { contains: search, mode: "insensitive" } } } },
              { shippingAddress: { is: { phone: { contains: search } } } },
            ],
          }
        : {}),
    };
    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        skip,
        take: limit,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          currency: true,
          createdAt: true,
          guestEmail: true,
          shippingAddress: { select: { fullName: true, phone: true, countryCode: true } },
          payments: { where: { status: "CAPTURED" }, select: { id: true, amount: true, currency: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      items: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        name: order.shippingAddress.fullName,
        email: order.guestEmail,
        phone: order.shippingAddress.phone,
        countryCode: order.shippingAddress.countryCode,
        capturedAmountAED: order.payments
          .filter((payment) => payment.currency === "AED")
          .reduce((totalAmount, payment) => totalAmount.plus(payment.amount), new Prisma.Decimal(0))
          .toFixed(2),
        isPaymentCaptured: order.payments.length > 0,
      })),
      pagination: { page, limit, total, pageCount: Math.ceil(total / limit) },
    };
  }

  static async getCustomer(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        phone: true,
        isVip: true,
        loyaltyPoints: true,
        createdAt: true,
        updatedAt: true,
        fragranceProfile: {
          select: {
            preferredFamilies: true,
            favoriteNotes: true,
            dislikedNotes: true,
            preferredSillage: true,
            preferredLongevity: true,
            signatureScentSlug: true,
            updatedAt: true,
          },
        },
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
          select: {
            id: true,
            fullName: true,
            phone: true,
            streetAddress: true,
            apartment: true,
            city: true,
            emirateState: true,
            postalCode: true,
            countryCode: true,
            isDefault: true,
          },
        },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            orderNumber: true,
            status: true,
            currency: true,
            totalAmount: true,
            createdAt: true,
            payments: { where: { status: "CAPTURED" }, select: { amount: true, currency: true } },
            returnRequests: { select: { id: true, returnNumber: true, status: true, createdAt: true } },
          },
        },
        loyaltyTransactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { id: true, type: true, points: true, balanceAfter: true, reason: true, createdAt: true, orderId: true },
        },
        _count: { select: { orders: true, returnRequests: true } },
      },
    });

    if (!customer) return null;
    const { passwordHash, ...safeCustomer } = customer;
    const capturedPayments = await prisma.payment.findMany({
      where: {
        status: "CAPTURED",
        order: { customerId: id },
      },
      select: { orderId: true, amount: true, currency: true },
    });
    const capturedOrderIds = new Set(capturedPayments.map((payment) => payment.orderId));
    const capturedAmountAED = capturedPayments
      .filter((payment) => payment.currency === "AED")
      .reduce((amount, payment) => amount.plus(payment.amount), new Prisma.Decimal(0));
    return {
      ...safeCustomer,
      name: [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email.split("@")[0],
      accountType: passwordHash ? "REGISTERED" : "PASSWORDLESS",
      capturedOrderCount: capturedOrderIds.size,
      capturedAmountAED: capturedAmountAED.toFixed(2),
      amountLabel: "Captured payment total; refunds not netted",
      orders: customer.orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        currency: order.currency,
        createdAt: order.createdAt.toISOString(),
        capturedAmountAED: order.payments
          .filter((payment) => payment.currency === "AED")
          .reduce((amount, payment) => amount.plus(payment.amount), new Prisma.Decimal(0))
          .toFixed(2),
        isPaymentCaptured: order.payments.length > 0,
        returns: order.returnRequests,
      })),
      loyaltyTransactions: customer.loyaltyTransactions.map((transaction) => ({
        ...transaction,
        createdAt: transaction.createdAt.toISOString(),
      })),
    };
  }
}
