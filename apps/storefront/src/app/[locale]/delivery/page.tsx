"use client";
import { useState } from "react";
import { DeliveryPanel } from "../../../components/delivery-panel";
export default function DeliveryPage({ params: { locale } }: { params: { locale: "en" | "ar" } }) {
  const [country, setCountry] = useState("AE");
  const ar = locale === "ar";
  return <div className="editorial-section max-w-3xl"><span className="eyebrow">MUSCHIO</span><h1 className="font-serif text-5xl mb-8">{ar ? "معلومات التوصيل" : "Delivery, thoughtfully arranged."}</h1><label htmlFor="delivery-country" className="block mb-3">{ar ? "الوجهة" : "Your destination"}</label><select id="delivery-country" value={country} onChange={e => setCountry(e.target.value)} className="glass-input w-full p-4 mb-6">{[["AE", ar ? "الإمارات العربية المتحدة" : "United Arab Emirates"], ["SA", ar ? "السعودية" : "Saudi Arabia"], ["QA", ar ? "قطر" : "Qatar"], ["KW", ar ? "الكويت" : "Kuwait"], ["BH", ar ? "البحرين" : "Bahrain"], ["OM", ar ? "عمان" : "Oman"]].map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><DeliveryPanel country={country} locale={locale} /></div>;
}
