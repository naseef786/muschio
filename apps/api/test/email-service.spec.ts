import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EmailService } from "../src/services/email.service";

describe("Senior Fullstack Audit: Enterprise Email Service & Transactional Notifications", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // -------------------------------------------------------------------------
  // 1. Service Status & Environment Diagnostics
  // -------------------------------------------------------------------------
  describe("Configuration & Provider Diagnostics", () => {
    it("reports provider 'none' when neither SendGrid nor SMTP is configured", () => {
      delete process.env.SENDGRID_API_KEY;
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;

      const status = EmailService.getStatus();
      expect(status.provider).toBe("none");
      expect(status.configured).toBe(false);
      expect(status.from).toContain("Muschio Haute Parfumerie");
      expect(status.missing).toBeDefined();
      expect(status.missing?.length).toBeGreaterThan(0);
    });

    it("detects and prioritizes SendGrid when SENDGRID_API_KEY is present", () => {
      process.env.SENDGRID_API_KEY = "SG.test-mock-api-key-12345";
      delete process.env.SMTP_HOST;

      const status = EmailService.getStatus();
      expect(status.provider).toBe("sendgrid");
      expect(status.configured).toBe(true);
    });

    it("detects custom SMTP credentials (e.g. Zoho, Gmail, AWS SES)", () => {
      delete process.env.SENDGRID_API_KEY;
      process.env.SMTP_HOST = "smtppro.zoho.com";
      process.env.SMTP_PORT = "465";
      process.env.SMTP_SECURE = "true";
      process.env.SMTP_USER = "orders@muschio.ae";
      process.env.SMTP_PASS = "mock-secret-password";

      const status = EmailService.getStatus();
      expect(status.provider).toBe("smtp");
      expect(status.configured).toBe(true);

      const smtpConfig = EmailService.getSmtpConfig();
      expect(smtpConfig).toEqual({
        host: "smtppro.zoho.com",
        port: 465,
        secure: true,
        auth: {
          user: "orders@muschio.ae",
          pass: "mock-secret-password",
        },
      });
    });

    it("respects custom from address configuration hierarchies", () => {
      process.env.EMAIL_FROM = "Muschio VIP Concierge <concierge@muschio.ae>";
      expect(EmailService.getFromEmail()).toBe("Muschio VIP Concierge <concierge@muschio.ae>");

      delete process.env.EMAIL_FROM;
      process.env.SMTP_FROM = "Muschio Vault <vault@muschio.ae>";
      expect(EmailService.getFromEmail()).toBe("Muschio Vault <vault@muschio.ae>");
    });
  });

  // -------------------------------------------------------------------------
  // 2. Security: XSS Sanitization & HTML Injection Protection
  // -------------------------------------------------------------------------
  describe("Security & HTML Entity Escaping", () => {
    it("neutralizes script tags, image injection, and quote escapes", () => {
      const maliciousScript = "<script>alert('XSS_ATTACK')</script>";
      const sanitizedScript = EmailService.escapeHtml(maliciousScript);
      expect(sanitizedScript).toBe("&lt;script&gt;alert(&#39;XSS_ATTACK&#39;)&lt;/script&gt;");
      expect(sanitizedScript).not.toContain("<script>");

      const maliciousImg = '<img src="x" onerror="document.location=\'http://attacker.com\'">';
      const sanitizedImg = EmailService.escapeHtml(maliciousImg);
      expect(sanitizedImg).toBe("&lt;img src=&quot;x&quot; onerror=&quot;document.location=&#39;http://attacker.com&#39;&quot;&gt;");
      expect(sanitizedImg).not.toContain("<img");
    });

    it("safely handles null, undefined, numbers, and boolean values without throwing", () => {
      expect(EmailService.escapeHtml(null)).toBe("");
      expect(EmailService.escapeHtml(undefined)).toBe("");
      expect(EmailService.escapeHtml(1250)).toBe("1250");
      expect(EmailService.escapeHtml(true)).toBe("true");
    });
  });

  // -------------------------------------------------------------------------
  // 3. Deliverability: Multipart MIME Plain Text Alternative
  // -------------------------------------------------------------------------
  describe("Deliverability & RFC Plain Text Generation", () => {
    it("strips HTML markup, scripts, and breaks into clean readable plain text", () => {
      const richHtml = `
        <style>body { background: #000; }</style>
        <h1>MUSCHIO HAUTE PARFUMERIE</h1>
        <p>Dear <strong>Sultan Al Qasimi</strong>,<br />Thank you for your order.</p>
        <table role="presentation">
          <tr><td>Amouage Royal Tobacco</td><td>1,450.00 AED</td></tr>
        </table>
        <p>Total: 1,450.00 AED &amp; Complimentary Shipping.</p>
      `;

      const plainText = EmailService.stripHtmlToText(richHtml);
      expect(plainText).not.toContain("<style>");
      expect(plainText).not.toContain("<h1>");
      expect(plainText).not.toContain("<strong>");
      expect(plainText).toContain("MUSCHIO HAUTE PARFUMERIE");
      expect(plainText).toContain("Dear Sultan Al Qasimi");
      expect(plainText).toContain("Amouage Royal Tobacco");
      expect(plainText).toContain("Total: 1,450.00 AED & Complimentary Shipping.");
    });
  });

  // -------------------------------------------------------------------------
  // 4. Graceful Simulation Fallback (Zero Checkout Disruption)
  // -------------------------------------------------------------------------
  describe("Graceful Simulation Mode", () => {
    it("simulates email delivery cleanly when no credentials are configured", async () => {
      delete process.env.SENDGRID_API_KEY;
      delete process.env.SMTP_HOST;

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const result = await EmailService.sendEmail({
        to: "collector@dubai.ae",
        subject: "Order Confirmation: DXB-2026-0042",
        html: "<p>Thank you for your bespoke allocation.</p>",
      });

      expect(result.success).toBe(true);
      expect(result.simulated).toBe(true);
      expect(result.provider).toBe("none");
      expect(result.id).toMatch(/^sim-\d+/);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // 5. Luxury Order Confirmation
  // -------------------------------------------------------------------------
  describe("Customer Order Confirmation Template", () => {
    it("generates branded order confirmation with exact VAT and GCC courier details", async () => {
      const sendSpy = vi.spyOn(EmailService, "sendEmail").mockResolvedValue({
        success: true,
        simulated: true,
        id: "sim-test-1",
      });

      const orderPayload = {
        orderNumber: "DXB-2026-7788",
        guestEmail: "vip.connoisseur@almaktoum.ae",
        totalAmount: 1850.0,
        subtotal: 1850.0,
        taxAmount: 88.1,
        currency: "AED",
        createdAt: "2026-11-23T00:00:00.000Z",
        shippingAddress: {
          fullName: "H.E. Tariq Al Mansoori",
          addressLine1: "Villa 14, Al Safa 2",
          city: "Dubai",
          emirateState: "Dubai",
          countryCode: "AE",
          phone: "+971 50 123 4567",
        },
        items: [
          {
            brandName: "Boadicea the Victorious",
            productNameEn: "Blue Sapphire Supercharged",
            sizeLabel: "100ml Pure Extrait",
            quantity: 1,
            unitPrice: 1850.0,
            totalPrice: 1850.0,
          },
        ],
      };

      const result = await EmailService.sendOrderConfirmation(orderPayload);
      expect(result.success).toBe(true);
      expect(sendSpy).toHaveBeenCalledOnce();

      const callArgs = sendSpy.mock.calls[0][0];
      expect(callArgs.to).toBe("vip.connoisseur@almaktoum.ae");
      expect(callArgs.subject).toContain("DXB-2026-7788");
      expect(callArgs.html).toContain("H.E. Tariq Al Mansoori");
      expect(callArgs.html).toContain("Boadicea the Victorious");
      expect(callArgs.html).toContain("Blue Sapphire Supercharged");
      expect(callArgs.html).toContain("1,850.00");
      expect(callArgs.html).toContain("Complimentary");
      expect(callArgs.html).toContain("7-Day Guarantee");
      expect(callArgs.html).toContain("Track Order Status Live");
      expect(callArgs.html).toContain("DXB-2026-7788");
    });

    it("sanitizes malicious client input in customer name and items", async () => {
      const sendSpy = vi.spyOn(EmailService, "sendEmail").mockResolvedValue({
        success: true,
        simulated: true,
        id: "sim-test-2",
      });

      const maliciousOrder = {
        orderNumber: "DXB-2026-9999",
        guestEmail: "test@muschio.ae",
        totalAmount: 500,
        shippingAddress: {
          fullName: '<script>alert("Hacked")</script>',
          addressLine1: '<img src=x onerror=alert(1)>',
        },
        items: [
          {
            brandName: "<b>Malicious Brand</b>",
            productNameEn: '<iframe src="evil.com"></iframe>',
            quantity: 1,
            totalPrice: 500,
          },
        ],
      };

      await EmailService.sendOrderConfirmation(maliciousOrder);
      const html = sendSpy.mock.calls[0][0].html;

      expect(html).not.toContain('<script>alert("Hacked")</script>');
      expect(html).toContain("&lt;script&gt;alert(&quot;Hacked&quot;)&lt;/script&gt;");
      expect(html).not.toContain("<img src=x");
      expect(html).not.toContain("<iframe");
    });
  });

  // -------------------------------------------------------------------------
  // 6. Admin Dispatch Alert
  // -------------------------------------------------------------------------
  describe("Admin Fulfillment Dispatch Alert", () => {
    it("dispatches internal notification with destination, flacon summary, and admin link", async () => {
      const sendSpy = vi.spyOn(EmailService, "sendEmail").mockResolvedValue({
        success: true,
        simulated: true,
      });

      await EmailService.sendAdminOrderAlert({
        orderNumber: "DXB-2026-1122",
        guestEmail: "client@muschio.luxury",
        totalAmount: 2400,
        currency: "AED",
        shippingAddress: {
          fullName: "Hamdan Al Nahyan",
          city: "Abu Dhabi",
          emirateState: "Abu Dhabi",
          countryCode: "AE",
          phone: "+971 52 987 6543",
        },
        items: [
          {
            brandName: "Clive Christian",
            productNameEn: "No. 1 Imperial",
            sizeLabel: "50ml Parfum",
            quantity: 1,
            totalPrice: 2400,
          },
        ],
      });

      expect(sendSpy).toHaveBeenCalledOnce();
      const args = sendSpy.mock.calls[0][0];
      expect(args.to).toBe("concierge@muschio.ae");
      expect(args.subject).toContain("DXB-2026-1122");
      expect(args.html).toContain("Hamdan Al Nahyan");
      expect(args.html).toContain("Clive Christian");
      expect(args.html).toContain("Abu Dhabi");
      expect(args.html).toContain("Open Fulfillment Console");
    });
  });

  // -------------------------------------------------------------------------
  // 7. Order Cancellation Alerts
  // -------------------------------------------------------------------------
  describe("Order Cancellation Notifications", () => {
    it("dispatches both client cancellation notice and urgent courier halt alert", async () => {
      const sendSpy = vi.spyOn(EmailService, "sendEmail").mockResolvedValue({
        success: true,
        simulated: true,
      });

      await EmailService.sendOrderCancellation(
        {
          orderNumber: "DXB-2026-0005",
          guestEmail: "client@muschio.ae",
          shippingAddress: { fullName: "Zayed Al Marri" },
        },
        "Client requested delivery reschedule"
      );

      expect(sendSpy).toHaveBeenCalledTimes(2);

      // 1. Client Notice
      const clientCall = sendSpy.mock.calls[0][0];
      expect(clientCall.to).toBe("client@muschio.ae");
      expect(clientCall.subject).toContain("DXB-2026-0005");
      expect(clientCall.html).toContain("Order Cancellation Notice");
      expect(clientCall.html).toContain("Zayed Al Marri");

      // 2. Admin Alert
      const adminCall = sendSpy.mock.calls[1][0];
      expect(adminCall.to).toBe("concierge@muschio.ae");
      expect(adminCall.subject).toContain("Immediate Halt Required");
      expect(adminCall.html).toContain("courier pickup is halted");
    });
  });

  // -------------------------------------------------------------------------
  // 8. Contact & VIP Concierge Enquiries
  // -------------------------------------------------------------------------
  describe("Concierge & Consultation Enquiries", () => {
    it("acknowledges receipt to client with reference number and notifies VIP team", async () => {
      const sendSpy = vi.spyOn(EmailService, "sendEmail").mockResolvedValue({
        success: true,
        simulated: true,
      });

      // 1. Client Acknowledgement
      await EmailService.sendEnquiryAcknowledgement({
        enquiryId: "ENQ-2026-8899",
        name: "Fatima Al Shamsi",
        email: "fatima@alshamsi.ae",
        subject: "Private Scent Consultation for Royal Wedding",
      });

      expect(sendSpy).toHaveBeenCalledOnce();
      const ackArgs = sendSpy.mock.calls[0][0];
      expect(ackArgs.to).toBe("fatima@alshamsi.ae");
      expect(ackArgs.subject).toContain("We received your message");
      expect(ackArgs.html).toContain("ENQ-2026-8899");
      expect(ackArgs.html).toContain("Fatima Al Shamsi");

      // 2. VIP Team Notification
      await EmailService.sendEnquiryNotification({
        name: "Fatima Al Shamsi",
        email: "fatima@alshamsi.ae",
        phone: "+971 50 555 1234",
        subject: "Private Scent Consultation for Royal Wedding",
        fragranceInterest: "Roja Parfums & Vintage Ouds",
        message: "Looking for 50 bespoke 30ml wedding attars.",
      });

      expect(sendSpy).toHaveBeenCalledTimes(2);
      const alertArgs = sendSpy.mock.calls[1][0];
      expect(alertArgs.to).toBe("concierge@muschio.ae");
      expect(alertArgs.subject).toContain("VIP ENQUIRY");
      expect(alertArgs.html).toContain("Roja Parfums &amp; Vintage Ouds");
    });
  });

  // -------------------------------------------------------------------------
  // 9. Returns & Reverse Logistics Email Workflow
  // -------------------------------------------------------------------------
  describe("7-Day Guarantee Return & Reverse Logistics Notifications", () => {
    it("confirms return request generation with RMA number and wax seal policy", async () => {
      const sendSpy = vi.spyOn(EmailService, "sendEmail").mockResolvedValue({
        success: true,
        simulated: true,
      });

      const returnReq = {
        returnNumber: "RET-2026-0042",
        requestedAction: "STORE_CREDIT",
        orderId: "ord_123",
        customer: { email: "collector@dubai.ae", firstName: "Mansour", lastName: "Al Dhaheri" },
        items: [
          {
            quantity: 1,
            orderItem: {
              productNameEn: "Amouage Interlude 53",
              sizeLabel: "100ml Extrait",
            },
          },
        ],
      };

      const result = await EmailService.sendReturnRequestConfirmation(returnReq, {
        orderNumber: "DXB-2026-5544",
      });

      expect(result.success).toBe(true);
      expect(sendSpy).toHaveBeenCalledOnce();

      const args = sendSpy.mock.calls[0][0];
      expect(args.to).toBe("collector@dubai.ae");
      expect(args.subject).toContain("RET-2026-0042");
      expect(args.html).toContain("RET-2026-0042");
      expect(args.html).toContain("DXB-2026-5544");
      expect(args.html).toContain("Amouage Interlude 53");
      expect(args.html).toContain("Luxury Store Credit (+5% VIP Bonus)");
      expect(args.html).toContain("original wax seal unopened");
    });

    it("notifies customer on status progression through collection and inspection", async () => {
      const sendSpy = vi.spyOn(EmailService, "sendEmail").mockResolvedValue({
        success: true,
        simulated: true,
      });

      await EmailService.sendReturnStatusUpdate(
        {
          returnNumber: "RET-2026-0042",
          customer: { email: "collector@dubai.ae" },
        },
        "COLLECTION_SCHEDULED",
        "Muschio White-Glove VIP Courier",
        "TRK-REV-998811"
      );

      expect(sendSpy).toHaveBeenCalledOnce();
      const args = sendSpy.mock.calls[0][0];
      expect(args.to).toBe("collector@dubai.ae");
      expect(args.subject).toContain("Collection Scheduled");
      expect(args.html).toContain("Muschio White-Glove VIP Courier");
      expect(args.html).toContain("TRK-REV-998811");
    });

    it("dispatches luxury Store Credit Voucher code with 12-month validity and zero min spend", async () => {
      const sendSpy = vi.spyOn(EmailService, "sendEmail").mockResolvedValue({
        success: true,
        simulated: true,
      });

      await EmailService.sendRefundConfirmation(
        {
          returnNumber: "RET-2026-0042",
          customer: { email: "collector@dubai.ae" },
          order: { currency: "AED" },
        },
        {
          action: "STORE_CREDIT",
          voucherCode: "CREDIT-VCH-882190",
          refundAmount: 1450.0,
        }
      );

      expect(sendSpy).toHaveBeenCalledOnce();
      const args = sendSpy.mock.calls[0][0];
      expect(args.to).toBe("collector@dubai.ae");
      expect(args.subject).toContain("Store Credit Voucher: 1450.00 AED");
      expect(args.html).toContain("CREDIT-VCH-882190");
      expect(args.html).toContain("1450.00 AED");
      expect(args.html).toContain("Valid for 12 months");
      expect(args.html).toContain("Zero minimum spend");
    });

    it("dispatches original payment refund notice with bank clearance window", async () => {
      const sendSpy = vi.spyOn(EmailService, "sendEmail").mockResolvedValue({
        success: true,
        simulated: true,
      });

      await EmailService.sendRefundConfirmation(
        {
          returnNumber: "RET-2026-0077",
          order: { guestEmail: "guest@dubai.ae", currency: "AED" },
        },
        {
          action: "REFUND",
          refundAmount: 950.0,
        }
      );

      expect(sendSpy).toHaveBeenCalledOnce();
      const args = sendSpy.mock.calls[0][0];
      expect(args.to).toBe("guest@dubai.ae");
      expect(args.subject).toContain("Refund Processed: 950.00 AED");
      expect(args.html).toContain("950.00 AED");
      expect(args.html).toContain("3 to 5 business days");
    });
  });
});
