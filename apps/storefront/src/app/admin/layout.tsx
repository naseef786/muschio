import React from "react";
import "../globals.css";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600&family=Cormorant+Garamond:wght@400;500;600&family=Figtree:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
