'use client'
import { useState, useEffect } from "react"
import { getSellerOrders, updateOrderStatus, requestReschedule, respondToReschedule } from "@/backend-actions/actions/order"
import { useSelector } from "react-redux"
import Loading from "@/components/Loading"
import { AlertCircle as AlertCircleIcon, CheckCircle as CheckCircleIcon, Calendar as CalendarIcon, Truck as TruckIcon, Wallet as WalletIcon, X as XIcon, Clock as ClockIcon, User, Phone, Copy } from "lucide-react"
import toast from "react-hot-toast"
import ScheduleCalendar from "@/components/ScheduleCalendar"
import RescheduleModal from "@/components/RescheduleModal"
import BottomActionSheet from "@/components/BottomActionSheet"

export default function SellerOrders() {
    const { user } = useSelector(state => state.auth)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
    const [isActionSheetOpen, setIsActionSheetOpen] = useState(false)
    const [rescheduleLoading, setRescheduleLoading] = useState(false)

    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        let isMounted = true
        console.log("SellerOrders: User status:", !!user, user?.id)
        
        // Safety timeout to prevent infinite loading
        const safetyTimer = setTimeout(() => {
            if (isMounted && loading) {
                setLoading(false)
                console.warn("SellerOrders: Loading timed out after 10s")
            }
        }, 10000)

        if (user?.id) {
            fetchOrders(1)
        } else {
            // If no user after 3s, stop loading
            const timer = setTimeout(() => {
                if (isMounted && !user?.id) setLoading(false)
            }, 3000)
            return () => {
                clearTimeout(timer)
                clearTimeout(safetyTimer)
                isMounted = false
            }
        }

        return () => {
            clearTimeout(safetyTimer)
            isMounted = false
        }
    }, [user?.id])

    const fetchOrders = async (page) => {
        if (!user?.id) return
        try {
            if (page === 1) setLoading(true)
            const res = await getSellerOrders(user.id, page, 20)
            if (res.success) {
                if (page === 1) {
                    setOrders(res.orders)
                } else {
                    setOrders(prev => [...prev, ...res.orders])
                }
                setPagination(res.pagination)
            } else {
                console.error("Failed to fetch orders:", res.error)
                toast.error(res.error || "Could not load orders")
            }
        } catch (err) {
            console.error("Fetch error:", err)
            toast.error("An error occurred while fetching orders")
        } finally {
            setLoading(false)
        }
    }

    const loadMoreOrders = () => {
        if (pagination.page < pagination.totalPages) {
            fetchOrders(pagination.page + 1)
        }
    }

    const handleSellerRescheduleAction = async (orderId, action, alternateDate = null) => {
        setRescheduleLoading(true)
        const res = await respondToReschedule(orderId, action, alternateDate, 'SELLER')
        if (res.success) {
            const updatedOrder = res.data || res.order || res
            setOrders(orders.map(o => o.id === orderId ? updatedOrder : o))
            toast.success(action === 'ACCEPT' ? "Pickup date confirmed!" : (action === 'REJECT' ? "Reschedule declined" : "Counter-proposal sent!"))
            setIsRescheduleModalOpen(false)
            setSelectedOrder(null)
        } else {
            toast.error(res.error || "Failed to respond")
        }
        setRescheduleLoading(false)
    }

    const filteredOrders = orders.filter(order => {
        const searchLower = searchTerm.toLowerCase()
        return (
            order.user?.name?.toLowerCase().includes(searchLower) ||
            order.user?.phone?.toLowerCase().includes(searchLower) ||
            order.transactionId?.toLowerCase().includes(searchLower) ||
            order.verificationCode?.toLowerCase().includes(searchLower)
        )
    })

    if (loading) return <Loading />

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Incoming <span className="text-[#05DF72]">Orders</span></h1>
                    <p className="text-slate-500 mt-1">Manage pickups and track your sales progress.</p>
                </div>
                
                <div className="relative group min-w-[300px]">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#05DF72] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input 
                        type="text"
                        placeholder="Search name, phone, or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-[#05DF72] focus:ring-4 focus:ring-[#05DF72]/5 transition-all outline-none font-bold text-sm shadow-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-[2.5rem] border-2 border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#05DF72]/20 transition-all group">
                        {/* 1. Header Section: ID & Status */}
                        <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#05DF72] animate-pulse" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{order.transactionId || order.id}</span>
                            </div>
                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'ORDER_PLACED' ? 'bg-orange-100 text-orange-600' : (order.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600')}`}>
                                {order.status.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* 2. Product & Logistics Section */}
                            <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                                <div className="space-y-2 flex-1">
                                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                                        {order.orderItems?.map(item => item.product?.name).join(', ')}
                                    </h3>
                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                                        <TruckIcon size={14} className="text-[#05DF72]" />
                                        <span>{order.product?.lga || 'Surulere'} - {order.product?.state || 'Lagos'}</span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col md:items-end gap-1 shrink-0">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <CalendarIcon size={12} /> Ordered: {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-[#05DF72] uppercase tracking-widest">
                                        <ClockIcon size={12} /> Pickup: {order.collectionDate || 'Pending'}
                                    </div>
                                </div>
                            </div>

                            {/* 3. Handoff Core: The "Boxed" Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Verification Box */}
                                <div className="bg-slate-900 rounded-3xl p-6 text-white flex items-center justify-between shadow-xl shadow-slate-900/10 group-hover:scale-[1.02] transition-transform">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Code to Share</p>
                                        <p className="text-3xl font-black tracking-[0.15em]">{order.verificationCode || '---'}</p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(order.verificationCode);
                                            toast.success("Code copied!");
                                        }}
                                        className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-[#05DF72] hover:text-slate-900 transition-all"
                                    >
                                        <Copy size={20} />
                                    </button>
                                </div>

                                {/* Buyer Box */}
                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Buyer</p>
                                        <p className="text-base font-black text-slate-900">{order.user?.name || 'Adebayo Ecovolt'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Action & Pricing Section */}
                            <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-slate-900 leading-none">₦{(order.payoutAmount || order.total || 0).toLocaleString()}</span>
                                        {!order.isPaid ? (
                                            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1">Awaiting Payment</span>
                                        ) : (
                                            <span className="text-[9px] font-black text-[#05DF72] uppercase tracking-widest mt-1">Platform Fee Deducted</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    {order.status !== 'COMPLETED' && order.status !== 'PICKED_UP' && (
                                        <div className="flex flex-col gap-3 w-full md:w-auto">
                                            {order.collectionStatus === 'RESCHEDULE_REQUESTED' && (
                                                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-2">
                                                            <ClockIcon size={12} /> {order.proposedBy === 'BUYER' ? 'Buyer Requested' : 'You Requested'}
                                                        </p>
                                                        <span className="text-[10px] font-black text-amber-900">{order.proposedDate}</span>
                                                    </div>
                                                    
                                                    {order.proposedBy === 'BUYER' && (
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => handleSellerRescheduleAction(order.id, 'ACCEPT')} 
                                                                className="flex-1 bg-[#05DF72] text-slate-900 font-black text-[10px] uppercase tracking-widest py-2.5 rounded-lg hover:bg-[#04c764] transition-all"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button 
                                                                onClick={() => handleSellerRescheduleAction(order.id, 'REJECT')} 
                                                                className="flex-1 bg-red-50 text-red-600 border border-red-100 font-black text-[10px] uppercase tracking-widest py-2.5 rounded-lg hover:bg-red-100 transition-all"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2 pt-2 border-t border-amber-100">
                                                        <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-slate-400">
                                                            <User size={12} />
                                                        </div>
                                                        <p className="text-[9px] font-bold text-slate-500">{order.user?.name} • {order.user?.phone || 'No phone'}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <button 
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setIsActionSheetOpen(true);
                                                }}
                                                className="px-8 py-4 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                                            >
                                                <CalendarIcon size={16} /> Manage Pickup
                                            </button>
                                        </div>
                                    )}

                                    {order.status === 'PICKED_UP' && (
                                        <div className="bg-blue-50 text-blue-600 px-6 py-3 rounded-xl border border-blue-100 flex items-center gap-2">
                                            <CheckCircleIcon size={18} />
                                            <span className="text-xs font-black uppercase tracking-widest">Picked Up</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {pagination.page < pagination.totalPages && (
                <div className="flex justify-center pt-8">
                    <button
                        onClick={loadMoreOrders}
                        className="btn-primary !bg-white !text-slate-900 border border-slate-200 hover:border-[#05DF72] !shadow-none hover:!bg-[#05DF72]/5"
                    >
                        Load More Orders
                    </button>
                </div>
            )}

            {orders.length === 0 && (
                <div className="p-20 text-center card bg-slate-50 border-dashed">
                    <p className="text-slate-400">No incoming orders yet.</p>
                </div>
            )}

            {/* Action Sheet */}
            <BottomActionSheet
                isOpen={isActionSheetOpen}
                onClose={() => {
                    setIsActionSheetOpen(false);
                    setSelectedOrder(null);
                }}
                title="Order Details"
                subtitle={selectedOrder?.transactionId || selectedOrder?.id}
            >
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Buyer Information</p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">{selectedOrder?.user?.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Customer</p>
                                </div>
                            </div>

                            {selectedOrder?.user?.phone && (
                                <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[#05DF72]">
                                            <Phone size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{selectedOrder.user.phone}</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedOrder.user.phone);
                                            toast.success("Phone copied!");
                                        }}
                                        className="p-2 text-slate-400 hover:text-[#05DF72] transition-colors"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Products</p>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-sm font-bold text-slate-700 leading-relaxed">
                                {selectedOrder?.orderItems?.map(item => item.product?.name).join(', ')}
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pickup Logistics</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#05DF72] shadow-sm">
                                <TruckIcon size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900">
                                    {selectedOrder?.collectionDate ? new Date(selectedOrder.collectionDate).toLocaleDateString() : 'Pending Date Selection'}
                                </p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Confirmed Pickup Date</p>
                            </div>
                        </div>
                    </div>

                    {selectedOrder?.collectionStatus === 'RESCHEDULE_REQUESTED' && (
                        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Reschedule Proposal</p>
                                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[8px] font-black rounded-full uppercase">Review</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-900">
                                    <CalendarIcon size={16} />
                                    <span className="text-sm font-black">{selectedOrder.proposedDate}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">({selectedOrder.proposedBy === 'SELLER' ? 'You' : 'Buyer'})</span>
                                </div>
                                {selectedOrder.proposedBy === 'BUYER' ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => { handleSellerRescheduleAction(selectedOrder.id, 'ACCEPT'); setIsActionSheetOpen(false); }} className="flex-1 bg-[#05DF72] text-slate-900 font-black text-[10px] uppercase tracking-widest py-4 rounded-xl hover:bg-[#04c764] transition-all">Accept</button>
                                        <button onClick={() => { handleSellerRescheduleAction(selectedOrder.id, 'REJECT'); setIsActionSheetOpen(false); }} className="flex-1 bg-red-50 text-red-600 border border-red-100 font-black text-[10px] uppercase tracking-widest py-4 rounded-xl">Reject</button>
                                        <button onClick={() => { setIsActionSheetOpen(false); setIsRescheduleModalOpen(true); }} className="flex-1 bg-white border border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest py-4 rounded-xl">Counter</button>
                                    </div>
                                ) : (
                                    <button onClick={() => { setIsActionSheetOpen(false); setIsRescheduleModalOpen(true); }} className="w-full text-[10px] font-black text-[#05DF72] uppercase underline tracking-widest py-2 text-left">Change Proposal</button>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedOrder?.collectionStatus !== 'RESCHEDULE_REQUESTED' && selectedOrder?.status !== 'COMPLETED' && (
                        <button onClick={() => { setIsActionSheetOpen(false); setIsRescheduleModalOpen(true); }} className="w-full bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                            <CalendarIcon size={14} /> Request Reschedule
                        </button>
                    )}
                </div>
            </BottomActionSheet>

            <RescheduleModal 
                isOpen={isRescheduleModalOpen}
                onClose={() => { setIsRescheduleModalOpen(false); setSelectedOrder(null); }}
                orderId={selectedOrder?.id}
                role="SELLER"
                onRescheduled={(updatedOrder) => { setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o)); }}
            />
        </div>
    )
}
