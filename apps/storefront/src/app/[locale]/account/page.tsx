"use client";
import { useCallback, useEffect, useState } from "react";
import { StorefrontOrder } from "@muschio/types";
import { PriceDisplay } from "@muschio/ui";
import { Link } from "../../../navigation";
import { muschioApi } from "../../../lib/api";
export default function AccountPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const c = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const [orders, setOrders] = useState<StorefrontOrder[] | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    setOrders(await muschioApi.getMyOrders());
    setLoading(false);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <div className="editorial-section max-w-4xl space-y-7">
      <span className="eyebrow">MUSCHIO</span>
      <h1 className="font-serif text-5xl">
        {c("Your Muschio space.", "مساحتك لدى موسكيو.")}
      </h1>
      <p className="text-sm leading-7">
        {c(
          "View the latest orders placed in this browser session. Guest access lasts up to 30 days; orders from other browsers are not shown here.",
          "عرض أحدث الطلبات التي تم إنشاؤها في جلسة هذا المتصفح. يستمر وصول الضيف حتى ٣٠ يوماً؛ لا تظهر هنا طلبات المتصفحات الأخرى.",
        )}
      </p>
      <div className="flex gap-6">
        <Link href="/wishlist" className="editorial-text-link">
          {c("Your wishlist", "قائمتك المفضلة")}
        </Link>
        <Link href="/cart" className="editorial-text-link">
          {c("Your bag", "حقيبتك")}
        </Link>
      </div>
      <h2 className="font-serif text-3xl">{c("Your orders", "طلباتك")}</h2>
      {loading ? (
        <p role="status">
          {c("Checking your orders…", "جارٍ التحقق من طلباتك…")}
        </p>
      ) : orders === null ? (
        <p className="delivery-status" role="status">
          {c(
            "Order access is unavailable right now. No account or payment information is being displayed.",
            "الوصول إلى الطلبات غير متاح حالياً. لا يتم عرض معلومات الحساب أو الدفع.",
          )}
        </p>
      ) : !orders.length ? (
        <p className="delivery-status">
          {c(
            "No orders have been placed in this session.",
            "لم يتم إنشاء طلبات في هذه الجلسة.",
          )}
        </p>
      ) : (
        orders.map((order) => (
          <Link
            key={order.id}
            href={`/order-confirmation/${encodeURIComponent(order.orderNumber)}`}
            className="delivery-panel flex justify-between gap-6"
          >
            <div>
              <span className="font-mono text-sm">{order.orderNumber}</span>
              <p className="text-sm mt-3">{order.status}</p>
            </div>
            <PriceDisplay price={order.totalAmount} locale={locale} size="sm" />
          </Link>
        ))
      )}
      <button
        type="button"
        className="editorial-button disabled:opacity-50"
        onClick={load}
        disabled={loading}
      >
        {c("Refresh orders", "تحديث الطلبات")}
      </button>
    </div>
  );
}
