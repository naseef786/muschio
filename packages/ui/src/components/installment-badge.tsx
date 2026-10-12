import React from "react";
import { Currency } from "@muschio/types";
import { formatCurrency } from "./price-display";
import { cn } from "../utils/cn";

export interface InstallmentBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  price: number;
  currency?: Currency;
  locale?: "en" | "ar";
  providers?: Array<"TABBY" | "TAMARA">;
}

export function InstallmentBadge({
  price,
  currency = "AED",
  locale = "en",
  providers = ["TABBY", "TAMARA"],
  className,
  ...props
}: InstallmentBadgeProps) {
  // Tabby split in 4
  const tabbyInstallment = Math.round((price / 4) * 100) / 100;

  return (
    <div
      className={cn(
        "p-3 rounded-none border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-sans space-y-1.5",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
        <span>{locale === "ar" ? "خيارات التقسيط المرنة" : "Flexible Installments"}</span>
        <div className="flex items-center gap-2">
          {providers.includes("TABBY") && (
            <span className="px-1.5 py-0.5 rounded bg-[#3EFEBA] text-zinc-950 font-bold text-[9px] tracking-wider">
              tabby
            </span>
          )}
          {providers.includes("TAMARA") && (
            <span className="px-1.5 py-0.5 rounded bg-[#FF8F70] text-zinc-950 font-bold text-[9px] tracking-wider">
              tamara
            </span>
          )}
        </div>
      </div>
      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {locale === "ar" ? (
          <>
            أو قسّمها على 4 دفعات شهرية بقيمة{" "}
            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
              {formatCurrency(tabbyInstallment, currency, locale)}
            </strong>{" "}
            بدون فوائد أو رسوم خفية. متوافق مع الشريعة.
          </>
        ) : (
          <>
            Or 4 interest-free payments of{" "}
            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
              {formatCurrency(tabbyInstallment, currency, locale)}
            </strong>
            . No hidden fees. Sharia compliant.
          </>
        )}
      </p>
    </div>
  );
}
