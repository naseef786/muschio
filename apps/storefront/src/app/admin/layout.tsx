import React from "react";
import { Figtree } from "next/font/google";
import "../globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata = {
  title: "Muschio Admin Console — Catalog, Orders, SEO & Logistics",
  description: "Muschio Haute Parfumerie Administration Portal",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${figtree.variable} font-sans`}>
      <body className={`${figtree.className} ${figtree.variable} font-sans bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
