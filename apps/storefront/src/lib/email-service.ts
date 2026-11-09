/**
 * Muschio Haute Parfumerie — Transactional Email Service
 * 
 * Supports:
 * 1. Resend API (via native fetch) — RESEND_API_KEY
 * 2. SendGrid API (via native fetch) — SENDGRID_API_KEY
 * 3. Custom SMTP (via nodemailer) — SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE
 * 4. Graceful simulation mode with informative logging when no provider is configured.
 */

import nodemailer from "nodemailer";

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private static getResendKey(): string | undefined {
    return process.env.RESEND_API_KEY;
  }

  private static getSendGridKey(): string | undefined {
    return process.env.SENDGRID_API_KEY;
  }

  private static getSmtpConfig() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (host && user && pass) {
      return {
        host,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
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

  public static getStatus() {
    if (this.getResendKey()) {
      return { provider: "resend", configured: true };
    }
    if (this.getSendGridKey()) {
      return { provider: "sendgrid", configured: true };
    }
    if (this.getSmtpConfig()) {
      return { provider: "smtp", configured: true };
    }
    return {
      provider: "none",
      configured: false,
      missing: [
        "RESEND_API_KEY (Recommended: free at resend.com)",
        "or SENDGRID_API_KEY",
        "or SMTP_HOST, SMTP_USER, SMTP_PASS",
      ],
    };
  }

  static async sendEmail({ to, subject, html, from }: SendEmailParams): Promise<{
    success: boolean;
    simulated: boolean;
    provider?: string;
    id?: string;
    error?: any;
    message?: string;
  }> {
    const fromAddress = from || this.getFromEmail();
    const toAddresses = Array.isArray(to) ? to : [to];

    // 1. Resend API (Preferred & Zero-Setup)
    const resendKey = this.getResendKey();
    if (resendKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromAddress,
            to: toAddresses,
            subject,
            html,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          console.error("[EmailService:Resend] API Error:", data);
          return { success: false, simulated: false, provider: "resend", error: data };
        }

        return { success: true, simulated: false, provider: "resend", id: data.id };
      } catch (err: any) {
        console.error("[EmailService:Resend] Delivery Exception:", err);
        return { success: false, simulated: false, provider: "resend", error: err.message };
      }
    }

    // 2. SendGrid API
    const sendGridKey = this.getSendGridKey();
    if (sendGridKey) {
      try {
        const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sendGridKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: toAddresses.map((email) => ({ email })) }],
            from: { email: fromAddress.replace(/^.*<([^>]+)>.*$/, "$1").trim(), name: "Muschio Haute Parfumerie" },
            subject,
            content: [{ type: "text/html", value: html }],
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

    // 3. Custom SMTP (Gmail, Google Workspace, Zoho, Microsoft 365, AWS SES, cPanel)
    const smtpConfig = this.getSmtpConfig();
    if (smtpConfig) {
      try {
        const transporter = nodemailer.createTransport(smtpConfig);
        const info = await transporter.sendMail({
          from: fromAddress,
          to: toAddresses.join(", "),
          subject,
          html,
        });

        return { success: true, simulated: false, provider: "smtp", id: info.messageId };
      } catch (err: any) {
        console.error("[EmailService:SMTP] Delivery Exception:", err);
        return { success: false, simulated: false, provider: "smtp", error: err.message };
      }
    }

    // 4. Graceful Development / Missing Provider Simulation
    console.log(`\n---------------------------------------------------------`);
    console.log(`[Muschio Email Service (SIMULATION MODE)]`);
    console.log(`To: ${toAddresses.join(", ")}`);
    console.log(`Subject: ${subject}`);
    console.log(`Notice: No email provider configured.`);
    console.log(`Configure RESEND_API_KEY in Vercel/environment to deliver live emails.`);
    console.log(`---------------------------------------------------------\n`);

    return {
      success: true,
      simulated: true,
      provider: "none",
      message: "Simulation mode: Set RESEND_API_KEY, SENDGRID_API_KEY, or SMTP credentials in Vercel to send live emails.",
      id: `sim-${Date.now()}`,
    };
  }

  /**
   * Luxury HTML Template for Customer Order Confirmation
   */
  static async sendOrderConfirmation(order: any) {
    const recipient = order.guestEmail || order.customer?.email || order.shippingAddress?.email;
    if (!recipient) return { success: false, error: "No recipient email" };

    const customerName = order.shippingAddress?.fullName || order.customer?.name || "Esteemed Client";
    const totalAmount = order.totalAmount ? Number(order.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
    const subtotal = order.subtotal ? Number(order.subtotal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : totalAmount;
    const vatAmount = order.taxAmount ? Number(order.taxAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (Number(order.totalAmount || 0) * 0.05 / 1.05).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const currency = order.currency || "AED";
    const orderNumber = order.orderNumber || "MSC-ORDER";
    const trackUrl = `https://www.muschio.ae/en/track?ref=${encodeURIComponent(orderNumber)}`;
    const whatsappUrl = `https://wa.me/97148006872?text=${encodeURIComponent(`Hello Muschio Concierge, I have an enquiry regarding my order ${orderNumber}`)}`;

    const addr = order.shippingAddress || {};
    const street = [addr.addressLine1, addr.addressLine2].filter(Boolean).join(", ") || "Client Address";
    const cityState = [addr.city, addr.emirateState].filter(Boolean).join(", ") || "Dubai";
    const country = addr.countryCode === "AE" || !addr.countryCode ? "United Arab Emirates" : addr.countryCode;
    const phone = addr.phone || "Not specified";
    const paymentMethodLabel = order.payments?.[0]?.paymentMethod || order.paymentMethod || "Credit / Debit Card (Secure 3D-Auth)";

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
              ${item.brandName || "Muschio"}
            </div>
            <div style="font-family: 'Times New Roman', serif; font-size: 15px; color: #FFFFFF; font-weight: 500; margin-top: 4px;">
              ${item.productNameEn || "Rare Haute Fragrance"}
            </div>
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #8E8A82; margin-top: 4px;">
              Volume: ${item.sizeLabel || "100ml Extrait"} • Quantity: ${item.quantity || 1}
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
                HAUTE PARFUMERIE • DUBAI & GCC
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
                      ✨ The Muschio Client Privilege
                    </div>
                    <div style="font-size: 11px; color: #A8A194; line-height: 1.5;">
                      Every full-size flacon includes an official 2ml matching discovery vial. Experience the scent on your skin first; the flacon remains returnable if the bespoke wax seal remains intact.
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
                      Track Order Status Live →
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
                © 2026 Muschio Luxury Fragrances LLC. All master allocations authenticated.
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
      subject: `Your Muschio Order Confirmation: ${orderNumber}`,
      html,
    });
  }

  /**
   * Alert to Muschio Admin team for instant fulfillment dispatch
   */
  static async sendAdminOrderAlert(order: any) {
    const customerName = order.shippingAddress?.fullName || order.customer?.name || "Client";
    const totalAmount = order.totalAmount ? Number(order.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
    const currency = order.currency || "AED";
    const city = order.shippingAddress?.city || "Dubai";
    const emirate = order.shippingAddress?.emirateState || "Dubai";
    const country = order.shippingAddress?.countryCode || "AE";
    const orderNumber = order.orderNumber || "MSC-ORDER";
    const phone = order.shippingAddress?.phone || "N/A";
    const clientEmail = order.guestEmail || order.customer?.email || "N/A";

    const itemsSummary = (order.items || [])
      .map((it: any) => `• ${it.brandName || "Muschio"} — ${it.productNameEn || "Flacon"} (${it.sizeLabel || "100ml"}, Qty: ${it.quantity || 1}) — ${Number(it.totalPrice || 0).toLocaleString()} ${currency}`)
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
            <tr><td style="color: #8A857B;">Status:</td><td><span style="color: #10B981; font-weight: 600;">${order.status || "CONFIRMED"}</span></td></tr>
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
            Open Fulfillment Console →
          </a>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: this.getAdminEmail(),
      subject: `🛍️ [NEW ORDER] ${orderNumber} — ${totalAmount} ${currency} (${customerName})`,
      html,
    });
  }

  /**
   * Alert when an order is cancelled
   */
  static async sendOrderCancellation(order: any, reason?: string) {
    const recipient = order.guestEmail || order.customer?.email || order.shippingAddress?.email;
    const customerName = order.shippingAddress?.fullName || order.customer?.name || "Esteemed Client";
    const orderNumber = order.orderNumber || "Order";

    const html = `
      <div style="background-color: #000000; color: #ffffff; padding: 35px 20px; font-family: sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #262626;">
        <h2 style="font-family: 'Times New Roman', serif; font-size: 22px; font-weight: normal; margin-top: 0; letter-spacing: 0.1em;">
          MUSCHIO — Order Cancellation Notice
        </h2>
        <p style="font-size: 13px; color: #cccccc; line-height: 1.6;">
          Dear ${customerName},<br /><br />
          Your order <strong>${orderNumber}</strong> has been cancelled. Any reserved funds will be returned to your original payment method in accordance with banking clearing protocols.
        </p>
        ${reason ? `<div style="background-color: #171717; border-left: 3px solid #737373; padding: 12px; font-size: 12px; color: #a3a3a3; margin: 20px 0;"><strong>Reason:</strong> ${reason}</div>` : ""}
        <p style="font-size: 12px; color: #737373;">
          If this was done in error, please contact our VIP Concierge hotline immediately at concierge@muschio.ae.
        </p>
      </div>
    `;

    if (recipient) {
      await this.sendEmail({
        to: recipient,
        subject: `Order Cancellation: ${orderNumber} — Muschio Haute Parfumerie`,
        html,
      });
    }

    await this.sendEmail({
      to: this.getAdminEmail(),
      subject: `⚠️ [ORDER CANCELLED] ${orderNumber} — Immediate Halt Required`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e5e5;">
          <h3>⚠️ Order Cancelled: ${orderNumber}</h3>
          <p>Client: ${customerName}</p>
          <p>Reason: ${reason || "Client cancellation / Stock adjustment"}</p>
          <p>Please ensure courier pickup is halted and reserved flacons are returned to inventory.</p>
        </div>
      `,
    });
  }

  /**
   * Alert when a VIP Client submits a Fragrance Consultation / Concierge Enquiry
   */
  static async sendEnquiryNotification(enquiry: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    fragranceInterest?: string;
  }) {
    const html = `
      <div style="font-family: sans-serif; background-color: #ffffff; color: #000000; padding: 25px; border: 1px solid #e5e5e5; max-width: 550px;">
        <h2 style="margin-top: 0; font-size: 18px; border-bottom: 2px solid #000000; padding-bottom: 8px;">
          💬 NEW VIP CLIENT CONCIERGE ENQUIRY
        </h2>
        <ul style="font-size: 13px; line-height: 1.8;">
          <li><strong>Client Name:</strong> ${enquiry.name}</li>
          <li><strong>Email:</strong> <a href="mailto:${enquiry.email}">${enquiry.email}</a></li>
          <li><strong>Phone / WhatsApp:</strong> ${enquiry.phone || "Not provided"}</li>
          <li><strong>Subject:</strong> ${enquiry.subject || "VIP Fragrance Consultation"}</li>
          ${enquiry.fragranceInterest ? `<li><strong>Fragrance / Maison of Interest:</strong> ${enquiry.fragranceInterest}</li>` : ""}
        </ul>
        <div style="background-color: #f5f5f5; border-left: 3px solid #000000; padding: 12px; margin-top: 15px; font-size: 13px; line-height: 1.6;">
          <strong>Message:</strong><br />
          ${enquiry.message}
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
}
