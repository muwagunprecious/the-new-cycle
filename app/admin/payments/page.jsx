'use client'
import { useEffect, useState, useCallback } from "react"
import { getPendingCashouts, releasePayout, getAdminDashboardSummary } from "@/backend-actions/actions/admin"
import toast from "react-hot-toast"
import {
    Banknote as BanknoteIcon,
    Building2 as Building2Icon,
    CheckCircle as CheckCircleIcon,
    AlertCircle as AlertCircleIcon,
    Loader2 as Loader2Icon,
    RefreshCw as RefreshCwIcon,
    ChevronDown as ChevronDownIcon,
    Send as SendIcon,
    Copy as CopyIcon,
    Phone as PhoneIcon,
    Mail as MailIcon,
    Store as StoreIcon,
    Wallet as WalletIcon,
    CreditCard as CreditCardIcon,
    History as HistoryIcon,
    ArrowUpRight as ArrowUpRightIcon,
    XCircle as XCircleIcon,
    Shield as ShieldIcon,
    Clock as ClockIcon,
} from "lucide-react"

/* ── helpers ───────────────────────────────────────────────────── */
function Spinner({ size = 16, className = "" }) {
    return <Loader2Icon size={size} className={`animate-spin ${className}`} />
}

function CopyBtn({ text, label }) {
    const [copied, setCopied] = useState(false)
    const handle = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true); setTimeout(() => setCopied(false), 2000)
        })
    }
    return (
        <button
            onClick={handle}
            title={`Copy ${label || ''}`}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all text-[10px] font-bold"
        >
            {copied ? <CheckCircleIcon size={11} className="text-emerald-500" /> : <CopyIcon size={11} />}
            {copied ? "Copied" : (label || "Copy")}
        </button>
    )
}

function StatusBadge({ hasBankDetails }) {
    return hasBankDetails
        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[9px] font-black uppercase tracking-wider">
            <CheckCircleIcon size={9} /> Bank Verified
          </span>
        : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-[9px] font-black uppercase tracking-wider">
            <AlertCircleIcon size={9} /> No Bank Details
          </span>
}

/* ── main page ─────────────────────────────────────────────────── */
export default function AdminCashoutsPage() {
    const [cashouts, setCashouts] = useState([])
    const [totals, setTotals] = useState({ amount: 0, stores: 0, orders: 0 })
    const [platformBalance, setPlatformBalance] = useState(0)
    const [loading, setLoading] = useState(true)
    const [releasingId, setReleasingId] = useState(null)   // orderId being released
    const [expandedStore, setExpandedStore] = useState(null)
    const [filter, setFilter] = useState('all')             // 'all' | 'has-bank' | 'no-bank'
    const [search, setSearch] = useState('')
    const [history, setHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)
    const [showHistory, setShowHistory] = useState(false)

    const fetchAll = useCallback(async () => {
        setLoading(true)
        try {
            const [cashoutRes, dashRes] = await Promise.all([
                getPendingCashouts(),
                getAdminDashboardSummary()
            ])
            if (cashoutRes.success) {
                setCashouts(cashoutRes.data.cashouts || [])
                setTotals({
                    amount: cashoutRes.data.totalPendingAmount || 0,
                    stores: cashoutRes.data.totalStores || 0,
                    orders: cashoutRes.data.totalOrders || 0,
                })
            }
            if (dashRes.success) {
                setPlatformBalance(dashRes.data.adminBalance || 0)
            }
        } catch (e) {
            toast.error("Failed to load cashout data")
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchHistory = async () => {
        setHistoryLoading(true)
        try {
            const { getAdminPayoutHistory } = await import("@/backend-actions/actions/admin")
            const res = await getAdminPayoutHistory(1, 30)
            if (res.success) setHistory(res.data.orders || res.data.data || [])
        } catch (e) {
            toast.error("Failed to load history")
        } finally {
            setHistoryLoading(false)
        }
    }

    useEffect(() => { fetchAll() }, [fetchAll])
    useEffect(() => {
        if (showHistory && history.length === 0) fetchHistory()
    }, [showHistory])

    const handleRelease = async (orderId, storeId, payoutAmount, storeName) => {
        if (!confirm(`Release ₦${payoutAmount.toLocaleString()} payout to "${storeName}"?\n\nThis will credit their seller wallet immediately. This action cannot be undone.`)) return
        setReleasingId(orderId)
        try {
            const res = await releasePayout(orderId)
            if (res.success) {
                toast.success(`✅ ₦${payoutAmount.toLocaleString()} released to ${storeName}`)
                window.dispatchEvent(new Event('payout-released'))
                // Optimistically remove the order from UI
                setCashouts(prev => prev.map(store => {
                    if (store.storeId !== storeId) return store
                    const updatedOrders = store.orders.filter(o => o.id !== orderId)
                    return { ...store, orders: updatedOrders, totalPayout: store.totalPayout - payoutAmount, orderCount: store.orderCount - 1 }
                }).filter(s => s.orderCount > 0))
                setTotals(prev => ({ ...prev, amount: prev.amount - payoutAmount, orders: prev.orders - 1 }))
            } else {
                toast.error(res.error || "Release failed")
            }
        } catch (e) {
            toast.error(e?.message || "Unexpected error")
        } finally {
            setReleasingId(null)
        }
    }

    const handleReleaseAll = async (store) => {
        if (!confirm(`Release ALL ${store.orderCount} order(s) totalling ₦${store.totalPayout.toLocaleString()} to "${store.storeName}"?\n\nEach payout will be processed sequentially.`)) return
        for (const order of [...store.orders]) {
            await handleRelease(order.id, store.storeId, order.payoutAmount, store.storeName)
        }
    }

    /* Filtered + searched cashouts */
    const filtered = cashouts
        .filter(s => {
            if (filter === 'has-bank') return s.bankName && s.accountNumber
            if (filter === 'no-bank') return !s.bankName || !s.accountNumber
            return true
        })
        .filter(s => {
            if (!search.trim()) return true
            const q = search.toLowerCase()
            return (
                s.storeName.toLowerCase().includes(q) ||
                s.sellerName?.toLowerCase().includes(q) ||
                s.accountNumber?.includes(q) ||
                s.bankName?.toLowerCase().includes(q)
            )
        })

    return (
        <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">

            {/* ── Page Header ── */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Admin Finance</p>
                    <h1 className="text-3xl font-black text-slate-900">
                        Pending <span className="text-amber-500">Cashouts</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Review seller bank details and release verified payouts.
                    </p>
                </div>
                <button
                    onClick={fetchAll}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm"
                >
                    <RefreshCwIcon size={15} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#05DF72]/10 rounded-full blur-xl" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#05DF72] mb-1">Platform Balance</p>
                    <p className="text-2xl font-black">₦{platformBalance.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Admin wallet</p>
                </div>
                <div className="bg-amber-500 rounded-2xl p-5 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-100 mb-1">Total Pending</p>
                    <p className="text-2xl font-black">₦{totals.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-amber-100 mt-1 font-medium">Owed to sellers</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Sellers Waiting</p>
                    <p className="text-2xl font-black text-slate-900">{totals.stores}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Unique sellers</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Pending Orders</p>
                    <p className="text-2xl font-black text-slate-900">{totals.orders}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Ready to release</p>
                </div>
            </div>

            {/* ── Filter & Search Bar ── */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <StoreIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                        type="text"
                        placeholder="Search store, seller, bank, account..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-amber-400 transition-colors"
                    />
                </div>
                <div className="flex gap-2">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'has-bank', label: '✓ Has Bank' },
                        { key: 'no-bank', label: '⚠ No Bank' },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                filter === f.key
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Cashout List ── */}
            {loading ? (
                <div className="py-20 flex flex-col items-center gap-3">
                    <Spinner size={32} className="text-amber-500" />
                    <p className="text-slate-500 font-medium">Loading pending cashouts...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-20 text-center bg-white border border-slate-100 rounded-3xl">
                    <CheckCircleIcon size={48} className="mx-auto text-emerald-300 mb-4" />
                    <p className="text-xl font-black text-emerald-600">All paid out!</p>
                    <p className="text-slate-400 font-medium mt-2">No pending seller cashouts matching your filter.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((store) => {
                        const isExpanded = expandedStore === store.storeId
                        const hasBankDetails = !!(store.bankName && store.accountNumber)

                        return (
                            <div
                                key={store.storeId}
                                className={`bg-white rounded-3xl border overflow-hidden transition-all duration-200 ${
                                    isExpanded
                                        ? 'border-amber-200 shadow-xl shadow-amber-500/5'
                                        : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'
                                }`}
                            >
                                {/* ── Store Header Row ── */}
                                <button
                                    onClick={() => setExpandedStore(isExpanded ? null : store.storeId)}
                                    className="w-full p-5 flex items-center gap-4 text-left"
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                                        hasBankDetails ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'
                                    }`}>
                                        <StoreIcon size={20} className={hasBankDetails ? "text-amber-500" : "text-red-400"} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-base font-black text-slate-900">{store.storeName}</h3>
                                            <StatusBadge hasBankDetails={hasBankDetails} />
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium mt-0.5">
                                            {store.sellerName} · {store.orderCount} order{store.orderCount !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xl font-black text-amber-500">₦{store.totalPayout.toLocaleString()}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">total pending</p>
                                    </div>
                                    <ChevronDownIcon
                                        size={18}
                                        className={`text-slate-300 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* ── Expanded Detail ── */}
                                {isExpanded && (
                                    <div className="border-t border-slate-50 p-5 space-y-5 bg-slate-50/30">

                                        {/* Bank + Contact grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                            {/* Bank Details */}
                                            <div className={`rounded-2xl p-5 border ${hasBankDetails ? 'bg-white border-slate-100' : 'bg-red-50 border-red-200'}`}>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Building2Icon size={15} className={hasBankDetails ? "text-slate-500" : "text-red-500"} />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bank Account</p>
                                                </div>
                                                {hasBankDetails ? (
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Bank Name</p>
                                                            <p className="text-sm font-black text-slate-900">{store.bankName}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Account Number</p>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-lg font-black text-slate-900 tracking-widest">{store.accountNumber}</p>
                                                                <CopyBtn text={store.accountNumber} label="Acct No." />
                                                            </div>
                                                        </div>
                                                        {store.accountName && (
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Account Name</p>
                                                                <p className="text-sm font-bold text-slate-700">{store.accountName}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="py-4 text-center">
                                                        <AlertCircleIcon size={28} className="mx-auto text-red-300 mb-2" />
                                                        <p className="text-sm font-black text-red-600">No Bank Details</p>
                                                        <p className="text-xs text-red-400 mt-1">Contact seller to update their bank info before releasing funds.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Seller Contact */}
                                            <div className="bg-white rounded-2xl p-5 border border-slate-100 space-y-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <ShieldIcon size={15} className="text-slate-500" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seller Contact</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Full Name</p>
                                                    <p className="text-sm font-black text-slate-900">{store.sellerName || '—'}</p>
                                                </div>
                                                {store.sellerEmail && (
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Email</p>
                                                        <div className="flex items-center gap-2">
                                                            <MailIcon size={12} className="text-slate-400 shrink-0" />
                                                            <p className="text-xs font-medium text-slate-700 truncate">{store.sellerEmail}</p>
                                                            <CopyBtn text={store.sellerEmail} label="Email" />
                                                        </div>
                                                    </div>
                                                )}
                                                {store.sellerPhone && (
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Phone</p>
                                                        <div className="flex items-center gap-2">
                                                            <PhoneIcon size={12} className="text-slate-400 shrink-0" />
                                                            <p className="text-sm font-bold text-slate-900">{store.sellerPhone}</p>
                                                            <CopyBtn text={store.sellerPhone} label="Phone" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Seller Wallet Balance</p>
                                                    <p className="text-sm font-black text-[#05DF72]">₦{store.walletBalance.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Release All CTA */}
                                        {hasBankDetails && store.orderCount > 1 && (
                                            <button
                                                onClick={() => handleReleaseAll(store)}
                                                disabled={!!releasingId}
                                                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                                            >
                                                <SendIcon size={16} />
                                                Release All {store.orderCount} Orders · ₦{store.totalPayout.toLocaleString()}
                                            </button>
                                        )}

                                        {/* Orders Table */}
                                        <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white">
                                            <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/80">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    Orders Pending Payout ({store.orderCount})
                                                </p>
                                            </div>
                                            <div className="divide-y divide-slate-50">
                                                {store.orders.map(order => {
                                                    const isReleasing = releasingId === order.id
                                                    const completedDate = order.completedAt
                                                        ? new Date(order.completedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                                                        : '—'
                                                    return (
                                                        <div key={order.id} className="px-5 py-4 flex items-center gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-sm font-black text-slate-900">{order.buyerName}</span>
                                                                    <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                                                        #{(order.transactionId || order.id).slice(-10)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                        <ClockIcon size={10} /> Completed {completedDate}
                                                                    </span>
                                                                    <span className="text-xs text-rose-500 font-medium">
                                                                        -₦{order.sellerFee.toLocaleString()} fee
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <p className="text-base font-black text-[#05DF72]">₦{order.payoutAmount.toLocaleString()}</p>
                                                                <p className="text-[10px] text-slate-400">of ₦{order.total.toLocaleString()}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRelease(order.id, store.storeId, order.payoutAmount, store.storeName)}
                                                                disabled={!!releasingId || !hasBankDetails}
                                                                title={!hasBankDetails ? "No bank details on file" : "Release payout"}
                                                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shrink-0 ${
                                                                    hasBankDetails
                                                                        ? 'bg-[#05DF72] hover:bg-[#04c764] text-slate-900 shadow-md shadow-emerald-500/20 disabled:opacity-50'
                                                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                                }`}
                                                            >
                                                                {isReleasing ? (
                                                                    <><Spinner size={12} /> Releasing...</>
                                                                ) : (
                                                                    <><SendIcon size={12} /> Release</>
                                                                )}
                                                            </button>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ── Payout History Toggle ── */}
            <div className="pt-4">
                <button
                    onClick={() => setShowHistory(v => !v)}
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <HistoryIcon size={15} />
                    {showHistory ? 'Hide' : 'Show'} Released Payout History
                    <ChevronDownIcon size={14} className={`transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                </button>

                {showHistory && (
                    <div className="mt-4 bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-sm font-black text-slate-900">Released Payouts</h2>
                            {historyLoading && <Spinner size={14} className="text-slate-400" />}
                        </div>
                        {historyLoading ? (
                            <div className="py-10 text-center text-slate-400 text-sm">Loading history...</div>
                        ) : history.length === 0 ? (
                            <div className="py-10 text-center text-slate-400 text-sm">No released payouts yet.</div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {history.map(order => (
                                    <div key={order.id} className="px-6 py-4 flex items-center gap-4">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                            <CheckCircleIcon size={16} className="text-emerald-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900">{order.store?.name || order.storeId}</p>
                                            <p className="text-xs text-slate-400">{order.user?.name} · #{(order.transactionId || order.id).slice(-10)}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-black text-[#05DF72]">₦{(order.payoutAmount || order.total).toLocaleString()}</p>
                                            <p className="text-[10px] text-slate-400">
                                                {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : ''}
                                            </p>
                                        </div>
                                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wider border border-emerald-100 shrink-0">
                                            Released
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
