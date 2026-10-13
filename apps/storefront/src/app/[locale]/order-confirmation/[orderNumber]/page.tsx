"use client";
import { useCallback, useEffect, useState } from "react";
import { StorefrontOrder } from "@muschio/types";
import { PriceDisplay } from "@muschio/ui";
import { Link } from "../../../../navigation";
import { muschioApi } from "../../../../lib/api";
import { useCart } from "../../../../context/cart-context";
export default function OrderStatusPage({
  params: { locale, orderNumber },
}: {
  params: { locale: "en" | "ar"; orderNumber: string };
}) {
  const c = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const [order, setOrder] = useState<StorefrontOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentError, setPaymentError] = useState("");
  const [startingPayment, setStartingPayment] = useState(false);
  const cart = useCart();
  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await muschioApi.getOrder(orderNumber);
    setOrder(result);
    setLoading(false);
  }, [orderNumber]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const paid =
    order?.paymentStatus === "CAPTURED" &&
    ["PAID", "FULFILLING", "SHIPPED", "DELIVERED"].includes(order.status);
  const cancelled =
    order?.status === "CANCELLED" || order?.status === "PAYMENT_FAILED";
  async function resumePayment() {
    if (!order || startingPayment) return;
    setStartingPayment(true);
    setPaymentError("");
    try {
      const returnUrl = `${window.location.origin}/${locale}/order-confirmation/${encodeURIComponent(order.orderNumber)}`;
      const result = await muschioApi.initiatePaymentSession({
        orderId: order.id,
        amount: order.totalAmount,
        currency: order.currency,
        method: "CREDIT_CARD",
        returnUrl,
        cancelUrl: returnUrl + "?payment=cancelled",
      });
      const redirect = new URL(result?.redirectUrl || "");
      if (
        redirect.protocol !== "https:" ||
        redirect.hostname !== "checkout.stripe.com"
      )
        throw new Error("Payment unavailable");
      window.location.assign(redirect.toString());
    } catch {
      setPaymentError(
        c(
          "Payment is unavailable or the inventory hold has expired. Please refresh the order status.",
          "الدفع غير متاح أو انتهت مدة حجز المخزون. يرجى تحديث حالة الطلب.",
        ),
      );
    } finally {
      setStartingPayment(false);
    }
  }
  useEffect(() => {
    if (!paid || !order) return;
    try {
      const pending = JSON.parse(
        localStorage.getItem("muschio_pending_order") || "null",
      );
      const signature = JSON.stringify(
        cart.items.map((item) => ({
          id: item.variantId,
          quantity: item.quantity,
        })),
      );
      if (
        pending?.orderNumber === order.orderNumber &&
        pending?.signature === signature
      ) {
        cart.clearCart();
        localStorage.removeItem("muschio_pending_order");
      }
    } catch {
      /* Storage failures never alter the verified order status. */
    }
  }, [paid, order, cart]);
  useEffect(() => {
    if (!cancelled || !order) return;
    try {
      const pending = JSON.parse(
        localStorage.getItem("muschio_pending_order") || "null",
      );
      if (pending?.orderNumber === order.orderNumber)
        localStorage.removeItem("muschio_pending_order");
    } catch {}
  }, [cancelled, order]);
  return (
    <div className="editorial-section max-w-3xl space-y-7">
      <span className="eyebrow">
        {c("YOUR MUSCHIO ORDER", "طلبك لدى موسكيو")}
      </span>
      <h1 className="font-serif text-4xl">
        {loading
          ? c("Checking your order…", "جارٍ التحقق من طلبك…")
          : !order
            ? c("We couldn’t verify this order.", "تعذر التحقق من هذا الطلب.")
            : paid
              ? c("Thank you. Payment confirmed.", "شكراً لك. تم تأكيد الدفع.")
              : cancelled
                ? c(
                    "This order is closed. Your bag is saved.",
                    "هذا الطلب مغلق. حقيبتك محفوظة.",
                  )
                : c(
                    "Your order is awaiting payment confirmation.",
                    "طلبك بانتظار تأكيد الدفع.",
                  )}
      </h1>
      {!loading && !order && (
        <p role="status">
          {c(
            "Order details are available only in the browser session that placed the order. No payment confirmation can be shown right now.",
            "تفاصيل الطلب متاحة فقط في جلسة المتصفح التي أنشأت الطلب. لا يمكن عرض تأكيد للدفع حالياً.",
          )}
        </p>
      )}
      {order && (
        <section className="delivery-panel space-y-5">
          <div className="flex justify-between gap-4">
            <span>{c("Order reference", "رقم الطلب")}</span>
            <span className="font-mono text-sm break-all">
              {order.orderNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{c("Order status", "حالة الطلب")}</span>
            <span>{order.status}</span>
          </div>
          <div className="flex justify-between">
            <span>{c("Payment status", "حالة الدفع")}</span>
            <span>
              {paid ? c("Confirmed", "مؤكد") : c("Not confirmed", "غير مؤكد")}
            </span>
          </div>
          {order.items.map((item) => (
            <div
              className="flex justify-between gap-4 border-t border-luxury-border pt-4"
              key={item.id}
            >
              <div>
                {c(item.productNameEn, item.productNameAr)}
                <p className="text-xs mt-2">
                  {item.sizeLabel} × {item.quantity}
                </p>
              </div>
              <PriceDisplay price={item.totalPrice} locale={locale} size="sm" />
            </div>
          ))}
          <div className="flex justify-between border-t border-luxury-border pt-4">
            <span>
              {paid
                ? c("Total paid", "المجموع المدفوع")
                : c("Order total", "مجموع الطلب")}
            </span>
            <PriceDisplay price={order.totalAmount} locale={locale} />
          </div>
        </section>
      )}
      <p className="text-sm leading-7">
        {c(
          "Returning from payment does not itself confirm payment. The status changes only after a verified provider notification.",
          "العودة من صفحة الدفع لا تؤكد الدفع بحد ذاتها. تتغير الحالة فقط بعد إشعار موثق من مزود الخدمة.",
        )}
      </p>
      {paymentError && (
        <p role="alert" className="text-red-700">
          {paymentError}
        </p>
      )}
      <div className="flex flex-wrap gap-5">
        <button
          className="editorial-button disabled:opacity-50"
          onClick={refresh}
          disabled={loading}
        >
          {c("Refresh status", "تحديث الحالة")}
        </button>
        {order && !paid && !cancelled && (
          <button
            onClick={resumePayment}
            disabled={startingPayment}
            className="editorial-button disabled:opacity-50"
          >
            {c("Continue payment", "متابعة الدفع")}
          </button>
        )}
        <Link className="editorial-text-link self-center" href="/shop">
          {c("Continue exploring", "متابعة الاستكشاف")}
        </Link>
      </div>
    </div>
  );
}
