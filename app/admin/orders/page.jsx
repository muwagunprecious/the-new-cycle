'use client'
import { useState } from "react"
import { SearchIcon, FilterIcon, EyeIcon, TruckIcon, CalendarIcon, MessageSquareIcon, XCircleIcon } from "lucide-react"
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

function XCircleIcon({ size }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
}

function CheckCircleIcon({ size }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
}
