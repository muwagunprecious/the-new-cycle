'use client'
import { useState, useEffect } from "react"
import { 
    Package as PackageIcon, 
    Search as SearchIcon, 
    ArrowRight as ArrowRightIcon, 
    Calendar as CalendarIcon, 
    Wallet as WalletIcon, 
    ShieldCheck as ShieldCheckIcon, 
    AlertCircle as AlertCircleIcon,
    CheckCircle as CheckCircleIcon,
    MapPin as MapPinIcon,
    MessageSquare as MessageSquareIcon,
    X as XIcon, 
    Check as CheckIcon, 
    Clock as ClockIcon,
    Store
} from "lucide-react"
import Loading from "@/components/Loading"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { showLoader } from "@/lib/features/ui/uiSlice"
import { getUserOrders, respondToReschedule, verifyOrderCollection, requestReschedule } from "@/backend-actions/actions/order"
import ScheduleCalendar from "@/components/ScheduleCalendar"
import toast from "react-hot-toast"
import BottomActionSheet from "@/components/BottomActionSheet"

export default function BuyerOrders() {
    const router = useRouter()
    const dispatch = useDispatch()
    const { user, isHydrated } = useSelector(state => state.auth)
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [rescheduleLoading, setRescheduleLoading] = useState(false)
    const [verifyToken, setVerifyToken] = useState('')
    const [verifying, setVerifying] = useState(false)
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false)
    const [showRescheduleForm, setShowRescheduleForm] = useState(false)
    const [rescheduleDate, setRescheduleDate] = useState('')
    const [rescheduleReason, setRescheduleReason] = useState('')
    const [isRescheduling, setIsRescheduling] = useState(false)
    const [isResponding, setIsResponding] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

    useEffect(() => {
        if (isHydrated) {
            if (user?.id) {
                fetchOrders()
            } else {
                setLoading(false)
            }
        }
    }, [user?.id, isHydrated])

    const fetchOrders = async () => {
        console.log(`[OrdersPage] Fetching orders for user: ${user?.id}`);
        const res = await getUserOrders(user.id)
        if (res.success) {
            console.log(`[OrdersPage] Found ${res.data?.orders?.length || res.data?.length} orders`);
            setOrders(res.data?.orders || res.data || [])
        } else {
            console.error("[OrdersPage] Fetch Error:", res.error);
        }
        setLoading(false)
    }

    const handleRescheduleAction = async (orderId, action, alternateDate = null) => {
        setRescheduleLoading(true)
        const res = await respondToReschedule(orderId, action, alternateDate, 'BUYER')
        if (res.success) {
            const updatedOrder = res.data || res.order || res
            setOrders(orders.map(o => o.id === orderId ? updatedOrder : o))
            toast.success(action === 'ACCEPT' ? "Pickup date confirmed!" : (action === 'REJECT' ? "Reschedule declined" : "Counter-proposal sent!"))
            setIsRescheduleModalOpen(false)
            setIsVerifyModalOpen(false)
            setSelectedOrder(null)
        } else {
            toast.error(res.error || "Failed to respond")
        }
        setRescheduleLoading(false)
    }

    const handleBuyerReschedule = async (orderId, newDate) => {
        setRescheduleLoading(true)
        const res = await requestReschedule(orderId, newDate, 'BUYER')
        if (res.success) {
            const updatedOrder = res.data || res.order || res
            setOrders(orders.map(o => o.id === orderId ? updatedOrder : o))
            toast.success("Reschedule request sent to seller!")
            setIsRescheduleModalOpen(false)
            setIsVerifyModalOpen(false)
            setSelectedOrder(null)
        } else {
            toast.error(res.error || "Failed to request reschedule")
        }
        setRescheduleLoading(false)
    }

    const handleVerifyCollection = async (e, orderId) => {
        e.preventDefault()
        console.log("[CLIENT] Verifying Collection. OrderID:", orderId, "Token:", verifyToken)
        if (!verifyToken || verifyToken.length < 6) {
            toast.error("Please enter a valid 6-digit code")
            return
        }

        setVerifying(true)
        const res = await verifyOrderCollection(orderId, verifyToken)
        setVerifying(false)

        if (res.success) {
            toast.success("Pickup confirmed! Release of funds initiated.")
            const updatedOrder = res.data || res.order || res
            setOrders(orders.map(o => o.id === orderId ? updatedOrder : o))
            setIsVerifyModalOpen(false)
            setVerifyToken('')
            setSelectedOrder(null)
        } else {
            toast.error(res.error || "Invalid code. Please check with seller.")
        }
    }

    const handleNavigation = (href, message = "Loading tracking details...") => {
        dispatch(showLoader(message))
        setTimeout(() => {
            router.push(href)
        }, 500)
    }

    if (loading) return <Loading />

    // Safely filter orders
    const filteredOrders = orders.filter(order => {
        const orderId = order.id || ''
        const productName = order.orderItems?.map(i => i.product?.name).join(', ') || 'Battery Product'
        const term = searchTerm.toLowerCase()
        return orderId.toLowerCase().includes(term) || productName.toLowerCase().includes(term)
    })

    return (
        <div className="space-y-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 leading-tight">My <span className="text-[#05DF72]">Purchases</span></h1>
                    <p className="text-slate-400 font-bold text-sm mt-1">Track and manage your battery orders and circular history.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#05DF72] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search Order ID or Product..."
                            className="bg-white border border-slate-200 pl-12 pr-6 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 focus:border-[#05DF72] w-full md:w-80 font-medium transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Action Required Section */}
            {orders.some(order => ['APPROVED', 'ORDER_PLACED', 'PAID', 'AWAITING_PICKUP'].includes(order.status)) && (
                <div className="bg-amber-50 border border-amber-200 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest animate-pulse">Action Required</span>
                            <h2 className="text-2xl font-black text-slate-900">Verify Pickup</h2>
                        </div>
                        <div className="grid gap-4">
                            {orders.filter(o => ['APPROVED', 'ORDER_PLACED', 'PAID', 'AWAITING_PICKUP'].includes(o.status) && o.isPaid).map(order => (
                                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#05DF72]/10 text-[#05DF72] rounded-xl flex items-center justify-center shrink-0">
                                            <PackageIcon size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm">{order.orderItems?.map(i => i.product?.name).join(', ')}</h3>
                                            <p className="text-xs text-slate-500 font-medium">Order ID: {order.id}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-3">
                                        <button 
                                            onClick={() => { setSelectedOrder(order); setShowRescheduleForm(true); setIsVerifyModalOpen(true); }}
                                            className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
                                        >
                                            <CalendarIcon size={14} /> Reschedule
                                        </button>
                                        <button 
                                            onClick={() => { setSelectedOrder(order); setShowRescheduleForm(false); setIsVerifyModalOpen(true); }}
                                            className="px-6 py-3 bg-[#05DF72] text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#04c764] transition-all shadow-lg shadow-[#05DF72]/20 flex items-center gap-2"
                                        >
                                            <CheckCircleIcon size={14} /> Verify Pickup
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Orders List */}
            <div className="space-y-6">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/40 group hover:border-[#05DF72]/30 transition-all flex flex-col md:flex-row md:items-center gap-8">

                            {/* Icon & ID */}
                            <div className="flex items-center gap-6 md:w-1/4">
                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 ${order.status === 'Cancelled' ? 'bg-slate-50 text-slate-300' : 'bg-[#05DF72]/10 text-[#05DF72]'}`}>
                                    <PackageIcon size={28} />
                                </div>
                                <div className="space-y-1">
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${!order.isPaid ? 'text-orange-500' : 
                                        order.status === 'COMPLETED' ? 'text-green-500' :
                                        order.status === 'PICKED_UP' ? 'text-blue-500' :
                                            'text-amber-500'
                                        }`}>
                                        {!order.isPaid ? 'PAYMENT PENDING' : order.status?.replace('_', ' ') || 'PENDING'}
                                    </p>
                                    <h3 className="text-sm font-black text-slate-900">{order.id}</h3>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 space-y-2">
                                <p className="text-sm font-bold text-slate-900">{order.orderItems?.map(i => i.product?.name).join(', ') || 'Battery Product'}</p>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    <span className="flex items-center gap-1.5">
                                        <CalendarIcon size={12} />
                                        {order.collectionDate || new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <WalletIcon size={12} />
                                        ₦{(order.total || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Details & Action */}
                            <div className="flex items-center justify-between md:justify-end gap-10 md:w-1/3">

                                {order.collectionStatus === 'RESCHEDULE_REQUESTED' && order.proposedBy === 'SELLER' ? (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1 flex items-center gap-1">
                                            <ClockIcon size={12} /> Seller proposed: {order.proposedDate}
                                        </p>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400">
                                                <Store size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-900">{order.store?.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400">{order.store?.contact || 'No contact provided'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRescheduleAction(order.id, 'ACCEPT')}
                                                className="px-4 py-2 bg-[#05DF72] text-white font-bold text-[10px] rounded-lg hover:shadow-lg transition-all flex items-center gap-1"
                                            >
                                                <CheckIcon size={12} /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleRescheduleAction(order.id, 'REJECT')}
                                                className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 font-bold text-[10px] rounded-lg hover:bg-red-100 transition-all flex items-center gap-1"
                                            >
                                                <XIcon size={12} /> Reject
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder({ ...order, rescheduleMode: 'COUNTER' })
                                                    setIsRescheduleModalOpen(true)
                                                }}
                                                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-[10px] rounded-lg hover:bg-slate-50 transition-all"
                                            >
                                                Propose New
                                            </button>
                                        </div>
                                    </div>
                                ) : order.collectionStatus === 'RESCHEDULE_REQUESTED' && order.proposedBy === 'BUYER' ? (
                                    <div className="flex flex-col items-end gap-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-1">
                                            <ClockIcon size={12} /> Awaiting seller confirmation
                                        </p>
                                        <p className="text-[10px] text-slate-400">You proposed: {order.proposedDate}</p>
                                    </div>
                                ) : ['APPROVED', 'ORDER_PLACED', 'PAID', 'AWAITING_PICKUP'].includes(order.status) && order.isPaid ? (
                                    <div className="flex flex-col sm:flex-row items-center gap-3">
                                        <button 
                                            onClick={() => { setSelectedOrder(order); setShowRescheduleForm(true); setIsVerifyModalOpen(true); }}
                                            className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
                                        >
                                            <CalendarIcon size={12} /> Reschedule
                                        </button>
                                        <button 
                                            onClick={() => { setSelectedOrder(order); setShowRescheduleForm(false); setIsVerifyModalOpen(true); }}
                                            className="px-4 py-2.5 bg-[#05DF72] text-white rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-[#04c764] transition-all shadow-md shadow-[#05DF72]/10 flex items-center gap-2"
                                        >
                                            <CheckCircleIcon size={12} /> Verify
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => { setSelectedOrder(order); setIsDetailsModalOpen(true); }}
                                        className="px-8 py-4 bg-slate-50 text-slate-400 font-bold text-xs rounded-xl border border-slate-100 hover:bg-slate-100 transition-all"
                                    >
                                        View Details
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-slate-200">
                        <AlertCircleIcon className="mx-auto text-slate-200 mb-6" size={64} />
                        <h3 className="text-lg font-black text-slate-900 mb-2">No orders found</h3>
                        <p className="text-sm font-bold text-slate-400 mb-8 max-w-xs mx-auto">We couldn't find any orders matching your criteria.</p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="text-[#05DF72] font-black uppercase tracking-widest text-[10px] hover:underline"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </div>

            {/* Support Area */}
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden mt-10">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="max-w-md">
                        <div className="flex items-center gap-2 text-[#05DF72] mb-4 font-black uppercase tracking-widest text-[10px]">
                            <ShieldCheckIcon size={16} /> Order Protection
                        </div>
                        <h2 className="text-3xl font-black mb-4">Secured by GoCycle</h2>
                        <p className="text-slate-400 font-medium leading-relaxed">Every purchase is protected. Funds are only released to sellers after you verify delivery with your unique security code.</p>
                    </div>
                    <button className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#05DF72] hover:text-white transition-all shadow-2xl">
                        Contact Support
                    </button>
                </div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-[#05DF72]/10 rounded-full blur-[100px] -ml-20"></div>
            </div>

            <BottomActionSheet 
                isOpen={isVerifyModalOpen} 
                onClose={() => setIsVerifyModalOpen(false)} 
                title="Pickup Coordination" 
                subtitle={selectedOrder?.id ? `Order #${selectedOrder.id}` : 'Manage Order'}
            >
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

                    {!showRescheduleForm ? (
                        <div className="pt-4">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Verify Pickup Completion</h4>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mb-6">Enter the 6-digit verification code provided by the seller to release the funds.</p>
                            
                            <form onSubmit={(e) => handleVerifyCollection(e, selectedOrder?.id)} className="flex flex-col gap-4">
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
                            <div className="p-2">
                                <ScheduleCalendar onSelect={(dateInfo) => {
                                    handleBuyerReschedule(selectedOrder.id, dateInfo.date)
                                }} />
                                
                                {rescheduleLoading && (
                                    <div className="flex flex-col items-center gap-3 mt-4">
                                        <div className="w-10 h-10 border-4 border-[#05DF72] border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Sending Proposal...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </BottomActionSheet>

            {/* Reschedule Modal (Buyer Proposing Alternate) - Keeping the old one for other contexts if needed, but the ActionSheet covers it now */}
            {
                isRescheduleModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-none">Propose <span className="text-[#05DF72]">Alternate</span> Date</h3>
                                    <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">Select a date that works better for you</p>
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
                                <ScheduleCalendar onSelect={(dateInfo) => {
                                    if (selectedOrder?.rescheduleMode === 'INITIATE') {
                                        handleBuyerReschedule(selectedOrder.id, dateInfo.date)
                                    } else {
                                        handleRescheduleAction(selectedOrder.id, 'COUNTER', dateInfo.date)
                                    }
                                }} />

                                {rescheduleLoading && (
                                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center z-10">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-[#05DF72] border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Sending Proposal...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Details Modal */}
            {isDetailsModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 leading-none">Purchase <span className="text-[#05DF72]">Details</span></h3>
                                <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">Order #{selectedOrder.id}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsDetailsModalOpen(false)
                                    setSelectedOrder(null)
                                }}
                                className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:shadow-lg transition-all"
                            >
                                <XIcon size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Product Info with Image */}
                            <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                                    <img 
                                        src={selectedOrder.orderItems?.[0]?.product?.images?.[0] || '/placeholder-battery.jpg'} 
                                        alt="" 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-black text-slate-900 text-sm">{selectedOrder.orderItems?.[0]?.product?.name || 'Battery Product'}</h4>
                                    <p className="text-xs text-slate-500 font-medium">Brand: {selectedOrder.orderItems?.[0]?.product?.brand || 'N/A'}</p>
                                    <p className="text-xs text-slate-500 font-medium">Quantity: {selectedOrder.orderItems?.[0]?.quantity || 1} Unit(s)</p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Status</span>
                                    <p className="text-sm font-black text-[#05DF72] uppercase">
                                        {!selectedOrder.isPaid ? 'PAYMENT PENDING' : selectedOrder.status?.replace('_', ' ') || 'PENDING'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Price</span>
                                    <p className="text-sm font-black text-slate-900">₦{(selectedOrder.total || 0).toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Collection Date</span>
                                    <p className="text-sm font-black text-slate-900">
                                        {selectedOrder.collectionDate ? new Date(selectedOrder.collectionDate).toLocaleDateString() : 'TBD'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Collection Code</span>
                                    <p className="text-sm font-black text-slate-900 tracking-wider">
                                        {selectedOrder.isPaid ? (selectedOrder.verificationCode || 'Awaiting Code') : 'Locked until payment verified'}
                                    </p>
                                </div>
                            </div>

                            {/* Pickup & Seller details */}
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seller & Collection Info</h4>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-bold text-[#05DF72] uppercase">Store Name</p>
                                        <p className="font-bold text-slate-800 text-sm">{selectedOrder.store?.name || 'Authorized Partner'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#05DF72] uppercase">Pickup Address</p>
                                        <p className="font-bold text-slate-800 text-sm leading-tight">
                                            {selectedOrder.isPaid ? (selectedOrder.store?.address || 'Address not available') : "Address will be revealed after verification"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#05DF72] uppercase">Seller Phone</p>
                                        <p className="font-bold text-slate-800 text-sm">{selectedOrder.store?.user?.phone || selectedOrder.store?.contact || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}


        </div >
    )
}
