import React from "react";
import { notFound } from "next/navigation";
import { setRequestLocale, getMessages } from "next-intl/server";
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
import { FloatingCartBar } from "../../components/floating-cart-bar";
import { generateOrganizationJsonLd, generateWebSiteJsonLd } from "../../lib/seo";
import { CatalogService, NotesService, SettingsService } from "@muschio/api";
import { muschioApi } from "../../lib/api";
import { Figtree, Cairo } from "next/font/google";
import "../globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  const isAr = locale === "ar";
  return {
    metadataBase: new URL("https://www.muschio.ae"),
    title: {
      default: isAr
        ? "موسكيو — دار العطور النيش النادرة والفاخرة | دبي والخليج العربي"
        : "MUSCHIO — Haute Parfumerie & Rare Niche Fragrances | Dubai & GCC",
      template: isAr ? "%s | موسكيو" : "%s | MUSCHIO",
    },
    description: isAr
      ? "اكتشف أرقى دور العطور العالمية، خلاصات العطور النقية، مجموعات العينات الفاخرة، ومجلة موسكيو للطقوس العطرية."
      : "Discover rare niche fragrance houses, pure extraits de parfum, artisanal discovery sets, and the Muschio fragrance journal.",
    keywords: isAr
      ? [
          "عطور نيش دبي",
          "عطور أصلية الإمارات",
          "عطور نادرة الخليج",
          "عطور فاخرة الرياض",
          "دهن عود معتق",
          "خلاصات عطور نقية",
          "مجموعات عينات عطور",
          "توصيل عطور دبي",
          "عطور نسائية فاخرة",
          "عطور رجالية فخمة",
        ]
      : [
          "niche perfumes Dubai",
          "luxury perfumes UAE",
          "rare fragrances Dubai",
          "designer perfumes UAE",
          "perfume delivery UAE",
          "GCC fragrance delivery",
          "fragrance discovery sets",
          "oud perfumes Dubai",
          "fragrance notes guide",
          "pure extrait de parfum",
        ],
    alternates: {
      canonical: `https://www.muschio.ae/${locale}`,
      languages: {
        en: "https://www.muschio.ae/en",
        ar: "https://www.muschio.ae/ar",
        "en-AE": "https://www.muschio.ae/en",
        "ar-AE": "https://www.muschio.ae/ar",
        "en-SA": "https://www.muschio.ae/en",
        "ar-SA": "https://www.muschio.ae/ar",
        "en-KW": "https://www.muschio.ae/en",
        "ar-KW": "https://www.muschio.ae/ar",
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
      images: [
        {
          url: "https://www.muschio.ae/product-placeholder.svg",
          width: 1200,
          height: 630,
          alt: isAr ? "موسكيو للعطور الفاخرة" : "Muschio Haute Parfumerie",
        },
      ],
      locale: isAr ? "ar_AE" : "en_AE",
      alternateLocale: isAr ? ["en_AE"] : ["ar_AE", "ar_SA"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: isAr
        ? "موسكيو — دار العطور النيش النادرة والفاخرة"
        : "MUSCHIO — Haute Parfumerie & Luxury Niche Fragrances",
      description: isAr
        ? "مقتنيات عطرية فاخرة وخلاصات نادرة منتقاة لصفوة عشاق العطور في الخليج العربي."
        : "A considered collection. A personal discovery. Explore fragrance, notes, and the rituals that make a scent your own.",
      images: ["https://www.muschio.ae/product-placeholder.svg"],
    },
  };
}

export default async function RootLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  const {
    children
  } = props;

  if (!locales.includes(locale as any)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const isRtl = locale === "ar";
  const orgJsonLd = generateOrganizationJsonLd();
  const websiteJsonLd = generateWebSiteJsonLd(locale);

  let liveBrands: any[] = [];
  let liveNotes: any[] = [];
  let liveSettings: any = null;
  try {
    const [b, n, s] = await Promise.all([
      CatalogService.getBrands().catch(() => muschioApi.getBrands()),
      NotesService.getNotes({ limit: 6 }).then((res: any) => res?.items || res || []).catch(() => muschioApi.getNotes({ limit: 6 })),
      SettingsService.getSettings().catch(() => null),
    ]);
    liveBrands = Array.isArray(b) ? b : [];
    liveNotes = Array.isArray(n) ? n : [];
    liveSettings = s;
  } catch (err) {
    console.warn("Could not load layout navigation items:", err);
  }

  return (
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"} className={`${figtree.variable} ${cairo.variable} font-sans`} suppressHydrationWarning>
      <head>
        {/* Organization & WebSite SearchBox Structured Data for Google GCC Crawlers */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={`${figtree.className} ${figtree.variable} ${cairo.variable} font-sans min-h-screen flex flex-col bg-luxury-canvas text-luxury-text selection:bg-accent selection:text-white transition-colors duration-300 w-full max-w-full overflow-x-hidden`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <AuthProvider>
              <CurrencyProvider>
                <CartProvider freeShippingThreshold={liveSettings?.freeShippingThreshold || 500}>
                  <WishlistProvider>
                    <CompareProvider>
                      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-50 focus:bg-luxury-surface focus:p-4">{locale === "ar" ? "انتقل إلى المحتوى" : "Skip to content"}</a>
                      <Header locale={locale as Locale} initialBrands={liveBrands} initialNotes={liveNotes} initialSettings={liveSettings} />
                      <main id="main-content" className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
                      <Footer locale={locale as Locale} brands={liveBrands} settings={liveSettings} />
                      <FloatingWhatsApp locale={locale as Locale} settings={liveSettings} />
                      <CompareBar locale={locale as Locale} />
                      <FloatingCartBar locale={locale as Locale} />
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

