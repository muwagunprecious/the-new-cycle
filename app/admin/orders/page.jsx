'use client'
import { useState } from "react"
import { SearchIcon, FilterIcon, EyeIcon, TruckIcon, CalendarIcon, MessageSquareIcon, XCircleIcon, CheckCircleIcon } from "lucide-react"
import { getAllOrders } from "@/backend/actions/order"
import { useEffect } from "react"
import Loading from "@/components/Loading"

export default function OrderManagement() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            const res = await getAllOrders()
            if (res.success) {
                setOrders(res.data)
            }
            setLoading(false)
        }
        fetchOrders()
    }, [])

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

            {/* Mock Modal for Details */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-slate-900">Order Details - {selectedOrder.id}</h2>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                <XCircleIcon size={24} />
                            </button>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Buyer Information</h3>
                                    <p className="text-slate-900 font-medium">{selectedOrder.user?.name || 'Unknown'}</p>
                                    <p className="text-sm text-slate-500">Email: {selectedOrder.user?.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Vendor Information</h3>
                                    <p className="text-slate-900 font-medium">{selectedOrder.store?.name || selectedOrder.storeId}</p>
                                    <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 bg-[#05DF72]/10 text-[#05DF72] rounded text-[10px] font-bold">
                                        {(selectedOrder.store?.isVerified || true) ? 'VERIFIED VENDOR' : 'PENDING VERIFICATION'}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Tracking Progress</h3>
                                <div className="flex items-center justify-between relative mt-8">
                                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 -z-0"></div>
                                    <div className="absolute top-1/2 left-0 w-1/2 h-1 bg-[#05DF72] -translate-y-1/2 -z-0 transition-all duration-1000"></div>

                                    {['Pending', 'Approved', 'Picked', 'Transit', 'Completed'].map((step, idx) => (
                                        <div key={step} className="flex flex-col items-center gap-3 relative z-10">
                                            <div className={`w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-md ${idx <= 2 ? 'bg-[#05DF72] text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                {idx < 2 ? <CheckCircleIcon size={16} /> : (idx === 2 ? <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> : idx + 1)}
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-tighter ${idx <= 2 ? 'text-slate-900' : 'text-slate-400'}`}>{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Vendor Bank Details & Payout Section */}
                            {/* Vendor Bank Details & Payout Section */}
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#05DF72]/10 rounded-full blur-3xl"></div>

                                <h3 className="text-xs font-bold text-[#05DF72] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#05DF72]"></div>
                                    Vendor Payout Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                        <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Bank Name</p>
                                        <p className="font-bold text-lg">{selectedOrder.store?.bankName || 'Not Provided'}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                        <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Account Number</p>
                                        <p className="font-mono text-lg font-bold tracking-wider">{selectedOrder.store?.accountNumber || 'Not Provided'}</p>
                                    </div>
                                    <div className="md:col-span-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                                        <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Account Name</p>
                                        <p className="font-bold text-lg uppercase">{selectedOrder.store?.accountName || 'Not Provided'}</p>
                                    </div>
                                </div>

                                {/* Collection Code Status */}
                                <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Collection Token</p>
                                            <p className="font-mono text-2xl font-black text-[#05DF72]">{selectedOrder.collectionToken || '---'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Verification Status</p>
                                            <span className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${selectedOrder.collectionStatus === 'COLLECTED'
                                                ? 'bg-[#05DF72] text-slate-900'
                                                : 'bg-white/10 text-slate-400'
                                                }`}>
                                                {selectedOrder.collectionStatus || 'PENDING'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payout Status & Action */}
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10">
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-black mb-2">Payout Release Status</p>
                                        <div className="flex items-center gap-3">
                                            <span className={`status-badge-big ${selectedOrder.payoutStatus === 'released'
                                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                : selectedOrder.payoutStatus === 'pending'
                                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                                    : 'bg-slate-700 text-slate-400 border-slate-600'
                                                }`}>
                                                {selectedOrder.payoutStatus?.toUpperCase() || 'NONE'}
                                            </span>
                                            {selectedOrder.payoutStatus === 'released' && (
                                                <span className="text-[10px] font-bold text-slate-400">Funds Transferred</span>
                                            )}
                                        </div>
                                    </div>

                                    {selectedOrder.collectionStatus === 'COLLECTED' && selectedOrder.payoutStatus !== 'released' && (
                                        <button
                                            onClick={async () => {
                                                if (!confirm("Are you sure you have transferred funds to this vendor's account?")) return;
                                                const { releasePayout } = await import('@/backend/actions/admin')
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
                                            className="w-full md:w-auto px-8 py-4 bg-[#05DF72] hover:bg-[#04c965] text-slate-900 font-black rounded-2xl transition-all shadow-lg shadow-[#05DF72]/20 flex items-center justify-center gap-2 group"
                                        >
                                            <CheckCircleIcon size={20} className="group-hover:scale-110 transition-transform" />
                                            APPROVE & RELEASE PAYOUT
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logistics Actions</h3>
                                <div className="flex flex-wrap gap-3">
                                    <button className="flex-1 btn-primary text-sm !py-3">
                                        <TruckIcon size={16} />
                                        Approve Pickup
                                    </button>
                                    <button className="flex-1 border border-slate-200 text-slate-600 px-6 py-3 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
                                        Reschedule Pickup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
