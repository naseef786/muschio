import React from "react";
import { ContactClient } from "./ContactClient";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isAr = locale === "ar";
  return {
    title: isAr
      ? "تواصل مع كونسيرج دار موسكيو — استشارات عطرية خاصة | دبي والخليج العربي"
      : "Contact VIP Fragrance Concierge & Inquiries | Muschio Haute Parfumerie",
    description: isAr
      ? "تواصل مع مستشاري وخبراء دار موسكيو للعطور الفاخرة في دبي والرياض. استشارات خاصة، تتبع الطلبات، وتنسيق هدايا كبار الشخصيات."
      : "Connect with Muschio Haute Parfumerie VIP Concierge. Dedicated fragrance advisors for bespoke scent recommendations, white-glove orders, and private atelier visits.",
  };
}

export default function ContactPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  return <ContactClient locale={locale} />;
}
