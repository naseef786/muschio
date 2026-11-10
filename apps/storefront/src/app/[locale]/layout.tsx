import React from "react";
import { notFound } from "next/navigation";
import { unstable_setRequestLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { locales, Locale } from "../../i18n";
import { ThemeProvider } from "next-themes";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import { FloatingWhatsApp } from "../../components/floating-whatsapp";
import { AuthProvider } from "../../context/auth-context";
import { CartProvider } from "../../context/cart-context";
import { WishlistProvider } from "../../context/wishlist-context";
import { CompareProvider } from "../../context/compare-context";
import { CurrencyProvider } from "../../context/currency-context";
import { CompareBar } from "../../components/compare-bar";
import { generateOrganizationJsonLd } from "../../lib/seo";
import { Figtree, Cairo } from "next/font/google";
import "../globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-figtree",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isAr = locale === "ar";
  return {
    metadataBase: new URL("https://www.muschio.ae"),
    title: isAr
      ? "موسكيو — دار العطور النيش النادرة والفاخرة | دبي والخليج العربي"
      : "MUSCHIO — Haute Parfumerie & Rare Niche Fragrances | Dubai & GCC",
    description: isAr
      ? "اكتشف أرقى دور العطور العالمية، خلاصات العطور النقية، مجموعات العينات الفاخرة، ومجلة موسكيو للطقوس العطرية."
      : "Discover rare niche fragrance houses, pure extraits de parfum, artisanal discovery sets, and the Muschio fragrance journal.",
    keywords: [
      "Niche Perfumes Dubai",
      "Haute Parfumerie UAE",
      "Amouage Extrait",
      "Maison Francis Kurkdjian Dubai",
      "Roja Parfums GCC",
      "عطور نيش دبي",
      "عطور أصلية الإمارات",
      "دهن عود معتق",
      "لبان حوجري فضي",
    ],
    alternates: {
      canonical: `https://www.muschio.ae/${locale}`,
      languages: {
        "en-AE": "https://www.muschio.ae/en",
        "ar-AE": "https://www.muschio.ae/ar",
        "en-SA": "https://www.muschio.ae/en",
        "ar-SA": "https://www.muschio.ae/ar",
        "x-default": "https://www.muschio.ae/en",
      },
    },
    openGraph: {
      title: isAr
        ? "موسكيو — دار العطور النيش النادرة والفاخرة"
        : "MUSCHIO — Haute Parfumerie & Luxury Niche Fragrances",
      description: isAr
        ? "مقتنيات عطرية فاخرة وخلاصات نادرة منتقاة لصفوة عشاق العطور في الخليج العربي."
        : "A considered collection. A personal discovery. Explore fragrance, notes, and the rituals that make a scent your own.",
      url: `https://www.muschio.ae/${locale}`,
      siteName: isAr ? "موسكيو للعطور الفاخرة" : "Muschio Haute Parfumerie",
      locale: isAr ? "ar_AE" : "en_AE",
      alternateLocale: isAr ? ["en_AE"] : ["ar_AE", "ar_SA"],
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as any)) notFound();
  unstable_setRequestLocale(locale);

  const messages = await getMessages();
  const isRtl = locale === "ar";
  const orgJsonLd = generateOrganizationJsonLd();

  return (
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"} className={`${figtree.variable} ${cairo.variable} font-sans`} suppressHydrationWarning>
      <head>
        {/* Organization Structured Data for Google GCC Crawlers */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className={`${figtree.className} ${figtree.variable} ${cairo.variable} font-sans min-h-screen flex flex-col bg-luxury-canvas text-luxury-text selection:bg-accent selection:text-white transition-colors duration-300 w-full max-w-full overflow-x-hidden`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <AuthProvider>
              <CurrencyProvider>
                <CartProvider>
                  <WishlistProvider>
                    <CompareProvider>
                      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-50 focus:bg-luxury-surface focus:p-4">{locale === "ar" ? "انتقل إلى المحتوى" : "Skip to content"}</a>
                      <Header locale={locale as Locale} />
                      <main id="main-content" className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
                      <Footer locale={locale as Locale} />
                      <FloatingWhatsApp locale={locale as Locale} />
                      <CompareBar locale={locale as Locale} />
                    </CompareProvider>
                  </WishlistProvider>
                </CartProvider>
              </CurrencyProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

