import React from "react";
import { Link } from "../../../../navigation";
import { Button, PriceDisplay } from "@muschio/ui";
import { CheckCircle2 } from "lucide-react";

export default function OrderConfirmationPage({
  params: { locale, orderNumber },
}: {
  params: { locale: "en" | "ar"; orderNumber: string };
}) {
  const isAr = locale === "ar";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8">
      <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
        <CheckCircle2 size={36} />
      </div>

      <div className="space-y-3">
        <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-accent font-semibold">
          {isAr ? "تم اعتماد الطلب بنجاح" : "Order Confirmed & Allocated"}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-zinc-900 dark:text-zinc-100 font-light">
          {isAr ? "شكراً لاختيارك دار موسكيو" : "Thank You For Your Patronage"}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans max-w-md mx-auto leading-relaxed">
          {isAr
            ? `تم تسجيل طلبك رقم ${orderNumber} بنجاح. سنقوم بتجهيز عطورك الفاخرة في تغليفنا المميز وتوصيلها خلال 24-48 ساعة.`
            : `Your order #${orderNumber} has been received. Our concierge is preparing your extraits in signature presentation packaging for express delivery within 24-48 hours.`}
        </p>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 bg-luxury-surface p-8 max-w-lg mx-auto text-start space-y-4 text-xs font-sans">
        <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <span className="text-zinc-500">{isAr ? "رقم الطلب المرجعي:" : "Order Reference:"}</span>
          <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{orderNumber}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <span className="text-zinc-500">{isAr ? "حالة الدفع:" : "Payment Status:"}</span>
          <span className="text-emerald-600 font-medium">
            {isAr ? "معتمد وموثق (تابي)" : "Authorized & Captured (Tabby)"}
          </span>
        </div>
        <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <span className="text-zinc-500">{isAr ? "طريقة التوصيل:" : "Fulfillment:"}</span>
          <span className="text-zinc-900 dark:text-zinc-100">
            {isAr ? "توصيل مبرد سريع (دبي)" : "Climate-Controlled Express (Dubai)"}
          </span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-zinc-500">{isAr ? "المبلغ الإجمالي:" : "Total Paid:"}</span>
          <PriceDisplay price={1850} locale={locale} size="sm" />
        </div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button asChild variant="primary" size="lg">
          <Link href="/shop">{isAr ? "متابعة تصفح الخزانة" : "Return to Vault"}</Link>
        </Button>
      </div>
    </div>
  );
}
