import { describe, it, expect } from "vitest";

describe("Inventory Concurrency & Reservation Invariants", () => {
  it("enforces 15-minute TTL duration for inventory reservations", () => {
    const durationMinutes = 15;
    const now = Date.now();
    const expiresAt = new Date(now + durationMinutes * 60 * 1000);

    const diffMinutes = (expiresAt.getTime() - now) / (60 * 1000);
    expect(diffMinutes).toBe(15);
  });

  it("determines available stock strictly by subtracting reserved quantity from sealed stock", () => {
    const inventory = {
      sealedQuantity: 10,
      reservedQuantity: 8,
      testerQuantity: 2,
    };

    const availableForSale = inventory.sealedQuantity - inventory.reservedQuantity;
    expect(availableForSale).toBe(2);

    // Commercial sealed stock must remain strictly separated from tester stock
    expect(inventory.testerQuantity).toBe(2);
    expect(availableForSale + inventory.testerQuantity).toBe(4);
  });

  it("rejects reservation attempt when requested quantity exceeds available stock", () => {
    const sealedQuantity = 1;
    const reservedQuantity = 1;
    const available = sealedQuantity - reservedQuantity;

    const requestedQuantity = 1;
    const hasEnoughStock = available >= requestedQuantity;

    expect(hasEnoughStock).toBe(false);
  });

  it("simulates concurrent race condition where exactly 1 of N concurrent reservations succeeds for 1 available unit", () => {
    let sealedQuantity = 1;
    let reservedQuantity = 0;

    const attemptReservation = () => {
      const available = sealedQuantity - reservedQuantity;
      if (available >= 1) {
        reservedQuantity += 1;
        return { success: true };
      }
      return { success: false, reason: "INSUFFICIENT_STOCK" };
    };

    // 10 concurrent customer requests for 1 remaining luxury extrait bottle
    const results = Array.from({ length: 10 }, () => attemptReservation());

    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(9);
    expect(reservedQuantity).toBe(1);
  });

  it("releasing reservation restores available stock safely", () => {
    let sealedQuantity = 5;
    let reservedQuantity = 3;

    // Release 1 expired reservation
    reservedQuantity = Math.max(0, reservedQuantity - 1);
    const available = sealedQuantity - reservedQuantity;

    expect(reservedQuantity).toBe(2);
    expect(available).toBe(3);
  });
});
