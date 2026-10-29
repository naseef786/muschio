/**
 * Muschio Haute Parfumerie — Transactional Email Service
 * Supports Resend API (via native fetch) with graceful development fallback.
 */

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private static getApiKey(): string | undefined {
    return process.env.RESEND_API_KEY;
  }

  private static getAdminEmail(): string {
    return process.env.ADMIN_NOTIFICATION_EMAIL || "concierge@muschio.luxury";
  }

  private static getFromEmail(): string {
    return process.env.EMAIL_FROM || "Muschio Haute Parfumerie <orders@muschio.luxury>";
  }

  static async sendEmail({ to, subject, html, from }: SendEmailParams) {
    const apiKey = this.getApiKey();
    const fromAddress = from || this.getFromEmail();

    if (!apiKey) {
      console.log(`\n---------------------------------------------------------`);
      console.log(`[Muschio Email Service (SIMULATION MODE)]`);
      console.log(`To: ${Array.isArray(to) ? to.join(", ") : to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Notice: Configure RESEND_API_KEY in .env to deliver real emails.`);
      console.log(`---------------------------------------------------------\n`);
      return { success: true, simulated: true, id: `sim-${Date.now()}` };
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("[EmailService] Resend API Error:", data);
        return { success: false, error: data };
      }

      return { success: true, simulated: false, id: data.id };
    } catch (err: any) {
      console.error("[EmailService] Failed to send email:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Luxury HTML Template for Customer Order Confirmation
   */
  static async sendOrderConfirmation(order: any) {
    const recipient = order.guestEmail || order.customer?.email || order.shippingAddress?.email;
    if (!recipient) return;

    const customerName = order.shippingAddress?.fullName || order.customer?.name || "Esteemed Client";
    const totalAmount = order.totalAmount ? Number(order.totalAmount).toLocaleString() : "0";
    const currency = order.currency || "AED";

    const itemsHtml = (order.items || [])
      .map(
        (item: any) => `
        <tr style="border-bottom: 1px solid #262626;">
          <td style="padding: 12px 0; font-family: sans-serif; font-size: 13px; color: #ffffff;">
            <strong>${item.brandName || "Muschio"}</strong> — ${item.productNameEn || "Fragrance"}<br />
            <span style="font-size: 11px; color: #888888;">Volume: ${item.sizeLabel || "100ml"} • Qty: ${item.quantity || 1}</span>
          </td>
          <td style="padding: 12px 0; text-align: right; font-family: monospace; font-size: 13px; color: #ffffff;">
            ${Number(item.totalPrice || item.unitPrice || 0).toLocaleString()} ${currency}
          </td>
        </tr>`
      )
      .join("");

    const html = `
      <div style="background-color: #000000; color: #ffffff; padding: 40px 20px; font-family: 'Times New Roman', Times, serif; max-width: 600px; margin: 0 auto; border: 1px solid #262626;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 24px; letter-spacing: 0.3em; font-weight: normal; margin-bottom: 4px;">MUSCHIO</div>
          <div style="font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #a3a3a3; font-family: sans-serif;">Haute Parfumerie • Dubai & GCC</div>
        </div>

        <div style="border-top: 1px solid #262626; border-bottom: 1px solid #262626; padding: 20px 0; margin-bottom: 25px; text-align: center;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #888888; font-family: sans-serif;">Order Confirmation</div>
          <div style="font-size: 20px; margin-top: 5px; font-family: monospace; color: #ffffff;">${order.orderNumber}</div>
        </div>

        <p style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #cccccc;">
          Dear ${customerName},<br /><br />
          Thank you for ordering with Muschio. Your flacon is currently being prepared under artisanal temperature-controlled standards for white-glove courier dispatch.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
          <thead>
            <tr style="border-bottom: 1px solid #404040; text-align: left;">
              <th style="padding-bottom: 8px; font-family: sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888888;">Item</th>
              <th style="padding-bottom: 8px; text-align: right; font-family: sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888888;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 20px; font-family: sans-serif;">
          <div style="font-size: 12px; color: #888888;">Total (Inc. VAT & Delivery):</div>
          <div style="font-size: 22px; font-weight: bold; color: #ffffff; font-family: monospace;">${totalAmount} ${currency}</div>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #262626; font-size: 11px; font-family: sans-serif; color: #737373; text-align: center;">
          Direct VIP Concierge: concierge@muschio.luxury • WhatsApp: +971 4 238 9000<br />
          Muschio Haute Parfumerie, Level 2, Downtown Boulevard, Dubai, UAE
        </div>
      </div>
    `;

    return this.sendEmail({
      to: recipient,
      subject: `Your Muschio Order Confirmation: ${order.orderNumber}`,
      html,
    });
  }

  /**
   * Alert to Muschio Admin team for instant fulfillment dispatch
   */
  static async sendAdminOrderAlert(order: any) {
    const customerName = order.shippingAddress?.fullName || order.customer?.name || "Client";
    const totalAmount = order.totalAmount ? Number(order.totalAmount).toLocaleString() : "0";
    const currency = order.currency || "AED";
    const city = order.shippingAddress?.city || "Dubai";
    const country = order.shippingAddress?.countryCode || "AE";

    const html = `
      <div style="font-family: sans-serif; background-color: #ffffff; color: #000000; padding: 25px; border: 1px solid #e5e5e5; max-width: 550px;">
        <h2 style="margin-top: 0; font-size: 18px; border-bottom: 2px solid #000000; padding-bottom: 8px;">
          🛍️ NEW ORDER RECEIVED: ${order.orderNumber}
        </h2>
        <p style="font-size: 13px; color: #404040;">
          A new luxury order has been completed on the storefront and requires preparation.
        </p>
        <ul style="font-size: 13px; line-height: 1.8;">
          <li><strong>Client:</strong> ${customerName}</li>
          <li><strong>Email:</strong> ${order.guestEmail || order.customer?.email || "N/A"}</li>
          <li><strong>Destination:</strong> ${city}, ${country}</li>
          <li><strong>Total Amount:</strong> <span style="font-family: monospace; font-size: 15px;">${totalAmount} ${currency}</span></li>
          <li><strong>Status:</strong> ${order.status}</li>
          <li><strong>Items:</strong> ${order.items?.length || 1} flacons</li>
        </ul>
        <div style="margin-top: 20px;">
          <a href="https://muschio.luxury/admin" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 10px 18px; font-size: 12px; font-weight: bold; border-radius: 4px;">
            Open Admin Dashboard
          </a>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: this.getAdminEmail(),
      subject: `🚨 [NEW ORDER] ${order.orderNumber} — ${totalAmount} ${currency} (${customerName})`,
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
          If this was done in error, please contact our VIP Concierge hotline immediately at concierge@muschio.luxury.
        </p>
      </div>
    `;

    // 1. Notify Customer
    if (recipient) {
      await this.sendEmail({
        to: recipient,
        subject: `Order Cancellation: ${orderNumber} — Muschio Haute Parfumerie`,
        html,
      });
    }

    // 2. Alert Admin Team
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
          <a href="https://muschio.luxury/admin" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 10px 18px; font-size: 12px; font-weight: bold; border-radius: 4px;">
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
