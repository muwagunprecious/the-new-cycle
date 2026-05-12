'use client'
import { Package as PackageIcon, ShoppingCart as ShoppingCartIcon, CreditCard as CreditCardIcon, ShieldCheck as ShieldCheckIcon, MapPin as MapPinIcon, Calendar as CalendarIcon, Copy as CopyIcon, CheckCircle as CheckCircleIcon, AlertCircle as AlertCircleIcon, Clock as ClockIcon, Check as CheckIcon, MessageSquare as MessageSquareIcon } from "lucide-react"
import Loading from "@/components/Loading"
import { useState, useEffect } from "react"
import { productDummyData } from "@/assets/assets"
import Link from "next/link"
import BottomActionSheet from "@/components/BottomActionSheet"
import { useDispatch, useSelector } from "react-redux"
import { updateProfile } from "@/lib/features/auth/authSlice"
import { getUserProfile } from "@/backend-actions/actions/auth"
import ProductCard from "@/components/ProductCard"
import toast from "react-hot-toast"
import { getUserOrders, verifyOrderCollection, requestReschedule, respondToReschedule } from "@/backend-actions/actions/order"
import { getNotifications } from "@/backend-actions/actions/notification"

export default function BuyerDashboard() {
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState([])
    const [verifyToken, setVerifyToken] = useState('')
    const [verifying, setVerifying] = useState(false)
    const [isActionSheetOpen, setIsActionSheetOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [notifications, setNotifications] = useState([])
    const [rescheduleDate, setRescheduleDate] = useState('')
    const [rescheduleReason, setRescheduleReason] = useState('')
    const [isRescheduling, setIsRescheduling] = useState(false)
    const [isResponding, setIsResponding] = useState(false)
    const [showRescheduleForm, setShowRescheduleForm] = useState(false)

    useEffect(() => {
        const load = async () => {
            if (user?.id) {
                const [ordersRes, notifyRes, profileRes] = await Promise.all([
                    getUserOrders(user.id),
                    getNotifications(user.id),
                    getUserProfile(user.id)
                ])
                if (ordersRes.success) setOrders(ordersRes.data)
                if (notifyRes.success) setNotifications(notifyRes.data)

                if (profileRes.success && profileRes.data) {
                    const serialized = { ...profileRes.data }
                    for (const key of Object.keys(serialized)) {
                        if (serialized[key] instanceof Date) {
                            serialized[key] = serialized[key].toISOString()
                        }
                    }
                    dispatch(updateProfile(serialized))
                }
            }
            setLoading(false)
        }
        load()
    }, [user?.id, dispatch])

    const executePickupVerification = async (e, orderId) => {
        e.preventDefault()
        console.log("[CLIENT] Verifying Pickup. OrderID:", orderId, "Token:", verifyToken)
        if (!verifyToken || verifyToken.length < 6) {
            toast.error("Please enter the 6-digit verification code")
            return
        }

        setVerifying(true)
        const res = await verifyOrderCollection(orderId, verifyToken)
        setVerifying(false)

        if (res.success) {
            toast.success("Pickup confirmed!")
            const updatedOrder = res.data || res.order
            setOrders(orders.map(o => o.id === orderId ? updatedOrder : o))
            setVerifyToken('')
            setSelectedOrder(null)
            setIsActionSheetOpen(false)
        } else {
            toast.error(res.error || "Invalid code. Please check with seller.")
        }
    }

    const handleReschedule = async (e) => {
        e.preventDefault()
        if (!rescheduleDate) {
            toast.error("Please select a new date")
            return
        }

        setIsRescheduling(true)
        const res = await requestReschedule(selectedOrder.id, rescheduleDate, 'BUYER', rescheduleReason)
        setIsRescheduling(false)

        if (res.success) {
            toast.success("Reschedule request sent to seller")
            setOrders(orders.map(o => o.id === selectedOrder.id ? res.order : o))
            setShowRescheduleForm(false)
            setRescheduleDate('')
            setRescheduleReason('')
            setIsActionSheetOpen(false)
        } else {
            toast.error(res.error || "Failed to request reschedule")
        }
    }

    const handleRescheduleResponse = async (action) => {
        setIsResponding(true)
        const res = await respondToReschedule(selectedOrder.id, action, null, 'BUYER')
        setIsResponding(false)

        if (res.success) {
            toast.success(action === 'ACCEPT' ? "Pickup date confirmed!" : "Counter-proposal logic pending")
            setOrders(orders.map(o => o.id === selectedOrder.id ? res.order : o))
            setIsActionSheetOpen(false)
        } else {
            toast.error(res.error || "Action failed")
        }
    }

    if (loading) return <Loading />

    const metrics = [
        { label: 'Total Orders', value: orders.length, icon: PackageIcon, color: 'text-[#05DF72]', bg: 'bg-[#05DF72]/10' },
        { label: 'Pending Pickups', value: orders.filter(o => ['AWAITING_PICKUP', 'PAID', 'ORDER_PLACED', 'APPROVED'].includes(o.status)).length, icon: ClockIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Completed', value: orders.filter(o => o.status === 'COMPLETED').length, icon: CheckCircleIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Spent', value: '₦' + orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString(), icon: CreditCardIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
    ]

    const resolveStatusBadge = (order) => {
        if (!order.isPaid) return { bg: 'bg-orange-100 text-orange-700 font-black', label: 'Payment Pending' }
        switch (order.status) {
            case 'AWAITING_PICKUP':
            case 'PAID':
            case 'ORDER_PLACED':
            case 'APPROVED':
                return { bg: 'bg-amber-50 text-amber-600', label: 'Ready for Pickup' }
            case 'PICKED_UP':
                return { bg: 'bg-blue-50 text-blue-600', label: 'Picked Up' }
            case 'COMPLETED':
                return { bg: 'bg-[#05DF72]/10 text-[#05DF72]', label: 'Completed' }
            default:
                return { bg: 'bg-slate-100 text-slate-500', label: order.status }
        }
    }

    const orderedProductIds = orders.map(o => o.productId)
    const suggestedProducts = productDummyData.filter(p => !orderedProductIds.includes(p.id)).slice(0, 4)

    const isVerified = user?.accountStatus === 'approved'
    const isRejected = user?.accountStatus === 'rejected'

    return (
        <div className="relative space-y-12 min-h-[80vh]">
            {isRejected && (
                <div className="fixed inset-0 z-50 bg-red-50/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-xl border border-red-100">
                        <AlertCircleIcon className="text-red-500 mx-auto mb-8" size={48} />
                        <h2 className="text-4xl font-black text-slate-900 mb-4">Verification Rejected</h2>
                        <p className="text-slate-500 mb-10 leading-relaxed text-lg">Unfortunately, your buyer account verification was not approved.</p>
                        <div className="flex flex-col gap-4">
                            <button onClick={() => window.location.href = 'mailto:support@gocycle.com'} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold shadow-lg">Contact Support</button>
                            <button onClick={() => window.location.href = '/'} className="text-slate-400 text-sm font-bold">Back to Home</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={isRejected ? 'blur-xl pointer-events-none opacity-50 grayscale' : ''}>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`flex items-center gap-1 font-black uppercase tracking-widest text-[10px] ${isVerified ? 'text-[#05DF72]' : 'text-slate-400'}`}>
                                <ShieldCheckIcon size={16} /> {isVerified ? 'Verified Buyer' : 'Unverified Account'}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 leading-tight">My <span className="text-[#05DF72]">Dashboard</span></h1>
                        <p className="text-slate-400 font-bold text-sm mt-1">Welcome back, {user?.name || 'Buyer'}!</p>
                    </div>
                    <Link href={isVerified ? "/shop" : "#"} onClick={() => !isVerified && toast.error("Verification required")} className={`btn-primary ${!isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <ShoppingCartIcon size={18} /> Browse Batteries
                    </Link>
                </div>

                {orders.some(order => ['APPROVED', 'ORDER_PLACED', 'PAID', 'AWAITING_PICKUP'].includes(order.status) && order.isPaid) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-[2.5rem] p-8 md:p-10">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full animate-pulse">Action Required</span>
                            <h2 className="text-2xl font-black text-slate-900">Verify Pickup</h2>
                        </div>
                        <div className="grid gap-4">
                            {orders.filter(o => ['APPROVED', 'ORDER_PLACED', 'PAID', 'AWAITING_PICKUP'].includes(o.status) && o.isPaid).map(order => (
                                <div key={order.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-amber-100 flex flex-col gap-8 transition-all hover:shadow-md">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-[#05DF72]/10 text-[#05DF72] rounded-2xl flex items-center justify-center shrink-0">
                                                <PackageIcon size={28} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 text-lg leading-tight">{order.orderItems?.map(i => i.product?.name).join(', ') || 'Battery Order'}</h3>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Order ID: {order.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-amber-50 px-5 py-3 rounded-2xl border border-amber-100 self-start md:self-auto">
                                            <CalendarIcon size={18} className="text-amber-600" />
                                            <div>
                                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter leading-none mb-1">Agreed Date</p>
                                                <p className="text-sm font-black text-slate-900 leading-none">
                                                    {order.collectionDate ? new Date(order.collectionDate).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Pending Confirmation'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {order.collectionStatus === 'RESCHEDULE_REQUESTED' && order.proposedBy === 'SELLER' && (
                                        <div className="bg-amber-50 border-y border-amber-100 -mx-8 px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <CalendarIcon size={18} className="text-amber-600 shrink-0" />
                                                <p className="text-xs font-bold text-amber-900">
                                                    Seller proposed a new pickup date: <span className="font-black underline">{new Date(order.proposedDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => { setSelectedOrder(order); setIsActionSheetOpen(true); }}
                                                className="px-6 py-2 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 whitespace-nowrap"
                                            >
                                                Review & Respond
                                            </button>
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-slate-50 items-end">
                                        <div className="space-y-5">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                                    <MapPinIcon size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pickup Address</p>
                                                    <p className="text-sm font-bold text-slate-700 leading-snug">{order.store?.address || 'Address pending...'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                                    <MessageSquareIcon size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Seller Contact</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-black text-slate-800">{order.store?.contact || 'N/A'}</p>
                                                        {order.store?.contact && (
                                                            <a href={`tel:${order.store.contact}`} className="text-[10px] font-black text-[#05DF72] uppercase hover:underline ml-2">Call Now</a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button 
                                                onClick={() => { setSelectedOrder(order); setShowRescheduleForm(true); setIsActionSheetOpen(true); }}
                                                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-[1.25rem] font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                <CalendarIcon size={14} /> Reschedule
                                            </button>
                                            <button 
                                                onClick={() => { setSelectedOrder(order); setShowRescheduleForm(false); setIsActionSheetOpen(true); }}
                                                className="flex-[1.5] py-4 bg-[#05DF72] text-white rounded-[1.25rem] font-black uppercase text-[10px] tracking-widest hover:bg-[#04c764] transition-all shadow-xl shadow-[#05DF72]/20 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircleIcon size={14} /> Verify Pickup
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {metrics.map((stat) => (
                        <div key={stat.label} className="bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-lg border border-slate-100">
                            <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}><stat.icon size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 mt-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-slate-900">My Orders</h2>
                        <span className="text-xs font-bold text-slate-400">{orders.length} order(s)</span>
                    </div>

                    {orders.length === 0 ? (
                        <div className="text-center py-16">
                            <PackageIcon className="mx-auto text-slate-300 mb-4" size={64} />
                            <h3 className="text-lg font-bold text-slate-900">No Orders Yet</h3>
                            <p className="text-slate-500 mt-2">Start shopping to see your orders here.</p>
                            <Link href="/shop" className="inline-block mt-6 btn-primary">Browse Batteries</Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => {
                                const badge = resolveStatusBadge(order)
                                return (
                                    <div key={order.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-[#05DF72] shadow-sm"><PackageIcon size={28} /></div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{order.orderItems?.map(i => i.product?.name).join(', ') || 'Battery Order'}</h3>
                                                    <p className="text-sm text-slate-500">Qty: {order.quantity || 1}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-slate-900">₦{(order.totalAmount || 0).toLocaleString()}</p>
                                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${badge.bg}`}>{badge.label}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                                            <div className="flex items-center gap-3">
                                                <CalendarIcon size={16} className="text-slate-400" />
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase text-slate-400">Collection Date</p>
                                                    <p className="text-sm font-bold text-slate-700">{order.collectionDate ? new Date(order.collectionDate).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' }) : 'TBD'}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <button onClick={() => { setSelectedOrder(order); setIsActionSheetOpen(true); }} className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10">
                                                    <CalendarIcon size={14} /> Manage Pickup
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {suggestedProducts.length > 0 && (
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900">You Might Also Like</h2>
                            <Link href="/shop" className="text-sm font-bold text-[#05DF72] hover:underline">View All</Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {suggestedProducts.map(product => <ProductCard key={product.id} product={product} />)}
                        </div>
                    </div>
                )}
            </div>

            <BottomActionSheet isOpen={isActionSheetOpen} onClose={() => setIsActionSheetOpen(false)} title="Pickup Coordination" subtitle={selectedOrder?.id ? `Order #${selectedOrder.id}` : 'Manage Order'}>
                <div className="space-y-8">
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Seller Contact Details</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="size-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><MapPinIcon size={20} /></div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Pickup Address</p>
                                    <p className="text-sm font-black text-slate-700 leading-tight">{selectedOrder?.store?.address || 'Address not available'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="size-10 bg-white rounded-xl flex items-center justify-center text-[#05DF72] shadow-sm"><MessageSquareIcon size={20} /></div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Seller</p>
                                    <p className="text-sm font-black text-slate-700">{selectedOrder?.store?.contact || 'Phone not available'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reschedule Info (If requested by SELLER) */}
                    {selectedOrder?.collectionStatus === 'RESCHEDULE_REQUESTED' && selectedOrder?.proposedBy === 'SELLER' && (
                        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
                             <div className="flex items-center gap-2 mb-3">
                                <CalendarIcon size={16} className="text-amber-600" />
                                <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest">Seller Proposed Reschedule</h4>
                            </div>
                            <p className="text-sm font-bold text-slate-600 mb-4">
                                The seller has proposed a new pickup date: <span className="text-slate-900">{new Date(selectedOrder.proposedDate).toLocaleDateString()}</span>
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleRescheduleResponse('ACCEPT')}
                                    disabled={isResponding}
                                    className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 disabled:opacity-50"
                                >
                                    {isResponding ? 'Processing...' : 'Accept Date'}
                                </button>
                                <button 
                                    onClick={() => setShowRescheduleForm(true)}
                                    className="flex-1 py-3 bg-white text-slate-600 border border-amber-200 rounded-xl font-black text-[10px] uppercase tracking-widest"
                                >
                                    Suggest Other
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Reschedule Info (If requested by BUYER - Pending Seller) */}
                    {selectedOrder?.collectionStatus === 'RESCHEDULE_REQUESTED' && selectedOrder?.proposedBy === 'BUYER' && (
                        <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
                             <div className="flex items-center gap-2 mb-3">
                                <ClockIcon size={16} className="text-blue-600" />
                                <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">Reschedule Pending</h4>
                            </div>
                            <p className="text-sm font-bold text-slate-600">
                                You requested to reschedule for: <span className="text-slate-900">{new Date(selectedOrder.proposedDate).toLocaleDateString()}</span>
                            </p>
                            <p className="text-[10px] text-blue-500 font-bold mt-2 uppercase tracking-tight">Waiting for seller to confirm...</p>
                        </div>
                    )}

                    {/* Verification Form vs Reschedule Toggle */}
                    {!showRescheduleForm ? (
                        <div className="pt-4">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Verify Pickup Completion</h4>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mb-6">Enter the 6-digit verification code provided by the seller to release the funds.</p>
                            
                            <form onSubmit={(e) => executePickupVerification(e, selectedOrder?.id)} className="flex flex-col gap-4">
                                <div className="bg-slate-100 p-6 rounded-[2rem] border border-slate-200 flex items-center justify-center">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="000000"
                                        className="bg-transparent border-none text-center font-black tracking-[1em] text-4xl focus:ring-0 outline-none uppercase placeholder:text-slate-300 w-full"
                                        value={verifyToken}
                                        onChange={(e) => setVerifyToken(e.target.value.replace(/[^0-9]/g, ''))}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={verifying || verifyToken.length < 6}
                                    className="w-full py-5 bg-[#05DF72] text-white rounded-[2rem] font-black uppercase text-sm tracking-widest hover:bg-[#04c764] transition-all shadow-xl shadow-[#05DF72]/20 flex items-center justify-center gap-3"
                                >
                                    {verifying ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Confirm Collection <CheckIcon size={20} /></>
                                    )}
                                </button>
                            </form>

                            <button 
                                onClick={() => setShowRescheduleForm(true)}
                                className="w-full mt-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-sm tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3"
                            >
                                <CalendarIcon size={20} /> Need to Reschedule Pickup?
                            </button>
                        </div>
                    ) : (
                        <div className="pt-4">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Request Reschedule</h4>
                                <button 
                                    onClick={() => setShowRescheduleForm(false)}
                                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:underline"
                                >
                                    Back to Verify
                                </button>
                            </div>
                            <form onSubmit={handleReschedule} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">New Pickup Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-[#05DF72] outline-none"
                                        value={rescheduleDate}
                                        onChange={(e) => setRescheduleDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Reason for Reschedule</label>
                                    <textarea 
                                        placeholder="Briefly explain why you need to change the date..."
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-[#05DF72] outline-none h-24 resize-none"
                                        value={rescheduleReason}
                                        onChange={(e) => setRescheduleReason(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isRescheduling}
                                    className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-sm tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3"
                                >
                                    {isRescheduling ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Send Request <CalendarIcon size={20} /></>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </BottomActionSheet>
        </div>
    )
}
