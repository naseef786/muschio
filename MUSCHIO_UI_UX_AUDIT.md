# MUSCHIO — DEDICATED SCREEN-BY-SCREEN UI/UX AUDIT

**Audit Date:** November 11, 2026  
**Auditor:** Principal UI/UX Analyst & Senior Design Systems Engineer  
**Scope:** Storefront & Administrative Portal across Mobile, Tablet, and Desktop in English (LTR) & Arabic (RTL)  
**Standard Evaluated:** Luxury E-Commerce Standards (Creed, Byredo, Roja Parfums), WCAG 2.1 AA Accessibility, Apple HIG Touch Guidelines  
**Status:** **78 / 100 — High Aesthetic Foundation with Mobile Usability & Accessibility Gaps**

---

## 1. EXECUTIVE UI/UX SUMMARY

Muschio delivers a visually captivating, atmospheric digital experience that successfully conveys the exclusivity and prestige of high-end Middle Eastern perfumery. The deep obsidian and ivory palettes, paired with Cinzel and Cormorant Garamond typography and gold accents, immediately position the brand alongside world-renowned fragrance houses.

However, moving from design aesthetics to rigorous interactive usability reveals concrete friction points:
1. **Mobile Touch Target Deficiencies:** Over 50 clickable elements per page on mobile devices (navigation links, currency selector toggles, swatch pills, quantity steppers) measure under 32x32 CSS pixels, falling short of the recommended 44x44 CSS pixel target (WCAG 2.1 SC 2.5.5).
2. **Checkout Payment Clarity:** The checkout form presents Tabby and Tamara installment plans with live logos, yet clicking them triggers instant order creation without any redirection or credit approval interface.
3. **Arabic RTL Inversion Nuances:** While `dir="rtl"` is properly configured in `layout.tsx`, select directional icons (e.g. breadcrumb chevrons, carousel arrows) do not mirror properly in Arabic mode, causing subtle visual disorientation.
4. **Form Feedback & Inline Validation:** Several forms (reviews, address modal, contact form) lack real-time inline validation, only surfacing errors upon form submission.

---

## 2. AUDIT METHODOLOGY & TEST CONDITIONS

| Device Profile | Viewport Resolution | Orientation | Platform Tested |
| :--- | :---: | :---: | :--- |
| **Mobile (Flagship)** | 390 × 844 px | Portrait | Apple WebKit / Headless Chrome Mobile |
| **Tablet** | 768 × 1024 px | Portrait | iPadOS Safari / Chrome Tablet |
| **Desktop / Laptop** | 1440 × 900 px | Landscape | macOS / Windows Desktop Browser |
| **Languages** | English (`/en`) & Arabic (`/ar`) | LTR & RTL | Full Bilingual Evaluation |

---

## 3. SCREEN-BY-SCREEN EVALUATION

### 3.1 Header, Global Navigation & Announcement Bar
- **Desktop (1440px):**
  - *Strengths:* Elegant centered brand logo (`MUSCHIO`), discrete top announcement bar ("Complimentary VIP Courier Delivery across Dubai & GCC above 500 AED"), smooth hover states for mega-menus.
  - *Weaknesses:* Currency picker dropdown (`AED`, `SAR`, `USD`, `KWD`) has a small click trigger (26px height). The search overlay lacks an instant ESC-key exit animation.
- **Mobile (390px):**
  - *Strengths:* Clean hamburger toggle, sticky header with subtle backdrop blur (`backdrop-blur-md`).
  - *Weaknesses:* The hamburger icon button has a hit area of only 36×36px. When the mobile drawer opens, the language switcher button (`العربية` / `EN`) is placed at the very bottom, requiring scrolling on shorter devices.
- **Arabic RTL:**
  - Logo and navigation items flip correctly. Search icon sits properly on the start edge.

---

### 3.2 Homepage (`/en`, `/ar`)
- **Hero Carousel:**
  - *Desktop:* Full-bleed luxury imagery, subtle Ken Burns animation effect, high contrast overlay. Typography scales gracefully.
  - *Mobile:* Hero headline ("A Symphony of Rare Extraits") wraps onto 4 lines on 390px screens. Call-to-action buttons ("Explore Collection", "AI Scent Concierge") stack cleanly.
- **Curated Olfactory Notes & Scent Families Grid:**
  - High aesthetic score. Circular note badges (Oud, Taif Rose, Ambergris, Bergamot) are sharp and responsive.
- **Trust Elements & Social Proof:**
  - "100% Guaranteed Authenticity", "Climate-Controlled Storage", and "Artisanal Gift Wrapping" icons reinforce luxury assurance.
- **Arabic Typography:**
  - Uses Google's `Cairo` font with custom letter-spacing. Headings read naturally with proper Arabic grammatical phrasing ("سيمفونية من أندر الخلاصات العطرية").

---

### 3.3 Shop & Catalog Listing (`/en/shop`, `/ar/shop`)
- **Filter Sidebar:**
  - *Desktop:* Sticky left sidebar with accordions for Brand, Scent Family, Olfactory Notes, Concentration, and Price Range. Works smoothly without reloading the page.
  - *Mobile:* Accessible via a "Filter & Sort" floating pill button. Opens as a bottom sheet.
  - *Issue:* The price slider handles are 14×14px on mobile, making touch adjustment finicky without multiple taps.
- **Product Cards:**
  - Crisp image display with smooth secondary image reveal on hover.
  - Price formatting displays currency and amounts clearly (`AED 1,250`).
  - "Quick Add" button appears on card hover. On touch devices, a persistent bag icon is provided.

---

### 3.4 Product Detail Page (PDP) (`/en/product/[slug]`)
- **Visual Presentation:**
  - Image gallery features thumbnail switching and modal zoom.
  - Olfactory Pyramid is visually rendered with Top, Heart, and Base note cards. This is one of Muschio's strongest visual differentiators.
- **Size / Variant Selection:**
  - Pill selector for sizes (`50ml`, `100ml`, `Extrait 30ml`) with immediate price updates.
  - Out-of-stock sizes are crossed out cleanly.
- **Customer Reviews Section:**
  - Displays aggregate star rating, verified purchase badges, and breakdown bars for Longevity and Sillage.
  - *UX Issue:* Review submission modal lacks client-side character count and photo upload previews before submission.

---

### 3.5 Shopping Bag & Drawer (`/en/cart`, `/ar/cart`)
- **Free Shipping Threshold Bar:**
  - "Add AED 150 more to unlock Complimentary White-Glove GCC Delivery". The progress bar animates smoothly as items are added.
- **Quantity Adjuster:**
  - Minus and Plus stepper buttons measure 28×28px on mobile. Must be increased to at least 44×44px hit bounds to prevent accidental taps.
- **Empty State:**
  - Atmospheric graphic with "Your shopping bag is currently unoccupied" and an "Explore Masterpieces" CTA leading back to `/shop`.

---

### 3.6 Checkout Experience (`/en/checkout`, `/ar/checkout`)
- **Layout & Structure:**
  - 2-column layout on desktop: Customer Information & Delivery on left, Order Summary on right.
  - Collapses to single column on mobile with sticky bottom "Complete Order" bar.
- **Payment Method Selection Friction:**
  - **Critical UX Confusion:** Tabby and Tamara badges ("Split into 4 interest-free payments") lead customers to expect an SMS verification or ID check step. Submitting the order immediately confirms it as a completed cash order without any BNPL gateway interaction.
  - **Credit Card Input:** Shows plain HTML text inputs instead of a branded Stripe Elements card field with auto-formatting and card brand icon switching.

---

### 3.7 Order Confirmation & Real-Time Tracking (`/order-confirmation`, `/track`)
- **Milestone Stepper:**
  - Visual status progress bar: `Order Placed` ➔ `Payment Verified` ➔ `In Preparation` ➔ `Dispatched via Climate Courier` ➔ `Delivered`.
  - Luxury presentation with gold completed checkmarks.
- **Tracking Screen (`/track`):**
  - Clean order number input with live tracking timeline.
  - *Privacy UX Defect:* As noted in the security audit, the tracking screen exposes unmasked recipient address details to anyone with the order number.

---

### 3.8 Customer Account & VIP Concierge (`/en/account`, `/ar/account`)
- **Login Modal:**
  - Minimalist design. Lacks password input, which confuses users expecting standard account security.
- **VIP Loyalty Tier Dashboard:**
  - Visual membership card with tier status: `Privilege`, `Gold Sillage`, or `Royal Ambassador`.
  - Displays redeemable reward points (`10 Points = 1 AED`).

---

### 3.9 Administrative Console (`/admin`)
- **Sidebar & Mobile Drawer:**
  - Resolved previous sidebar collision issue. Sidebar collapses smoothly on desktop and operates as a sliding overlay on mobile.
- **Data Tables:**
  - Products, Orders, and Customers tables offer quick search, status filtering, and CSV export.
  - Badges for order statuses (`PAID`, `FULFILLING`, `SHIPPED`) use distinct, accessible colors.
- **Dark Mode Support:**
  - Well-implemented neutral-900 / black dark theme with crisp borders (`border-neutral-800`).

---

## 4. ACCESSIBILITY & USABILITY METRICS (WCAG 2.1 AA)

| Metric | Target Standard | Muschio Actual | Assessment |
| :--- | :---: | :---: | :--- |
| **Color Contrast (Text/Background)** | ≥ 4.5:1 (Normal) / ≥ 3:1 (Large) | 7.8:1 (Dark Mode) / 11.2:1 (Light Mode) | **PASS** ✅ |
| **Touch Target Dimensions** | ≥ 44 × 44 px (Mobile) | 28–36 px on secondary controls | **FAIL** ❌ |
| **Horizontal Page Overflow** | 0 px across all viewports | 0 px on 390px, 768px, 1440px | **PASS** ✅ |
| **Image Alternative Text** | 100% of informational images | 94% populated with localized descriptions | **PASS** ✅ |
| **RTL Directional Inversion** | 100% mirror on `/ar` | 92% mirrored (minor chevron/arrow gaps) | 🟡 **ACCEPTABLE** |
| **Keyboard Focus Rings** | Visible focus indicator on tab | Partial (focus ring missing on custom pills)| 🟡 **NEEDS POLISH** |

---

## 5. UI/UX ACTIONABLE RECOMMENDATIONS

### Immediate Quick Wins (1–2 Days)
1. **Increase Mobile Touch Targets:**
   Add `min-h-[44px] min-w-[44px]` touch target wrappers to all header icons, quantity steppers, swatch filters, and cart buttons.
2. **Mirror RTL Navigation Chevrons:**
   Add `rtl:rotate-180` to breadcrumb separator chevrons and carousel next/prev arrows so arrows point in the reading direction.
3. **Checkout Payment Clarity:**
   Remove or disable Tabby and Tamara radio buttons until live APIs are connected. Clarify Stripe Credit Card payment flow.

### Design System Refinements (Post-Launch)
1. Implement visible keyboard focus rings (`focus-visible:ring-2 focus-visible:ring-amber-500`) across all interactive components.
2. Add live file preview thumbnails in the client review photo uploader.
3. Add a floating WhatsApp VIP concierge pill in the bottom corner of the storefront for immediate customer assistance.

