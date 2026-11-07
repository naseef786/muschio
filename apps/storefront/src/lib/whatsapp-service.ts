/**
 * Muschio Haute Parfumerie — WhatsApp Business Messaging Service
 * 
 * Automated transactional WhatsApp notifications for orders, cancellations, and concierge tracking.
 * Supports:
 * 1. Meta WhatsApp Cloud API (Graph API) — WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID
 * 2. Twilio WhatsApp REST API — TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_WHATSAPP_FROM
 * 3. Deep link click-to-chat generator for storefront and admin panel
 * 4. Graceful simulation mode with informative logging when credentials are not configured
 */

interface SendWhatsAppParams {
  to: string;
  body: string;
  previewUrl?: boolean;
}

export class WhatsAppService {
  private static getMetaAccessToken(): string | undefined {
    return process.env.WHATSAPP_ACCESS_TOKEN;
  }

  private static getMetaPhoneNumberId(): string | undefined {
    return process.env.WHATSAPP_PHONE_NUMBER_ID;
  }

  private static getTwilioSid(): string | undefined {
    return process.env.TWILIO_ACCOUNT_SID;
  }

  private static getTwilioAuthToken(): string | undefined {
    return process.env.TWILIO_AUTH_TOKEN;
  }

  private static getTwilioFrom(): string {
    return process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
  }

  public static getAdminWhatsApp(): string {
    return process.env.WHATSAPP_ADMIN_PHONE || "97148006872";
  }

  public static getStoreUrl(): string {
    return process.env.NEXT_PUBLIC_STORE_URL || "https://www.muschio.ae";
  }

  public static getStatus() {
    if (this.getMetaAccessToken() && this.getMetaPhoneNumberId()) {
      return { provider: "meta", configured: true };
    }
    if (this.getTwilioSid() && this.getTwilioAuthToken()) {
      return { provider: "twilio", configured: true };
    }
    return {
      provider: "none",
      configured: false,
      missing: [
        "Meta Cloud API: WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID",
        "or Twilio: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN",
      ],
    };
  }

  /**
   * Normalizes international phone number into clean E.164 digits without "+"
   * e.g. "050 123 4567" -> "971501234567"
   * e.g. "+966 55 123 4567" -> "966551234567"
   */
  public static normalizePhoneNumber(rawPhone: string, defaultCountry: string = "AE"): string {
    if (!rawPhone) return "";
    let clean = rawPhone.replace(/[^0-9+]/g, "");

    if (clean.startsWith("+")) {
      clean = clean.substring(1);
    } else if (clean.startsWith("00")) {
      clean = clean.substring(2);
    }

    // GCC local formatting fallback (if starting with 05...)
    if (clean.startsWith("05")) {
      if (defaultCountry === "SA") {
        clean = "966" + clean.substring(1);
      } else if (defaultCountry === "KW") {
        clean = "965" + clean.substring(1);
      } else {
        // UAE default (+971)
        clean = "971" + clean.substring(1);
      }
    }

    return clean;
  }

  /**
   * Send WhatsApp Message via Meta WhatsApp Cloud API or Twilio WhatsApp API
   */
  public static async sendWhatsAppMessage({ to, body, previewUrl = true }: SendWhatsAppParams): Promise<{
    success: boolean;
    simulated: boolean;
    provider?: string;
    id?: string;
    error?: any;
    message?: string;
  }> {
    const cleanTo = this.normalizePhoneNumber(to);
    if (!cleanTo || cleanTo.length < 8) {
      console.warn(`[WhatsAppService] Invalid recipient phone number: "${to}"`);
      return { success: false, simulated: false, error: `Invalid phone number: ${to}` };
    }

    // 1. Meta WhatsApp Cloud API (Graph API)
    const metaToken = this.getMetaAccessToken();
    const metaPhoneId = this.getMetaPhoneNumberId();
    if (metaToken && metaPhoneId) {
      try {
        const res = await fetch(`https://graph.facebook.com/v19.0/${metaPhoneId}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${metaToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: cleanTo,
            type: "text",
            text: {
              preview_url: previewUrl,
              body,
            },
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          console.error("[WhatsAppService:Meta] API Error:", data);
          return { success: false, simulated: false, provider: "meta", error: data };
        }

        const messageId = data?.messages?.[0]?.id || `meta-${Date.now()}`;
        return { success: true, simulated: false, provider: "meta", id: messageId };
      } catch (err: any) {
        console.error("[WhatsAppService:Meta] Exception:", err);
        return { success: false, simulated: false, provider: "meta", error: err.message };
      }
    }

    // 2. Twilio WhatsApp REST API
    const twilioSid = this.getTwilioSid();
    const twilioAuthToken = this.getTwilioAuthToken();
    if (twilioSid && twilioAuthToken) {
      try {
        const auth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString("base64");
        const fromNumber = this.getTwilioFrom();
        const bodyParams = new URLSearchParams();
        bodyParams.append("From", fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`);
        bodyParams.append("To", `whatsapp:+${cleanTo}`);
        bodyParams.append("Body", body);

        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: bodyParams.toString(),
        });

        const data = await res.json();
        if (!res.ok) {
          console.error("[WhatsAppService:Twilio] API Error:", data);
          return { success: false, simulated: false, provider: "twilio", error: data };
        }

        return { success: true, simulated: false, provider: "twilio", id: data.sid || `tw-${Date.now()}` };
      } catch (err: any) {
        console.error("[WhatsAppService:Twilio] Exception:", err);
        return { success: false, simulated: false, provider: "twilio", error: err.message };
      }
    }

    // 3. Graceful Simulation Mode
    console.log(`\n=========================================================`);
    console.log(`[Muschio WhatsApp Business Service (SIMULATION MODE)]`);
    console.log(`To: +${cleanTo}`);
    console.log(`Message Body:\n${body}`);
    console.log(`Notice: No WhatsApp API credentials configured.`);
    console.log(`Configure WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID (or TWILIO_ACCOUNT_SID) in Vercel to deliver live messages.`);
    console.log(`=========================================================\n`);

    return {
      success: true,
      simulated: true,
      provider: "none",
      message: "Simulation mode: Set WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID or Twilio credentials in Vercel to send live WhatsApp messages.",
      id: `sim-wa-${Date.now()}`,
    };
  }

  /**
   * 1. Customer Order Confirmation via WhatsApp
   */
  public static async sendOrderConfirmation(order: any) {
    const recipientPhone =
      order.shippingAddress?.phone ||
      order.customer?.phone ||
      order.customerPhone;

    if (!recipientPhone) {
      console.warn(`[WhatsAppService] No phone number available for order ${order.orderNumber}`);
      return { success: false, error: "No phone number available" };
    }

    const customerName =
      order.shippingAddress?.fullName ||
      order.customer?.name ||
      order.customer?.firstName ||
      "Esteemed Client";

    const totalAmount = order.totalAmount
      ? Number(order.totalAmount).toLocaleString()
      : "0";
    const currency = order.currency || "AED";
    const city = order.shippingAddress?.city || "Dubai";
    const country = order.shippingAddress?.countryCode || "AE";

    const itemsSummary = (order.items || [])
      .map(
        (item: any, i: number) =>
          `  ${i + 1}. *${item.brandName || "Muschio"}* — ${item.productNameEn || "Fragrance"} (${item.sizeLabel || "100ml"}) x${item.quantity || 1}`
      )
      .join("\n");

    const trackingUrl = `${this.getStoreUrl()}/en/order-confirmation/${encodeURIComponent(order.orderNumber)}`;

    const message = 
`⚜️ *MUSCHIO HAUTE PARFUMERIE · DUBAI*
*Order Confirmed: #${order.orderNumber}*

Dear ${customerName},

Thank you for choosing Muschio. Your flacon has been reserved and is now entering artisanal preparation and batch certification.

📦 *Order Summary:*
• Reference: *${order.orderNumber}*
• Total Amount: *${totalAmount} ${currency}*
• Destination: ${city}, ${country}
${itemsSummary ? `\n*Selected Flacons:*\n${itemsSummary}\n` : ""}
🔍 *Track Live Status & Delivery Timeline:*
${trackingUrl}

💬 *VIP Concierge:*
Need temperature-controlled evening handover or custom royal gift wrapping? Reply directly to this WhatsApp chat or call +971 4 800 6872.`;

    return this.sendWhatsAppMessage({
      to: recipientPhone,
      body: message,
      previewUrl: true,
    });
  }

  /**
   * 2. Customer Order Cancellation via WhatsApp
   */
  public static async sendOrderCancellation(order: any, reason?: string) {
    const recipientPhone =
      order.shippingAddress?.phone ||
      order.customer?.phone ||
      order.customerPhone;

    if (!recipientPhone) return { success: false, error: "No phone number available" };

    const customerName =
      order.shippingAddress?.fullName ||
      order.customer?.firstName ||
      "Esteemed Client";
    const orderNumber = order.orderNumber || "Order";

    const message =
`⚜️ *MUSCHIO HAUTE PARFUMERIE · DUBAI*
*Order Cancellation Notice: #${orderNumber}*

Dear ${customerName},

This is an automated notice confirming that your order *#${orderNumber}* has been cancelled.
${reason ? `\n*Reason:* ${reason}\n` : ""}
Any authorized funds have been released and will reflect in accordance with your bank's clearance policy.

If this cancellation was unintended, please reply immediately to this chat to have our VIP concierge reinstate your reservation.`;

    return this.sendWhatsAppMessage({
      to: recipientPhone,
      body: message,
      previewUrl: false,
    });
  }

  /**
   * 3. Alert Muschio Operations Team on WhatsApp
   */
  public static async sendAdminOrderAlert(order: any) {
    const adminPhone = this.getAdminWhatsApp();
    const customerName =
      order.shippingAddress?.fullName ||
      order.customer?.name ||
      order.customer?.firstName ||
      "Client";
    const totalAmount = order.totalAmount
      ? Number(order.totalAmount).toLocaleString()
      : "0";
    const currency = order.currency || "AED";
    const city = order.shippingAddress?.city || "Dubai";
    const country = order.shippingAddress?.countryCode || "AE";

    const message =
`🛍️ *NEW MUSCHIO STOREFRONT ORDER*
Order: *#${order.orderNumber}*
Client: *${customerName}*
Phone: ${order.shippingAddress?.phone || "N/A"}
Amount: *${totalAmount} ${currency}*
City: ${city}, ${country}
Items: ${order.items?.length || 1} flacons

👉 Open Admin Console: ${this.getStoreUrl()}/admin`;

    return this.sendWhatsAppMessage({
      to: adminPhone,
      body: message,
      previewUrl: false,
    });
  }

  /**
   * 4. Generate Pre-Filled WhatsApp Click-to-Chat URL
   * Opens native WhatsApp on mobile / WhatsApp Web on desktop with prefilled message
   */
  public static generatePrefilledWhatsAppLink(order: any): string {
    const orderNumber = order.orderNumber || "Order";
    const total = order.totalAmount ? `${Number(order.totalAmount).toLocaleString()} ${order.currency || "AED"}` : "";
    const text = `Hello Muschio Concierge, I would like assistance regarding my order #${orderNumber} (${total}).`;
    return `https://wa.me/${this.getAdminWhatsApp()}?text=${encodeURIComponent(text)}`;
  }

  /**
   * 5. Generate Direct Customer WhatsApp Chat Link for Admin
   */
  public static generateCustomerWhatsAppLink(phone: string, customerName: string, orderNumber: string): string {
    const clean = this.normalizePhoneNumber(phone);
    const text = `Hello ${customerName}, this is Muschio Haute Parfumerie Concierge reaching out regarding your order #${orderNumber}.`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  }
}
