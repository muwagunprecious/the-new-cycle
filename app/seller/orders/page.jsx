'use client'
import { useState, useEffect } from "react"
import { getSellerOrders, updateOrderStatus, requestReschedule, respondToReschedule } from "@/backend-actions/actions/order"
import { useSelector } from "react-redux"
import Loading from "@/components/Loading"
import { AlertCircle as AlertCircleIcon, CheckCircle as CheckCircleIcon, Calendar as CalendarIcon, Truck as TruckIcon, Wallet as WalletIcon, X as XIcon, Clock as ClockIcon, User, Phone, Copy } from "lucide-react"
import toast from "react-hot-toast"
import ScheduleCalendar from "@/components/ScheduleCalendar"
import RescheduleModal from "@/components/RescheduleModal"

export default function SellerOrders() {
    const { user } = useSelector(state => state.auth)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
    const [rescheduleLoading, setRescheduleLoading] = useState(false)

    useEffect(() => {
        if (user?.id) {
            fetchOrders(1)
        } else {
            setLoading(false)
        }
    }, [user])

    const fetchOrders = async (page) => {
        if (page === 1) setLoading(true)
        const res = await getSellerOrders(user.id, page, 20)
        if (res.success) {
            if (page === 1) {
                setOrders(res.orders)
            } else {
                setOrders(prev => [...prev, ...res.orders])
            }
            setPagination(res.pagination)
        }
        setLoading(false)
    }

    const loadMoreOrders = () => {
        if (pagination.page < pagination.totalPages) {
            fetchOrders(pagination.page + 1)
        }
    }


    const handleRescheduleRequest = async (newDate) => {
        setRescheduleLoading(true)
        const res = await requestReschedule(selectedOrder.id, newDate.date, 'SELLER')
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

    const handleSellerRescheduleAction = async (orderId, action, alternateDate = null) => {
        setRescheduleLoading(true)
        const res = await respondToReschedule(orderId, action, alternateDate, 'SELLER')
        if (res.success) {
            setOrders(orders.map(o => o.id === orderId ? res.order : o))
            toast.success(action === 'ACCEPT' ? "Pickup date confirmed!" : "Counter-proposal sent!")
            setIsRescheduleModalOpen(false)
            setSelectedOrder(null)
        } else {
            toast.error(res.error || "Failed to respond")
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

    const handleVerifyOrder = async (orderId, code) => {
        setLoading(true)
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
            const response = await fetch(`${backendUrl}/api/orders/${orderId}/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            })
            const data = await response.json()
            if (data.success) {
                setOrders(orders.map(o => o.id === orderId ? data.data : o))
                toast.success("Order verified and completed!")
            } else {
                toast.error(data.message || "Invalid verification code")
            }
        } catch (error) {
            toast.error("Verification failed")
        }
        setLoading(false)
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
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center w-full">
                            <div className="flex items-start gap-4 flex-1">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${order.status === 'ORDER_PLACED' ? 'bg-orange-50 text-orange-500' : (order.status === 'COMPLETED' ? 'bg-green-50 text-green-500' : 'bg-[#05DF72]/10 text-[#05DF72]')}`}>
                                    {order.status === 'ORDER_PLACED' ? <AlertCircleIcon /> : <CheckCircleIcon />}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                        <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none truncate max-w-[150px] sm:max-w-none">{order.transactionId || order.id}</span>
                                        <span className={`status-badge text-[9px] sm:text-[10px] whitespace-nowrap ${order.status === 'ORDER_PLACED' ? 'status-pending' : (order.status === 'COMPLETED' ? 'status-picked' : 'status-approved')}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-600 line-clamp-1">{order.orderItems?.map(item => item.product?.name).join(', ') || 'Battery Order'}</p>
                                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5">
                                            <CalendarIcon size={12} />
                                            Ordered: {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[#05DF72]">
                                            <TruckIcon size={12} />
                                            Pickup: {order.collectionDate || 'Pending Selection'}
                                            {order.collectionStatus === 'RESCHEDULE_REQUESTED' && (
                                                <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black rounded-full animate-pulse">
                                                    RESCHEDULE PENDING
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Buyer & Verification Info */}
                            <div className="flex flex-wrap gap-6 items-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                                <div className="space-y-2 min-w-[140px]">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <User size={12} /> Buyer
                                    </p>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-black text-slate-900 leading-none">{order.user?.name}</p>
                                        {order.user?.phone && (
                                            <a href={`tel:${order.user.phone}`} className="text-[10px] font-bold text-[#05DF72] hover:underline flex items-center gap-1">
                                                <Phone size={10} /> {order.user.phone}
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {order.status !== 'COMPLETED' && (
                                    <div className="space-y-2 bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100">
                                        <div className="flex items-center justify-between gap-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <CheckCircleIcon size={12} /> Code to share
                                            </p>
                                            {!order.isPaid && (
                                                <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-tight">
                                                    UNPAID
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black tracking-[0.2em] text-sm shadow-lg shadow-slate-900/20">
                                                {order.verificationCode || "GEN-ERR"}
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(order.verificationCode)
                                                    toast.success("Code copied!")
                                                }}
                                                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#05DF72] hover:border-[#05DF72] transition-all"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                        {!order.isPaid && (
                                            <p className="text-[8px] font-bold text-slate-400 leading-tight">
                                                Only share after confirming payment
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                            <span className="text-xl font-black text-slate-900">₦{(order.payoutAmount || order.total || 0).toLocaleString()}</span>
                            {order.isPaid && (
                                <div className="bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 flex items-center gap-1.5 mb-2 mt-1 w-full md:w-auto animate-in slide-in-from-right-4 duration-300">
                                    <AlertCircleIcon size={12} className="text-amber-500 shrink-0" />
                                    <span className="text-[9px] font-bold text-amber-700 uppercase tracking-widest leading-tight text-left md:text-right">
                                        5% Admin Platform Fee Deducted
                                    </span>
                                </div>
                            )}
                            <div className="flex gap-2 w-full md:w-auto mt-2">
                                {order.status === 'COMPLETED' || order.payoutStatus === 'released' ? (
                                     <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-100">
                                         <WalletIcon size={14} />
                                         <span className="text-xs font-black uppercase tracking-widest">
                                             Paid to Wallet
                                         </span>
                                     </div>
                                 ) : (
<div className="flex flex-col items-end gap-3 w-full">
                                          <div className="flex flex-wrap gap-2 justify-end w-full">
                                             {order.isPaid && (
                                                  <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg border border-blue-100">
                                                     <CheckCircleIcon size={14} />
                                                     <span className="text-xs font-bold uppercase tracking-widest">Payment Verified</span>
                                                 </div>
                                             )}
    
                                            {order.status === 'ORDER_PLACED' && !order.isPaid && (
                                                 <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-2 rounded-lg border border-amber-100">
                                                    <ClockIcon size={14} />
                                                    <span className="text-xs font-bold uppercase tracking-widest">Awaiting Payment</span>
                                                </div>
                                            )}
                                          </div>

                                          {/* Reschedule Management */}
                                          {order.status !== 'COMPLETED' && order.status !== 'PICKED_UP' && (
                                              <div className="w-full">
                                                  {order.collectionStatus === 'RESCHEDULE_REQUESTED' && order.proposedBy === 'BUYER' ? (
                                                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl space-y-3 mt-1">
                                                          <div className="flex items-center justify-between">
                                                              <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Buyer Proposed: {order.proposedDate}</p>
                                                              <span className="text-[8px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-black uppercase tracking-tight">Review Required</span>
                                                          </div>
                                                          <div className="flex gap-2">
                                                              <button 
                                                                  onClick={() => handleSellerRescheduleAction(order.id, 'ACCEPT')}
                                                                  className="flex-1 px-4 py-2 bg-[#05DF72] text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#04c764] transition-all"
                                                              >
                                                                  Accept
                                                              </button>
                                                              <button 
                                                                  onClick={() => {
                                                                      setSelectedOrder(order);
                                                                      setIsRescheduleModalOpen(true);
                                                                  }}
                                                                  className="flex-1 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all"
                                                              >
                                                                  Counter
                                                              </button>
                                                          </div>
                                                      </div>
                                                  ) : order.collectionStatus === 'RESCHEDULE_REQUESTED' && order.proposedBy === 'SELLER' ? (
                                                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2 mt-1">
                                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">You Proposed: {order.proposedDate}</p>
                                                          <div className="flex items-center gap-2">
                                                              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Awaiting Buyer Acceptance</p>
                                                          </div>
                                                          <button 
                                                              onClick={() => {
                                                                  setSelectedOrder(order);
                                                                  setIsRescheduleModalOpen(true);
                                                              }}
                                                              className="text-[9px] font-black text-[#05DF72] uppercase underline"
                                                          >
                                                              Change Proposal
                                                          </button>
                                                      </div>
                                                  ) : (
                                                      <button 
                                                          onClick={() => {
                                                              setSelectedOrder(order);
                                                              setIsRescheduleModalOpen(true);
                                                          }}
                                                          className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                                      >
                                                          <CalendarIcon size={14} /> Reschedule Pickup
                                                      </button>
                                                  )}
                                              </div>
                                          )}

                                          {order.status === 'PICKED_UP' && (
                                              <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg border border-blue-100">
                                                  <CheckCircleIcon size={14} />
                                                  <span className="text-xs font-bold uppercase tracking-widest">Picked Up</span>
                                              </div>
                                          )}
                                      </div>
                                )}
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
            {/* Reschedule Modal */}
            <RescheduleModal 
                isOpen={isRescheduleModalOpen}
                onClose={() => {
                    setIsRescheduleModalOpen(false);
                    setSelectedOrder(null);
                }}
                orderId={selectedOrder?.id}
                role="SELLER"
                onRescheduled={(updatedOrder) => {
                    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
                }}
            />
        </div>
    )
}
