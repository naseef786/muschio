import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Search, Users, UserRound } from "lucide-react";

type CustomerManagerProps = {
  authToken: string;
  onOpenOrder: (orderNumber: string) => void;
};

type PageResult<T> = {
  items: T[];
  pagination: { page: number; limit: number; total: number; pageCount: number };
};

type CustomerRow = {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  name: string;
  accountType: string;
  isVip: boolean;
  loyaltyPoints: number;
  createdAt: string;
  capturedOrderCount: number;
  capturedAmountAED: string;
  lastPaidOrder: { orderNumber: string; createdAt: string } | null;
};

type GuestRow = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  name: string;
  email: string | null;
  phone: string;
  countryCode: string;
  capturedAmountAED: string;
  isPaymentCaptured: boolean;
};

type CustomerProfile = CustomerRow & {
  updatedAt: string;
  capturedOrderCount: number;
  capturedAmountAED: string;
  fragranceProfile: null | {
    preferredFamilies: string[];
    favoriteNotes: string[];
    dislikedNotes: string[];
    preferredSillage: string | null;
    preferredLongevity: string | null;
    signatureScentSlug: string | null;
    updatedAt: string;
  };
  addresses: Array<{
    id: string;
    fullName: string;
    phone: string;
    streetAddress: string;
    apartment: string | null;
    city: string;
    emirateState: string | null;
    postalCode: string | null;
    countryCode: string;
    isDefault: boolean;
  }>;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    currency: string;
    createdAt: string;
    capturedAmountAED: string;
    isPaymentCaptured: boolean;
    returns: Array<{ id: string; returnNumber: string; status: string; createdAt: string }>;
  }>;
  loyaltyTransactions: Array<{
    id: string;
    type: string;
    points: number;
    balanceAfter: number;
    reason: string;
    createdAt: string;
    orderId: string | null;
  }>;
  _count: { orders: number; returnRequests: number };
};

function getErrorMessage(body: any) {
  return body?.error?.message || "We could not load this information. Please try again.";
}

async function fetchCustomerData<T>(url: string, authToken: string, signal?: AbortSignal): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${authToken}` }, signal });
    const rawBody = await response.text();
    if (!rawBody.trim()) {
      if (attempt === 0 && !signal?.aborted) continue;
      throw new Error("The customer service returned an empty response. Please try again.");
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      throw new Error("The customer service returned an invalid response. Please try again.");
    }
    if (!response.ok || !body?.success) throw new Error(getErrorMessage(body));
    return body.data as T;
  }
  throw new Error("We could not load this information. Please try again.");
}

function dateLabel(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function amountLabel(amount: string | null | undefined) {
  if (amount == null || !Number.isFinite(Number(amount))) return "Unavailable";
  return `AED ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 sm:p-5">
      <h2 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">{title}</h2>
      {children}
    </section>
  );
}

export function CustomerManager({ authToken, onOpenOrder }: CustomerManagerProps) {
  const [mode, setMode] = useState<"customers" | "guests">("customers");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PageResult<CustomerRow> | PageResult<GuestRow> | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadDirectory = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    const endpoint = mode === "customers" ? "admin/customers" : "admin/customer-guests";
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    try {
      setResult(await fetchCustomerData<PageResult<CustomerRow> | PageResult<GuestRow>>(`/api/v1/${endpoint}?${params}`, authToken, signal));
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "We could not load customers. Please retry.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [authToken, mode, page, search]);

  useEffect(() => {
    const controller = new AbortController();
    void loadDirectory(controller.signal);
    return () => controller.abort();
  }, [loadDirectory]);

  const openProfile = useCallback(async (id: string) => {
    setLoading(true);
    setError("");
    try {
      setProfile(await fetchCustomerData<CustomerProfile>(`/api/v1/admin/customers/${encodeURIComponent(id)}`, authToken));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not open this customer.");
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  const pagination = result?.pagination;
  const customers = mode === "customers" ? (result as PageResult<CustomerRow> | null)?.items || [] : [];
  const guests = mode === "guests" ? (result as PageResult<GuestRow> | null)?.items || [] : [];
  const profileName = profile?.name || "Customer";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 pb-10">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">Customer care</p>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white">Customers</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Find a customer, review their purchases, and see their saved details.</p>
      </div>

      {profile ? (
        <div className="space-y-5">
          <button type="button" onClick={() => setProfile(null)} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-neutral-600 hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500 dark:text-neutral-300 dark:hover:bg-neutral-900">
            <ArrowLeft size={16} /> Back to customers
          </button>
          <header className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="break-words text-xl font-semibold text-neutral-950 dark:text-white">{profileName}</h2>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">{profile.accountType === "REGISTERED" ? "Registered account" : "Account setup not complete"}</span>
                  {profile.isVip && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">VIP</span>}
                </div>
                <p className="mt-2 break-all text-sm text-neutral-600 dark:text-neutral-300">{profile.email}</p>
                <p className="mt-1 text-sm text-neutral-500">{profile.phone || "No phone number saved"}</p>
              </div>
              <p className="text-xs text-neutral-500">Customer since {dateLabel(profile.createdAt)}</p>
            </div>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Captured orders", String(profile.capturedOrderCount)],
              ["Captured total (AED)", amountLabel(profile.capturedAmountAED)],
              ["Loyalty points", profile.loyaltyPoints.toLocaleString()],
              ["Returns", String(profile._count.returnRequests)],
            ].map(([label, value]) => <div key={label} className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"><p className="text-xs text-neutral-500">{label}</p><p className="mt-2 break-words text-lg font-semibold text-neutral-950 dark:text-white">{value}</p></div>)}
          </div>
          <p className="-mt-3 text-xs text-neutral-500">Captured payment totals include all linked orders, are gross, and do not subtract refunds. The order list shows the latest 20.</p>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card title="Orders and returns">
              {profile.orders.length ? <div className="divide-y divide-neutral-100 dark:divide-neutral-800">{profile.orders.map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div><button type="button" onClick={() => onOpenOrder(order.orderNumber)} className="min-h-10 font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-800 dark:text-white">{order.orderNumber}</button><p className="text-xs text-neutral-500">{dateLabel(order.createdAt)} · {order.status.replaceAll("_", " ")}</p>{order.returns.map((returnItem) => <p key={returnItem.id} className="mt-1 text-xs text-neutral-500">Return {returnItem.returnNumber}: {returnItem.status.replaceAll("_", " ")}</p>)}</div><div className="text-right"><p className="text-sm font-medium">{order.isPaymentCaptured ? amountLabel(order.capturedAmountAED) : "Not captured"}</p><p className="text-xs text-neutral-500">{order.isPaymentCaptured ? "Captured" : "Payment not confirmed"}</p></div></div>)}</div> : <p className="text-sm text-neutral-500">No orders are linked to this account.</p>}
              {profile._count.orders > profile.orders.length && <p className="mt-3 text-xs text-neutral-500">Showing the latest {profile.orders.length} of {profile._count.orders} orders.</p>}
            </Card>

            <Card title="Saved addresses">
              {profile.addresses.length ? <div className="space-y-3">{profile.addresses.map((address) => <div key={address.id} className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-900"><div className="flex flex-wrap justify-between gap-2"><span className="font-medium">{address.fullName}</span>{address.isDefault && <span className="text-xs text-neutral-500">Default</span>}</div><p className="mt-1 text-neutral-600 dark:text-neutral-300">{address.streetAddress}{address.apartment ? `, ${address.apartment}` : ""}, {address.city}{address.emirateState ? `, ${address.emirateState}` : ""}, {address.countryCode}</p><p className="mt-1 text-xs text-neutral-500">{address.phone}</p></div>)}</div> : <p className="text-sm text-neutral-500">No saved addresses.</p>}
            </Card>

            <Card title="Fragrance preferences">
              {profile.fragranceProfile ? <div className="space-y-3 text-sm">{[
                ["Preferred families", profile.fragranceProfile.preferredFamilies],
                ["Favorite notes", profile.fragranceProfile.favoriteNotes],
                ["Notes to avoid", profile.fragranceProfile.dislikedNotes],
              ].map(([label, values]) => <div key={label as string}><p className="text-xs text-neutral-500">{label as string}</p><p className="mt-1 text-neutral-800 dark:text-neutral-200">{(values as string[]).length ? (values as string[]).join(", ") : "Not set"}</p></div>)}<p><span className="text-xs text-neutral-500">Preferred lasting power</span><br />{profile.fragranceProfile.preferredLongevity || "Not set"}</p><p><span className="text-xs text-neutral-500">Preferred strength</span><br />{profile.fragranceProfile.preferredSillage || "Not set"}</p></div> : <p className="text-sm text-neutral-500">No fragrance preferences saved.</p>}
            </Card>

            <Card title="Loyalty history">
              <p className="mb-3 text-sm"><span className="text-neutral-500">Current points balance: </span><strong>{profile.loyaltyPoints.toLocaleString()}</strong></p>
              {profile.loyaltyTransactions.length ? <div className="divide-y divide-neutral-100 dark:divide-neutral-800">{profile.loyaltyTransactions.map((tx) => <div key={tx.id} className="flex justify-between gap-3 py-2.5 text-sm"><div><p>{tx.reason}</p><p className="text-xs text-neutral-500">{dateLabel(tx.createdAt)}</p></div><span className="shrink-0 font-medium">{tx.points > 0 ? "+" : ""}{tx.points}</span></div>)}</div> : <p className="text-sm text-neutral-500">No loyalty activity.</p>}
            </Card>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Customer type">
            {([ ["customers", "Customer accounts", Users], ["guests", "Guest orders", UserRound] ] as const).map(([value, label, Icon]) => <button key={value} type="button" role="tab" aria-selected={mode === value} onClick={() => { setMode(value); setPage(1); setResult(null); }} className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500 ${mode === value ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950" : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"}`}><Icon size={16} />{label}</button>)}
          </div>

          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(searchInput.trim()); }}>
            <label className="relative min-w-0 flex-1"><span className="sr-only">Search customer name, email, phone, or order number</span><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search name, email, phone, or order number" className="min-h-12 w-full rounded-lg border border-neutral-200 bg-white py-3 pl-10 pr-3 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:ring-neutral-800" /></label><button type="submit" className="min-h-12 rounded-lg bg-neutral-900 px-5 text-sm font-medium text-white hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500 dark:bg-white dark:text-neutral-950">Search</button>
          </form>

          {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"><p>{error}</p><button type="button" onClick={() => void loadDirectory()} className="min-h-10 rounded-md border border-current px-3">Try again</button></div>}

          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            {loading && !result ? <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-neutral-500"><Loader2 size={18} className="animate-spin" />Loading customers…</div> : error && !result ? null : mode === "customers" ? (
              customers.length ? <><div className="divide-y divide-neutral-100 dark:divide-neutral-800">{customers.map((customer) => <button key={customer.id} type="button" onClick={() => void openProfile(customer.id)} className="grid w-full gap-3 p-4 text-left hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-neutral-500 dark:hover:bg-neutral-900 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_auto_auto] sm:items-center sm:gap-5 sm:px-5"><span className="min-w-0"><span className="block break-words font-medium text-neutral-900 dark:text-white">{customer.name}</span><span className="mt-1 block break-all text-sm text-neutral-500">{customer.email}</span></span><span className="text-sm text-neutral-600 dark:text-neutral-300">{customer.phone || "No phone saved"}<span className="mt-1 block text-xs text-neutral-500">{customer.accountType === "REGISTERED" ? "Registered account" : "Account setup not complete"}{customer.emailVerified ? " · Email verified" : ""}</span></span><span className="text-sm text-neutral-700 dark:text-neutral-200">{customer.capturedOrderCount} captured {customer.capturedOrderCount === 1 ? "order" : "orders"}<span className="mt-1 block text-xs text-neutral-500">{amountLabel(customer.capturedAmountAED)}</span></span><span className="text-xs text-neutral-500">Last purchase<br />{dateLabel(customer.lastPaidOrder?.createdAt)}</span></button>)}</div></> : <div className="p-10 text-center"><Users className="mx-auto mb-3 text-neutral-400" size={24} /><p className="text-sm font-medium">No customer accounts found</p><p className="mt-1 text-sm text-neutral-500">Try another name, email, phone, or order number.</p></div>
            ) : guests.length ? <div className="divide-y divide-neutral-100 dark:divide-neutral-800">{guests.map((guest) => <div key={guest.id} className="grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-5 sm:px-5"><span className="min-w-0"><span className="block font-medium text-neutral-900 dark:text-white">{guest.name}</span><span className="mt-1 block break-all text-sm text-neutral-500">{guest.email || "No email saved"} · {guest.phone}</span></span><span className="text-sm text-neutral-700 dark:text-neutral-200">{guest.orderNumber}<span className="mt-1 block text-xs text-neutral-500">{guest.status.replaceAll("_", " ")} · {dateLabel(guest.createdAt)}</span></span><span className="text-sm">{guest.isPaymentCaptured ? amountLabel(guest.capturedAmountAED) : "Payment not confirmed"}</span></div>)}</div> : <div className="p-10 text-center"><UserRound className="mx-auto mb-3 text-neutral-400" size={24} /><p className="text-sm font-medium">No guest orders found</p><p className="mt-1 text-sm text-neutral-500">Guest purchases will appear here without creating customer accounts.</p></div>}
            {loading && result && <div className="flex items-center justify-center gap-2 border-t border-neutral-100 py-3 text-xs text-neutral-500 dark:border-neutral-800"><Loader2 size={14} className="animate-spin" />Updating results…</div>}
            {pagination && pagination.pageCount > 1 && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 p-3 dark:border-neutral-800"><p className="text-xs text-neutral-500">{pagination.total.toLocaleString()} results · Page {pagination.page} of {pagination.pageCount}</p><div className="flex gap-2"><button type="button" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-neutral-200 disabled:opacity-40 dark:border-neutral-800"><ChevronLeft size={18} /></button><button type="button" aria-label="Next page" disabled={page >= pagination.pageCount || loading} onClick={() => setPage((current) => current + 1)} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-neutral-200 disabled:opacity-40 dark:border-neutral-800"><ChevronRight size={18} /></button></div></div>}
          </div>
          <p className="text-xs text-neutral-500">Captured totals are gross payments in AED; refunds are not subtracted. Payment details are not shown.</p>
        </>
      )}
    </div>
  );
}
