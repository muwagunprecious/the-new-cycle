'use client'
import { useState } from "react"
import { getSellerOrders, updateOrderStatus } from "@/backend/actions/order"
import { useSelector } from "react-redux"
import { useEffect } from "react"
import Loading from "@/components/Loading"

export default function SellerOrders() {
    const { user } = useSelector(state => state.auth)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

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
                                {order.status === 'Pending' ? <AlertCircleIcon /> : <CheckCircle2Icon />}
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
                                {(order.status === 'ORDER_PLACED' || order.status === 'PAID') && (
                                    <>
                                        <button onClick={() => updateStatus(order.id, 'APPROVED')} className="flex-1 md:flex-none btn-primary !py-2 !px-4 text-sm">Accept Order</button>
                                        <button className="flex-1 md:flex-none px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 hover:bg-slate-50">Reschedule</button>
                                    </>
                                )}
                                {order.status === 'APPROVED' && (
                                    <button onClick={() => updateStatus(order.id, 'PICKED_UP')} className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Mark as Picked</button>
                                )}
                                {order.status === 'PICKED_UP' && (
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting Verification</span>
                                )}
                                {order.status === 'COMPLETED' && (
                                    <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Order Completed</span>
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
        </div>
    )
}
