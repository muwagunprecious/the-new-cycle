'use client'
import { useState, useEffect, useRef } from "react"
import {
    Search as SearchIcon,
    Filter as FilterIcon,
    Eye as EyeIcon,
    Truck as TruckIcon,
    Calendar as CalendarIcon,
    MessageSquare as MessageSquareIcon,
    XCircle as XCircleIcon,
    CheckCircle as CheckCircleIcon,
    Loader2 as Loader2Icon,
    AlertCircle as AlertCircleIcon,
} from "lucide-react"
import { getAllOrders } from "@/backend-actions/actions/order"
import toast from "react-hot-toast"

// Inline spinner component
function Spinner({ size = 16, className = "" }) {
    return <Loader2Icon size={size} className={`animate-spin ${className}`} />
}

// Inline result banner — shown inside the sidebar for immediate feedback
function ActionBanner({ type, message, onDismiss }) {
    if (!message) return null
    const isSuccess = type === "success"
    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-medium animate-fade-in
                ${isSuccess
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
        >
            {isSuccess
                ? <CheckCircleIcon size={18} className="shrink-0 mt-0.5 text-emerald-500" />
                : <AlertCircleIcon size={18} className="shrink-0 mt-0.5 text-red-500" />
            }
            <span className="flex-1">{message}</span>
            <button onClick={onDismiss} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                <XCircleIcon size={16} />
            </button>
        </div>
    )
}

export default function OrderManagementClient({ initialOrders }) {
    const [orders, setOrders] = useState(initialOrders || [])
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")

    // Per-action loading states
    const [pickupLoading, setPickupLoading] = useState(false)
    const [rescheduleLoading, setRescheduleLoading] = useState(false)
    const [verifyPaymentLoading, setVerifyPaymentLoading] = useState(false)
    const [releasePayoutLoading, setReleasePayoutLoading] = useState(false)

    // Inline feedback banners
    const [pickupBanner, setPickupBanner] = useState(null)          // { type, message }
    const [rescheduleBanner, setRescheduleBanner] = useState(null)
    const [paymentBanner, setPaymentBanner] = useState(null)
    const [payoutBanner, setPayoutBanner] = useState(null)

    // Reschedule date ref
    const rescheduleInputRef = useRef(null)

    // Deep-link: open sidebar for a specific orderId from URL params
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search)
            const targetId = params.get("orderId")
            if (targetId && orders.length > 0) {
                const targetOrder = orders.find((o) => o.id === targetId)
                if (targetOrder) setSelectedOrder(targetOrder)
            }
        }
    }, [orders])

    // Reset banners when sidebar changes
    useEffect(() => {
        setPickupBanner(null)
        setRescheduleBanner(null)
        setPaymentBanner(null)
        setPayoutBanner(null)
    }, [selectedOrder?.id])

    const refreshOrders = async () => {
        const res = await getAllOrders()
        if (res.success) setOrders(res.data)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "ORDER_PLACED": return "status-pending"
            case "APPROVED":     return "status-approved"
            case "PICKED_UP":    return "status-picked"
            case "IN_TRANSIT":   return "status-transit"
            case "COMPLETED":    return "status-completed"
            default:             return "status-pending"
        }
    }

    // ── Handle: Approve Pickup ──────────────────────────────────────────────
    const handleApprovePickup = async () => {
        if (!confirm("Confirm: Approve pickup and mark this order as COMPLETED?")) return
        setPickupLoading(true)
        setPickupBanner(null)
        try {
            const { adminApproveOrderPickup } = await import("@/backend-actions/actions/admin")
            const res = await adminApproveOrderPickup(selectedOrder.id)
            if (res.success) {
                setPickupBanner({ type: "success", message: "✅ Pickup approved! Order marked as completed. Buyer & seller have been notified." })
                toast.success("Pickup approved! Order completed.")
                await refreshOrders()
                // Update the in-sidebar order too
                setSelectedOrder((prev) => ({ ...prev, status: "COMPLETED", collectionStatus: "COLLECTED" }))
            } else {
                const msg = res.error || "Something went wrong."
                setPickupBanner({ type: "error", message: `❌ Failed to approve pickup: ${msg}` })
                toast.error("Failed to approve pickup: " + msg)
            }
        } catch (err) {
            const msg = err?.message || "Unexpected error."
            setPickupBanner({ type: "error", message: `❌ Error: ${msg}` })
            toast.error("Error: " + msg)
        } finally {
            setPickupLoading(false)
        }
    }

    // ── Handle: Reschedule ──────────────────────────────────────────────────
    const handleReschedule = async () => {
        const inputDate = rescheduleInputRef.current?.value
        if (!inputDate) {
            setRescheduleBanner({ type: "error", message: "Please select a new pickup date first." })
            return
        }
        if (!confirm(`Confirm reschedule pickup to ${inputDate}?`)) return
        setRescheduleLoading(true)
        setRescheduleBanner(null)
        try {
            const { adminRescheduleOrderPickup } = await import("@/backend-actions/actions/admin")
            const res = await adminRescheduleOrderPickup(selectedOrder.id, inputDate)
            if (res.success) {
                setRescheduleBanner({ type: "success", message: `✅ Pickup rescheduled to ${inputDate}. Buyer & seller have been notified.` })
                toast.success(`Pickup rescheduled to ${inputDate}`)
                if (rescheduleInputRef.current) rescheduleInputRef.current.value = ""
                await refreshOrders()
                setSelectedOrder((prev) => ({ ...prev, collectionDate: inputDate }))
            } else {
                const msg = res.error || "Something went wrong."
                setRescheduleBanner({ type: "error", message: `❌ Failed to reschedule: ${msg}` })
                toast.error("Failed to reschedule: " + msg)
            }
        } catch (err) {
            const msg = err?.message || "Unexpected error."
            setRescheduleBanner({ type: "error", message: `❌ Error: ${msg}` })
            toast.error("Error: " + msg)
        } finally {
            setRescheduleLoading(false)
        }
    }

    // ── Handle: Verify Payment ──────────────────────────────────────────────
    const handleVerifyPayment = async () => {
        if (!confirm("Confirm: Have you received the exact funds from this buyer?")) return
        setVerifyPaymentLoading(true)
        setPaymentBanner(null)
        try {
            const { verifyOrderPayment } = await import("@/backend-actions/actions/admin")
            const res = await verifyOrderPayment(selectedOrder.id)
            if (res.success) {
                setPaymentBanner({ type: "success", message: "✅ Payment verified! Buyer and seller have been notified." })
                toast.success("Payment verified!")
                await refreshOrders()
                setSelectedOrder((prev) => ({ ...prev, paymentStatus: "verified" }))
            } else {
                const msg = res.error || "Something went wrong."
                setPaymentBanner({ type: "error", message: `❌ Failed to verify payment: ${msg}` })
                toast.error("Failed to verify payment: " + msg)
            }
        } catch (err) {
            const msg = err?.message || "Unexpected error."
            setPaymentBanner({ type: "error", message: `❌ Error: ${msg}` })
            toast.error("Error: " + msg)
        } finally {
            setVerifyPaymentLoading(false)
        }
    }

    // ── Handle: Release Payout ──────────────────────────────────────────────
    const handleReleasePayout = async () => {
        if (!confirm("Confirm: Have you transferred funds to this vendor's account?")) return
        setReleasePayoutLoading(true)
        setPayoutBanner(null)
        try {
            const { releasePayout } = await import("@/backend-actions/actions/admin")
            const res = await releasePayout(selectedOrder.id)
            if (res.success) {
                setPayoutBanner({ type: "success", message: "✅ Payout released! Vendor has been notified." })
                toast.success("Payout released and vendor notified!")
                await refreshOrders()
                setSelectedOrder((prev) => ({ ...prev, payoutStatus: "released" }))
            } else {
                const msg = res.error || "Something went wrong."
                setPayoutBanner({ type: "error", message: `❌ Failed to release payout: ${msg}` })
                toast.error("Failed to release payout: " + msg)
            }
        } catch (err) {
            const msg = err?.message || "Unexpected error."
            setPayoutBanner({ type: "error", message: `❌ Error: ${msg}` })
            toast.error("Error: " + msg)
        } finally {
            setReleasePayoutLoading(false)
        }
    }

    // ── Filtered orders ─────────────────────────────────────────────────────
    const filteredOrders = orders.filter((o) => {
        const q = searchQuery.toLowerCase()
        return (
            o.id?.toLowerCase().includes(q) ||
            o.user?.name?.toLowerCase().includes(q) ||
            o.user?.email?.toLowerCase().includes(q)
        )
    })

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                    Order <span className="text-[#05DF72]">Tracking</span>
                </h1>
                <p className="text-slate-500 mt-1">Monitor transactions and coordinate logistics.</p>
            </div>

            <div className="card bg-white h-auto">
                {/* Search & Filter */}
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by Order ID or Buyer..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#05DF72] transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            <FilterIcon size={16} /> Filter
                        </button>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Order ID</th>
                                <th className="px-6 py-4 font-semibold">Buyer / Vendor</th>
                                <th className="px-6 py-4 font-semibold">Items & Total</th>
                                <th className="px-6 py-4 font-semibold">Logistics Status</th>
                                <th className="px-6 py-4 font-semibold">Payout Status</th>
                                <th className="px-6 py-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{order.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-800">{order.user?.name || "Unknown Buyer"}</span>
                                                <span className="text-xs text-[#05DF72]">{order.store?.name || order.storeId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-sm">
                                                <span className="text-slate-500 truncate max-w-[200px]">
                                                    {order.orderItems?.map((i) => i.product?.name).join(", ") || "Battery Order"}
                                                </span>
                                                <span className="font-bold text-slate-900 mt-0.5">₦{(order.total || 0).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className={`status-badge ${getStatusColor(order.status)} w-fit`}>{order.status}</span>
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                                    <CalendarIcon size={12} />
                                                    Pickup: {order.collectionDate || "Pending"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`status-badge w-fit ${
                                                    order.payoutStatus === "released"
                                                        ? "bg-green-100 text-green-700"
                                                        : order.payoutStatus === "pending"
                                                        ? "bg-amber-100 text-amber-700"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {order.payoutStatus?.toUpperCase() || "NONE"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2 bg-slate-50 hover:bg-[#05DF72]/10 rounded-lg transition-colors text-slate-600 hover:text-[#05DF72]"
                                                    title="View Details"
                                                >
                                                    <EyeIcon size={18} />
                                                </button>
                                                <button
                                                    className="p-2 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors text-slate-600 hover:text-blue-500"
                                                    title="Contact Seller"
                                                >
                                                    <MessageSquareIcon size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Slide-out Order Detail Sidebar ── */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end" onClick={(e) => { if (e.target === e.currentTarget) setSelectedOrder(null) }}>
                    <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col overflow-y-auto animate-slide-in">

                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Order Details</h2>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedOrder.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                            >
                                <XCircleIcon size={22} />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <div className="p-6 space-y-6">

                                {/* Buyer / Vendor Info */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Buyer</h3>
                                        <p className="text-slate-900 font-semibold">{selectedOrder.user?.name || "Unknown"}</p>
                                        <p className="text-xs text-slate-500">{selectedOrder.user?.email || "N/A"}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Vendor</h3>
                                        <p className="text-slate-900 font-semibold">{selectedOrder.store?.name || selectedOrder.storeId}</p>
                                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-[#05DF72]/10 text-[#05DF72] rounded text-[10px] font-bold">
                                            VERIFIED VENDOR
                                        </div>
                                    </div>
                                </div>

                                {/* Tracking Progress */}
                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tracking Progress</h3>
                                    <div className="flex items-center justify-between relative mt-4">
                                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2" />
                                        <div
                                            className="absolute top-1/2 left-0 h-1 bg-[#05DF72] -translate-y-1/2 transition-all"
                                            style={{
                                                width: selectedOrder.status === "COMPLETED" ? "100%" :
                                                       selectedOrder.status === "IN_TRANSIT" ? "75%" :
                                                       selectedOrder.status === "PICKED_UP"  ? "50%" :
                                                       selectedOrder.status === "APPROVED"   ? "25%" : "0%"
                                            }}
                                        />
                                        {["Pending", "Approved", "Picked", "Transit", "Completed"].map((step, idx) => {
                                            const statusMap = ["ORDER_PLACED", "APPROVED", "PICKED_UP", "IN_TRANSIT", "COMPLETED"]
                                            const currentIdx = statusMap.indexOf(selectedOrder.status)
                                            const done = idx <= currentIdx
                                            return (
                                                <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                                                    <div className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-md text-[10px] font-bold ${done ? "bg-[#05DF72] text-white" : "bg-slate-200 text-slate-400"}`}>
                                                        {done ? "✓" : idx + 1}
                                                    </div>
                                                    <span className={`text-[8px] font-bold uppercase tracking-tighter ${done ? "text-slate-900" : "text-slate-400"}`}>{step}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Payment Verification */}
                                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                            Incoming Buyer Payment
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black ${selectedOrder.paymentStatus === "verified" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                            {selectedOrder.paymentStatus?.toUpperCase() || "PENDING"}
                                        </span>
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[9px] text-slate-400 uppercase font-black mb-0.5">Expected Amount</p>
                                            <p className="font-bold text-base text-slate-900">₦{(selectedOrder.total || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[9px] text-slate-400 uppercase font-black mb-0.5">Payment Method</p>
                                            <p className="font-bold text-base text-slate-900 uppercase">{selectedOrder.paymentMethod || "MANUAL_TRANSFER"}</p>
                                        </div>
                                        <div className="md:col-span-2 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                            <p className="text-[9px] text-amber-600 uppercase font-black mb-0.5">Sender Account Name</p>
                                            <p className="font-bold text-base text-amber-900 uppercase tracking-wider">{selectedOrder.paymentSenderName || "NOT PROVIDED"}</p>
                                        </div>
                                    </div>

                                    <ActionBanner
                                        type={paymentBanner?.type}
                                        message={paymentBanner?.message}
                                        onDismiss={() => setPaymentBanner(null)}
                                    />

                                    {selectedOrder.paymentStatus !== "verified" && (
                                        <button
                                            onClick={handleVerifyPayment}
                                            disabled={verifyPaymentLoading}
                                            className="mt-3 w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-black uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                                        >
                                            {verifyPaymentLoading ? (
                                                <><Spinner size={16} /> Verifying Payment...</>
                                            ) : (
                                                <><CheckCircleIcon size={16} /> FUNDS RECEIVED — VERIFY PAYMENT</>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Vendor Payout */}
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-sm">
                                    <h3 className="text-xs font-bold text-[#05DF72] uppercase tracking-wider mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#05DF72]" />
                                            Target Payout
                                        </div>
                                        <div className="bg-[#05DF72]/20 text-[#05DF72] px-2 py-0.5 rounded-full text-[8px] font-black">
                                            FEE: ₦{((selectedOrder.buyerFee || 0) + (selectedOrder.sellerFee || 0)).toLocaleString()}
                                        </div>
                                    </h3>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                            <p className="text-[8px] text-slate-400 uppercase font-black mb-0.5">Base Price</p>
                                            <p className="font-bold text-sm">₦{(selectedOrder.subtotal || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-[#05DF72]/10 p-3 rounded-lg border border-[#05DF72]/20">
                                            <p className="text-[8px] text-[#05DF72] uppercase font-black mb-0.5">Net Vendor Payout</p>
                                            <p className="font-black text-sm text-[#05DF72]">₦{(selectedOrder.payoutAmount || 0).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/10 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[8px] text-slate-400 uppercase font-black mb-1">Payout Status</p>
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black border ${
                                                    selectedOrder.payoutStatus === "released"
                                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                        : selectedOrder.payoutStatus === "pending"
                                                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                                        : "bg-slate-700 text-slate-400 border-slate-600"
                                                }`}>
                                                    {selectedOrder.payoutStatus?.toUpperCase() || "NONE"}
                                                </span>
                                            </div>

                                            {selectedOrder.collectionStatus === "COLLECTED" && selectedOrder.payoutStatus !== "released" && (
                                                <button
                                                    onClick={handleReleasePayout}
                                                    disabled={releasePayoutLoading}
                                                    className="px-5 py-2.5 bg-[#05DF72] hover:bg-[#04c965] disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                                                >
                                                    {releasePayoutLoading ? (
                                                        <><Spinner size={14} className="text-slate-900" /> Releasing...</>
                                                    ) : (
                                                        <><CheckCircleIcon size={14} /> RELEASE PAYOUT</>
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        <ActionBanner
                                            type={payoutBanner?.type}
                                            message={payoutBanner?.message}
                                            onDismiss={() => setPayoutBanner(null)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── Logistics Controls ── */}
                            <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logistics Controls</h3>

                                {selectedOrder.status === "COMPLETED" ? (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                        <CheckCircleIcon size={28} className="mx-auto text-green-400 mb-2" />
                                        <p className="text-green-700 text-xs font-black uppercase">Order Completed</p>
                                        <p className="text-green-600 text-[10px] mt-0.5">All logistics handling is complete.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">

                                        {/* Approve Pickup */}
                                        <div className="space-y-2">
                                            <ActionBanner
                                                type={pickupBanner?.type}
                                                message={pickupBanner?.message}
                                                onDismiss={() => setPickupBanner(null)}
                                            />
                                            <button
                                                onClick={handleApprovePickup}
                                                disabled={pickupLoading}
                                                className="w-full py-4 bg-[#05DF72] hover:bg-[#04c764] disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                                            >
                                                {pickupLoading ? (
                                                    <><Spinner size={16} className="text-slate-900" /> Approving Pickup...</>
                                                ) : (
                                                    <><TruckIcon size={14} /> Approve Pickup</>
                                                )}
                                            </button>
                                        </div>

                                        {/* Reschedule Date */}
                                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Reschedule Pickup Date</p>

                                            <ActionBanner
                                                type={rescheduleBanner?.type}
                                                message={rescheduleBanner?.message}
                                                onDismiss={() => setRescheduleBanner(null)}
                                            />

                                            <div className="flex gap-2">
                                                <input
                                                    type="date"
                                                    ref={rescheduleInputRef}
                                                    min={new Date().toISOString().split("T")[0]}
                                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-[#05DF72] outline-none"
                                                />
                                                <button
                                                    onClick={handleReschedule}
                                                    disabled={rescheduleLoading}
                                                    className="px-4 py-2 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 whitespace-nowrap"
                                                >
                                                    {rescheduleLoading ? (
                                                        <><Spinner size={12} /> Saving...</>
                                                    ) : (
                                                        <><CalendarIcon size={12} /> Submit</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
