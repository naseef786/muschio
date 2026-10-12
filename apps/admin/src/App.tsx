import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Warehouse,
  RotateCcw,
  Star,
  Globe,
  FileText,
} from "lucide-react";

type AdminTab =
  | "dashboard"
  | "products"
  | "notes"
  | "inventory"
  | "purchasing"
  | "returns"
  | "reviews"
  | "markets"
  | "orders"
  | "audit";

export function App() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  const [products] = useState([
    {
      id: "p1",
      sku: "AMO-INT53-100",
      name: "Interlude 53 Man Extrait de Parfum",
      brand: "Amouage",
      price: "1,850 AED",
      stock: 28,
      testerStock: 5,
      reserved: 2,
      warehouse: "DXB-MAIN",
      status: "PUBLISHED",
    },
    {
      id: "p2",
      sku: "MFK-BR540E-70",
      name: "Baccarat Rouge 540 Extrait",
      brand: "Maison Francis Kurkdjian",
      price: "1,650 AED",
      stock: 34,
      testerStock: 4,
      reserved: 1,
      warehouse: "DXB-MAIN",
      status: "PUBLISHED",
    },
    {
      id: "p3",
      sku: "ROJA-ELY-100",
      name: "Elysium Pour Homme Parfum",
      brand: "Roja Parfums",
      price: "1,950 AED",
      stock: 25,
      testerStock: 2,
      reserved: 0,
      warehouse: "RUH-HUB",
      status: "PUBLISHED",
    },
  ]);

  const [notes] = useState([
    { id: "n1", nameEn: "Royal Taif Rose", nameAr: "ورد الطائف الملكي", slug: "taif-rose", status: "PUBLISHED", perfumesCount: 4 },
    { id: "n2", nameEn: "Silver Frankincense", nameAr: "اللبان الحوجري الفضي", slug: "silver-frankincense", status: "PUBLISHED", perfumesCount: 3 },
    { id: "n3", nameEn: "Cambodian Agarwood (Oud)", nameAr: "دهن عود كمبودي", slug: "cambodian-oud", status: "PUBLISHED", perfumesCount: 5 },
    { id: "n4", nameEn: "Florentine Iris", nameAr: "سوسن فلورنسا", slug: "florentine-iris", status: "PUBLISHED", perfumesCount: 3 },
    { id: "n5", nameEn: "Golden Ambergris", nameAr: "العنبر الأشهب", slug: "golden-ambergris", status: "PUBLISHED", perfumesCount: 4 },
  ]);

  const [orders, setOrders] = useState([
    {
      id: "ord-1",
      number: "MSC-2026-981245",
      customer: "H.E. Sultan Al-Nuaimi",
      amount: "1,850 AED",
      method: "TABBY (4x)",
      status: "PAID",
      market: "AE",
      date: "Today, 14:32",
    },
    {
      id: "ord-2",
      number: "MSC-2026-981244",
      customer: "Fatima Al-Zahra",
      amount: "3,500 AED",
      method: "APPLE_PAY",
      status: "FULFILLING",
      market: "AE",
      date: "Today, 12:15",
    },
    {
      id: "ord-3",
      number: "MSC-2026-981240",
      customer: "Rashid Mansoor",
      amount: "2,200 SAR",
      method: "TAMARA (4x)",
      status: "SHIPPED",
      market: "SA",
      date: "Yesterday",
    },
  ]);

  const [returns, setReturns] = useState([
    {
      id: "ret-1",
      number: "RET-2026-001",
      customer: "Ahmad Al-Ghamdi",
      item: "AMO-INT53-100 (Interlude 53)",
      reason: "Ordered Extrait by mistake, wanted EDP",
      condition: "PRISTINE_SEALED",
      disposition: "RESTOCK_SELLABLE",
      status: "INSPECTING",
    },
    {
      id: "ret-2",
      number: "RET-2026-002",
      customer: "Leila H.",
      item: "MFK-BR540E-70 (Baccarat Rouge 540)",
      reason: "Sprayed once on wrist",
      condition: "OPENED_SPRAYED",
      disposition: "ALLOCATE_TESTER",
      status: "INSPECTING",
    },
  ]);

  const [reviews, setReviews] = useState([
    {
      id: "rev-1",
      product: "Interlude 53 Man Extrait",
      customer: "Ahmad Al Maktoum",
      rating: 5,
      longevity: 5,
      sillage: 5,
      title: "The True Definition of Omani Royalty",
      verified: true,
      status: "APPROVED",
    },
    {
      id: "rev-2",
      product: "Baccarat Rouge 540 Extrait",
      customer: "Nasser Al-Qasimi",
      rating: 5,
      longevity: 5,
      sillage: 4,
      title: "Addictive and crystalline sillage",
      verified: true,
      status: "PENDING",
    },
  ]);

  const updateOrderStatus = (orderId: string, nextStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
  };

  const handleInspectReturn = (returnId: string, disposition: string) => {
    setReturns((prev) =>
      prev.map((r) =>
        r.id === returnId ? { ...r, disposition, status: "COMPLETED" } : r
      )
    );
  };

  const handleReviewAction = (reviewId: string, status: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-200 flex">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 border-e border-slate-800 bg-[#0E1420] flex flex-col justify-between p-4">
        <div className="space-y-6">
          <div className="px-2 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-none bg-accent flex items-center justify-center font-serif text-white font-bold text-lg">
              M
            </div>
            <div>
              <span className="font-serif tracking-widest text-lg text-white font-medium block">
                MUSCHIO
              </span>
              <span className="text-[10px] text-accent tracking-widest uppercase font-semibold">
                Haute Operations
              </span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-sans">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
                activeTab === "dashboard" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Executive Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
                activeTab === "products" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <Package size={16} />
              <span>Catalog & Variants</span>
            </button>

            <button
              onClick={() => setActiveTab("notes")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
                activeTab === "notes" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers size={16} />
              <span>Notes & Accords Graph</span>
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
                activeTab === "inventory" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <Warehouse size={16} />
              <span>Warehouses & Stock Ledger</span>
            </button>

            <button
              onClick={() => setActiveTab("purchasing")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
                activeTab === "purchasing" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText size={16} />
              <span>Suppliers & POs</span>
            </button>

            <button
              onClick={() => setActiveTab("returns")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
                activeTab === "returns" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <RotateCcw size={16} />
              <span>Returns & Inspection</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
                activeTab === "orders" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <ShoppingBag size={16} />
              <span>Orders & Multi-Shipments</span>
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
                activeTab === "reviews" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <Star size={16} />
              <span>Reviews Moderation</span>
            </button>

            <button
              onClick={() => setActiveTab("markets")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
                activeTab === "markets" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe size={16} />
              <span>Markets & GCC VAT</span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
                activeTab === "audit" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck size={16} />
              <span>Security & Audit Log</span>
            </button>
          </nav>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 text-[11px] space-y-1">
          <div className="font-semibold text-slate-200">Director of Operations</div>
          <div className="text-slate-400">superadmin@muschio.luxury</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Vault Online • PostgreSQL Connected</span>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* HEADER */}
        <header className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="font-serif text-2xl font-light text-white capitalize">
              {activeTab.replace("-", " ")}
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Muschio Luxury Enterprise Portal • Multi-Warehouse & 19-Point Domain Compliant
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              UAE VAT: 5.0% • KSA VAT: 15.0%
            </div>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-accent text-white text-xs font-sans hover:bg-accent-hover transition-colors flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>Live Storefront ↗</span>
            </a>
          </div>
        </header>

        {/* 1. EXECUTIVE DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 bg-[#111622] border border-slate-800 space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Total Net Revenue (MTD)</span>
                <div className="font-serif text-3xl text-white font-light">384,250 AED</div>
                <div className="text-emerald-400 text-xs flex items-center gap-1">
                  <TrendingUp size={12} />
                  <span>+28.4% vs last month</span>
                </div>
              </div>

              <div className="p-6 bg-[#111622] border border-slate-800 space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Active 15-Min Holds</span>
                <div className="font-serif text-3xl text-amber-400 font-light">3 Carts</div>
                <div className="text-slate-400 text-xs font-mono">Auto-reconciling in 4m 12s</div>
              </div>

              <div className="p-6 bg-[#111622] border border-slate-800 space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Physical Stock Valuation</span>
                <div className="font-serif text-3xl text-white font-light">1,240,000 AED</div>
                <div className="text-slate-400 text-xs">Across Dubai & Riyadh Vaults</div>
              </div>

              <div className="p-6 bg-[#111622] border border-slate-800 space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Returns in Inspection</span>
                <div className="font-serif text-3xl text-purple-400 font-light">2 Units</div>
                <div className="text-slate-400 text-xs">Quarantine Isolation Active</div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PRODUCTS & CATALOG */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="border border-slate-800 bg-[#111622] overflow-hidden">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-start">SKU / Product</th>
                    <th className="p-4 text-start">House / Brand</th>
                    <th className="p-4 text-start">Base Price</th>
                    <th className="p-4 text-start">Warehouse Stock</th>
                    <th className="p-4 text-start">Tester Units</th>
                    <th className="p-4 text-start">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30">
                      <td className="p-4">
                        <span className="font-semibold text-white block">{p.name}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{p.sku}</span>
                      </td>
                      <td className="p-4 text-slate-300">{p.brand}</td>
                      <td className="p-4 font-mono font-medium text-slate-100">{p.price}</td>
                      <td className="p-4 font-mono text-emerald-400">{p.stock} sealed ({p.warehouse})</td>
                      <td className="p-4 font-mono text-purple-400">{p.testerStock} testers</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. DEDICATED NOTES & ACCORDS GRAPH */}
        {activeTab === "notes" && (
          <div className="space-y-6">
            <div className="border border-slate-800 bg-[#111622] overflow-hidden">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-start">Note (EN / AR)</th>
                    <th className="p-4 text-start">Canonical Slug</th>
                    <th className="p-4 text-start">Linked Published Perfumes</th>
                    <th className="p-4 text-start">Status</th>
                    <th className="p-4 text-start">Landing Page Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {notes.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-800/30">
                      <td className="p-4">
                        <span className="font-semibold text-white block">{n.nameEn}</span>
                        <span className="text-slate-400 text-xs">{n.nameAr}</span>
                      </td>
                      <td className="p-4 font-mono text-slate-400">{n.slug}</td>
                      <td className="p-4 font-mono text-slate-200">{n.perfumesCount} products joined</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                          {n.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <a
                          href={`http://localhost:3000/notes/${n.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:underline font-mono text-xs"
                        >
                          /notes/{n.slug} ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. WAREHOUSES & STOCK LEDGER */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#111622] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg text-white">DXB-MAIN (Dubai Central Hub)</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">DEFAULT VAULT</span>
                </div>
                <p className="text-xs text-slate-400">Fashion Avenue Logistics Center, Dubai Mall • Climate: 18°C Controlled</p>
                <div className="pt-2 text-xs font-mono text-slate-300">Total Sealed Bottles: 62 units • Sample Vials: 120 units</div>
              </div>

              <div className="p-4 bg-[#111622] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg text-white">RUH-HUB (Riyadh Facility)</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-bold">EXPRESS NODE</span>
                </div>
                <p className="text-xs text-slate-400">Olaya Logistics Center, Riyadh • Same-Day KSA Allocation</p>
                <div className="pt-2 text-xs font-mono text-slate-300">Total Sealed Bottles: 25 units • Testers: 2 units</div>
              </div>
            </div>

            <div className="border border-slate-800 bg-[#111622] p-6 space-y-4">
              <h3 className="font-serif text-xl font-light text-white">Auditable Physical Stock Movements (StockLedger)</h3>
              <div className="divide-y divide-slate-800 text-xs font-mono">
                {[
                  { type: "GOODS_RECEIPT", qty: "+30", sku: "AMO-INT53-100", ref: "GRN-2026-001", time: "Today 10:15", warehouse: "DXB-MAIN" },
                  { type: "TESTER_ALLOCATION", qty: "-2 (Converted)", sku: "AMO-INT53-100", ref: "INT-TEST-01", time: "Today 11:30", warehouse: "DXB-MAIN" },
                  { type: "ORDER_RESERVATION", qty: "-1", sku: "AMO-INT53-100", ref: "ORD-MSC-2026-981245", time: "Today 14:32", warehouse: "DXB-MAIN" },
                ].map((l, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div className="space-x-3">
                      <span className="text-accent font-bold">{l.type}</span>
                      <span className="text-slate-300">{l.sku}</span>
                      <span className="text-slate-500">[{l.ref}]</span>
                    </div>
                    <div className="space-x-4 text-slate-400">
                      <span className="font-bold text-emerald-400">{l.qty}</span>
                      <span>{l.warehouse}</span>
                      <span>{l.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. SUPPLIERS & PURCHASING */}
        {activeTab === "purchasing" && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-900 border border-slate-800 text-xs font-sans space-y-1">
              <span className="text-gold font-semibold uppercase tracking-wider">Direct House Purchasing & Provenance</span>
              <p className="text-slate-400">
                Manage direct manufacturer allocations (Amouage Oman, MFK Paris, Roja Dove). Every goods receipt generates Inventory Lots with batch codes, unit costs, and receiving stamps.
              </p>
            </div>

            <div className="border border-slate-800 bg-[#111622] overflow-hidden">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-start">Supplier Code</th>
                    <th className="p-4 text-start">Manufacturer Name</th>
                    <th className="p-4 text-start">Origin Country</th>
                    <th className="p-4 text-start">Payment Terms</th>
                    <th className="p-4 text-start">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-4 font-mono text-white">SUP-AMO-01</td>
                    <td className="p-4 font-semibold text-slate-100">Amouage Royal Attars & Parfums LLC</td>
                    <td className="p-4 text-slate-300">Sultanate of Oman</td>
                    <td className="p-4 font-mono text-slate-400">Net 30</td>
                    <td className="p-4 text-emerald-400 font-bold text-[10px]">AUTHORIZED DIRECT</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-4 font-mono text-white">SUP-MFK-02</td>
                    <td className="p-4 font-semibold text-slate-100">Maison Francis Kurkdjian Paris</td>
                    <td className="p-4 text-slate-300">France</td>
                    <td className="p-4 font-mono text-slate-400">Net 45</td>
                    <td className="p-4 text-emerald-400 font-bold text-[10px]">AUTHORIZED DIRECT</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. RETURNS & INSPECTION STATION */}
        {activeTab === "returns" && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-900 border border-slate-800 text-xs font-sans space-y-1">
              <span className="text-accent font-semibold uppercase tracking-wider">Independent Return & Quarantine Protocol</span>
              <p className="text-slate-400">
                Returned fragrance bottles never return to sellable stock automatically. The inspection station evaluates whether pristine sealed packaging allows restock, opened bottles become tester assets, or damaged/suspicious lots are quarantined.
              </p>
            </div>

            <div className="border border-slate-800 bg-[#111622] overflow-hidden">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-start">Return ID</th>
                    <th className="p-4 text-start">Customer</th>
                    <th className="p-4 text-start">Product Item</th>
                    <th className="p-4 text-start">Customer Reason</th>
                    <th className="p-4 text-start">Physical Condition</th>
                    <th className="p-4 text-start">Disposition Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {returns.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30">
                      <td className="p-4 font-mono font-semibold text-white">{r.number}</td>
                      <td className="p-4 text-slate-300">{r.customer}</td>
                      <td className="p-4 font-mono text-slate-200">{r.item}</td>
                      <td className="p-4 text-slate-400">{r.reason}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                          {r.condition}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2">
                        {r.status === "INSPECTING" ? (
                          <>
                            <button
                              onClick={() => handleInspectReturn(r.id, "RESTOCK_SELLABLE")}
                              className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] uppercase font-bold"
                            >
                              Restock Sealed
                            </button>
                            <button
                              onClick={() => handleInspectReturn(r.id, "ALLOCATE_TESTER")}
                              className="px-2 py-1 bg-purple-700 hover:bg-purple-600 text-white text-[10px] uppercase font-bold"
                            >
                              Allocate Tester
                            </button>
                          </>
                        ) : (
                          <span className="text-emerald-400 font-mono text-[11px]">Disposition: {r.disposition} ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. REVIEWS MODERATION */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="border border-slate-800 bg-[#111622] overflow-hidden">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-start">Fragrance</th>
                    <th className="p-4 text-start">Connoisseur</th>
                    <th className="p-4 text-start">Rating / Performance</th>
                    <th className="p-4 text-start">Review Title</th>
                    <th className="p-4 text-start">Status</th>
                    <th className="p-4 text-start">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {reviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-slate-800/30">
                      <td className="p-4 font-semibold text-white">{rev.product}</td>
                      <td className="p-4 text-slate-300">
                        {rev.customer}
                        {rev.verified && <span className="text-emerald-400 ms-1 text-[10px]">(Verified)</span>}
                      </td>
                      <td className="p-4 font-mono text-amber-400">
                        {rev.rating}★ (Longevity: {rev.longevity}/5, Sillage: {rev.sillage}/5)
                      </td>
                      <td className="p-4 text-slate-200">&quot;{rev.title}&quot;</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold ${
                          rev.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {rev.status}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2">
                        {rev.status === "PENDING" && (
                          <button
                            onClick={() => handleReviewAction(rev.id, "APPROVED")}
                            className="px-2 py-1 bg-emerald-700 text-white text-[10px] font-bold"
                          >
                            Approve
                          </button>
                        )}
                        {rev.status === "APPROVED" && (
                          <span className="text-slate-500 text-[11px]">Published on PDP</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. MARKETS CONFIG */}
        {activeTab === "markets" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#111622] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-serif text-xl text-white">United Arab Emirates (AE)</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">ACTIVE MARKET</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div>Base Currency: AED</div>
                <div>VAT Rate: 5.0% (Server-Calculated)</div>
                <div>Free Shipping Threshold: 500 AED</div>
                <div>Supported Gateways: Tabby, Tamara, Card, Apple Pay, Google Pay</div>
              </div>
            </div>

            <div className="p-6 bg-[#111622] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-serif text-xl text-white">Kingdom of Saudi Arabia (SA)</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">ACTIVE MARKET</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div>Base Currency: SAR</div>
                <div>VAT Rate: 15.0% (Server-Calculated)</div>
                <div>Free Shipping Threshold: 600 SAR</div>
                <div>Supported Gateways: Tabby, Tamara, Card, Apple Pay, Google Pay</div>
              </div>
            </div>
          </div>
        )}

        {/* 9. ORDERS & SHIPMENTS */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="border border-slate-800 bg-[#111622] overflow-hidden">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-start">Order ID</th>
                    <th className="p-4 text-start">Customer</th>
                    <th className="p-4 text-start">Market</th>
                    <th className="p-4 text-start">Amount</th>
                    <th className="p-4 text-start">Payment Provider</th>
                    <th className="p-4 text-start">Order State</th>
                    <th className="p-4 text-start">Transition State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-800/30">
                      <td className="p-4 font-mono font-semibold text-white">{o.number}</td>
                      <td className="p-4 text-slate-300">{o.customer}</td>
                      <td className="p-4 font-mono text-slate-400">{o.market}</td>
                      <td className="p-4 font-mono text-slate-200">{o.amount}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[10px] font-bold">
                          {o.method}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-accent/20 text-accent font-bold text-[10px]">
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2">
                        {o.status === "PAID" && (
                          <button
                            onClick={() => updateOrderStatus(o.id, "FULFILLING")}
                            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] uppercase font-bold"
                          >
                            Mark Fulfilling
                          </button>
                        )}
                        {o.status === "FULFILLING" && (
                          <button
                            onClick={() => updateOrderStatus(o.id, "SHIPPED")}
                            className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] uppercase font-bold"
                          >
                            Mark Shipped
                          </button>
                        )}
                        {o.status === "SHIPPED" && (
                          <span className="text-emerald-400 text-[11px]">In Transit via Courier</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 10. SECURITY & AUDIT */}
        {activeTab === "audit" && (
          <div className="border border-slate-800 bg-[#111622] p-6 space-y-4">
            <h3 className="font-serif text-xl font-light text-white">Immutable Administrative Audit Log</h3>
            <div className="divide-y divide-slate-800 text-xs font-mono">
              {[
                { action: "INVENTORY_RESERVATION_CREATED", res: "ORDER #MSC-2026-981245", user: "system (checkout)", time: "14:32:01" },
                { action: "WEBHOOK_PAYMENT_CAPTURED", res: "TABBY #tabby_sess_9812", user: "webhook-service", time: "14:32:45" },
                { action: "ORDER_STATUS_TRANSITION_PAID", res: "ORDER #MSC-2026-981245", user: "system", time: "14:32:46" },
                { action: "STOCK_LEDGER_DISPATCH_COMMIT", res: "SKU AMO-INT53-100 (-1)", user: "system", time: "14:32:46" },
              ].map((log, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-slate-300">
                  <div className="space-x-3">
                    <span className="text-accent font-bold">{log.action}</span>
                    <span className="text-slate-400">[{log.res}]</span>
                  </div>
                  <div className="space-x-4 text-slate-500">
                    <span>{log.user}</span>
                    <span>{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
