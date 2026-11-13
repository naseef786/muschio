// Notify same-origin tabs immediately; polling also covers other browsers/devices.
export function subscribeCatalogUpdates(refresh: () => Promise<void>) {
  let stopped = false;
  let pending = false;
  const update = async () => {
    if (stopped || pending || document.visibilityState === "hidden") return;
    pending = true;
    try {
      await refresh();
    } catch {
      // Keep the last successful catalog during transient connection failures.
    } finally {
      pending = false;
    }
  };
  const storage = (event: StorageEvent) => {
    if (event.key === "muschio:catalog-updated") void update();
  };
  const interval = window.setInterval(update, 5000);
  window.addEventListener("focus", update);
  window.addEventListener("storage", storage);
  document.addEventListener("visibilitychange", update);
  return () => {
    stopped = true;
    window.clearInterval(interval);
    window.removeEventListener("focus", update);
    window.removeEventListener("storage", storage);
    document.removeEventListener("visibilitychange", update);
  };
}
