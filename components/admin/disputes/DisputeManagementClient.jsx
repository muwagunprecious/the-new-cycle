'use client'
import { useState, useTransition } from "react"
import {
    Search as SearchIcon,
    AlertTriangle as AlertTriangleIcon,
    User as UserIcon,
    Store as StoreIcon,
    ShoppingBag as ShoppingBagIcon,
    Mail as MailIcon,
    Calendar as CalendarIcon,
    Clock as ClockIcon,
    CheckCircle2 as CheckCircleIcon,
    XCircle as XCircleIcon,
    ChevronRight as ChevronRightIcon,
    ArrowRight as ArrowRightIcon,
    Info as InfoIcon,
    DollarSign as DollarSignIcon,
    FileText as FileTextIcon,
    X as XIcon,
    Eye as EyeIcon,
    Phone as PhoneIcon,
    MapPin as MapPinIcon,
    CreditCard as CreditCardIcon,
    ShieldCheck as ShieldCheckIcon
} from "lucide-react"
import { searchDisputes } from "@/backend-actions/actions/admin"
import toast from "react-hot-toast"
import Image from "next/image"

export default function DisputeManagementClient() {
    const [searchQuery, setSearchQuery] = useState("")
    const [orders, setOrders] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isPending, startTransition] = useTransition()

    // Email Modal states
    const [previewEmail, setPreviewEmail] = useState(null) // { subject, htmlContent, recipient }

    const handleSearch = async (e) => {
        if (e) e.preventDefault()
        if (!searchQuery.trim()) {
            toast.error("Please enter a search term")
            return
        }

        startTransition(async () => {
            try {
                const res = await searchDisputes(searchQuery)
                if (res.success) {
                    setOrders(res.data || [])
                    if (res.data && res.data.length > 0) {
                        toast.success(`Found ${res.data.length} matching order(s)`)
                    } else {
                        toast.error("No matches found")
                    }
                } else {
                    toast.error(res.error || "Failed to search disputes")
                }
            } catch (err) {
                toast.error("An error occurred while searching")
            }
        })
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleDateString("en-NG", {
            dateStyle: "medium"
        })
    }

    const formatTime = (dateString) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleTimeString("en-NG", {
            timeStyle: "short"
        })
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A"
        return `${formatDate(dateString)} at ${formatTime(dateString)}`
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case "ORDER_PLACED": return "bg-yellow-50 text-yellow-800 border-yellow-200"
            case "PAID": return "bg-blue-50 text-blue-800 border-blue-200"
            case "APPROVED": return "bg-emerald-50 text-emerald-800 border-emerald-200"
            case "PROCESSING": return "bg-purple-50 text-purple-800 border-purple-200"
            case "COMPLETED": return "bg-green-50 text-green-800 border-green-200"
            case "CANCELLED": return "bg-red-50 text-red-800 border-red-200"
            default: return "bg-slate-50 text-slate-800 border-slate-200"
        }
    }

    // --- Mock Nodemailer HTML Email Previews based on real data ---
    const getEmailTemplate = (type, order) => {
        const buyer = order.user || {}
        const store = order.store || {}
        const seller = store.user || {}
        const item = order.orderItems?.[0] || {}
        const product = item.product || {}
        const productName = product.name || "Battery Product"
        const amount = order.total || 0
        const qty = item.quantity || 1
        const code = order.verificationCode || "N/A"
        const payout = order.payoutAmount || (amount - (order.sellerFee || amount * 0.05))
        const year = new Date().getFullYear()

        switch (type) {
            case "buyer_confirmed":
                return {
                    recipient: buyer.email || "buyer@example.com",
                    subject: `Order Confirmed – #${order.transactionId || order.id}`,
                    html: `
                    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background-color:#ffffff;">
                        <div style="background:#0f172a;padding:24px;text-align:center;">
                            <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
                            <p style="color:#94a3b8;margin:4px 0 0;font-size:12px;">Battery Recycling Marketplace</p>
                        </div>
                        <div style="padding:28px;">
                            <h2 style="color:#0f172a;margin-top:0;">Hi ${buyer.name || "Customer"},</h2>
                            <p style="color:#475569;">Your order has been placed successfully!</p>
                            
                            <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0;border-radius:12px;padding:24px;margin:20px 0;text-align:center;">
                                <p style="margin:0;font-size:14px;color:#15803d;font-weight:bold;">Safe Pickup Instructions</p>
                                <p style="margin:8px 0 0;font-size:13px;color:#1e293b;line-height:1.5;">When you arrive at the pickup location, <strong>ask the seller for the verification code</strong>. You will need to enter this code in your dashboard to confirm receipt of your battery.</p>
                            </div>

                            <div style="background:#f8fafc;border-radius:10px;padding:20px;margin:20px 0;">
                                <p style="margin:0 0 12px;font-size:11px;color:#64748b;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Seller & Pickup Details</p>
                                <p style="margin:4px 0;font-size:14px;color:#0f172a;"><strong>Seller:</strong> ${store.name || "Verified Seller"}</p>
                                <p style="margin:4px 0;font-size:14px;color:#0f172a;"><strong>Phone:</strong> ${seller.phone || store.contact || "N/A"}</p>
                                <p style="margin:4px 0;font-size:14px;color:#0f172a;"><strong>Address:</strong> ${store.address || "See dashboard for details"}</p>
                                <p style="margin:12px 0 4px;font-size:14px;color:#0f172a;"><strong>Collection Date:</strong> ${order.collectionDate || "TBD"}</p>
                            </div>

                            <div style="background:#f8fafc;border-radius:10px;padding:16px;margin:20px 0;">
                                <p style="margin:0 0 8px;font-size:13px;color:#64748b;">ORDER SUMMARY</p>
                                <p style="margin:4px 0;"><strong>Order ID:</strong> #${order.transactionId || order.id}</p>
                                <p style="margin:4px 0;"><strong>Product:</strong> ${productName}</p>
                                <p style="margin:4px 0;"><strong>Amount:</strong> ₦${Number(amount).toLocaleString()}</p>
                            </div>
                            <p style="color:#475569;font-size:14px;">The seller will provide you with the secret code only after they have handed over the items to you.</p>
                        </div>
                        <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                            <p style="color:#94a3b8;font-size:12px;margin:0;">© ${year} Go-Cycle. All rights reserved.</p>
                        </div>
                    </div>`
                }
            case "seller_new_order":
                return {
                    recipient: seller.email || "seller@example.com",
                    subject: `New Order Received – #${order.transactionId || order.id} 🎉`,
                    html: `
                    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background-color:#ffffff;">
                        <div style="background:#0f172a;padding:24px;text-align:center;">
                            <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
                            <p style="color:#94a3b8;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">New Order Notification</p>
                        </div>
                        <div style="padding:28px;">
                            <h2 style="color:#0f172a;margin-top:0;">Hi ${seller.name || "Vendor"},</h2>
                            <p style="color:#475569;">Great news! You have a new order from <strong>${buyer.name || "Buyer"}</strong>.</p>

                            <div style="background:#f0fdf4;border:2px dashed #05DF72;border-radius:12px;padding:24px;margin:20px 0;text-align:center;">
                                <p style="margin:0 0 8px;font-size:12px;color:#15803d;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Verification Code</p>
                                <h2 style="margin:0;font-size:32px;color:#0f172a;letter-spacing:8px;">${code}</h2>
                                <p style="margin:8px 0 0;font-size:11px;color:#64748b;"><strong>Give this code to the buyer</strong> once they have picked up the items. They will need it to confirm the transaction.</p>
                            </div>

                            <div style="background:#f8fafc;border-radius:10px;padding:16px;margin:20px 0;">
                                <p style="margin:0 0 8px;font-size:13px;color:#64748b;">ORDER DETAILS</p>
                                <p style="margin:4px 0;"><strong>Order ID:</strong> #${order.transactionId || order.id}</p>
                                <p style="margin:4px 0;"><strong>Product:</strong> ${productName}</p>
                                <p style="margin:4px 0;"><strong>Quantity:</strong> ${qty} unit(s)</p>
                                <p style="margin:4px 0;"><strong>Amount:</strong> ₦${Number(amount).toLocaleString()}</p>
                                <p style="margin:4px 0;"><strong>Collection Date:</strong> ${order.collectionDate || "TBD"}</p>
                            </div>
                        </div>
                        <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                            <p style="color:#94a3b8;font-size:12px;margin:0;">© ${year} Go-Cycle Nigeria. All rights reserved.</p>
                        </div>
                    </div>`
                }
            case "buyer_receipt":
                return {
                    recipient: buyer.email || "buyer@example.com",
                    subject: `Your Receipt – Go-Cycle Order #${order.transactionId || order.id}`,
                    html: `
                    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background-color:#ffffff;">
                        <div style="background:#0f172a;padding:28px;text-align:center;">
                            <h1 style="color:#05DF72;margin:0 0 4px;font-size:24px;letter-spacing:-0.5px;">Go-Cycle</h1>
                            <p style="color:#94a3b8;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Official Receipt</p>
                        </div>
                        <div style="background:#f0fdf4;border-bottom:1px solid #bbf7d0;padding:14px 28px;text-align:center;">
                            <p style="margin:0;font-weight:bold;color:#15803d;font-size:14px;">✅ Collection Confirmed</p>
                            <p style="margin:0;color:#64748b;font-size:12px;">Your battery has been successfully picked up</p>
                        </div>
                        <div style="padding:28px;">
                            <p style="color:#475569;margin-top:0;">Hi <strong>${buyer.name || "Customer"}</strong>, thank you for using Go-Cycle. Here is your official receipt.</p>
                            <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
                                <thead>
                                    <tr style="background:#f8fafc;">
                                        <th style="text-align:left;padding:10px 12px;color:#64748b;border-bottom:1px solid #e5e7eb;">Item</th>
                                        <th style="text-align:center;padding:10px 12px;color:#64748b;border-bottom:1px solid #e5e7eb;">Qty</th>
                                        <th style="text-align:right;padding:10px 12px;color:#64748b;border-bottom:1px solid #e5e7eb;">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style="padding:12px;color:#0f172a;">${productName}</td>
                                        <td style="padding:12px;text-align:center;color:#0f172a;">${qty}</td>
                                        <td style="padding:12px;text-align:right;color:#0f172a;font-weight:600;">₦${Number(amount).toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div style="background:#f8fafc;border-radius:10px;padding:16px;font-size:13px;color:#475569;">
                                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                                    <span>Collected from</span><strong style="color:#0f172a;">${store.name || "Seller"}</strong>
                                </div>
                                <div style="display:flex;justify-content:space-between;">
                                    <span>Collection Date</span><strong style="color:#0f172a;">${order.collectionDate || formatDate(order.updatedAt)}</strong>
                                </div>
                            </div>
                        </div>
                        <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                            <p style="color:#94a3b8;font-size:12px;margin:0;">© ${year} Go-Cycle Nigeria. All rights reserved.</p>
                        </div>
                    </div>`
                }
            case "seller_collected":
                return {
                    recipient: seller.email || "seller@example.com",
                    subject: `Order Collected – Payout Pending #${order.transactionId || order.id}`,
                    html: `
                    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background-color:#ffffff;">
                        <div style="background:#0f172a;padding:24px;text-align:center;">
                            <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
                        </div>
                        <div style="padding:28px;">
                            <h2 style="color:#0f172a;margin-top:0;">Hi ${seller.name || "Vendor"},</h2>
                            <p style="color:#475569;">Great news! Order <strong>#${order.transactionId || order.id}</strong> has been collected successfully.</p>
                            <p style="color:#475569;">Your payout of <strong>₦${Number(payout).toLocaleString()}</strong> (after 5% platform fee) is now pending admin approval.</p>
                            <p style="color:#475569;font-size:14px;">You'll receive a payment confirmation email once the payout is released.</p>
                        </div>
                        <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                            <p style="color:#94a3b8;font-size:12px;margin:0;">© ${year} Go-Cycle. All rights reserved.</p>
                        </div>
                    </div>`
                }
            case "payout_released":
                return {
                    recipient: seller.email || "seller@example.com",
                    subject: `Payout Released – ₦${Number(payout).toLocaleString()}`,
                    html: `
                    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background-color:#ffffff;">
                        <div style="background:#0f172a;padding:24px;text-align:center;">
                            <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
                        </div>
                        <div style="padding:28px;">
                            <h2 style="color:#0f172a;margin-top:0;">Hi ${seller.name || "Vendor"},</h2>
                            <p style="color:#475569;">💰 Your payout for order <strong>#${order.transactionId || order.id}</strong> has been released!</p>
                            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:20px 0;text-align:center;">
                                <p style="margin:0;font-size:28px;font-weight:bold;color:#16a34a;">₦${Number(payout).toLocaleString()}</p>
                                <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Credited to your wallet</p>
                            </div>
                            <p style="color:#475569;font-size:14px;">Log in to your seller dashboard to view your updated wallet balance.</p>
                        </div>
                        <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                            <p style="color:#94a3b8;font-size:12px;margin:0;">© ${year} Go-Cycle. All rights reserved.</p>
                        </div>
                    </div>`
                }
            default:
                return null
        }
    }

    const openEmailPreview = (type) => {
        const tmpl = getEmailTemplate(type, selectedOrder)
        if (tmpl) {
            setPreviewEmail(tmpl)
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <AlertTriangleIcon className="text-yellow-500 shrink-0" size={32} />
                        Disputes & <span className="text-[#05DF72]">Transaction Audit Log</span>
                    </h1>
                    <p className="text-slate-500 mt-1.5 text-sm md:text-base">
                        Query database records using names, emails, phone numbers, or order IDs to view detailed order lifecycles and communications.
                    </p>
                </div>
            </div>

            {/* Main Search Panel */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Enter buyer/seller name, email, phone, transaction ID or order ID..."
                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl outline-none focus:border-[#05DF72] focus:ring-4 focus:ring-[#05DF72]/10 transition-all text-sm font-medium text-slate-700 bg-slate-50/50"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-slate-950 text-white font-semibold px-8 py-3 rounded-2xl hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 shadow-sm"
                    >
                        {isPending ? "Searching..." : "Track Records"}
                        {!isPending && <ArrowRightIcon size={16} />}
                    </button>
                </form>
            </div>

            {/* Split Layout Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Search Results List */}
                <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm self-stretch flex flex-col min-h-[300px]">
                    <div className="p-4 bg-slate-50/70 border-b border-slate-100">
                        <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                            Matching Transactions ({orders.length})
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[600px] no-scrollbar">
                        {orders.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 h-full flex flex-col justify-center items-center gap-3">
                                <InfoIcon size={36} className="text-slate-300" />
                                <p className="text-sm font-medium">No records matching your search or no search submitted yet.</p>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <button
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className={`w-full p-5 text-left transition-all hover:bg-slate-50 flex items-start gap-3 border-l-4 ${selectedOrder?.id === order.id ? "bg-slate-50/60 border-l-[#05DF72]" : "border-l-transparent"}`}
                                >
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-mono text-xs font-bold text-slate-500 truncate">
                                                {order.transactionId || order.id.slice(-8)}
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-800 truncate">
                                            {order.user?.name || "Unknown Buyer"}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-slate-400">
                                            <span>{order.store?.name || "Private Seller"}</span>
                                            <span className="font-bold text-slate-800">
                                                ₦{(order.total || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400">
                                            Ordered: {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <ChevronRightIcon size={16} className="text-slate-300 self-center shrink-0" />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Audit Detail Workspace */}
                <div className="lg:col-span-8 space-y-8">
                    {!selectedOrder ? (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-4 min-h-[500px]">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                <ShieldCheckIcon size={28} className="text-slate-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-700">Select a matched transaction</h3>
                                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                                    Track full audit trails, product listings, buyer & seller details, notification logs, and nodemailer emails.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Visual Timeline Card */}
                            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
                                <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Order Audit Timeline</h3>
                                        <p className="text-xs text-slate-500">Timeline of state transitions, verifications, and payouts.</p>
                                    </div>
                                    <div className="font-mono text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
                                        ID: {selectedOrder.id}
                                    </div>
                                </div>

                                <div className="relative pl-8 border-l border-slate-200 space-y-8">
                                    
                                    {/* Product Upload step */}
                                    <div className="relative">
                                        <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-[#05DF72]/20 border-2 border-[#05DF72] flex items-center justify-center">
                                            <ShoppingBagIcon size={10} className="text-[#05DF72]" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">Product Uploaded to Marketplace</h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Uploaded on {formatDateTime(selectedOrder.orderItems?.[0]?.product?.createdAt)}
                                            </p>
                                            <div className="mt-2 text-xs bg-slate-50 border border-slate-100 p-3 rounded-xl max-w-md">
                                                <span className="font-semibold text-slate-600">Product Name:</span> {selectedOrder.orderItems?.[0]?.product?.name || "N/A"}<br />
                                                <span className="font-semibold text-slate-600">Condition:</span> {selectedOrder.orderItems?.[0]?.product?.condition || "N/A"} ({selectedOrder.orderItems?.[0]?.product?.amps || 0} Amps)
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Placed step */}
                                    <div className="relative">
                                        <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-[#05DF72]/20 border-2 border-[#05DF72] flex items-center justify-center">
                                            <CalendarIcon size={10} className="text-[#05DF72]" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">Order Placed (Purchased)</h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Purchased on {formatDateTime(selectedOrder.createdAt)}
                                            </p>
                                            <div className="mt-2 text-xs bg-slate-50 border border-slate-100 p-3 rounded-xl max-w-md">
                                                <div className="flex justify-between"><span>Battery Price:</span> <strong>₦{(selectedOrder.subtotal || selectedOrder.orderItems?.[0]?.price || 0).toLocaleString()}</strong></div>
                                                <div className="flex justify-between"><span>Buyer Fee:</span> <strong>₦{(selectedOrder.buyerFee || 0).toLocaleString()}</strong></div>
                                                <div className="flex justify-between border-t border-slate-200 mt-1 pt-1 font-bold"><span>Total Paid by Buyer:</span> <span className="text-[#05DF72]">₦{(selectedOrder.total || 0).toLocaleString()}</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Verified step */}
                                    <div className="relative">
                                        <div className={`absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedOrder.isPaid ? "bg-emerald-100 border-emerald-500" : "bg-yellow-100 border-yellow-500"}`}>
                                            {selectedOrder.isPaid ? (
                                                <CheckCircleIcon size={12} className="text-emerald-600" />
                                            ) : (
                                                <ClockIcon size={12} className="text-yellow-600" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                Payment Status: {selectedOrder.isPaid ? "Verified" : "Pending Verification"}
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Method: {selectedOrder.paymentMethod || "N/A"}
                                            </p>
                                            
                                            <div className="mt-2 text-xs bg-slate-50 border border-slate-100 p-3 rounded-xl max-w-md space-y-1">
                                                <div><span className="font-semibold text-slate-600">Verification Type:</span> {selectedOrder.paymentMethod === 'MANUAL_TRANSFER' ? "Manual (Admin Approved)" : "Automated API Gateway"}</div>
                                                {selectedOrder.paymentMethod === 'MANUAL_TRANSFER' && selectedOrder.paymentSenderName && (
                                                    <div><span className="font-semibold text-slate-600">Sender Name:</span> {selectedOrder.paymentSenderName}</div>
                                                )}
                                                {selectedOrder.paymentReference && (
                                                    <div><span className="font-semibold text-slate-600">Tx Reference:</span> {selectedOrder.paymentReference}</div>
                                                )}
                                                {selectedOrder.isPaid && (
                                                    <div className="text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                                                        <CheckCircleIcon size={12} /> Verified & Confirmed
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pickup Approved step */}
                                    <div className="relative">
                                        <div className={`absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedOrder.status === 'COMPLETED' ? "bg-emerald-100 border-emerald-500" : "bg-yellow-100 border-yellow-500"}`}>
                                            {selectedOrder.status === 'COMPLETED' ? (
                                                <CheckCircleIcon size={12} className="text-emerald-600" />
                                            ) : (
                                                <ClockIcon size={12} className="text-yellow-600" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">Pickup & Collection Code</h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Verification Code: <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{selectedOrder.verificationCode || "N/A"}</span>
                                            </p>
                                            <div className="mt-2 text-xs bg-slate-50 border border-slate-100 p-3 rounded-xl max-w-md space-y-1">
                                                <div><span className="font-semibold text-slate-600">Pickup Status:</span> {selectedOrder.collectionStatus || "PENDING"}</div>
                                                {selectedOrder.status === 'COMPLETED' ? (
                                                    <div>
                                                        <span className="font-semibold text-slate-600">Pickup Verified Date:</span> {formatDateTime(selectedOrder.updatedAt)}
                                                        <div className="text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                                                            <CheckCircleIcon size={12} /> Approved by Admin / Code Verified
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-amber-600 font-semibold flex items-center gap-1">
                                                        <ClockIcon size={12} /> Awaiting buyer collection and admin verification
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payout Released step */}
                                    <div className="relative">
                                        <div className={`absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedOrder.payoutStatus === 'released' ? "bg-emerald-100 border-emerald-500" : "bg-slate-100 border-slate-300"}`}>
                                            {selectedOrder.payoutStatus === 'released' ? (
                                                <CheckCircleIcon size={12} className="text-emerald-600" />
                                            ) : (
                                                <ClockIcon size={12} className="text-slate-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">Seller Payout Status</h4>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Payout status: <span className="font-bold uppercase text-slate-700">{selectedOrder.payoutStatus}</span>
                                            </p>
                                            <div className="mt-2 text-xs bg-slate-50 border border-slate-100 p-3 rounded-xl max-w-md space-y-1">
                                                <div className="flex justify-between"><span>Payout Owed to Seller:</span> <strong>₦{(selectedOrder.payoutAmount || selectedOrder.total - (selectedOrder.sellerFee || selectedOrder.total * 0.05)).toLocaleString()}</strong></div>
                                                <div className="flex justify-between text-rose-600"><span>Platform Commission Fee (5%):</span> <strong>- ₦{(selectedOrder.sellerFee || selectedOrder.total * 0.05).toLocaleString()}</strong></div>
                                                {selectedOrder.payoutStatus === 'released' ? (
                                                    <div className="border-t border-slate-200 pt-1 mt-1">
                                                        <span className="font-semibold text-slate-600">Released Date:</span> {formatDateTime(selectedOrder.updatedAt)}
                                                        <div className="text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                                                            <CheckCircleIcon size={12} /> Funds released to Seller wallet
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-slate-500 font-semibold flex items-center gap-1 border-t border-slate-200 pt-1 mt-1">
                                                        <ClockIcon size={12} /> Pending release approval
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sent Emails Audit Log Card */}
                            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Communication & Notifications Log</h3>
                                    <p className="text-xs text-slate-500">Preview triggered emails and communications sent to the buyer or seller.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Buyer Emails */}
                                    <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40 space-y-3">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                            <UserIcon size={14} /> Buyer Emails ({selectedOrder.user?.email ? "Active" : "No Email"})
                                        </h4>
                                        <div className="space-y-2">
                                            {/* Order Confirmation */}
                                            <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100 text-xs">
                                                <div>
                                                    <p className="font-bold text-slate-700">Order Confirmation</p>
                                                    <p className="text-[10px] text-slate-400">Sent on payment verified</p>
                                                </div>
                                                <button
                                                    onClick={() => openEmailPreview("buyer_confirmed")}
                                                    className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
                                                >
                                                    <EyeIcon size={12} /> Preview
                                                </button>
                                            </div>

                                            {/* Receipt */}
                                            {selectedOrder.status === 'COMPLETED' && (
                                                <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100 text-xs">
                                                    <div>
                                                        <p className="font-bold text-slate-700">Official Receipt</p>
                                                        <p className="text-[10px] text-slate-400">Sent on pickup completed</p>
                                                    </div>
                                                    <button
                                                        onClick={() => openEmailPreview("buyer_receipt")}
                                                        className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
                                                    >
                                                        <EyeIcon size={12} /> Preview
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Seller Emails */}
                                    <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40 space-y-3">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                            <StoreIcon size={14} /> Seller Emails ({selectedOrder.store?.user?.email ? "Active" : "No Email"})
                                        </h4>
                                        <div className="space-y-2">
                                            {/* New Order Alert */}
                                            <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100 text-xs">
                                                <div>
                                                    <p className="font-bold text-slate-700">New Order Alert</p>
                                                    <p className="text-[10px] text-slate-400">Sent on payment verified</p>
                                                </div>
                                                <button
                                                    onClick={() => openEmailPreview("seller_new_order")}
                                                    className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
                                                >
                                                    <EyeIcon size={12} /> Preview
                                                </button>
                                            </div>

                                            {/* Collected / Payout Pending */}
                                            {selectedOrder.status === 'COMPLETED' && (
                                                <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100 text-xs">
                                                    <div>
                                                        <p className="font-bold text-slate-700">Payout Pending Alert</p>
                                                        <p className="text-[10px] text-slate-400">Sent on pickup completed</p>
                                                    </div>
                                                    <button
                                                        onClick={() => openEmailPreview("seller_collected")}
                                                        className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
                                                    >
                                                        <EyeIcon size={12} /> Preview
                                                    </button>
                                                </div>
                                            )}

                                            {/* Payout Released */}
                                            {selectedOrder.payoutStatus === 'released' && (
                                                <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100 text-xs">
                                                    <div>
                                                        <p className="font-bold text-slate-700">Payout Wallet Credit</p>
                                                        <p className="text-[10px] text-slate-400">Sent on payout released</p>
                                                    </div>
                                                    <button
                                                        onClick={() => openEmailPreview("payout_released")}
                                                        className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
                                                    >
                                                        <EyeIcon size={12} /> Preview
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Participant Information Tabbed Area */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* Buyer Details Card */}
                                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                        <UserIcon className="text-[#05DF72]" size={20} />
                                        <h3 className="font-bold text-slate-900">Buyer Information</h3>
                                    </div>
                                    <div className="space-y-3 text-xs text-slate-600">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Full Name</p>
                                            <p className="text-slate-800 font-semibold text-sm">{selectedOrder.user?.name || "N/A"}</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Email Address</p>
                                                <p className="text-slate-800 font-semibold break-all">{selectedOrder.user?.email || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Phone Number</p>
                                                <p className="text-slate-800 font-semibold">{selectedOrder.user?.phone || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Wallet Balance</p>
                                                <p className="text-[#05DF72] font-extrabold text-sm">₦{(selectedOrder.user?.walletBalance || 0).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Registration Date</p>
                                                <p className="text-slate-800 font-semibold">{formatDate(selectedOrder.user?.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Account Status</p>
                                            <span className={`inline-block px-2 py-0.5 rounded-full font-semibold border mt-0.5 ${selectedOrder.user?.accountStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                                {selectedOrder.user?.accountStatus || "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Seller / Store Details Card */}
                                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                        <StoreIcon className="text-[#05DF72]" size={20} />
                                        <h3 className="font-bold text-slate-900">Seller / Store Details</h3>
                                    </div>
                                    <div className="space-y-3 text-xs text-slate-600">
                                        <div className="flex gap-3 items-center">
                                            {selectedOrder.store?.logo ? (
                                                <Image width={40} height={40} src={selectedOrder.store.logo} alt={selectedOrder.store.name} className="w-10 h-10 object-contain rounded-full shadow border" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase border">
                                                    {selectedOrder.store?.name?.charAt(0) || "S"}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Store Name</p>
                                                <p className="text-slate-800 font-semibold text-sm">{selectedOrder.store?.name || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Store Email</p>
                                                <p className="text-slate-800 font-semibold break-all">{selectedOrder.store?.email || selectedOrder.store?.user?.email || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Contact Phone</p>
                                                <p className="text-slate-800 font-semibold">{selectedOrder.store?.contact || selectedOrder.store?.user?.phone || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-2">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Bank Name</p>
                                                <p className="text-slate-800 font-semibold">{selectedOrder.store?.bankName || "Not Provided"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Account Number</p>
                                                <p className="text-slate-800 font-mono font-bold">{selectedOrder.store?.accountNumber || "Not Provided"}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Account Name</p>
                                                <p className="text-slate-800 font-semibold truncate">{selectedOrder.store?.accountName || "Not Provided"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400 font-semibold">Wallet Balance</p>
                                                <p className="text-[#05DF72] font-extrabold text-sm">₦{(selectedOrder.store?.walletBalance || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Product & Warehouse details */}
                            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <ShoppingBagIcon className="text-[#05DF72]" size={20} />
                                    <h3 className="font-bold text-slate-900">Product & Warehouse Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Product Name</p>
                                            <p className="text-slate-800 font-semibold text-sm">{selectedOrder.orderItems?.[0]?.product?.name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Description</p>
                                            <p className="text-slate-600 mt-1 leading-relaxed">{selectedOrder.orderItems?.[0]?.product?.description || "No description provided."}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Recycled Price</p>
                                                <p className="text-slate-800 font-semibold">₦{(selectedOrder.orderItems?.[0]?.product?.price || 0).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Brand</p>
                                                <p className="text-slate-800 font-semibold">{selectedOrder.orderItems?.[0]?.product?.brand || "Generic"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Pickup & Warehouse Address</p>
                                            <p className="text-slate-800 font-semibold mt-1 flex items-start gap-1.5 leading-relaxed">
                                                <MapPinIcon size={14} className="shrink-0 text-slate-400 mt-0.5" />
                                                {selectedOrder.orderItems?.[0]?.product?.pickupAddress || store.address || "N/A"}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Category</p>
                                                <p className="text-slate-800 font-semibold">{selectedOrder.orderItems?.[0]?.product?.category || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Condition</p>
                                                <p className="text-slate-800 font-semibold">{selectedOrder.orderItems?.[0]?.product?.condition || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Upload Date</p>
                                            <p className="text-slate-800 font-semibold">{formatDateTime(selectedOrder.orderItems?.[0]?.product?.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Email Preview Modal */}
            {previewEmail && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                                    <MailIcon size={16} className="text-[#05DF72]" />
                                    Email Preview: {previewEmail.subject}
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Recipient: <span className="font-mono text-slate-300 font-bold">{previewEmail.recipient}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setPreviewEmail(null)}
                                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
                            >
                                <XIcon size={16} />
                            </button>
                        </div>

                        {/* Email Iframe Box */}
                        <div className="flex-1 p-6 bg-slate-900 overflow-y-auto no-scrollbar">
                            <div className="bg-white rounded-2xl overflow-hidden shadow-inner p-2">
                                <div dangerouslySetInnerHTML={{ __html: previewEmail.html }} />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
                            <button
                                onClick={() => setPreviewEmail(null)}
                                className="bg-[#05DF72] text-[#052e16] font-bold px-6 py-2 rounded-xl text-xs hover:bg-[#05DF72]/90 transition-colors shadow-sm"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
