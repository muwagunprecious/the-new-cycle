'use client'
import { useState } from "react"
import { Search as SearchIcon, Filter as FilterIcon, Eye as EyeIcon, Truck as TruckIcon, Calendar as CalendarIcon, MessageSquare as MessageSquareIcon, XCircle as XCircleIcon, CheckCircle as CheckCircleIcon } from "lucide-react"
import { getAllOrders } from "@/backend-actions/actions/order"
import { useEffect } from "react"
import Loading from "@/components/Loading"

export default function OrderManagementClient({ initialOrders }) {
    const [orders, setOrders] = useState(initialOrders || [])
    const [loading, setLoading] = useState(false)

    // Orders are passed as props for initial load!
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const targetId = params.get('orderId');
            if (targetId && orders.length > 0) {
                const targetOrder = orders.find(o => o.id === targetId);
                if (targetOrder) setSelectedOrder(targetOrder);
            }
        }
    }, []) // Run once on mount

    const [selectedOrder, setSelectedOrder] = useState(null)

    const getStatusColor = (status) => {
        switch (status) {
            case 'ORDER_PLACED': return 'status-pending';
            case 'APPROVED': return 'status-approved';
            case 'PICKED_UP': return 'status-picked';
            case 'IN_TRANSIT': return 'status-transit';
            case 'COMPLETED': return 'status-completed';
            default: return 'status-pending';
        }
    }

    if (loading) return <Loading />

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Order <span className="text-[#05DF72]">Tracking</span></h1>
                <p className="text-slate-500 mt-1">Monitor transactions and coordinate logistics.</p>
            </div>

            <div className="card bg-white h-auto">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Buyer..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#05DF72] transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            <FilterIcon size={16} />
                            Filter
                        </button>
                    </div>
                </div>

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
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{order.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-800">{order.user?.name || 'Unknown Buyer'}</span>
                                            <span className="text-xs text-[#05DF72]">Seller ID: {order.storeId}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-sm">
                                            <span className="text-slate-500 truncate max-w-[200px]">{order.orderItems?.map(i => i.product?.name).join(', ') || 'Battery Order'}</span>
                                            <span className="font-bold text-slate-900 mt-0.5">₦{(order.total || 0).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <span className={`status-badge ${getStatusColor(order.status)} w-fit`}>
                                                {order.status}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                                <CalendarIcon size={12} />
                                                Pickup: {order.collectionDate || 'Pending'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`status-badge w-fit ${order.payoutStatus === 'released'
                                            ? 'bg-green-100 text-green-700'
                                            : order.payoutStatus === 'pending'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {order.payoutStatus?.toUpperCase() || 'NONE'}
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
                                            <button className="p-2 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors text-slate-600 hover:text-blue-500" title="Contact Seller">
                                                <MessageSquareIcon size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Slide-out Sidebar for Details */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
                    <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-in">
                        <div>
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-bold text-slate-900">Order Details - {selectedOrder.id}</h2>
                                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                    <XCircleIcon size={24} />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Buyer Information</h3>
                                        <p className="text-slate-900 font-medium">{selectedOrder.user?.name || 'Unknown'}</p>
                                        <p className="text-sm text-slate-500">Email: {selectedOrder.user?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Vendor Information</h3>
                                        <p className="text-slate-900 font-medium">{selectedOrder.store?.name || selectedOrder.storeId}</p>
                                        <div className="mt-1.5 inline-flex items-center gap-2 px-2 py-0.5 bg-[#05DF72]/10 text-[#05DF72] rounded text-[10px] font-bold">
                                            {(selectedOrder.store?.isVerified || true) ? 'VERIFIED VENDOR' : 'PENDING'}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tracking Progress</h3>
                                    <div className="flex items-center justify-between relative mt-4">
                                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 -z-0"></div>
                                        <div className="absolute top-1/2 left-0 w-1/2 h-1 bg-[#05DF72] -translate-y-1/2 -z-0 transition-all"></div>

                                        {['Pending', 'Approved', 'Picked', 'Transit', 'Completed'].map((step, idx) => (
                                            <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                                                <div className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-md text-[10px] font-bold ${idx <= 2 ? 'bg-[#05DF72] text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                    {idx < 2 ? '✓' : (idx === 2 ? '●' : idx + 1)}
                                                </div>
                                                <span className={`text-[8px] font-bold uppercase tracking-tighter ${idx <= 2 ? 'text-slate-900' : 'text-slate-400'}`}>{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Buyer Payment Verification Section */}
                                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                            Incoming Buyer Payment
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black ${selectedOrder.paymentStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {selectedOrder.paymentStatus?.toUpperCase() || 'PENDING'}
                                        </span>
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[9px] text-slate-400 uppercase font-black mb-0.5">Expected Amount</p>
                                            <p className="font-bold text-base text-slate-900">₦{(selectedOrder.total || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[9px] text-slate-400 uppercase font-black mb-0.5">Payment Method</p>
                                            <p className="font-bold text-base text-slate-900 uppercase">{selectedOrder.paymentMethod || 'MANUAL_TRANSFER'}</p>
                                        </div>
                                        <div className="md:col-span-2 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                            <p className="text-[9px] text-amber-600 uppercase font-black mb-0.5">Sender Account Name</p>
                                            <p className="font-bold text-base text-amber-900 uppercase tracking-wider">{selectedOrder.paymentSenderName || 'NOT PROVIDED'}</p>
                                        </div>
                                    </div>
                                    
                                    {selectedOrder.paymentStatus !== 'verified' && (
                                        <button
                                            onClick={async () => {
                                                if (!confirm("Are you sure you have received the exact funds from this buyer?")) return;
                                                const { verifyOrderPayment } = await import('@/backend-actions/actions/admin')
                                                const res = await verifyOrderPayment(selectedOrder.id)
                                                if (res.success) {
                                                    toast.success('Payment verified! Buyer and Vendor have been notified.')
                                                    setSelectedOrder(null)
                                                    const ordersRes = await getAllOrders()
                                                    if (ordersRes.success) setOrders(ordersRes.data)
                                                } else {
                                                    toast.error('Failed to verify payment: ' + res.error)
                                                }
                                            }}
                                            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                                        >
                                            <CheckCircleIcon size={16} />
                                            FUNDS RECEIVED - VERIFY PAYMENT
                                        </button>
                                    )}
                                </div>

                                {/* Vendor Payout Section */}
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-sm relative overflow-hidden">
                                    <h3 className="text-xs font-bold text-[#05DF72] uppercase tracking-wider mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#05DF72]"></div>
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

                                    {/* Payout Release Action */}
                                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
                                        <div>
                                            <p className="text-[8px] text-slate-400 uppercase font-black mb-1">Payout Status</p>
                                            <span className={`status-badge-big py-1 px-3 text-[9px] ${selectedOrder.payoutStatus === 'released'
                                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                : selectedOrder.payoutStatus === 'pending'
                                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                                    : 'bg-slate-700 text-slate-400 border-slate-600'
                                                }`}>
                                                {selectedOrder.payoutStatus?.toUpperCase() || 'NONE'}
                                            </span>
                                        </div>

                                        {selectedOrder.collectionStatus === 'COLLECTED' && selectedOrder.payoutStatus !== 'released' && (
                                            <button
                                                onClick={async () => {
                                                    if (!confirm("Are you sure you have transferred funds to this vendor's account?")) return;
                                                    const { releasePayout } = await import('@/backend-actions/actions/admin')
                                                    const res = await releasePayout(selectedOrder.id)
                                                    if (res.success) {
                                                        toast.success('Payout released and vendor notified!')
                                                        setSelectedOrder(null)
                                                        const ordersRes = await getAllOrders()
                                                        if (ordersRes.success) setOrders(ordersRes.data)
                                                    } else {
                                                        toast.error('Failed to release payout: ' + res.error)
                                                    }
                                                }}
                                                className="px-5 py-2.5 bg-[#05DF72] hover:bg-[#04c965] text-slate-900 font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                                            >
                                                <CheckCircleIcon size={14} />
                                                RELEASE PAYOUT
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Logistics Section inside Sidebar */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logistics Controls</h3>
                            <div className="flex flex-col gap-3">
                                {selectedOrder.status !== 'COMPLETED' ? (
                                    <>
                                        <button
                                            onClick={async () => {
                                                if (!confirm("Are you sure you want to approve pickup and complete this order?")) return;
                                                const { adminApproveOrderPickup } = await import('@/backend-actions/actions/admin');
                                                const res = await adminApproveOrderPickup(selectedOrder.id);
                                                if (res.success) {
                                                    toast.success("Pickup approved! Order is now completed.");
                                                    setSelectedOrder(null);
                                                    const ordersRes = await getAllOrders();
                                                    if (ordersRes.success) setOrders(ordersRes.data);
                                                } else {
                                                    toast.error("Failed to approve pickup: " + res.error);
                                                }
                                            }}
                                            className="w-full py-4 bg-[#05DF72] hover:bg-[#04c764] text-slate-900 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                                        >
                                            <TruckIcon size={14} /> Approve Pickup
                                        </button>
                                        
                                        <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Reschedule Pickup Date</p>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="date"
                                                    id="admin-reschedule-date"
                                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:border-[#05DF72] outline-none"
                                                />
                                                <button
                                                    onClick={async () => {
                                                        const inputDate = document.getElementById('admin-reschedule-date')?.value;
                                                        if (!inputDate) {
                                                            toast.error("Please pick a reschedule date first.");
                                                            return;
                                                        }
                                                        if (!confirm(`Confirm reschedule to ${inputDate}?`)) return;
                                                        const { adminRescheduleOrderPickup } = await import('@/backend-actions/actions/admin');
                                                        const res = await adminRescheduleOrderPickup(selectedOrder.id, inputDate);
                                                        if (res.success) {
                                                            toast.success(`Pickup rescheduled to ${inputDate}`);
                                                            setSelectedOrder(null);
                                                            const ordersRes = await getAllOrders();
                                                            if (ordersRes.success) setOrders(ordersRes.data);
                                                        } else {
                                                            toast.error("Failed to reschedule: " + res.error);
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-colors"
                                                >
                                                    Submit
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                        <p className="text-green-700 text-xs font-black uppercase">Order Completed</p>
                                        <p className="text-green-600 text-[10px] mt-0.5">Logistics handling is complete.</p>
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
