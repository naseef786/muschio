import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { subscribeCatalogUpdates } from "../../storefront/src/lib/catalog-updates";

let browser: EventTarget;
let page: EventTarget & { visibilityState: string };
beforeEach(() => {
  vi.useFakeTimers();
  browser = new EventTarget();
  page = Object.assign(new EventTarget(), { visibilityState: "visible" });
  vi.stubGlobal("window", Object.assign(browser, { setInterval, clearInterval }));
  vi.stubGlobal("document", page);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("automatic storefront catalog updates", () => {
  it("refreshes after an admin save notification and polls for changes from other devices", async () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    const stop = subscribeCatalogUpdates(refresh);
    browser.dispatchEvent(Object.assign(new Event("storage"), { key: "unrelated" }));
    expect(refresh).not.toHaveBeenCalled();
    browser.dispatchEvent(Object.assign(new Event("storage"), { key: "muschio:catalog-updated" }));
    expect(refresh).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(5000);
    expect(refresh).toHaveBeenCalledTimes(2);
    stop();
    await vi.advanceTimersByTimeAsync(5000);
    browser.dispatchEvent(new Event("focus"));
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("pauses hidden tabs and refreshes on return without overlapping requests", async () => {
    let finish!: () => void;
    const refresh = vi.fn().mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; }));
    const stop = subscribeCatalogUpdates(refresh);
    page.visibilityState = "hidden";
    await vi.advanceTimersByTimeAsync(5000);
    expect(refresh).not.toHaveBeenCalled();
    page.visibilityState = "visible";
    page.dispatchEvent(new Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(10000);
    expect(refresh).toHaveBeenCalledTimes(1);
    finish();
    await vi.advanceTimersByTimeAsync(5000);
    expect(refresh).toHaveBeenCalledTimes(2);
    finish();
    stop();
  });

  it("retries after transient failures", async () => {
    const refresh = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
    const stop = subscribeCatalogUpdates(refresh);
    await vi.advanceTimersByTimeAsync(10000);
    expect(refresh).toHaveBeenCalledTimes(2);
    stop();
  });
});
