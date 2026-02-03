'use client'
import { useState, useEffect } from "react"
import { getSellerOrders, updateOrderStatus, requestReschedule } from "@/backend/actions/order"
import { useSelector } from "react-redux"
import Loading from "@/components/Loading"
import { AlertCircleIcon, CheckCircleIcon, CalendarIcon, TruckIcon, WalletIcon, XIcon, ClockIcon } from "lucide-react"
import toast from "react-hot-toast"
import ScheduleCalendar from "@/components/ScheduleCalendar"

export default function SellerOrders() {
    const { user } = useSelector(state => state.auth)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
    const [rescheduleLoading, setRescheduleLoading] = useState(false)

    useEffect(() => {
        if (user?.id) {
            fetchOrders()
        } else {
            setLoading(false)
        }
    }, [user])

    const fetchOrders = async () => {
        const res = await getSellerOrders(user.id)
        if (res.success) {
            setOrders(res.orders)
        }
        setLoading(false)
    }

    const handleRescheduleRequest = async (newDate) => {
        setRescheduleLoading(true)
        const res = await requestReschedule(selectedOrder.id, newDate.date)
        if (res.success) {
            setOrders(orders.map(o => o.id === selectedOrder.id ? res.order : o))
            toast.success("Reschedule request sent to buyer")
            setIsRescheduleModalOpen(false)
            setSelectedOrder(null)
        } else {
            toast.error(res.error || "Failed to send reschedule request")
        }
        setRescheduleLoading(false)
    }

    const updateStatus = async (id, newStatus) => {
        const res = await updateOrderStatus(id, newStatus)
        if (res.success) {
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o))
            toast.success(`Order ${newStatus.toLowerCase().replace('_', ' ')}`)
        } else {
            toast.error(res.error || "Failed to update status")
        }
    }

    if (loading) return <Loading />

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Incoming <span className="text-[#05DF72]">Orders</span></h1>
                <p className="text-slate-500 mt-1">Manage pickups and track your sales progress.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {orders.map((order) => (
                    <div key={order.id} className="card p-6 bg-white flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group">
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${order.status === 'Pending' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
                                {order.status === 'Pending' ? <AlertCircleIcon /> : <CheckCircleIcon />}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-slate-900">{order.id}</span>
                                    <span className={`status-badge ${order.status === 'Pending' ? 'status-pending' : (order.status === 'Picked' ? 'status-picked' : 'status-approved')}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-slate-600 line-clamp-1">{order.orderItems?.map(item => item.product?.name).join(', ') || 'Battery Order'}</p>
                                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon size={14} />
                                        Ordered: {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1 text-[#05DF72] font-semibold">
                                        <TruckIcon size={14} />
                                        Pickup: {order.collectionDate || 'Pending Selection'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                            <span className="text-xl font-bold text-slate-900">₦{(order.total || 0).toLocaleString()}</span>
                            <div className="flex gap-2 w-full md:w-auto mt-2">
                                {order.status === 'COMPLETED' ? (
                                    <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-100">
                                        <WalletIcon size={14} />
                                        <span className="text-xs font-black uppercase tracking-widest">
                                            {order.payoutStatus === 'released' ? 'Paid to Wallet' : 'Payout Pending'}
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        {(order.status === 'ORDER_PLACED' || order.status === 'PAID') && (
                                            <>
                                                <button onClick={() => updateStatus(order.id, 'APPROVED')} className="flex-1 md:flex-none btn-primary !py-2 !px-4 text-sm">Accept Order</button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order)
                                                        setIsRescheduleModalOpen(true)
                                                    }}
                                                    className="flex-1 md:flex-none px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 hover:bg-slate-50"
                                                >
                                                    Reschedule
                                                </button>
                                            </>
                                        )}
                                        {order.collectionStatus === 'RESCHEDULE_REQUESTED' && (
                                            <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-2 rounded-lg border border-amber-100">
                                                <ClockIcon size={14} />
                                                <span className="text-xs font-bold uppercase tracking-widest">Reschedule Requested</span>
                                            </div>
                                        )}
                                        {order.status === 'APPROVED' && (
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Collection Code</span>
                                                <div className="text-xl font-black text-[#05DF72] tracking-widest bg-[#05DF72]/10 px-3 py-1 rounded-lg border border-[#05DF72]/20 mt-1">
                                                    {order.collectionToken}
                                                </div>
                                                <span className="text-[10px] text-slate-400 mt-1">Share with buyer to confirm pickup</span>
                                            </div>
                                        )}
                                        {order.status === 'PICKED_UP' && (
                                            <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg border border-blue-100">
                                                <CheckCircleIcon size={14} />
                                                <span className="text-xs font-bold uppercase tracking-widest">Picked Up</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {orders.length === 0 && (
                <div className="p-20 text-center card bg-slate-50 border-dashed">
                    <p className="text-slate-400">No incoming orders yet.</p>
                </div>
            )}
            {/* Reschedule Modal */}
            {isRescheduleModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 leading-none">Reschedule <span className="text-[#05DF72]">Pickup</span></h3>
                                <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">Select a new proposed date for the buyer</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsRescheduleModalOpen(false)
                                    setSelectedOrder(null)
                                }}
                                className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:shadow-lg transition-all"
                            >
                                <XIcon size={24} />
                            </button>
                        </div>

                        <div className="p-8">
                            <ScheduleCalendar onSelect={(dateInfo) => handleRescheduleRequest(dateInfo)} />

                            {rescheduleLoading && (
                                <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center z-10">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-10 h-10 border-4 border-[#05DF72] border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Sending Request...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
