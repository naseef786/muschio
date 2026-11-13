import React from "react";
import { SettingsService } from "@muschio/api";
import { ContactClient } from "./ContactClient";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isAr = locale === "ar";
  return {
    title: isAr
      ? "تواصل مع موسكيو | نصائح عطرية ومساعدة في الطلبات"
      : "Contact Muschio | Fragrance Advice & Order Support",
    description: isAr
      ? "احصل على نصيحة عطرية أو مساعدة في طلبك أو تنسيق هدية. تواصل مع موسكيو عبر البريد أو الهاتف أو واتساب أو نموذج الاستفسار."
      : "Get fragrance advice, ask about an order, or discuss a gift. Contact Muschio by email, phone, WhatsApp, or our enquiry form.",
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { "en-AE": "/en/contact", "ar-AE": "/ar/contact" },
    },
    openGraph: {
      title: isAr ? "تواصل مع موسكيو" : "Contact Muschio",
      description: isAr
        ? "استشارات عطرية ومساعدة في الطلبات والهدايا."
        : "Fragrance advice, order support, and gifting enquiries.",
      url: `/${locale}/contact`,
    },
  };
}

export default async function ContactPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const settings = await SettingsService.getSettings();
  const whatsappNumber = settings.whatsappNumber.replace(/\D/g, "");
  // Retain the existing dialable number when the display setting uses a vanity name.
  const phone = settings.conciergePhone;
  const dialablePhone = /[a-z]/i.test(phone)
    ? "+97148006872"
    : phone.replace(/[^+\d]/g, "");
  return (
    <ContactClient
      locale={locale}
      contact={{
        email: settings.conciergeEmail,
        phone,
        phoneHref: `tel:${dialablePhone}`,
        whatsappUrl: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(settings.whatsappDefaultMsg)}`,
      }}
    />
  );
}
