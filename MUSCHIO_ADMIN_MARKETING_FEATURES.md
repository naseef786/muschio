# MUSCHIO — ADMIN MARKETING & REWARDS SPECIFICATION

**Date:** November 11, 2026  
**Document Version:** 1.0.0  
**Target:** Muschio Admin Panel (`apps/admin`)  

---

## 1. Overview & Navigation Structure

The Muschio Admin Panel is upgraded with a comprehensive **Marketing & Rewards** section accessible via the primary sidebar. It provides complete administrative control over:
1. **Promotions Dashboard:** Real-time financial metrics, active campaigns, voucher liability, and redemption performance.
2. **Coupons:** Creation, scheduling, customer assignment, percentage/fixed discounts, usage limits, and product restrictions.
3. **Vouchers:** Issuance and tracking of discount vouchers and stored-value vouchers, including discovery set vouchers.
4. **Gift Cards:** Issuance, recipient management, balance tracking, and partial redemptions.
5. **Campaigns & Banners:** Visual offers, announcement bar text, homepage placements, and bilingual Arabic/English copy.
6. **Loyalty Program:** Global configuration (earning and redemption ratios, welcome bonus), tier management, and customer point ledger adjustments with mandatory audit reasons.

---

## 2. Screen Specifications & Capabilities

### 2.1 Promotions Dashboard
* **KPI Metrics:**
  - Active Promotions count.
  - Active Coupons count.
  - Total Discounts Granted (AED) calculated from real recorded order transactions.
  - Outstanding Stored-Value Voucher Liability (AED).
  - Outstanding Gift Card Liability (AED).
  - Total Outstanding Loyalty Points & Equivalent AED Liability.
* **Redemption Trend Chart / Table:** Real transaction history detailing Order Number, Client Name, Promotion/Coupon, Discount Amount, and Timestamp.

### 2.2 Coupon Management
* **List View:** Search by code, filter by Status (Active, Scheduled, Expired, Inactive), Type (Percentage, Fixed), and Customer.
* **Coupon Modal / Form:**
  - Code (with automatic secure code generator).
  - Promotion Name (English & Arabic).
  - Discount Type (Percentage `%` or Fixed Amount `AED`).
  - Discount Value.
  - Minimum Order Value (AED).
  - Maximum Discount Cap (AED).
  - Usage Limits: Total usage limit and per-customer limit.
  - Customer Restriction: Public or restricted to specific customer email/ID.
  - Tier Restriction: Applicable to all, or exclusive to specific loyalty tiers.
  - Start Date & Expiration Date (with time).
  - Active Toggle.

### 2.3 Voucher Management
* **List View:** Table of all issued vouchers with code, discount amount/percent, expiration date, redemptions count, and discovery set flag.
* **Issuance Modal:**
  - Code generator (e.g. `MSC-VCH-...`).
  - Voucher Type: Discount Amount or Discount Percentage.
  - Currency (AED).
  - Expiration period (days or specific date).
  - Discovery Voucher toggle.
* **Redemption Details Modal:** View linked order, client details, date of redemption, and financial impact.

### 2.4 Gift Card Management
* **List View:** View issued cards, code mask (e.g. `GC-••••-••••-9482`), original value, remaining balance, recipient email, and status.
* **Issuance Modal:**
  - Gift Card Code generation.
  - Initial Balance (AED).
  - Recipient Email & Full Name.
  - Sender Name & Personal Gift Message.
  - Expiration Date (or Lifetime Validity).
* **Ledger Drawer:** Inspect full audit trail of debits and credits on any gift card.

### 2.5 Loyalty Program Configuration & Ledger
* **Global Rules Form:**
  - Program Enabled Toggle.
  - Points earned per AED spent (e.g. 1 point = 1 AED).
  - Points redemption conversion rate (e.g. 10 points = 1 AED).
  - Welcome bonus points awarded on registration (e.g. 100 points).
  - Minimum points required to redeem (e.g. 100 points).
  - Maximum AED redemption allowed per order.
* **Tiers Management:**
  - View and edit tiers (Privilege, Gold Sillage, Royal Ambassador).
  - Threshold spend and points required for upgrade.
  - Earning multiplier (e.g. 1.0x, 1.6x).
  - Localized perks and benefits list (English & Arabic).
* **Customer Loyalty Adjustment Modal:**
  - Search customer by email or name.
  - Current balance display.
  - Adjustment Type: Credit (+) or Debit (-).
  - Adjustment Amount (Points).
  - Mandatory Audit Reason (e.g. "Customer care resolution for courier delay").
  - Commit adjustment with ledger record and running balance.

