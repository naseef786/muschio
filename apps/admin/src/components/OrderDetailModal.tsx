import React, { useState } from "react";
import {
  X,
  Printer,
  Copy,
  Check,
  Truck,
  CreditCard,
  Package,
  MessageSquare,
  Mail,
  ExternalLink,
  User,
  MapPin,
  AlertCircle,
  Phone,
} from "lucide-react";

export interface OrderDetailModalProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string, trackingNumber?: string, carrier?: string, reason?: string) => Promise<void>;
  onResendNotification: (orderId: string, channel: "whatsapp" | "email") => Promise<void>;
}

const ORDER_STEPS = [
  { key: "PENDING", label: "Placed", desc: "Order initiated" },
  { key: "PAID", label: "Paid", desc: "Payment captured" },
  { key: "FULFILLING", label: "Packaging", desc: "Sealed & insulated" },
  { key: "SHIPPED", label: "In Transit", desc: "Climate courier dispatch" },
  { key: "DELIVERED", label: "Delivered", desc: "Handover completed" },
];

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onResendNotification,
}) => {
  if (!isOpen || !order) return null;

  const [copiedId, setCopiedId] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(order.status || "PENDING");
  const [carrier, setCarrier] = useState<string>(
    order.fulfillments?.[0]?.shipments?.[0]?.carrier || "DHL_EXPRESS"
  );
  const [trackingNumber, setTrackingNumber] = useState<string>(
    order.fulfillments?.[0]?.shipments?.[0]?.trackingNumber || ""
  );
  const [adminNote, setAdminNote] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const orderNum = order.orderNumber || order.number || order.id;
  const clientName =
    order.shippingAddress?.fullName ||
    order.customerName ||
    order.customer?.name ||
    order.customer ||
    "Client";
  const clientEmail =
    order.shippingAddress?.email ||
    order.customerEmail ||
    order.customer?.email ||
    order.guestEmail ||
    "";
  const clientPhone =
    order.shippingAddress?.phone ||
    order.customerPhone ||
    order.customer?.phone ||
    "";
  const address = order.shippingAddress || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const payments = Array.isArray(order.payments) ? order.payments : [];
  const primaryPayment = payments[0] || null;
  const shipment = order.fulfillments?.[0]?.shipments?.[0] || null;

  const currency = order.currency || "AED";
  const totalAmount = Number(order.totalAmount || order.amount || 0);
  const subtotal = Number(order.subtotal || totalAmount);
  const shippingAmount = Number(order.shippingAmount || 0);
  const discountAmount = Number(order.discountAmount || 0);

  const market = (order.market || address.country || "AE").toUpperCase();
  const vatRate = market === "SA" ? 0.15 : market === "BH" ? 0.10 : market === "OM" ? 0.05 : 0.05;
  const vatRateLabel = market === "SA" ? "15.0% (KSA ZATCA)" : market === "BH" ? "10.0% (Bahrain NBR)" : market === "OM" ? "5.0% (Oman OTA)" : "5.0% (UAE FTA)";
  const taxableSubtotal = totalAmount > 0 ? totalAmount / (1 + vatRate) : 0;
  const vatAmount = totalAmount - taxableSubtotal;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNum);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setActionSuccess(null);
    try {
      await onUpdateStatus(order.id, selectedStatus, trackingNumber, carrier, adminNote);
      setActionSuccess("Order workflow successfully updated.");
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: any) {
      console.error("Failed to update status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentStepIdx = ORDER_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                {orderNum}
              </span>
              <button
                type="button"
                onClick={handleCopyOrderNumber}
                title="Copy Order Reference"
                className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              >
                {copiedId ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-none ${
                  order.status === "DELIVERED"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : order.status === "SHIPPED"
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                    : order.status === "FULFILLING"
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                    : order.status === "PAID"
                    ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30"
                    : order.status === "CANCELLED"
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                }`}
              >
                {order.status}
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                Market: <strong className="text-neutral-900 dark:text-white">{order.market || order.shippingAddress?.country || "AE"}</strong>
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">
              Acquisition placed on {order.createdAt ? new Date(order.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : order.date || "Today"}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              title="Print Order Packing Slip / Invoice"
              className="p-2 text-xs border border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-white text-neutral-700 dark:text-neutral-300 rounded transition-colors flex items-center gap-1.5"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print Slip</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 text-xs font-sans">
          {actionSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 rounded-none">
              <Check size={14} />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* 1. Lifecycle Progression Tracker */}
          {order.status !== "CANCELLED" ? (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800/80">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-3">
                Order Fulfillment Pipeline
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {ORDER_STEPS.map((step, idx) => {
                  const isDone = currentStepIdx >= idx;
                  const isCurrent = order.status === step.key;

                  return (
                    <div
                      key={step.key}
                      onClick={() => setSelectedStatus(step.key)}
                      className={`p-2.5 border rounded-none cursor-pointer transition-all ${
                        isCurrent
                          ? "border-black dark:border-white bg-black/5 dark:bg-white/10 font-medium"
                          : isDone
                          ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                          : "border-neutral-200 dark:border-neutral-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold">{step.label}</span>
                        {isDone ? (
                          <Check size={12} className="text-emerald-500" />
                        ) : (
                          <span className="text-[9px] text-neutral-400">#{idx + 1}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-500 line-clamp-1">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-3">
              <AlertCircle size={18} />
              <div>
                <p className="font-semibold text-xs">This order has been cancelled</p>
                <p className="text-[11px] opacity-80">Inventory reservations have been released back to stock.</p>
              </div>
            </div>
          )}

          {/* 2. Main Grid: Client Dossier & Shipment Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Client & Delivery Card */}
            <div className="p-4 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <User size={13} className="text-accent" />
                  Client & Shipping Details
                </span>
                {clientPhone && (
                  <a
                    href={`https://wa.me/${clientPhone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-medium text-[#128C7E] flex items-center gap-1 hover:underline"
                  >
                    <MessageSquare size={12} />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {clientName}
                </p>
                {clientEmail && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                    <Mail size={12} className="text-neutral-400" />
                    <a href={`mailto:${clientEmail}`} className="hover:underline">{clientEmail}</a>
                  </p>
                )}
                {clientPhone && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                    <Phone size={12} className="text-neutral-400" />
                    <a href={`tel:${clientPhone}`} className="hover:underline">{clientPhone}</a>
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 space-y-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400 flex items-center gap-1">
                  <MapPin size={11} /> Destination
                </span>
                <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
                  {address.addressLine1 || "Al Wasl Road, Villa 42"}, {address.city || "Dubai"}, {address.stateOrEmirate || "Dubai"}, {address.country || "AE"}
                </p>
              </div>
            </div>

            {/* Shipment & Courier Card */}
            <div className="p-4 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Truck size={13} className="text-accent" />
                  Courier & Climate Tracking
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                  White-Glove GCC
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                    Carrier Partner
                  </label>
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs px-2.5 py-1.5 rounded focus:outline-none font-sans"
                  >
                    <option value="DHL_EXPRESS">DHL Express (GCC Priority Air)</option>
                    <option value="ARAMEX">Aramex Climate Courier</option>
                    <option value="FEDEX">FedEx International Priority</option>
                    <option value="LOCAL_COURIER">Muschio VIP White-Glove Fleet (DXB/AUH)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. DXB-VIP-981245 or DHL 7819203"
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs px-2.5 py-1.5 rounded font-mono focus:outline-none"
                  />
                </div>
              </div>

              {shipment?.trackingUrl && (
                <a
                  href={shipment.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline pt-1"
                >
                  <ExternalLink size={12} />
                  <span>Open Live Carrier Tracking Sheet</span>
                </a>
              )}
            </div>
          </div>

          {/* 3. Line Items Table */}
          <div className="border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                <Package size={14} className="text-accent" />
                Purchased Olfactory Items ({items.length || 1})
              </span>
            </div>

            <table className="w-full text-start text-xs font-sans">
              <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 uppercase text-[10px] tracking-wider border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-3 text-start">Fragrance / Creation</th>
                  <th className="p-3 text-start">Volume / Flacon</th>
                  <th className="p-3 text-start">SKU</th>
                  <th className="p-3 text-end">Unit Price</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-end">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {items.length > 0 ? (
                  items.map((item: any, idx: number) => {
                    const itemUnitPrice = Number(item.unitPrice || item.price || (totalAmount / (items.length || 1)));
                    const itemQty = Number(item.quantity || 1);
                    const itemTotal = Number(item.totalPrice || (itemUnitPrice * itemQty));

                    return (
                      <tr key={item.id || idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50">
                        <td className="p-3">
                          <p className="font-semibold text-neutral-900 dark:text-white">
                            {item.productNameEn || item.nameEn || item.name || "Haute Parfumerie Flacon"}
                          </p>
                          {item.productNameAr && (
                            <p className="text-[11px] text-neutral-400 font-sans" dir="rtl">
                              {item.productNameAr}
                            </p>
                          )}
                        </td>
                        <td className="p-3 font-mono text-neutral-600 dark:text-neutral-400">
                          {item.sizeLabel || "100ml Flacon"}
                        </td>
                        <td className="p-3 font-mono text-neutral-500 text-[11px]">
                          {item.sku || "FRAG-VOL"}
                        </td>
                        <td className="p-3 text-end font-mono">
                          {itemUnitPrice.toLocaleString()} {currency}
                        </td>
                        <td className="p-3 text-center font-mono font-medium">
                          {itemQty}
                        </td>
                        <td className="p-3 text-end font-mono font-semibold text-neutral-900 dark:text-white">
                          {itemTotal.toLocaleString()} {currency}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {order.title || "Amouage Interlude 53 Man Extrait"}
                      </p>
                    </td>
                    <td className="p-3 font-mono text-neutral-600 dark:text-neutral-400">100ml Flacon</td>
                    <td className="p-3 font-mono text-neutral-500">AMO-INT53-100</td>
                    <td className="p-3 text-end font-mono">{totalAmount.toLocaleString()} {currency}</td>
                    <td className="p-3 text-center font-mono">1</td>
                    <td className="p-3 text-end font-mono font-semibold text-neutral-900 dark:text-white">
                      {totalAmount.toLocaleString()} {currency}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 4. Financial Summary & Payment Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Payment Method / Verification */}
            <div className="p-4 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/30 space-y-2.5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <CreditCard size={13} className="text-accent" />
                Payment Clearance & Verification
              </span>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Payment Gateway:</span>
                  <span className="font-mono font-semibold text-neutral-900 dark:text-white uppercase">
                    {order.method || primaryPayment?.provider || "STRIPE_CARD"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Payment Status:</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                    {primaryPayment?.status || (order.status === "PAID" || order.status === "SHIPPED" || order.status === "DELIVERED" ? "CAPTURED" : "PENDING")}
                  </span>
                </div>
                {primaryPayment?.gatewayReference && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Gateway Ref:</span>
                    <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                      {primaryPayment.gatewayReference}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="p-4 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/30 space-y-2">
              <div className="flex items-center justify-between text-neutral-500">
                <span>Gross Items Subtotal:</span>
                <span className="font-mono text-neutral-900 dark:text-white">
                  {subtotal.toLocaleString()} {currency}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-500">
                <span>Climate Courier Delivery:</span>
                <span className="font-mono text-neutral-900 dark:text-white">
                  {shippingAmount > 0 ? `${shippingAmount.toLocaleString()} ${currency}` : "Complimentary"}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span>Loyalty Credit Redeemed:</span>
                  <span className="font-mono">-{discountAmount.toLocaleString()} {currency}</span>
                </div>
              )}
              
              {/* VAT & Tax Invoice Breakdown */}
              <div className="pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                  <span>Taxable Base (Ex-VAT):</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300">
                    {taxableSubtotal.toFixed(2)} {currency}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                  <span>VAT Rate:</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300">{vatRateLabel}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                  <span>VAT Amount (Included):</span>
                  <span className="font-mono font-medium text-neutral-900 dark:text-white">
                    {vatAmount.toFixed(2)} {currency}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-sm font-semibold">
                <div>
                  <span className="text-neutral-900 dark:text-white block">Net Total Settled:</span>
                  <span className="text-[10px] text-neutral-400 font-normal">VAT Inclusive · TRN: 100492817200003</span>
                </div>
                <span className="font-mono text-base text-neutral-900 dark:text-white">
                  {totalAmount.toLocaleString()} {currency}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Update Status & Dispatch Form */}
          <form onSubmit={handleStatusSubmit} className="p-4 border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/70 space-y-3">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white block">
              Administrative Status Transition & Dispatch Controls
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                  Target Workflow Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-xs px-3 py-2 rounded focus:outline-none font-medium"
                >
                  <option value="PENDING">PENDING (Awaiting clearance)</option>
                  <option value="PAID">PAID (Payment settled)</option>
                  <option value="FULFILLING">FULFILLING (Packaging in cleanroom)</option>
                  <option value="SHIPPED">SHIPPED (Handed to GCC courier)</option>
                  <option value="DELIVERED">DELIVERED (Client received)</option>
                  <option value="CANCELLED">CANCELLED (Void & restock)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                  Internal Status Note (Logged to Timeline)
                </label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. Dispatched via priority climate flight"
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-xs px-3 py-2 rounded focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onResendNotification(order.id, "whatsapp")}
                  className="px-3 py-1.5 rounded bg-[#128C7E]/10 hover:bg-[#128C7E]/20 text-[#128C7E] border border-[#128C7E]/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare size={13} />
                  <span>Resend WhatsApp Alert</span>
                </button>
                <button
                  type="button"
                  onClick={() => onResendNotification(order.id, "email")}
                  className="px-3 py-1.5 rounded bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Mail size={13} />
                  <span>Resend Email Alert</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold text-xs tracking-wider uppercase transition-colors disabled:opacity-50"
              >
                {isUpdating ? "Saving Transition…" : "Apply Status Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
