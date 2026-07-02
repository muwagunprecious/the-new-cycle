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
    const { user, isHydrated } = useSelector(state => state.auth)
    const [profile, setProfile] = useState(null)
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
        const load = async (targetId) => {
            const idToUse = targetId || user?.id;
            if (!idToUse) {
                if (isHydrated) setLoading(false);
                return;
            }

            console.log(`[Dashboard] Deep Sync: Loading data for ${idToUse}`);
            try {
                const [ordersRes, notifyRes, profileRes] = await Promise.all([
                    getUserOrders(idToUse),
                    getNotifications(idToUse),
                    getUserProfile(idToUse)
                ])

                 if (ordersRes.success) {
                     const ordersArray = ordersRes.data?.orders || ordersRes.data || [];
                     console.log(`[DEBUG] Received ${ordersArray.length} orders from server:`, ordersArray);
                     setOrders(ordersArray);
                 }
                
                if (profileRes.success && profileRes.data) {
                    // Critical: If the fetched profile has an ID but our Redux doesn't, sync it!
                    if (profileRes.data.id && profileRes.data.id !== user.id) {
                         console.log("[Dashboard] Syncing user ID from profile:", profileRes.data.id);
                    }
                    setProfile(profileRes.data);
                    const serialized = { ...profileRes.data }
                    for (const key of Object.keys(serialized)) {
                        if (serialized[key] instanceof Date) {
                            serialized[key] = serialized[key].toISOString()
                        }
                    }
                    dispatch(updateProfile(serialized))
                }
            } catch (err) {
                console.error("[Dashboard] Load Error:", err);
            } finally {
                setLoading(false)
            }
        }

        if (isHydrated) {
            load(user?.id)
        }
    }, [user?.id, isHydrated, dispatch])

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
        { label: 'Total Orders', value: orders.filter(Boolean).length, icon: PackageIcon, color: 'text-[#05DF72]', bg: 'bg-[#05DF72]/10' },
        { label: 'Pending Pickups', value: orders.filter(o => o?.status && ['AWAITING_PICKUP', 'PAID', 'ORDER_PLACED', 'APPROVED'].includes(o.status)).length, icon: ClockIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Completed', value: orders.filter(o => o?.status === 'COMPLETED').length, icon: CheckCircleIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Spent', value: '₦' + orders.reduce((sum, o) => sum + (o?.total || 0), 0).toLocaleString(), icon: CreditCardIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
    ]

    const resolveStatusBadge = (order) => {
        if (!order) return { bg: 'bg-slate-100 text-slate-500', label: 'Unknown' }
        // Manual transfer waiting for admin to verify payment
        if (!order.isPaid && order.paymentMethod === 'MANUAL_TRANSFER') {
            return { bg: 'bg-orange-100 text-orange-700 font-black', label: 'Payment Pending Verification' }
        }
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
                return { bg: 'bg-slate-100 text-slate-500', label: order.status || 'Processing' }
        }
    }

    const orderedProductIds = orders.map(o => o?.productId).filter(Boolean)
    const suggestedProducts = productDummyData.filter(p => !orderedProductIds.includes(p.id)).slice(0, 4)

    const isVerified = user?.accountStatus === 'approved'
    const isRejected = user?.accountStatus === 'rejected'

    return (
        <div key={user?.id || 'guest'} className="relative space-y-12 min-h-[80vh]">
            {isRejected && (
                <div className="fixed inset-0 z-50 bg-red-50/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-white p-10 rounded-sm shadow-xl max-w-xl border border-slate-200">
                        <AlertCircleIcon className="text-red-500 mx-auto mb-6" size={40} />
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Verification Rejected</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed text-sm">Unfortunately, your buyer account verification was not approved.</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => window.location.href = 'mailto:support@gocycle.com'} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-sm font-bold shadow-sm transition-colors text-xs uppercase tracking-wider">Contact Support</button>
                            <button onClick={() => window.location.href = '/'} className="text-slate-500 hover:text-slate-900 text-xs font-bold transition-colors">Back to Home</button>
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
                    <Link href={isVerified ? "/shop" : "#"} onClick={() => !isVerified && toast.error("Verification required")} className={`bg-[#05DF72] hover:bg-[#04c865] text-slate-950 font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-sm transition-colors shadow-sm inline-flex items-center gap-2 ${!isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <ShoppingCartIcon size={16} /> Browse Batteries
                    </Link>
                </div>
                {/* Payment Pending Verification Banner — Manual Transfer, not yet admin-approved */}
                {orders.some(o => o?.paymentMethod === 'MANUAL_TRANSFER' && !o?.isPaid) && (
                    <div className="bg-orange-50 border border-orange-200 rounded-sm p-6 md:p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="bg-orange-500 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-sm animate-pulse">Awaiting Verification</span>
                            <h2 className="text-xl font-bold text-slate-900">Payment Pending Verification</h2>
                        </div>
                        <div className="grid gap-4">
                            {orders.filter(o => o?.paymentMethod === 'MANUAL_TRANSFER' && !o?.isPaid).map(order => (
                                <div key={order.id} className="bg-white rounded-sm p-6 shadow-sm border border-slate-200 flex flex-col gap-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-orange-50 border border-orange-100 text-orange-500 rounded-sm flex items-center justify-center shrink-0">
                                                <ClockIcon size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-base leading-tight">{order.orderItems?.map(i => i.product?.name).join(', ') || 'Battery Order'}</h3>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Order ID: {order.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-sm border border-slate-200 self-start md:self-auto">
                                            <CalendarIcon size={16} className="text-slate-500" />
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Collection Date</p>
                                                <p className="text-sm font-bold text-slate-900 leading-none">
                                                    {order.collectionDate ? new Date(order.collectionDate).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Pending Confirmation'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-orange-50/50 border border-orange-100 rounded-sm p-4 flex items-start gap-4">
                                        <AlertCircleIcon size={20} className="text-orange-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Awaiting Admin Approval</p>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                Your bank transfer is being reviewed by our finance team. Once verified, the seller's pickup address and your collection code will be unlocked. This usually takes 1-24 hours.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-200">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Amount: <span className="text-slate-700">₦{(order.total || 0).toLocaleString()}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Verify Pickup Banner — Only for paid/verified orders */}
                {orders.some(order => order?.status && ['APPROVED', 'ORDER_PLACED', 'PAID', 'AWAITING_PICKUP'].includes(order.status) && order.isPaid) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-sm p-6 md:p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="bg-amber-500 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-sm animate-pulse">Action Required</span>
                            <h2 className="text-xl font-bold text-slate-900">Payment Verified — Verify Pickup</h2>
                        </div>
                        <div className="grid gap-4">
                            {orders.filter(o => o?.status && ['APPROVED', 'ORDER_PLACED', 'PAID', 'AWAITING_PICKUP'].includes(o.status) && o.isPaid).map(order => (
                                <div key={order.id} className="bg-white rounded-sm p-6 shadow-sm border border-slate-200 flex flex-col gap-6 transition-all hover:shadow-sm">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#05DF72]/10 text-[#05DF72] rounded-sm flex items-center justify-center shrink-0 border border-[#05DF72]/20">
                                                <PackageIcon size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-base leading-tight">{order.orderItems?.map(i => i.product?.name).join(', ') || 'Battery Order'}</h3>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Order ID: {order.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-sm border border-slate-200 self-start md:self-auto">
                                            <CalendarIcon size={16} className="text-slate-500" />
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Agreed Date</p>
                                                <p className="text-sm font-bold text-slate-900 leading-none">
                                                    {order.collectionDate ? new Date(order.collectionDate).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Pending Confirmation'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {order.collectionStatus === 'RESCHEDULE_REQUESTED' && order.proposedBy === 'SELLER' && (
                                        <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <CalendarIcon size={16} className="text-amber-650 shrink-0" />
                                                <p className="text-xs font-bold text-amber-900">
                                                    Seller proposed a new pickup date: <span className="font-bold underline">{new Date(order.proposedDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => { setSelectedOrder(order); setIsActionSheetOpen(true); }}
                                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-sm font-bold text-[10px] uppercase tracking-wider whitespace-nowrap transition-colors"
                                            >
                                                Review & Respond
                                            </button>
                                        </div>
                                    )}

                                    {/* Payment Verified badge */}
                                    <div className="flex items-center gap-2">
                                        <CheckCircleIcon size={16} className="text-[#05DF72]" />
                                        <span className="text-[10px] font-bold text-[#05DF72] uppercase tracking-wider">Payment Verified</span>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-slate-200 items-end">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 size-8 rounded-sm bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                                                    <MapPinIcon size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pickup Address</p>
                                                    <p className="text-sm font-bold text-slate-700 leading-snug">{order.store?.address || 'Address pending...'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 size-8 rounded-sm bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                                                    <MessageSquareIcon size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Seller Contact</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-slate-800">{order.store?.contact || 'N/A'}</p>
                                                        {order.store?.contact && (
                                                            <a href={`tel:${order.store.contact}`} className="text-[10px] font-bold text-[#05DF72] uppercase hover:underline ml-2">Call Now</a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button 
                                                onClick={() => { setSelectedOrder(order); setShowRescheduleForm(true); setIsActionSheetOpen(true); }}
                                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-sm font-bold uppercase text-[10px] tracking-wider transition-colors flex items-center justify-center gap-2"
                                            >
                                                <CalendarIcon size={14} /> Reschedule
                                            </button>
                                            <button 
                                                onClick={() => { setSelectedOrder(order); setShowRescheduleForm(false); setIsActionSheetOpen(true); }}
                                                className="flex-[1.5] py-3 bg-[#05DF72] hover:bg-[#04c865] text-slate-955 rounded-sm font-bold uppercase text-[10px] tracking-wider transition-colors flex items-center justify-center gap-2"
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
                        <div key={stat.label} className="bg-white rounded-sm p-6 flex flex-col gap-4 shadow-sm border border-slate-200">
                            <div className={`w-10 h-10 rounded-sm border border-slate-200/80 bg-slate-50 flex items-center justify-center text-slate-700`}><stat.icon size={20} /></div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
                                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-sm p-8 shadow-sm border border-slate-200 mt-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900">My Orders</h2>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        const idToUse = user?.id;
                                        if (idToUse) {
                                            const [ordersRes, notifyRes, profileRes] = await Promise.all([
                                                getUserOrders(idToUse),
                                                getNotifications(idToUse),
                                                getUserProfile(idToUse)
                                            ]);
                                            if (ordersRes.success) {
                                                const ordersArray = ordersRes.data?.orders || ordersRes.data || [];
                                                setOrders(ordersArray);
                                                toast.success("Orders refreshed!");
                                            }
                                        }
                                    } catch (e) {
                                        toast.error("Failed to refresh orders");
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-sm transition-colors"
                            >
                                Refresh Orders
                            </button>
                            <span className="text-xs font-bold text-slate-400">{orders.length} order(s)</span>
                        </div>
                    </div>

                    {orders.length === 0 ? (
                        <div className="text-center py-16">
                            <PackageIcon className="mx-auto text-slate-300 mb-4" size={64} />
                            <h3 className="text-lg font-bold text-slate-900">No Orders Yet</h3>
                            <p className="text-slate-500 mt-2">Start shopping to see your orders here.</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                                <Link href="/shop" className="px-6 py-2.5 bg-[#05DF72] hover:bg-[#04c865] text-slate-955 rounded-sm font-bold text-xs uppercase tracking-wider transition-all">Browse Batteries</Link>
                                <button 
                                    onClick={async () => {
                                        const { logoutUser } = await import("@/backend-actions/actions/auth")
                                        await logoutUser();
                                        localStorage.removeItem('gocycle_session');
                                        localStorage.clear();
                                        window.location.reload();
                                    }}
                                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-sm font-bold text-xs uppercase tracking-wider transition-colors"
                                >
                                    Refresh Session
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.filter(Boolean).map((order) => {
                                const badge = resolveStatusBadge(order)
                                return (
                                    <div key={order.id} className="bg-slate-50 rounded-sm p-6 border border-slate-200">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-sm border border-slate-200 flex items-center justify-center text-[#05DF72] shadow-sm"><PackageIcon size={24} /></div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{order.orderItems?.map(i => i.product?.name).join(', ') || 'Battery Order'}</h3>
                                                    <p className="text-sm text-slate-500">Qty: {order.quantity || 1}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-slate-900">₦{(order.total || 0).toLocaleString()}</p>
                                                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-sm border ${badge.bg}`}>{badge.label}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                                            <div className="flex items-center gap-3">
                                                <CalendarIcon size={16} className="text-slate-400" />
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase text-slate-400 font-sans tracking-wide">Collection Date</p>
                                                    <p className="text-sm font-bold text-slate-750">{order.collectionDate ? new Date(order.collectionDate).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' }) : 'TBD'}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-3">
                                                {order.isPaid && (
                                                    <button onClick={() => { setSelectedOrder(order); setIsActionSheetOpen(true); }} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2">
                                                        <CalendarIcon size={14} /> Manage Pickup
                                                    </button>
                                                )}
                                                {order.isPaid && (
                                                    <button 
                                                        onClick={() => {
                                                            const win = window.open('', '_blank');
                                                            win.document.write(`
                                                                <html>
                                                                    <head>
                                                                        <title>Receipt - ${order.id}</title>
                                                                        <script src="https://cdn.tailwindcss.com"></script>
                                                                    </head>
                                                                    <body class="bg-slate-100 p-8">
                                                                        <div class="max-w-2xl mx-auto bg-white rounded-sm shadow-xl overflow-hidden font-sans border border-slate-200">
                                                                            <div class="bg-slate-900 p-8 text-center text-white">
                                                                                <h1 class="text-3xl font-black mb-2">Go-Cycle Receipt</h1>
                                                                                <p class="text-slate-400 uppercase tracking-widest text-xs font-bold">Official Transaction Record</p>
                                                                            </div>
                                                                            <div class="p-12">
                                                                                <div class="flex justify-between items-start mb-12">
                                                                                    <div>
                                                                                        <p class="text-[10px] font-black text-slate-400 uppercase mb-1">Customer</p>
                                                                                        <p class="text-xl font-bold text-slate-900">${user?.name || 'Customer'}</p>
                                                                                    </div>
                                                                                    <div class="text-right">
                                                                                        <p class="text-[10px] font-black text-slate-400 uppercase mb-1">Order Date</p>
                                                                                        <p class="font-bold text-slate-900">${new Date(order.createdAt).toLocaleDateString()}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="border-y border-slate-100 py-8 mb-8">
                                                                                    <div class="flex justify-between mb-4">
                                                                                        <span class="font-bold text-slate-600">${order.orderItems?.[0]?.product?.name || 'Battery Product'}</span>
                                                                                        <span class="font-black text-slate-900">₦${(order.total || 0).toLocaleString()}</span>
                                                                                    </div>
                                                                                    <div class="flex justify-between text-sm">
                                                                                        <span class="text-slate-400 italic">Pickup: ${order.store?.address || 'See Manage Pickup'}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="bg-slate-50 rounded-sm p-8 border border-slate-200 mb-8">
                                                                                    <p class="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest text-center">Pickup Location & Seller Details</p>
                                                                                    <div class="flex flex-col gap-4">
                                                                                        <div>
                                                                                            <p class="text-[10px] font-bold text-[#05DF72] uppercase">Store Name</p>
                                                                                            <p class="font-bold text-slate-900">${order.store?.name || 'Authorized Go-Cycle Partner'}</p>
                                                                                        </div>
                                                                                        <div>
                                                                                            <p class="text-[10px] font-bold text-[#05DF72] uppercase">Pickup Address</p>
                                                                                            <p class="font-bold text-slate-900">${order.store?.address || 'See Manage Pickup for details'}</p>
                                                                                        </div>
                                                                                        <div>
                                                                                            <p class="text-[10px] font-bold text-[#05DF72] uppercase">Contact Number</p>
                                                                                            <p class="font-bold text-slate-900">${order.store?.user?.phone || order.store?.contact || 'N/A'}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="text-center pt-8 border-t border-slate-50">
                                                                                    <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Go-Cycle Marketplace</p>
                                                                                    <button onclick="window.print()" class="px-8 py-3 bg-slate-900 text-white rounded-sm font-bold text-xs uppercase tracking-widest">Print Receipt</button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </body>
                                                                </html>
                                                            `);
                                                        }}
                                                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircleIcon size={14} /> View Receipt
                                                    </button>
                                                )}
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
                    <div className="bg-slate-50 rounded-sm p-6 border border-slate-200">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Seller Contact Details</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="size-10 bg-white rounded-sm flex items-center justify-center text-slate-400 shadow-sm border border-slate-100"><MapPinIcon size={20} /></div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Pickup Address</p>
                                    <p className="text-sm font-black text-slate-700 leading-tight">{selectedOrder?.store?.address || 'Address not available'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="size-10 bg-white rounded-sm flex items-center justify-center text-[#05DF72] shadow-sm border border-slate-100"><MessageSquareIcon size={20} /></div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Seller</p>
                                    <p className="text-sm font-black text-slate-700">{selectedOrder?.store?.contact || 'Phone not available'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reschedule Info (If requested by SELLER) */}
                    {selectedOrder?.collectionStatus === 'RESCHEDULE_REQUESTED' && selectedOrder?.proposedBy === 'SELLER' && (
                        <div className="bg-amber-50 rounded-sm p-6 border border-amber-200">
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
                                    className="flex-1 py-3 bg-amber-500 text-white rounded-sm font-black text-[10px] uppercase tracking-widest shadow-md disabled:opacity-50"
                                >
                                    {isResponding ? 'Processing...' : 'Accept Date'}
                                </button>
                                <button 
                                    onClick={() => setShowRescheduleForm(true)}
                                    className="flex-1 py-3 bg-white text-slate-600 border border-amber-200 rounded-sm font-black text-[10px] uppercase tracking-widest"
                                >
                                    Suggest Other
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Reschedule Info (If requested by BUYER - Pending Seller) */}
                    {selectedOrder?.collectionStatus === 'RESCHEDULE_REQUESTED' && selectedOrder?.proposedBy === 'BUYER' && (
                        <div className="bg-blue-50 rounded-sm p-6 border border-blue-200">
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
                                <div className="bg-slate-50 p-6 rounded-sm border border-slate-200 flex items-center justify-center">
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
                                    className="w-full py-5 bg-[#05DF72] text-white rounded-sm font-black uppercase text-sm tracking-widest hover:bg-[#04c764] transition-all flex items-center justify-center gap-3"
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
                                className="w-full mt-8 py-5 bg-slate-900 text-white rounded-sm font-black uppercase text-sm tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
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
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-sm font-bold text-slate-700 focus:ring-1 focus:ring-[#05DF72] outline-none"
                                        value={rescheduleDate}
                                        onChange={(e) => setRescheduleDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Reason for Reschedule</label>
                                    <textarea 
                                        placeholder="Briefly explain why you need to change the date..."
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-sm font-bold text-slate-700 focus:ring-1 focus:ring-[#05DF72] outline-none h-24 resize-none"
                                        value={rescheduleReason}
                                        onChange={(e) => setRescheduleReason(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isRescheduling}
                                    className="w-full py-5 bg-slate-900 text-white rounded-sm font-black uppercase text-sm tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
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
