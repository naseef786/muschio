import { beforeEach, describe, expect, it, vi } from "vitest";
const root = vi.hoisted(() => ({ transaction: vi.fn() }));
vi.mock("../src/prisma", () => ({
  prisma: { $transaction: root.transaction },
}));
import { InventoryService } from "../src/services/inventory.service";
function transaction() {
  return {
    $queryRaw: vi.fn(),
    warehouse: {
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    inventory: {
      findUnique: vi
        .fn()
        .mockResolvedValue({
          id: "stock",
          sealedQuantity: 2,
          reservedQuantity: 0,
        }),
      update: vi.fn(),
    },
    inventoryReservation: {
      create: vi.fn().mockResolvedValue({ id: "hold" }),
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn(),
    },
  };
}
beforeEach(() => vi.clearAllMocks());
describe("inventory transaction boundaries", () => {
  it("shares the caller's checkout transaction and locks inventory before reserving", async () => {
    const tx = transaction();
    await InventoryService.reserveInventory(
      {
        items: [{ variantId: "variant", quantity: 1 }],
        orderId: "order",
        sessionId: "session",
        durationMinutes: 35,
      },
      tx as any,
    );
    expect(root.transaction).not.toHaveBeenCalled();
    expect(tx.$queryRaw).toHaveBeenCalled();
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      tx.inventory.update.mock.invocationCallOrder[0]!,
    );
    expect(
      tx.inventoryReservation.create.mock.calls[0]?.[0]?.data,
    ).toMatchObject({ orderId: "order", sessionId: "session", quantity: 1 });
  });
  it("rejects insufficient inventory before any reservation is written", async () => {
    const tx = transaction();
    await expect(
      InventoryService.reserveInventory(
        { items: [{ variantId: "variant", quantity: 3 }] },
        tx as any,
      ),
    ).rejects.toMatchObject({ code: "INSUFFICIENT_STOCK" });
    expect(tx.inventory.update).not.toHaveBeenCalled();
    expect(tx.inventoryReservation.create).not.toHaveBeenCalled();
  });
  it("rejects expired holds before stock or payment can be committed", async () => {
    const tx = transaction();
    tx.inventoryReservation.findMany.mockResolvedValue([
      {
        id: "expired",
        variantId: "variant",
        quantity: 1,
        expiresAt: new Date(0),
      },
    ] as any);
    await expect(
      InventoryService.commitOrderInventory("order", tx as any),
    ).rejects.toMatchObject({ code: "RESERVATION_EXPIRED" });
    expect(tx.inventory.update).not.toHaveBeenCalled();
  });
  it("commits and releases within a supplied transaction without starting a nested transaction", async () => {
    const tx = transaction();
    tx.inventoryReservation.findMany.mockResolvedValue([
      {
        id: "hold",
        variantId: "variant",
        quantity: 1,
        expiresAt: new Date(Date.now() + 60000),
      },
    ] as any);
    await InventoryService.commitOrderInventory("order", tx as any);
    expect(root.transaction).not.toHaveBeenCalled();
    expect(tx.inventory.update).toHaveBeenCalledWith({
      where: { variantId: "variant" },
      data: {
        sealedQuantity: { decrement: 1 },
        reservedQuantity: { decrement: 1 },
      },
    });
  });
});
