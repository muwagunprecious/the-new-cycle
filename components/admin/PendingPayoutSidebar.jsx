'use client'
import { useEffect, useState, useRef } from "react"
import { getAdminDashboardSummary, getPendingCashouts, releasePayout } from "@/backend-actions/actions/admin"
import { getAllOrders } from "@/backend-actions/actions/order"
import toast from "react-hot-toast"
import {
    Truck as TruckIcon,
    Wallet as WalletIcon,
    CheckCircle as CheckCircleIcon,
    AlertCircle as AlertCircleIcon,
    XCircle as XCircleIcon,
    Calendar as CalendarIcon,
    Loader2 as Loader2Icon,
    RefreshCw as RefreshCwIcon,
    ChevronDown as ChevronDownIcon,
    Clock as ClockIcon,
    Package as PackageIcon,
    Banknote as BanknoteIcon,
    Building2 as Building2Icon,
    CreditCard as CreditCardIcon,
    Send as SendIcon,
    Copy as CopyIcon,
    Phone as PhoneIcon,
    Store as StoreIcon,
} from "lucide-react"

function Spinner({ size = 14, className = "" }) {
    return <Loader2Icon size={size} className={`animate-spin ${className}`} />
}

function ActionBanner({ type, message, onDismiss }) {
    if (!message) return null
    const isSuccess = type === "success"
    return (
        <div className={`flex items-start gap-2 p-3 rounded-xl border text-xs font-medium
            ${isSuccess
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
        >
            {isSuccess
                ? <CheckCircleIcon size={14} className="shrink-0 mt-0.5 text-emerald-500" />
                : <AlertCircleIcon size={14} className="shrink-0 mt-0.5 text-red-500" />
            }
            <span className="flex-1 leading-relaxed">{message}</span>
            <button onClick={onDismiss} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                <XCircleIcon size={12} />
            </button>
        </div>
    )
}

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false)
    const handle = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }
    return (
        <button
            onClick={handle}
            className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
            title="Copy"
        >
            {copied ? <CheckCircleIcon size={11} className="text-emerald-500" /> : <CopyIcon size={11} />}
        </button>
    )
}

export default function PendingPayoutSidebar() {
    const currency = '₦'

    const [activeTab, setActiveTab] = useState("pickup")

    // ── Payout Stats ──────────────────────────────────────────────────
    const [stats, setStats] = useState({
        subtotal: 0, total: 0, sellerFee: 0,
        buyerFee: 0, payoutAmount: 0, platformEarnings: 0, adminBalance: 0
    })
    const [statsLoading, setStatsLoading] = useState(true)

    // ── Cashout Tab State ─────────────────────────────────────────────
    const [cashouts, setCashouts] = useState([])
    const [cashoutsLoading, setCashoutsLoading] = useState(true)
    const [cashoutsTotal, setCashoutsTotal] = useState({ amount: 0, stores: 0, orders: 0 })
    const [expandedStore, setExpandedStore] = useState(null)
    const [releasingId, setReleasingId] = useState(null)
    const [cashoutBanners, setCashoutBanners] = useState({})

    // ── Pickup Tab State ──────────────────────────────────────────────
    const [orders, setOrders] = useState([])
    const [ordersLoading, setOrdersLoading] = useState(true)
    const [expandedOrderId, setExpandedOrderId] = useState(null)
    const [approvingId, setApprovingId] = useState(null)
    const [reschedulingId, setReschedulingId] = useState(null)
    const [banners, setBanners] = useState({})
    const rescheduleRefs = useRef({})

    // ── Fetchers ──────────────────────────────────────────────────────
    const fetchStats = async () => {
        try {
            const res = await getAdminDashboardSummary()
            if (res.success && res.data.pendingStats) {
                setStats(res.data.pendingStats)
            }
        } catch (e) {
            console.error("Sidebar Stats Error:", e)
        } finally {
            setStatsLoading(false)
        }
    }

    const fetchCashouts = async () => {
        setCashoutsLoading(true)
        try {
            const res = await getPendingCashouts()
            if (res.success) {
                setCashouts(res.data.cashouts || [])
                setCashoutsTotal({
                    amount: res.data.totalPendingAmount || 0,
                    stores: res.data.totalStores || 0,
                    orders: res.data.totalOrders || 0
                })
            }
        } catch (e) {
            console.error("Cashout Fetch Error:", e)
        } finally {
            setCashoutsLoading(false)
        }
    }

    const fetchOrders = async () => {
        setOrdersLoading(true)
        try {
            const res = await getAllOrders(1, 100)
            if (res.success) {
                const pending = (res.data || []).filter(
                    o => o.status !== "COMPLETED" && o.status !== "CANCELLED"
                )
                setOrders(pending)
            }
        } catch (e) {
            console.error("Sidebar Orders Error:", e)
        } finally {
            setOrdersLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
        fetchCashouts()
        fetchOrders()
        const onPayoutReleased = () => { fetchStats(); fetchCashouts() }
        window.addEventListener('payout-released', onPayoutReleased)
        window.addEventListener('pickup-approved', fetchOrders)
        return () => {
            window.removeEventListener('payout-released', onPayoutReleased)
            window.removeEventListener('pickup-approved', fetchOrders)
        }
    }, [])

    // ── Release Payout per order ──────────────────────────────────────
    const handleReleasePayout = async (orderId, storeId, payoutAmount) => {
        if (!confirm(`Release ₦${payoutAmount.toLocaleString()} to this seller? This cannot be undone.`)) return
        setReleasingId(orderId)
        setCashoutBanners(prev => ({ ...prev, [orderId]: null }))
        try {
            const res = await releasePayout(orderId)
            if (res.success) {
                toast.success(`₦${payoutAmount.toLocaleString()} released!`)
                window.dispatchEvent(new Event('payout-released'))
                // Remove this order from its store group
                setCashouts(prev => prev.map(store => {
                    if (store.storeId !== storeId) return store
                    const updatedOrders = store.orders.filter(o => o.id !== orderId)
                    return {
                        ...store,
                        orders: updatedOrders,
                        totalPayout: store.totalPayout - payoutAmount,
                        orderCount: store.orderCount - 1
                    }
                }).filter(store => store.orderCount > 0))
                setCashoutsTotal(prev => ({
                    ...prev,
                    amount: prev.amount - payoutAmount,
                    orders: prev.orders - 1,
                    stores: cashouts.filter(s => s.storeId === storeId)[0]?.orderCount === 1
                        ? prev.stores - 1 : prev.stores
                }))
            } else {
                const msg = res.error || "Release failed"
                setCashoutBanners(prev => ({ ...prev, [orderId]: { type: 'error', message: msg } }))
                toast.error(msg)
            }
        } catch (err) {
            const msg = err?.message || "Unexpected error"
            setCashoutBanners(prev => ({ ...prev, [orderId]: { type: 'error', message: msg } }))
            toast.error(msg)
        } finally {
            setReleasingId(null)
        }
    }

    // ── Release ALL orders for a store ───────────────────────────────
    const handleReleaseAll = async (store) => {
        if (!confirm(`Release ALL ${store.orderCount} pending payout(s) totalling ₦${store.totalPayout.toLocaleString()} to ${store.storeName}?`)) return
        for (const order of store.orders) {
            await handleReleasePayout(order.id, store.storeId, order.payoutAmount)
        }
    }

    // ── Approve Pickup ────────────────────────────────────────────────
    const handleApprovePickup = async (orderId) => {
        if (!confirm("Confirm: Approve pickup and mark this order as COMPLETED?")) return
        setApprovingId(orderId)
        setBanners(prev => ({ ...prev, [orderId]: null }))
        try {
            const { adminApproveOrderPickup } = await import("@/backend-actions/actions/admin")
            const res = await adminApproveOrderPickup(orderId)
            if (res.success) {
                setBanners(prev => ({ ...prev, [orderId]: { type: "success", message: "Pickup approved!" } }))
                toast.success("Pickup approved!")
                setTimeout(() => {
                    setOrders(prev => prev.filter(o => o.id !== orderId))
                    fetchStats(); fetchCashouts()
                }, 1500)
            } else {
                const msg = res.error || "Something went wrong."
                setBanners(prev => ({ ...prev, [orderId]: { type: "error", message: msg } }))
                toast.error(msg)
            }
        } catch (err) {
            const msg = err?.message || "Unexpected error."
            setBanners(prev => ({ ...prev, [orderId]: { type: "error", message: msg } }))
            toast.error(msg)
        } finally {
            setApprovingId(null)
        }
    }

    const handleReschedule = async (orderId) => {
        const inputDate = rescheduleRefs.current[orderId]?.value
        if (!inputDate) {
            setBanners(prev => ({ ...prev, [orderId]: { type: "error", message: "Please select a new date first." } }))
            return
        }
        if (!confirm(`Confirm reschedule pickup to ${inputDate}?`)) return
        setReschedulingId(orderId)
        setBanners(prev => ({ ...prev, [orderId]: null }))
        try {
            const { adminRescheduleOrderPickup } = await import("@/backend-actions/actions/admin")
            const res = await adminRescheduleOrderPickup(orderId, inputDate)
            if (res.success) {
                setBanners(prev => ({ ...prev, [orderId]: { type: "success", message: `Rescheduled to ${inputDate}.` } }))
                toast.success(`Rescheduled to ${inputDate}`)
                if (rescheduleRefs.current[orderId]) rescheduleRefs.current[orderId].value = ""
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, collectionDate: inputDate } : o))
            } else {
                const msg = res.error || "Something went wrong."
                setBanners(prev => ({ ...prev, [orderId]: { type: "error", message: msg } }))
                toast.error(msg)
            }
        } catch (err) {
            const msg = err?.message || "Unexpected error."
            setBanners(prev => ({ ...prev, [orderId]: { type: "error", message: msg } }))
            toast.error(msg)
        } finally {
            setReschedulingId(null)
        }
    }

    const clearBanner = (id) => setBanners(prev => ({ ...prev, [id]: null }))
    const clearCashoutBanner = (id) => setCashoutBanners(prev => ({ ...prev, [id]: null }))

    const getStatusStyle = (status) => {
        switch (status) {
            case "ORDER_PLACED": return "bg-amber-100 text-amber-700"
            case "APPROVED":     return "bg-blue-100 text-blue-700"
            case "PICKED_UP":    return "bg-indigo-100 text-indigo-700"
            case "IN_TRANSIT":   return "bg-purple-100 text-purple-700"
            default:             return "bg-slate-100 text-slate-600"
        }
    }

    if (statsLoading && ordersLoading && cashoutsLoading) {
        return (
            <div className="xl:w-80 h-full p-8 border-l border-slate-100 bg-white hidden xl:block animate-pulse">
                <div className="h-8 bg-slate-100 rounded-full w-3/4 mb-10"></div>
                <div className="h-32 bg-slate-100 rounded-2xl mb-8"></div>
                <div className="space-y-4">
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="xl:min-w-80 xl:w-80 h-full border-l border-slate-100 bg-white hidden xl:flex flex-col overflow-hidden">

            {/* ── Tab Switcher ── */}
            <div className="flex border-b border-slate-100 shrink-0">
                <button
                    onClick={() => setActiveTab("pickup")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                        activeTab === "pickup"
                            ? "text-[#05DF72] border-b-2 border-[#05DF72] bg-[#05DF72]/5"
                            : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                    <TruckIcon size={12} />
                    Pickup
                    {orders.length > 0 && (
                        <span className="ml-0.5 w-4 h-4 rounded-full bg-[#05DF72] text-white text-[8px] flex items-center justify-center font-black">
                            {orders.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("cashout")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                        activeTab === "cashout"
                            ? "text-[#05DF72] border-b-2 border-[#05DF72] bg-[#05DF72]/5"
                            : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                    <BanknoteIcon size={12} />
                    Cashout
                    {cashoutsTotal.orders > 0 && (
                        <span className="ml-0.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[8px] flex items-center justify-center font-black">
                            {cashoutsTotal.orders}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("payout")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                        activeTab === "payout"
                            ? "text-[#05DF72] border-b-2 border-[#05DF72] bg-[#05DF72]/5"
                            : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                    <WalletIcon size={12} />
                    Stats
                </button>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto no-scrollbar">

                {/* ════════════════════════════════════════════════════
                    CASHOUT TAB
                   ════════════════════════════════════════════════════ */}
                {activeTab === "cashout" && (
                    <div className="p-4 space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-6 bg-amber-400 rounded-full"></div>
                                <h2 className="text-sm font-black text-slate-900">Pending Cashouts</h2>
                            </div>
                            <button
                                onClick={fetchCashouts}
                                disabled={cashoutsLoading}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40"
                                title="Refresh"
                            >
                                <RefreshCwIcon size={13} className={cashoutsLoading ? "animate-spin" : ""} />
                            </button>
                        </div>

                        {/* Summary strip */}
                        {cashoutsTotal.orders > 0 && (
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <p className="text-[8px] font-black uppercase text-amber-500 tracking-wider">Sellers</p>
                                    <p className="text-base font-black text-slate-900">{cashoutsTotal.stores}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase text-amber-500 tracking-wider">Orders</p>
                                    <p className="text-base font-black text-slate-900">{cashoutsTotal.orders}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase text-amber-500 tracking-wider">Total</p>
                                    <p className="text-sm font-black text-slate-900">₦{(cashoutsTotal.amount / 1000).toFixed(1)}k</p>
                                </div>
                            </div>
                        )}

                        {cashoutsLoading ? (
                            <div className="py-10 flex flex-col items-center gap-2">
                                <Spinner size={20} className="text-amber-500" />
                                <p className="text-xs text-slate-400 font-medium">Loading cashouts...</p>
                            </div>
                        ) : cashouts.length === 0 ? (
                            <div className="py-10 text-center">
                                <CheckCircleIcon size={32} className="mx-auto text-emerald-300 mb-3" />
                                <p className="text-sm font-bold text-emerald-600">All paid out!</p>
                                <p className="text-[10px] text-slate-400 mt-1">No pending seller cashouts.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cashouts.map((store) => {
                                    const isExpanded = expandedStore === store.storeId
                                    const hasBankDetails = store.bankName && store.accountNumber
                                    return (
                                        <div
                                            key={store.storeId}
                                            className={`rounded-2xl border overflow-hidden transition-all ${
                                                isExpanded
                                                    ? "border-amber-200 shadow-lg shadow-amber-500/5"
                                                    : "border-slate-100 shadow-sm hover:shadow-md"
                                            }`}
                                        >
                                            {/* Store header row */}
                                            <button
                                                onClick={() => setExpandedStore(isExpanded ? null : store.storeId)}
                                                className="w-full p-3 flex items-center gap-2.5 text-left bg-white"
                                            >
                                                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                                                    <StoreIcon size={14} className="text-amber-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black text-slate-900 truncate">{store.storeName}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                        {store.orderCount} order{store.orderCount !== 1 ? 's' : ''} · <span className="text-amber-600 font-black">₦{store.totalPayout.toLocaleString()}</span>
                                                    </p>
                                                </div>
                                                <ChevronDownIcon
                                                    size={13}
                                                    className={`text-slate-300 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                                />
                                            </button>

                                            {/* Expanded store detail */}
                                            {isExpanded && (
                                                <div className="border-t border-slate-50 bg-slate-50/50 px-3 pb-3 pt-2.5 space-y-3">

                                                    {/* Bank Details Card */}
                                                    <div className={`rounded-xl p-3 border ${hasBankDetails ? 'bg-white border-slate-100' : 'bg-red-50 border-red-100'}`}>
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                                                            <Building2Icon size={9} /> Bank Details
                                                        </p>
                                                        {hasBankDetails ? (
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[10px] text-slate-500 font-medium">Bank</span>
                                                                    <span className="text-[10px] font-black text-slate-900">{store.bankName}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[10px] text-slate-500 font-medium">Account</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-[11px] font-black text-slate-900 tracking-wider">{store.accountNumber}</span>
                                                                        <CopyButton text={store.accountNumber} />
                                                                    </div>
                                                                </div>
                                                                {store.accountName && (
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[10px] text-slate-500 font-medium">Name</span>
                                                                        <span className="text-[10px] font-bold text-slate-700">{store.accountName}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <p className="text-[10px] font-bold text-red-500">⚠ No bank details on file</p>
                                                        )}
                                                    </div>

                                                    {/* Contact */}
                                                    {store.sellerPhone && (
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                            <PhoneIcon size={10} />
                                                            <span className="font-medium">{store.sellerPhone}</span>
                                                            <CopyButton text={store.sellerPhone} />
                                                        </div>
                                                    )}

                                                    {/* Release All button */}
                                                    {store.orderCount > 1 && (
                                                        <button
                                                            onClick={() => handleReleaseAll(store)}
                                                            disabled={!!releasingId}
                                                            className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                                                        >
                                                            <SendIcon size={11} />
                                                            Release All (₦{store.totalPayout.toLocaleString()})
                                                        </button>
                                                    )}

                                                    {/* Individual Orders */}
                                                    <div className="space-y-2">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Orders to Release</p>
                                                        {store.orders.map(order => {
                                                            const isReleasing = releasingId === order.id
                                                            const banner = cashoutBanners[order.id]
                                                            return (
                                                                <div key={order.id} className="bg-white rounded-xl border border-slate-100 p-2.5 space-y-2">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div className="min-w-0">
                                                                            <p className="text-[10px] font-bold text-slate-900 truncate">
                                                                                {order.buyerName}
                                                                            </p>
                                                                            <p className="text-[9px] text-slate-400 font-medium font-mono">
                                                                                #{(order.transactionId || order.id).slice(-8)}
                                                                            </p>
                                                                        </div>
                                                                        <div className="text-right shrink-0">
                                                                            <p className="text-[11px] font-black text-[#05DF72]">₦{order.payoutAmount.toLocaleString()}</p>
                                                                            <p className="text-[8px] text-slate-400">-₦{order.sellerFee.toLocaleString()} fee</p>
                                                                        </div>
                                                                    </div>
                                                                    {banner && (
                                                                        <ActionBanner
                                                                            type={banner.type}
                                                                            message={banner.message}
                                                                            onDismiss={() => clearCashoutBanner(order.id)}
                                                                        />
                                                                    )}
                                                                    <button
                                                                        onClick={() => handleReleasePayout(order.id, store.storeId, order.payoutAmount)}
                                                                        disabled={!!releasingId}
                                                                        className="w-full py-2 bg-[#05DF72] hover:bg-[#04c764] disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-black text-[9px] uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5"
                                                                    >
                                                                        {isReleasing ? (
                                                                            <><Spinner size={10} className="text-slate-900" /> Releasing...</>
                                                                        ) : (
                                                                            <><SendIcon size={10} /> Release ₦{order.payoutAmount.toLocaleString()}</>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ════════════════════════════════════════════════════
                    PICKUP TAB
                   ════════════════════════════════════════════════════ */}
                {activeTab === "pickup" && (
                    <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-7 bg-[#05DF72] rounded-full"></div>
                                <h2 className="text-base font-black text-slate-900 tracking-tight">Approve Pickup</h2>
                            </div>
                            <button
                                onClick={fetchOrders}
                                disabled={ordersLoading}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40"
                                title="Refresh"
                            >
                                <RefreshCwIcon size={14} className={ordersLoading ? "animate-spin" : ""} />
                            </button>
                        </div>

                        {ordersLoading ? (
                            <div className="py-12 flex flex-col items-center gap-2">
                                <Spinner size={20} className="text-[#05DF72]" />
                                <p className="text-xs text-slate-400 font-medium">Loading orders...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="py-12 text-center">
                                <CheckCircleIcon size={32} className="mx-auto text-emerald-300 mb-3" />
                                <p className="text-sm font-bold text-emerald-600">All caught up!</p>
                                <p className="text-[10px] text-slate-400 mt-1">No orders awaiting pickup approval.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map((order) => {
                                    const isExpanded = expandedOrderId === order.id
                                    const isApproving = approvingId === order.id
                                    const isRescheduling = reschedulingId === order.id
                                    const banner = banners[order.id]
                                    return (
                                        <div
                                            key={order.id}
                                            className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                                                isExpanded
                                                    ? "border-[#05DF72]/30 shadow-lg shadow-[#05DF72]/5"
                                                    : "border-slate-100 shadow-sm hover:shadow-md"
                                            }`}
                                        >
                                            <button
                                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                                className="w-full p-3.5 flex items-center gap-3 text-left"
                                            >
                                                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                                    <PackageIcon size={16} className="text-slate-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 truncate">{order.user?.name || "Unknown Buyer"}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-bold text-slate-900">₦{(order.total || 0).toLocaleString()}</span>
                                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${getStatusStyle(order.status)}`}>
                                                            {order.status?.replace("_", " ")}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronDownIcon size={14} className={`text-slate-300 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                            </button>

                                            {isExpanded && (
                                                <div className="px-3.5 pb-3.5 space-y-3 border-t border-slate-50 pt-3">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="bg-slate-50 rounded-lg p-2.5">
                                                            <p className="text-[8px] font-black text-slate-400 uppercase">Vendor</p>
                                                            <p className="text-[11px] font-bold text-slate-800 truncate mt-0.5">{order.store?.name || order.storeId || "N/A"}</p>
                                                        </div>
                                                        <div className="bg-slate-50 rounded-lg p-2.5">
                                                            <p className="text-[8px] font-black text-slate-400 uppercase">Pickup Date</p>
                                                            <p className="text-[11px] font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                                                                <ClockIcon size={10} className="text-slate-400" />
                                                                {order.collectionDate || "Pending"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {banner && <ActionBanner type={banner.type} message={banner.message} onDismiss={() => clearBanner(order.id)} />}
                                                    <button
                                                        onClick={() => handleApprovePickup(order.id)}
                                                        disabled={isApproving || isRescheduling}
                                                        className="w-full py-3 bg-[#05DF72] hover:bg-[#04c764] disabled:opacity-50 text-slate-900 font-black uppercase text-[9px] tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                                                    >
                                                        {isApproving ? (
                                                            <><Spinner size={12} className="text-slate-900" /> Approving...</>
                                                        ) : (
                                                            <><TruckIcon size={12} /> Approve Pickup</>
                                                        )}
                                                    </button>
                                                    <div className="bg-slate-50 rounded-xl p-2.5 space-y-2">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Reschedule Date</p>
                                                        <div className="flex gap-1.5">
                                                            <input
                                                                type="date"
                                                                ref={(el) => (rescheduleRefs.current[order.id] = el)}
                                                                min={new Date().toISOString().split("T")[0]}
                                                                className="flex-1 px-2 py-1.5 border border-slate-200 rounded-lg text-[10px] font-medium focus:border-[#05DF72] outline-none bg-white"
                                                            />
                                                            <button
                                                                onClick={() => handleReschedule(order.id)}
                                                                disabled={isApproving || isRescheduling}
                                                                className="px-3 py-1.5 bg-slate-900 text-white font-black text-[8px] uppercase tracking-widest rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-1"
                                                            >
                                                                {isRescheduling ? <><Spinner size={10} />...</> : <><CalendarIcon size={10} />Set</>}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-[8px] font-mono text-slate-300 truncate text-center pt-1">{order.id}</p>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ════════════════════════════════════════════════════
                    STATS TAB
                   ════════════════════════════════════════════════════ */}
                {activeTab === "payout" && (
                    <div className="p-6 space-y-8">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-7 bg-[#05DF72] rounded-full"></div>
                            <h2 className="text-base font-black text-slate-900 tracking-tight">Financial Stats</h2>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-6 text-center shadow-xl shadow-slate-200">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#05DF72] mb-2">Platform Balance</p>
                            <h3 className="text-3xl font-black text-white">₦{(stats.adminBalance || 0).toLocaleString()}</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 font-bold">Base Price (Subtotal)</span>
                                <span className="text-slate-900 font-black">₦{(stats.subtotal || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 font-bold">Buyer Paid (+5% Fee)</span>
                                <span className="font-black text-[#05DF72]">₦{(stats.total || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 font-bold">Seller -5% Fee</span>
                                <span className="text-rose-500 font-black">- ₦{(stats.sellerFee || 0).toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t border-dashed border-slate-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-900 font-black text-[10px] uppercase tracking-widest">Net Payout</span>
                                    <span className="text-2xl font-black text-slate-900">₦{(stats.payoutAmount || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                            <p className="text-[10px] text-emerald-700 font-bold leading-relaxed">
                                ⚠️ Aggregate totals for all orders awaiting payout release.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
