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
import { CompareBar } from "../../components/compare-bar";
import { generateOrganizationJsonLd } from "../../lib/seo";
import { Figtree } from "next/font/google";
import "../globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata = {
  title: "MUSCHIO — Haute Parfumerie & Rare Niche Fragrances | Dubai & GCC",
  description: "Discover niche fragrance houses, scent notes, personal discovery sets, and the Muschio fragrance journal.",
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
    canonical: "https://muschio.luxury",
    languages: {
      "en-AE": "https://muschio.luxury/en",
      "ar-AE": "https://muschio.luxury/ar",
      "en-SA": "https://muschio.luxury/en",
      "ar-SA": "https://muschio.luxury/ar",
      "x-default": "https://muschio.luxury/en",
    },
  },
  openGraph: {
    title: "MUSCHIO — Haute Parfumerie & Luxury Niche Fragrances",
    description: "A considered collection. A personal discovery. Explore fragrance, notes, and the rituals that make a scent your own.",
    url: "https://muschio.luxury",
    siteName: "Muschio Haute Parfumerie",
    locale: "en_AE",
    alternateLocale: ["ar_AE", "ar_SA"],
    type: "website",
  },
};

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
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"} className={figtree.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Figtree:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Organization Structured Data for Google GCC Crawlers */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className={`${figtree.variable} font-sans min-h-screen flex flex-col bg-luxury-canvas text-luxury-text selection:bg-accent selection:text-white transition-colors duration-300`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <CompareProvider>
                    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-50 focus:bg-luxury-surface focus:p-4">{locale === "ar" ? "انتقل إلى المحتوى" : "Skip to content"}</a>
                    <Header locale={locale as Locale} />
                    <main id="main-content" className="flex-1">{children}</main>
                    <Footer locale={locale as Locale} />
                    <FloatingWhatsApp locale={locale as Locale} />
                    <CompareBar locale={locale as Locale} />
                  </CompareProvider>
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

