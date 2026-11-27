/**
 * Muschio Haute Parfumerie — Senior Fullstack Enterprise Transactional Email Service
 * 
 * Production-ready delivery engine supporting:
 * 1. Custom SMTP via Nodemailer (Zoho, Gmail / Google Workspace, AWS SES, Microsoft 365, cPanel)
 * 2. SendGrid REST API v3 (via native fetch)
 * 3. RFC-compliant multipart/alternative MIME formatting (HTML + Auto-generated Plain Text for spam resistance)
 * 4. Comprehensive XSS / HTML Injection sanitization on all dynamic parameters
 * 5. Luxury bilingual (EN/AR) responsive email design system
 * 6. Graceful development simulation mode with structured logging
 */

import nodemailer, { Transporter } from "nodemailer";

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailServiceStatus {
  provider: "sendgrid" | "smtp" | "none";
  configured: boolean;
  from: string;
  missing?: string[];
}

export class EmailService {
  private static cachedTransporter: Transporter | null = null;
  private static cachedTransporterConfig: string | null = null;

  /**
   * Comprehensive HTML entity escape to prevent HTML injection / XSS in webmail clients
   */
  public static escapeHtml(value: any): string {
    if (value === null || value === undefined) return "";
    const str = String(value);
    return str.replace(/[&<>"']/g, (character) => {
      const entities: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[character] || character;
    });
  }

  /**
   * Converts HTML markup to a clean plain text alternative for multipart MIME deliverability
   */
  public static stripHtmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<br\s*[\/]?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/tr>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  private static getSendGridKey(): string | undefined {
    return process.env.SENDGRID_API_KEY;
  }

  public static getSmtpConfig() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (host && user && pass) {
      const port = Number(process.env.SMTP_PORT || 587);
      const secure = process.env.SMTP_SECURE === "true" || port === 465;
      return {
        host,
        port,
        secure,
        auth: { user, pass },
      };
    }
    return null;
  }

  public static getAdminEmail(): string {
    return process.env.ADMIN_NOTIFICATION_EMAIL || "concierge@muschio.ae";
  }

  public static getFromEmail(): string {
    return (
      process.env.EMAIL_FROM ||
      process.env.SMTP_FROM ||
      "Muschio Haute Parfumerie <orders@muschio.ae>"
    );
  }

  public static getStatus(): EmailServiceStatus {
    const from = this.getFromEmail();
    if (this.getSendGridKey()) {
      return { provider: "sendgrid", configured: true, from };
    }
    if (this.getSmtpConfig()) {
      return { provider: "smtp", configured: true, from };
    }
    return {
      provider: "none",
      configured: false,
      from,
      missing: ["SENDGRID_API_KEY", "or SMTP_HOST, SMTP_USER, SMTP_PASS"],
    };
  }

  /**
   * Returns a singleton nodemailer transporter to avoid reconnect overhead per email
   */
  private static getTransporter(config: any): Transporter {
    const configKey = `${config.host}:${config.port}:${config.auth.user}`;
    if (!this.cachedTransporter || this.cachedTransporterConfig !== configKey) {
      this.cachedTransporter = nodemailer.createTransport(config);
      this.cachedTransporterConfig = configKey;
    }
    return this.cachedTransporter;
  }

  /**
   * Core transmission handler with SendGrid API -> SMTP -> Simulation Fallback
   */
  public static async sendEmail({ to, subject, html, text, from }: SendEmailParams): Promise<{
    success: boolean;
    simulated: boolean;
    provider?: string;
    id?: string;
    error?: any;
    message?: string;
  }> {
    const sanitizeHeader = (value: string): string => value.replace(/[\r\n]+/g, " ").trim();
    const fromAddress = sanitizeHeader(from || this.getFromEmail());
    const toAddresses = (Array.isArray(to) ? to : [to]).map((addr) => sanitizeHeader(String(addr)));
    const safeSubject = sanitizeHeader(subject);
    const plainText = text || this.stripHtmlToText(html);

    // 1. SendGrid API (Native REST fetch, non-blocking)
    const sendGridKey = this.getSendGridKey();
    if (sendGridKey) {
      try {
        const fromEmailOnly = fromAddress.replace(/^.*<([^>]+)>.*$/, "$1").trim();
        const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sendGridKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: toAddresses.map((email) => ({ email })) }],
            from: { email: fromEmailOnly, name: "Muschio Haute Parfumerie" },
            subject: safeSubject,
            content: [
              { type: "text/plain", value: plainText },
              { type: "text/html", value: html },
            ],
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error("[EmailService:SendGrid] API Error:", errText);
          return { success: false, simulated: false, provider: "sendgrid", error: errText };
        }

        return { success: true, simulated: false, provider: "sendgrid", id: `sg-${Date.now()}` };
      } catch (err: any) {
        console.error("[EmailService:SendGrid] Delivery Exception:", err);
        return { success: false, simulated: false, provider: "sendgrid", error: err.message };
      }
    }

    // 2. Custom SMTP (Nodemailer: Gmail, Zoho, Microsoft 365, AWS SES)
    const smtpConfig = this.getSmtpConfig();
    if (smtpConfig) {
      try {
        const transporter = this.getTransporter(smtpConfig);
        const info = await transporter.sendMail({
          from: fromAddress,
          to: toAddresses.join(", "),
          subject: safeSubject,
          text: plainText,
          html,
        });

        return { success: true, simulated: false, provider: "smtp", id: info.messageId };
      } catch (err: any) {
        console.error("[EmailService:SMTP] Delivery Exception:", err);
        return { success: false, simulated: false, provider: "smtp", error: err.message };
      }
    }

    // 3. Graceful Simulation Mode (Local dev / unconfigured environments)
    console.log(`\n---------------------------------------------------------`);
    console.log(`[Muschio Email Service (SIMULATION MODE)]`);
    console.log(`From:    ${fromAddress}`);
    console.log(`To:      ${toAddresses.join(", ")}`);
    console.log(`Subject: ${subject}`);
    console.log(`Notice:  No live email credentials detected (SendGrid or SMTP).`);
    console.log(`---------------------------------------------------------\n`);

    return {
      success: true,
      simulated: true,
      provider: "none",
      message: "Simulation mode: Set SENDGRID_API_KEY or SMTP credentials to send live emails.",
      id: `sim-${Date.now()}`,
    };
  }

  // =========================================================================
  // TRANSACTIONAL LUXURY TEMPLATES
  // =========================================================================

  /**
   * Luxury HTML Template for Customer Order Confirmation
   */
  public static async sendOrderConfirmation(order: any) {
    const recipient = order.guestEmail || order.customer?.email || order.shippingAddress?.email;
    if (!recipient) return { success: false, error: "No recipient email" };

    const rawName = order.shippingAddress?.fullName || order.customer?.name || "Esteemed Client";
    const customerName = this.escapeHtml(rawName);
    const totalAmount = order.totalAmount
      ? Number(order.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "0.00";
    const subtotal = order.subtotal
      ? Number(order.subtotal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : totalAmount;
    const vatAmount = order.taxAmount
      ? Number(order.taxAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : ((Number(order.totalAmount || 0) * 0.05) / 1.05).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    const currency = this.escapeHtml(order.currency || "AED");
    const orderNumber = this.escapeHtml(order.orderNumber || "MSC-ORDER");
    const trackUrl = `https://www.muschio.ae/en/track?ref=${encodeURIComponent(order.orderNumber || "")}`;
    const whatsappUrl = `https://wa.me/97148006872?text=${encodeURIComponent(
      `Hello Muschio Concierge, I have an enquiry regarding my order ${order.orderNumber || ""}`
    )}`;

    const addr = order.shippingAddress || {};
    const street = this.escapeHtml([addr.addressLine1, addr.addressLine2].filter(Boolean).join(", ") || "Client Address");
    const cityState = this.escapeHtml([addr.city, addr.emirateState].filter(Boolean).join(", ") || "Dubai");
    const country = this.escapeHtml(
      addr.countryCode === "AE" || !addr.countryCode ? "United Arab Emirates" : addr.countryCode
    );
    const phone = this.escapeHtml(addr.phone || "Not specified");
    const paymentMethodLabel = this.escapeHtml(
      order.payments?.[0]?.paymentMethod || order.paymentMethod || "Credit / Debit Card (Secure 3D-Auth)"
    );

    const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Dubai",
    });

    const itemsHtml = (order.items || [])
      .map(
        (item: any) => `
        <tr style="border-bottom: 1px solid #262626;">
          <td style="padding: 16px 0; vertical-align: top;">
            <div style="font-family: 'Times New Roman', serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: #C5A265; font-weight: 600;">
              ${this.escapeHtml(item.brandName || "Muschio")}
            </div>
            <div style="font-family: 'Times New Roman', serif; font-size: 15px; color: #FFFFFF; font-weight: 500; margin-top: 4px;">
              ${this.escapeHtml(item.productNameEn || "Rare Haute Fragrance")}
            </div>
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #8E8A82; margin-top: 4px;">
              Volume: ${this.escapeHtml(item.sizeLabel || "100ml Extrait")} • Quantity: ${Number(item.quantity || 1)}
            </div>
          </td>
          <td style="padding: 16px 0; text-align: right; vertical-align: top; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; color: #F5F2EB; white-space: nowrap;">
            ${Number(item.totalPrice || item.unitPrice || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style="font-size: 11px; font-weight: normal; color: #C5A265;">${currency}</span>
          </td>
        </tr>`
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Muschio Order Confirmation: ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070707; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #EDE8D0; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #070707; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #0E0E0E; border: 1px solid #222222; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
          
          <!-- Top Gold Accent Bar -->
          <tr>
            <td height="3" style="background: linear-gradient(90deg, #8A6D3B 0%, #C5A265 50%, #8A6D3B 100%);"></td>
          </tr>

          <!-- Brand Masthead Header -->
          <tr>
            <td align="center" style="padding: 40px 30px 30px 30px; text-align: center;">
              <!-- Ornamental Gold Monogram Crest -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 16px auto;">
                <tr>
                  <td align="center" style="width: 44px; height: 44px; border: 1px solid #C5A265; text-align: center; vertical-align: middle;">
                    <span style="font-family: 'Times New Roman', serif; font-size: 22px; font-weight: 400; color: #C5A265; letter-spacing: 0.05em; display: inline-block; line-height: 42px;">M</span>
                  </td>
                </tr>
              </table>

              <!-- Wordmark -->
              <div style="font-family: 'Times New Roman', Georgia, serif; font-size: 28px; letter-spacing: 0.35em; color: #FFFFFF; font-weight: 300; text-transform: uppercase; margin-bottom: 6px;">
                MUSCHIO
              </div>
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #C5A265; font-weight: 500;">
                HAUTE PARFUMERIE • DUBAI &amp; GCC
              </div>
              <div style="font-family: 'Times New Roman', serif; font-size: 13px; color: #8A857B; margin-top: 6px; font-style: italic;">
                دار العطور النيش والزيوت الملكية النادرة
              </div>
            </td>
          </tr>

          <!-- Order Status Callout Card -->
          <tr>
            <td style="padding: 0 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #141414; border: 1px solid #282828; border-left: 3px solid #C5A265; padding: 20px;">
                <tr>
                  <td>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.22em; color: #C5A265; font-weight: 600;">
                      Official Client Allocation • مؤكد
                    </div>
                    <div style="font-family: 'Times New Roman', Georgia, serif; font-size: 20px; color: #FFFFFF; margin: 4px 0 2px 0; font-weight: 400;">
                      Order Confirmation: <span style="font-family: monospace; color: #F5F2EB;">${orderNumber}</span>
                    </div>
                    <div style="font-size: 11px; color: #7A756D;">
                      Placed on ${orderDate} • GCC White-Glove Vault Dispatch
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Personal Greeting -->
          <tr>
            <td style="padding: 30px 30px 10px 30px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.7; color: #D6D0C2;">
              Dear <strong>${customerName}</strong>,<br /><br />
              Thank you for ordering with Muschio. Your flacon has been securely allocated from our authenticated inventory and is currently being prepared under temperature-controlled protocols to protect natural essences, aged attars, and volatile accords.
            </td>
          </tr>

          <!-- Flacons Table -->
          <tr>
            <td style="padding: 10px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="border-bottom: 1px solid #333333;">
                    <th align="left" style="padding-bottom: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #7A756D; font-weight: 600;">
                      Curated Flacon
                    </th>
                    <th align="right" style="padding-bottom: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #7A756D; font-weight: 600;">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Financial Breakdown -->
          <tr>
            <td style="padding: 10px 30px 20px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 10px;">
                <tr>
                  <td align="right" style="padding: 4px 0; font-size: 12px; color: #8A857B;">
                    Flacons Subtotal:
                  </td>
                  <td align="right" width="120" style="padding: 4px 0; font-size: 12px; color: #D6D0C2; font-family: monospace;">
                    ${subtotal} ${currency}
                  </td>
                </tr>
                <tr>
                  <td align="right" style="padding: 4px 0; font-size: 12px; color: #8A857B;">
                    White-Glove GCC Courier:
                  </td>
                  <td align="right" width="120" style="padding: 4px 0; font-size: 12px; color: #10B981; font-weight: 500;">
                    Complimentary
                  </td>
                </tr>
                <tr>
                  <td align="right" style="padding: 4px 0; font-size: 12px; color: #8A857B;">
                    Included UAE 5% VAT:
                  </td>
                  <td align="right" width="120" style="padding: 4px 0; font-size: 12px; color: #8A857B; font-family: monospace;">
                    ${vatAmount} ${currency}
                  </td>
                </tr>
                <tr style="border-top: 1px solid #2B2B2B;">
                  <td align="right" style="padding: 12px 0 4px 0; font-family: 'Times New Roman', serif; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #FFFFFF;">
                    Total Order Value:
                  </td>
                  <td align="right" width="120" style="padding: 12px 0 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 20px; font-weight: 700; color: #C5A265;">
                    ${totalAmount} <span style="font-size: 12px; font-weight: normal; color: #EDE8D0;">${currency}</span>
                  </td>
                </tr>
                <tr>
                  <td align="right" colspan="2" style="font-size: 11px; color: #6D6962; padding-top: 2px;">
                    Payment: <span style="color: #A39E93;">${paymentMethodLabel}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery Address & Logistics Card -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #121212; border: 1px solid #242424; padding: 18px 20px;">
                <tr>
                  <td width="50%" valign="top" style="padding-right: 15px;">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #C5A265; font-weight: 600; margin-bottom: 6px;">
                      📍 Shipping Destination
                    </div>
                    <div style="font-size: 13px; color: #FFFFFF; font-weight: 500;">${customerName}</div>
                    <div style="font-size: 12px; color: #9A958C; line-height: 1.5; margin-top: 4px;">
                      ${street}<br />
                      ${cityState}, ${country}<br />
                      Tel: ${phone}
                    </div>
                  </td>
                  <td width="50%" valign="top" style="padding-left: 15px; border-left: 1px solid #242424;">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #C5A265; font-weight: 600; margin-bottom: 6px;">
                      🚚 Logistics Standard
                    </div>
                    <div style="font-size: 12px; color: #D6D0C2; line-height: 1.5;">
                      <strong>Same-Day Dubai</strong> (orders before 2 PM)<br />
                      <strong>Next-Day GCC</strong> temperature-regulated transit with pre-cleared customs.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Luxury Privilege Guarantee Badge -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(180deg, #161512 0%, #11100E 100%); border: 1px solid #332B1D; padding: 16px 20px;">
                <tr>
                  <td>
                    <div style="font-size: 11px; color: #C5A265; font-weight: 600; letter-spacing: 0.05em; margin-bottom: 4px;">
                      ✨ The Muschio Client Privilege &amp; 7-Day Guarantee
                    </div>
                    <div style="font-size: 11px; color: #A8A194; line-height: 1.5;">
                      Every full-size flacon includes an official 2ml matching discovery vial. Experience the scent on your skin first; the flacon remains returnable within 7 days if the bespoke wax seal remains intact.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Primary Call To Action Button -->
          <tr>
            <td align="center" style="padding: 10px 30px 35px 30px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #C5A265; padding: 14px 32px; border-radius: 0;">
                    <a href="${trackUrl}" target="_blank" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.22em; font-weight: 700; color: #070707; text-decoration: none; display: inline-block;">
                      Track Order Status Live &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <div style="margin-top: 14px; font-size: 11px; color: #7A756D;">
                Need concierge adjustments? <a href="${whatsappUrl}" target="_blank" style="color: #C5A265; text-decoration: underline;">Chat directly on WhatsApp</a>
              </div>
            </td>
          </tr>

          <!-- Footer & Authenticity Credentials -->
          <tr>
            <td style="background-color: #0A0A0A; border-top: 1px solid #1E1E1E; padding: 30px 30px; text-align: center;">
              <div style="font-family: 'Times New Roman', serif; font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase; color: #FFFFFF; margin-bottom: 6px;">
                MUSCHIO HAUTE PARFUMERIE
              </div>
              <div style="font-size: 11px; color: #6D6962; line-height: 1.6;">
                Level 2, Fashion Avenue Boulevard, Downtown Dubai, United Arab Emirates<br />
                Direct VIP Concierge: <a href="mailto:concierge@muschio.ae" style="color: #C5A265; text-decoration: none;">concierge@muschio.ae</a> • WhatsApp: +971 4 800 6872
              </div>
              <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #181818; font-size: 10px; color: #4A4742; letter-spacing: 0.05em;">
                &copy; 2026 Muschio Luxury Fragrances LLC. All master allocations authenticated.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail({
      to: recipient,
      subject: `Your Muschio Order Confirmation: ${order.orderNumber || "Order"}`,
      html,
    });
  }

  /**
   * Alert to Muschio Admin team for instant fulfillment dispatch
   */
  public static async sendAdminOrderAlert(order: any) {
    const rawName = order.shippingAddress?.fullName || order.customer?.name || "Client";
    const customerName = this.escapeHtml(rawName);
    const totalAmount = order.totalAmount
      ? Number(order.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "0.00";
    const currency = this.escapeHtml(order.currency || "AED");
    const city = this.escapeHtml(order.shippingAddress?.city || "Dubai");
    const emirate = this.escapeHtml(order.shippingAddress?.emirateState || "Dubai");
    const country = this.escapeHtml(order.shippingAddress?.countryCode || "AE");
    const orderNumber = this.escapeHtml(order.orderNumber || "MSC-ORDER");
    const phone = this.escapeHtml(order.shippingAddress?.phone || "N/A");
    const clientEmail = this.escapeHtml(order.guestEmail || order.customer?.email || "N/A");

    const itemsSummary = (order.items || [])
      .map(
        (it: any) =>
          `• ${this.escapeHtml(it.brandName || "Muschio")} — ${this.escapeHtml(it.productNameEn || "Flacon")} (${this.escapeHtml(it.sizeLabel || "100ml")}, Qty: ${Number(it.quantity || 1)}) — ${Number(it.totalPrice || 0).toLocaleString()} ${currency}`
      )
      .join("<br />");

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0E0E0E; color: #EDE8D0; padding: 30px; border: 1px solid #C5A265; max-width: 580px; margin: 0 auto;">
        <div style="border-bottom: 1px solid #282828; padding-bottom: 15px; margin-bottom: 20px;">
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; color: #C5A265; font-weight: 600;">
            MUSCHIO HAUTE PARFUMERIE • DISPATCH ALERT
          </div>
          <div style="font-family: 'Times New Roman', serif; font-size: 22px; color: #FFFFFF; margin-top: 4px;">
            🛍️ New Client Order: ${orderNumber}
          </div>
        </div>

        <div style="background-color: #141414; border: 1px solid #222; padding: 15px; margin-bottom: 20px;">
          <table style="width: 100%; font-size: 13px; line-height: 1.8; color: #D6D0C2;">
            <tr><td style="color: #8A857B; width: 120px;">Client:</td><td><strong>${customerName}</strong></td></tr>
            <tr><td style="color: #8A857B;">Email:</td><td><a href="mailto:${clientEmail}" style="color: #C5A265;">${clientEmail}</a></td></tr>
            <tr><td style="color: #8A857B;">Phone:</td><td><a href="tel:${phone}" style="color: #C5A265;">${phone}</a></td></tr>
            <tr><td style="color: #8A857B;">Destination:</td><td>${city}, ${emirate} (${country})</td></tr>
            <tr><td style="color: #8A857B;">Total Value:</td><td><strong style="color: #C5A265; font-size: 16px;">${totalAmount} ${currency}</strong></td></tr>
            <tr><td style="color: #8A857B;">Status:</td><td><span style="color: #10B981; font-weight: 600;">${this.escapeHtml(order.status || "CONFIRMED")}</span></td></tr>
          </table>
        </div>

        <div style="margin-bottom: 25px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #C5A265; font-weight: 600; margin-bottom: 8px;">
            Allocated Flacons:
          </div>
          <div style="font-size: 12px; line-height: 1.6; color: #EDE8D0; background-color: #121212; padding: 12px; border: 1px solid #222;">
            ${itemsSummary || "1 x Bespoke Flacon Allocation"}
          </div>
        </div>

        <div style="text-align: center; padding-top: 10px;">
          <a href="https://www.muschio.ae/admin" style="display: inline-block; background-color: #C5A265; color: #070707; text-decoration: none; padding: 12px 28px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700;">
            Open Fulfillment Console &rarr;
          </a>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: this.getAdminEmail(),
      subject: `🛍️ [NEW ORDER] ${order.orderNumber || "MSC-ORDER"} — ${totalAmount} ${currency} (${customerName})`,
      html,
    });
  }

  /**
   * Alert when an order is cancelled
   */
  public static async sendOrderCancellation(order: any, reason?: string) {
    const recipient = order.guestEmail || order.customer?.email || order.shippingAddress?.email;
    const rawName = order.shippingAddress?.fullName || order.customer?.name || "Esteemed Client";
    const customerName = this.escapeHtml(rawName);
    const orderNumber = this.escapeHtml(order.orderNumber || "Order");
    const escapedReason = reason ? this.escapeHtml(reason) : undefined;

    const html = `
      <div style="background-color: #000000; color: #ffffff; padding: 35px 20px; font-family: sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #262626;">
        <h2 style="font-family: 'Times New Roman', serif; font-size: 22px; font-weight: normal; margin-top: 0; letter-spacing: 0.1em;">
          MUSCHIO — Order Cancellation Notice
        </h2>
        <p style="font-size: 13px; color: #cccccc; line-height: 1.6;">
          Dear ${customerName},<br /><br />
          Your order <strong>${orderNumber}</strong> has been cancelled. Any reserved funds will be returned to your original payment method in accordance with banking clearing protocols.
        </p>
        ${
          escapedReason
            ? `<div style="background-color: #171717; border-left: 3px solid #737373; padding: 12px; font-size: 12px; color: #a3a3a3; margin: 20px 0;"><strong>Reason:</strong> ${escapedReason}</div>`
            : ""
        }
        <p style="font-size: 12px; color: #737373;">
          If this was done in error, please contact our VIP Concierge hotline immediately at concierge@muschio.ae.
        </p>
      </div>
    `;

    if (recipient) {
      await this.sendEmail({
        to: recipient,
        subject: `Order Cancellation: ${order.orderNumber || "Order"} — Muschio Haute Parfumerie`,
        html,
      });
    }

    await this.sendEmail({
      to: this.getAdminEmail(),
      subject: `⚠️ [ORDER CANCELLED] ${order.orderNumber || "Order"} — Immediate Halt Required`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e5e5; background-color: #0E0E0E; color: #EDE8D0;">
          <h3 style="color: #EF4444; margin-top: 0;">⚠️ Order Cancelled: ${orderNumber}</h3>
          <p>Client: <strong>${customerName}</strong></p>
          <p>Reason: ${escapedReason || "Client cancellation / Stock adjustment"}</p>
          <p style="color: #F59E0B;">Please ensure courier pickup is halted and reserved flacons are returned to vault inventory.</p>
        </div>
      `,
    });
  }

  /**
   * Acknowledge receipt of a customer contact / concierge enquiry
   */
  public static async sendEnquiryAcknowledgement(enquiry: {
    enquiryId?: string;
    name: string;
    email: string;
    subject?: string;
  }) {
    const customerName = this.escapeHtml(enquiry.name || "there");
    const enquirySubject = this.escapeHtml(enquiry.subject || "Your enquiry");
    const enquiryId = this.escapeHtml(enquiry.enquiryId || "pending");

    const html = `
      <div style="margin:0; padding:32px 16px; background:#f5f3ef; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; color:#191817;">
        <table role="presentation" style="width:100%; max-width:620px; margin:0 auto; border-collapse:collapse; background:#ffffff;">
          <tr>
            <td style="padding:34px 36px 26px; border-bottom:1px solid #e8e3dc; text-align:center;">
              <div style="font-family:Georgia,'Times New Roman',serif; font-size:25px; letter-spacing:.16em; color:#171615;">MUSCHIO</div>
              <div style="margin-top:8px; font-size:10px; letter-spacing:.18em; color:#9a7950; text-transform:uppercase;">Haute Parfumerie</div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 36px 28px;">
              <p style="margin:0 0 18px; font-size:14px; color:#6f6a63;">Thank you for contacting Muschio.</p>
              <h1 style="margin:0 0 18px; font-family:Georgia,'Times New Roman',serif; font-size:30px; line-height:1.2; font-weight:400; color:#171615;">We received your message</h1>
              <p style="margin:0; font-size:15px; line-height:1.75; color:#4f4a44;">Dear ${customerName}, our team has received your enquiry about <strong style="color:#171615;">${enquirySubject}</strong>. A Muschio concierge will review it and reply using the contact details you provided.</p>
              <div style="margin:28px 0; padding:18px 20px; border-left:3px solid #b58b58; background:#faf8f5; font-size:13px; line-height:1.7; color:#5d574f;">
                <strong style="color:#171615;">Reference:</strong> ${enquiryId}<br />
                <strong style="color:#171615;">Typical reply time:</strong> Within one business day
              </div>
              <p style="margin:0; font-size:14px; line-height:1.7; color:#5d574f;">If your request is urgent, reply to this email or contact our concierge team directly at <a href="mailto:concierge@muschio.ae" style="color:#9a6f3f;">concierge@muschio.ae</a>.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 36px 30px; border-top:1px solid #e8e3dc; font-size:11px; line-height:1.7; color:#8b857d; text-align:center;">
              Muschio Haute Parfumerie · Dubai, United Arab Emirates<br />
              This is an automatic confirmation that your message reached our team.
            </td>
          </tr>
        </table>
      </div>
    `;

    return this.sendEmail({
      to: enquiry.email,
      subject: "We received your message — Muschio Haute Parfumerie",
      html,
    });
  }

  /**
   * Alert when a VIP Client submits a Fragrance Consultation / Concierge Enquiry
   */
  public static async sendEnquiryNotification(enquiry: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    fragranceInterest?: string;
  }) {
    const customerName = this.escapeHtml(enquiry.name);
    const customerEmail = this.escapeHtml(enquiry.email);
    const phone = this.escapeHtml(enquiry.phone || "Not provided");
    const subject = this.escapeHtml(enquiry.subject || "VIP Fragrance Consultation");
    const fragranceInterest = enquiry.fragranceInterest ? this.escapeHtml(enquiry.fragranceInterest) : undefined;
    const message = this.escapeHtml(enquiry.message);

    const html = `
      <div style="font-family: sans-serif; background-color: #ffffff; color: #000000; padding: 25px; border: 1px solid #e5e5e5; max-width: 550px;">
        <h2 style="margin-top: 0; font-size: 18px; border-bottom: 2px solid #000000; padding-bottom: 8px;">
          💬 NEW VIP CLIENT CONCIERGE ENQUIRY
        </h2>
        <ul style="font-size: 13px; line-height: 1.8;">
          <li><strong>Client Name:</strong> ${customerName}</li>
          <li><strong>Email:</strong> <a href="mailto:${customerEmail}">${customerEmail}</a></li>
          <li><strong>Phone / WhatsApp:</strong> ${phone}</li>
          <li><strong>Subject:</strong> ${subject}</li>
          ${fragranceInterest ? `<li><strong>Fragrance / Maison of Interest:</strong> ${fragranceInterest}</li>` : ""}
        </ul>
        <div style="background-color: #f5f5f5; border-left: 3px solid #000000; padding: 12px; margin-top: 15px; font-size: 13px; line-height: 1.6;">
          <strong>Message:</strong><br />
          ${message}
        </div>
        <div style="margin-top: 20px;">
          <a href="https://www.muschio.ae/admin" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 10px 18px; font-size: 12px; font-weight: bold; border-radius: 4px;">
            Respond in Admin Console
          </a>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: this.getAdminEmail(),
      subject: `💬 [VIP ENQUIRY] ${enquiry.name}: ${enquiry.subject || "Fragrance Consultation"}`,
      html,
    });
  }

  /**
   * Confirmation sent to customer upon 7-Day Guarantee Return Request submission
   */
  public static async sendReturnRequestConfirmation(returnRequest: any, order?: any) {
    const recipient =
      returnRequest.customer?.email ||
      order?.guestEmail ||
      order?.shippingAddress?.email;
    if (!recipient) return { success: false, error: "No recipient email found for return request" };

    const rawName =
      order?.shippingAddress?.fullName ||
      (returnRequest.customer?.firstName
        ? `${returnRequest.customer.firstName} ${returnRequest.customer.lastName || ""}`
        : null) ||
      "Esteemed Client";
    const customerName = this.escapeHtml(rawName.trim());
    const rmaNumber = this.escapeHtml(returnRequest.returnNumber || "RET-PENDING");
    const orderNumber = this.escapeHtml(order?.orderNumber || returnRequest.orderId || "Order");
    const resolution = returnRequest.requestedAction === "STORE_CREDIT" ? "Luxury Store Credit (+5% VIP Bonus)" : "Original Payment Method Refund";
    const trackUrl = `https://www.muschio.ae/en/track?ref=${encodeURIComponent(returnRequest.returnNumber || "")}`;

    const itemsSummary = (returnRequest.items || [])
      .map((it: any) => `• Qty ${it.quantity || 1} x ${this.escapeHtml(it.orderItem?.productNameEn || "Curated Flacon")} (${this.escapeHtml(it.orderItem?.sizeLabel || "Full-size")})`)
      .join("<br />");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Return Request Initiated: ${rmaNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070707; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #EDE8D0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #070707; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #0E0E0E; border: 1px solid #222;">
          <tr><td height="3" style="background: linear-gradient(90deg, #8A6D3B 0%, #C5A265 50%, #8A6D3B 100%);"></td></tr>
          <tr>
            <td style="padding: 35px 30px; text-align: center;">
              <div style="font-family: 'Times New Roman', serif; font-size: 24px; letter-spacing: 0.3em; color: #FFFFFF; text-transform: uppercase;">
                MUSCHIO
              </div>
              <div style="font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #C5A265; margin-top: 4px;">
                HAUTE PARFUMERIE • 7-DAY GUARANTEE
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <div style="background-color: #141414; border: 1px solid #282828; border-left: 3px solid #C5A265; padding: 18px 20px;">
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #C5A265; font-weight: 600;">
                  Return Authorization Active
                </div>
                <div style="font-family: 'Times New Roman', serif; font-size: 20px; color: #FFFFFF; margin: 4px 0;">
                  RMA Number: <span style="font-family: monospace; color: #F5F2EB;">${rmaNumber}</span>
                </div>
                <div style="font-size: 11px; color: #7A756D;">
                  Order Reference: ${orderNumber} • Requested Settlement: <strong>${resolution}</strong>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 30px 20px 30px; font-size: 14px; line-height: 1.7; color: #D6D0C2;">
              Dear <strong>${customerName}</strong>,<br /><br />
              We have received your 7-day privilege return request. A Muschio white-glove courier dispatch will be scheduled to collect your parcel.<br /><br />
              <div style="background-color: #121212; border: 1px solid #222; padding: 14px; margin: 15px 0;">
                <strong style="color: #C5A265; font-size: 12px; text-transform: uppercase;">Return Flacons:</strong><br />
                <span style="font-size: 13px; color: #E5E5E5;">${itemsSummary || "1 x Flacon Return"}</span>
              </div>
              <div style="font-size: 12px; color: #9A958C; line-height: 1.6; border-left: 2px solid #C5A265; padding-left: 12px;">
                <strong>Return Condition Reminder:</strong> Please ensure the main flacon packaging remains intact with the original wax seal unopened. You are welcome to keep the accompanying 2ml discovery vial.
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 10px 30px 35px 30px;">
              <a href="${trackUrl}" target="_blank" style="display: inline-block; background-color: #C5A265; color: #070707; text-decoration: none; padding: 12px 28px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700;">
                Track Return Progress Live &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail({
      to: recipient,
      subject: `Return Request Confirmed: ${returnRequest.returnNumber || "RMA"} (Order ${orderNumber})`,
      html,
    });
  }

  /**
   * Notification sent to customer when Return Status advances in reverse logistics
   */
  public static async sendReturnStatusUpdate(
    returnRequest: any,
    newStatus: string,
    carrier?: string,
    trackingNumber?: string
  ) {
    const recipient = returnRequest.customer?.email || returnRequest.order?.guestEmail || returnRequest.order?.shippingAddress?.email;
    if (!recipient) return { success: false, error: "No recipient email" };

    const rmaNumber = this.escapeHtml(returnRequest.returnNumber || "RET-RMA");
    const escapedCarrier = carrier ? this.escapeHtml(carrier) : "Muschio White-Glove Logistics";
    const escapedTracking = trackingNumber ? this.escapeHtml(trackingNumber) : undefined;

    const statusLabels: Record<string, { title: string; desc: string }> = {
      APPROVED: {
        title: "Return Authorized",
        desc: "Our quality team has authorized your return request. A courier is being assigned.",
      },
      COLLECTION_SCHEDULED: {
        title: "Collection Scheduled",
        desc: "A courier has been booked to collect the flacon from your shipping address.",
      },
      IN_TRANSIT: {
        title: "In Transit to Vault",
        desc: "Your return package has been collected and is en route to our Dubai vault.",
      },
      RECEIVED: {
        title: "Received at Vault",
        desc: "Your package has arrived at our Dubai fulfillment vault and is queued for verification.",
      },
      INSPECTED: {
        title: "Inspection Complete",
        desc: "Authenticity and seal integrity have been verified by our Master Perfumery curators.",
      },
      COMPLETED: {
        title: "Return Finalized",
        desc: "Your return workflow is completed and your refund or store credit has been issued.",
      },
      REJECTED: {
        title: "Return Not Approved",
        desc: "The return could not be approved. Please review inspector notes or contact our VIP Concierge.",
      },
    };

    const info = statusLabels[newStatus] || {
      title: `Return Status: ${newStatus}`,
      desc: "Your return request status has been updated.",
    };

    const html = `
      <div style="font-family: sans-serif; background-color: #0E0E0E; color: #EDE8D0; padding: 30px; border: 1px solid #C5A265; max-width: 580px; margin: 0 auto;">
        <h2 style="font-family: 'Times New Roman', serif; color: #FFFFFF; margin-top: 0;">
          ${this.escapeHtml(info.title)}
        </h2>
        <p style="font-size: 13px; color: #D6D0C2; line-height: 1.6;">
          ${this.escapeHtml(info.desc)}
        </p>
        <div style="background-color: #141414; border: 1px solid #222; padding: 15px; margin: 20px 0; font-size: 12px; color: #A39E93;">
          <strong>RMA:</strong> <span style="color: #F5F2EB;">${rmaNumber}</span><br />
          <strong>Carrier:</strong> ${escapedCarrier}<br />
          ${escapedTracking ? `<strong>Tracking Reference:</strong> <span style="color: #C5A265;">${escapedTracking}</span><br />` : ""}
        </div>
        <p style="font-size: 11px; color: #7A756D;">
          For questions, contact <a href="mailto:concierge@muschio.ae" style="color: #C5A265;">concierge@muschio.ae</a>.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: recipient,
      subject: `Update on Return ${returnRequest.returnNumber || "RMA"}: ${info.title}`,
      html,
    });
  }

  /**
   * Receipt sent to customer when a refund or store credit voucher is issued
   */
  public static async sendRefundConfirmation(returnRequest: any, refundResult: any) {
    const recipient = returnRequest.customer?.email || returnRequest.order?.guestEmail || returnRequest.order?.shippingAddress?.email;
    if (!recipient) return { success: false, error: "No recipient email" };

    const rmaNumber = this.escapeHtml(returnRequest.returnNumber || "RMA");
    const amount = Number(refundResult.refundAmount || returnRequest.refundAmount || 0).toFixed(2);
    const currency = this.escapeHtml(returnRequest.order?.currency || "AED");
    const isVoucher = refundResult.action === "STORE_CREDIT" || refundResult.voucherCode;
    const voucherCode = isVoucher ? this.escapeHtml(refundResult.voucherCode || "STORE-CREDIT") : null;

    const html = isVoucher
      ? `
      <div style="font-family: sans-serif; background-color: #0E0E0E; color: #EDE8D0; padding: 30px; border: 1px solid #C5A265; max-width: 580px; margin: 0 auto;">
        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #C5A265;">MUSCHIO PRIVILEGE</div>
        <h2 style="font-family: 'Times New Roman', serif; color: #FFFFFF; margin: 6px 0 15px 0;">
          ✨ Your Luxury Store Credit Voucher
        </h2>
        <p style="font-size: 13px; color: #D6D0C2; line-height: 1.6;">
          Your return <strong>${rmaNumber}</strong> has been finalized. We have credited your account with an exclusive store credit voucher valid for 12 months across our entire haute parfumerie collection.
        </p>
        <div style="background: linear-gradient(180deg, #1A1813 0%, #12110D 100%); border: 1px solid #C5A265; padding: 20px; text-align: center; margin: 25px 0;">
          <div style="font-size: 11px; text-transform: uppercase; color: #A39E93; letter-spacing: 0.15em;">Voucher Code</div>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 0.25em; color: #FFFFFF; margin: 8px 0; font-family: monospace;">
            ${voucherCode}
          </div>
          <div style="font-size: 16px; color: #C5A265; font-weight: 600;">
            Value: ${amount} ${currency}
          </div>
          <div style="font-size: 10px; color: #7A756D; margin-top: 6px;">
            Valid for 12 months • Zero minimum spend • Applied directly at checkout
          </div>
        </div>
        <div style="text-align: center;">
          <a href="https://www.muschio.ae/en/shop" style="display: inline-block; background-color: #C5A265; color: #070707; text-decoration: none; padding: 12px 28px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700;">
            Explore Fragrance Catalog &rarr;
          </a>
        </div>
      </div>
      `
      : `
      <div style="font-family: sans-serif; background-color: #0E0E0E; color: #EDE8D0; padding: 30px; border: 1px solid #222; max-width: 580px; margin: 0 auto;">
        <h2 style="font-family: 'Times New Roman', serif; color: #FFFFFF; margin-top: 0;">
          💳 Refund Confirmation: ${rmaNumber}
        </h2>
        <p style="font-size: 13px; color: #D6D0C2; line-height: 1.6;">
          Your refund of <strong style="color: #C5A265;">${amount} ${currency}</strong> has been processed to your original payment method in settlement of return request ${rmaNumber}.
        </p>
        <div style="background-color: #141414; border: 1px solid #222; padding: 14px; font-size: 12px; color: #9A958C; line-height: 1.6;">
          <strong>Settlement Method:</strong> Original Card / Digital Wallet<br />
          <strong>Processing Time:</strong> Funds typically appear on your statement within 3 to 5 business days, depending on your bank's clearing cycle.
        </div>
        <p style="font-size: 11px; color: #6D6962; margin-top: 20px;">
          If you have questions, our VIP Concierge is available at <a href="mailto:concierge@muschio.ae" style="color: #C5A265;">concierge@muschio.ae</a>.
        </p>
      </div>
      `;

    return this.sendEmail({
      to: recipient,
      subject: isVoucher
        ? `✨ Your Store Credit Voucher: ${amount} ${currency} — Muschio Haute Parfumerie`
        : `💳 Refund Processed: ${amount} ${currency} — Muschio Return ${rmaNumber}`,
      html,
    });
  }
}
