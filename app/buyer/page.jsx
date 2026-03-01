'use client'
import { PackageIcon, ShoppingCartIcon, CreditCardIcon, ShieldCheckIcon, MapPinIcon, CalendarIcon, CopyIcon, CheckCircleIcon, AlertCircleIcon, ClockIcon, CheckIcon } from "lucide-react"
import Loading from "@/components/Loading"
import { useState, useEffect } from "react"
import { productDummyData, orderDummyData } from "@/assets/assets"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { updateProfile } from "@/lib/features/auth/authSlice"
import { getUserProfile } from "@/backend/actions/auth"
import ProductCard from "@/components/ProductCard"
import VerificationModal from "@/components/VerificationModal"
import DocumentVerificationModal from "@/components/DocumentVerificationModal"
import toast from "react-hot-toast"
import { getUserOrders, verifyOrderCollection } from "@/backend/actions/order"
import { getNotifications } from "@/backend/actions/notification"
import { MessageSquareIcon } from "lucide-react"

export default function BuyerDashboard() {
    const dispatch = useDispatch()
    const { user, isLoggedIn } = useSelector(state => state.auth)
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState([])
    const [showVerificationModal, setShowVerificationModal] = useState(false)
    const [verifyToken, setVerifyToken] = useState('')
    const [verifying, setVerifying] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [documentsSubmitted, setDocumentsSubmitted] = useState(false)
    const [notifications, setNotifications] = useState([])

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

                // Update Redux state with latest profile data
                if (profileRes.success && profileRes.data) {
                    const hasChanged =
                        profileRes.data.accountStatus !== user?.accountStatus ||
                        profileRes.data.ninDocument !== user?.ninDocument ||
                        profileRes.data.isPhoneVerified !== user?.isPhoneVerified;

                    if (hasChanged) {
                        dispatch(updateProfile(profileRes.data))
                    }
                }
            }
            setLoading(false)
        }
        load()
    }, [user?.id, dispatch])

    const handleVerifyCollection = async (e, orderId) => {
        e.preventDefault()
        if (!verifyToken || verifyToken.length < 6) {
            toast.error("Please enter a valid 6-digit code")
            return
        }

        setVerifying(true)
        const res = await verifyOrderCollection(orderId, verifyToken)
        setVerifying(false)

        if (res.success) {
            toast.success("Pickup confirmed! Release of funds initiated.")
            setOrders(orders.map(o => o.id === orderId ? res.order : o))
            setVerifyToken('')
            setSelectedOrder(null)
        } else {
            toast.error(res.error || "Invalid code. Please check with seller.")
        }
    }

    const handleVerificationComplete = (data) => {
        toast.success("Account verified!")
    }

    if (loading) return <Loading />

    const stats = [
        { label: 'Total Orders', value: orders.length, icon: PackageIcon, color: 'text-[#05DF72]', bg: 'bg-[#05DF72]/10' },
        { label: 'Pending Pickups', value: orders.filter(o => o.status === 'AWAITING_PICKUP' || o.status === 'PAID').length, icon: ClockIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Completed', value: orders.filter(o => o.status === 'COMPLETED').length, icon: CheckCircleIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Spent', value: '₦' + orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString(), icon: CreditCardIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
    ]

    const getStatusBadge = (status) => {
        switch (status) {
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
                return { bg: 'bg-slate-100 text-slate-500', label: status }
        }
    }

    // Get related products (different from ordered products)
    const orderedProductIds = orders.map(o => o.productId)
    const relatedProducts = productDummyData.filter(p => !orderedProductIds.includes(p.id)).slice(0, 4)

    const isVerified = user?.accountStatus === 'approved'
    const isPending = user?.accountStatus === 'pending'
    const isRejected = user?.accountStatus === 'rejected'

    // Check if user has submitted documents (either in DB or in current session)
    const hasSubmitted = !!user?.ninDocument || documentsSubmitted

    // Strict Blocking Logic - Priority: Rejected > Pending Review > Input Required
    const showRejectedOverlay = isRejected
    const showUnderReviewOverlay = !isRejected && isPending && hasSubmitted
    const showInputModal = !isRejected && isPending && !hasSubmitted

    const handleDocumentSubmissionComplete = () => {
        setDocumentsSubmitted(true)
        toast.success('Documents submitted! Account under review.')
        // Removed forced reload to allow Redux state update to handle the UI transition
    }

    return (
        <div className="relative space-y-12 min-h-[80vh]">

            {/* STATE 1: INPUT REQUIRED (Blocking Modal) */}
            {showInputModal && (
                <DocumentVerificationModal
                    user={user}
                    onComplete={handleDocumentSubmissionComplete}
                />
            )}

            {/* STATE 2: UNDER REVIEW (Blocking Overlay) */}
            {showUnderReviewOverlay && (
                <div className="fixed inset-0 z-50 bg-slate-50/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
                    <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-xl border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[#05DF72] animate-pulse"></div>
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <ClockIcon className="text-[#05DF72] animate-spin-slow" size={48} />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Account <span className="text-[#05DF72]">Pending Approval</span></h2>
                        <div className="space-y-4 text-slate-500 font-medium mb-10 leading-relaxed text-lg">
                            <p>
                                Thank you for completing your verification! Your documents have been successfully received and are currently being reviewed by our administrative team.
                            </p>
                            <div className="bg-slate-50 p-6 rounded-3xl text-sm border border-slate-100">
                                <p className="text-slate-700 font-bold mb-2 uppercase tracking-widest text-[10px]">What happens next?</p>
                                <ul className="text-left space-y-2 text-slate-600">
                                    <li className="flex gap-2">
                                        <div className="w-1.5 h-1.5 bg-[#05DF72] rounded-full mt-1.5 shrink-0"></div>
                                        <span>Our team will verify your identity and bank details.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <div className="w-1.5 h-1.5 bg-[#05DF72] rounded-full mt-1.5 shrink-0"></div>
                                        <span>You will receive an email notification once your account is active.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <div className="w-1.5 h-1.5 bg-[#05DF72] rounded-full mt-1.5 shrink-0"></div>
                                        <span>This usually takes between <span className="text-slate-900 font-bold">2-24 hours</span>.</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Admin Messages section */}
                            {notifications.length > 0 && (
                                <div className="mt-8 space-y-3">
                                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                        <MessageSquareIcon size={16} className="text-[#05DF72]" />
                                        <span>Messages from Admin</span>
                                    </div>
                                    <div className="space-y-2 max-h-32 overflow-y-auto no-scrollbar">
                                        {notifications.map(n => (
                                            <div key={n.id} className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 text-left">
                                                <p className="text-xs font-bold text-slate-800 mb-1">{n.title}</p>
                                                <p className="text-xs text-slate-600">{n.message}</p>
                                                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex justify-center gap-2">
                                <div className="w-2 h-2 bg-[#05DF72] rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-[#05DF72] rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-[#05DF72] rounded-full animate-bounce delay-200"></div>
                            </div>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* STATE 3: REJECTED (Blocking Overlay) */}
            {showRejectedOverlay && (
                <div className="fixed inset-0 z-50 bg-red-50/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-lg border border-red-100">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircleIcon className="text-red-500" size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">Verification Failed</h2>
                        <p className="text-slate-500 font-medium mb-6">
                            Unfortunately, your account application was not approved.
                        </p>
                        {user?.verificationNotes && (
                            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-sm text-red-700 font-bold mb-8">
                                " {user.verificationNotes} "
                            </div>
                        )}
                        <button
                            onClick={() => window.location.href = 'mailto:support@gocycle.com'}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors"
                        >
                            Contact Support
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content (Blurred if any blocking state is active) */}
            <div className={(showInputModal || showUnderReviewOverlay || showRejectedOverlay) ? 'blur-xl pointer-events-none opacity-50 select-none grayscale' : ''}>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {isVerified ? (
                                <span className="flex items-center gap-1 text-[#05DF72] font-black uppercase tracking-widest text-[10px]">
                                    <ShieldCheckIcon size={16} /> Verified Buyer
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                                    <ShieldCheckIcon size={16} /> Unverified Account
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 leading-tight">
                            My <span className="text-[#05DF72]">Dashboard</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-sm mt-1">
                            Welcome back, {user?.name || 'Buyer'}!
                        </p>
                    </div>

                    <Link
                        href={isVerified ? "/shop" : "#"}
                        onClick={() => !isVerified && toast.error("Account verification required to browse shop")}
                        className={`btn-primary ${!isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <ShoppingCartIcon size={18} />
                        Browse Batteries
                    </Link>
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
                                {orders.filter(o => ['APPROVED', 'ORDER_PLACED', 'PAID', 'AWAITING_PICKUP'].includes(o.status)).map(order => (
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

                                        <form onSubmit={(e) => {
                                            e.preventDefault()
                                            handleVerifyCollection(e, order.id)
                                        }} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                                            <input
                                                type="text"
                                                maxLength={6}
                                                placeholder="ENTER CODE"
                                                className="w-32 bg-transparent border-none text-center font-black tracking-widest text-sm focus:ring-0 outline-none uppercase placeholder:text-slate-300 placeholder:font-bold placeholder:tracking-normal"
                                                value={selectedOrder?.id === order.id ? verifyToken : ''}
                                                onChange={(e) => {
                                                    setSelectedOrder(order)
                                                    setVerifyToken(e.target.value.replace(/[^0-9]/g, ''))
                                                }}
                                                onClick={() => setSelectedOrder(order)}
                                            />
                                            <button
                                                type="submit"
                                                disabled={verifying || (selectedOrder?.id === order.id && verifyToken.length < 6)}
                                                className="p-2 bg-[#05DF72] text-white rounded-lg hover:bg-[#04c764] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#05DF72]/20"
                                            >
                                                {verifying && selectedOrder?.id === order.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckIcon size={16} />}
                                            </button>
                                        </form>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-lg border border-slate-100">
                            <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Orders Section */}
                <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-slate-900">My Orders</h2>
                        <span className="text-xs font-bold text-slate-400">{orders.length} order(s)</span>
                    </div>

                    {orders.length === 0 ? (
                        <div className="text-center py-16">
                            <PackageIcon className="mx-auto text-slate-300 mb-4" size={64} />
                            <h3 className="text-lg font-bold text-slate-900">No Orders Yet</h3>
                            <p className="text-slate-500 mt-2">Start shopping to see your orders here.</p>
                            <Link href="/shop" className="inline-block mt-6 btn-primary">
                                Browse Batteries
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => {
                                const status = getStatusBadge(order.status)
                                return (
                                    <div key={order.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-[#05DF72] shadow-sm">
                                                    <PackageIcon size={28} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{order.product?.name || 'Battery Order'}</h3>
                                                    <p className="text-sm text-slate-500">Qty: {order.quantity || 1}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-slate-900">₦{(order.totalAmount || 0).toLocaleString()}</p>
                                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${status.bg}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Order Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                                            {/* Collection Date */}
                                            <div className="flex items-center gap-3">
                                                <CalendarIcon size={16} className="text-slate-400" />
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase text-slate-400">Collection Date</p>
                                                    <p className="text-sm font-bold text-slate-700">
                                                        {order.collectionDate
                                                            ? new Date(order.collectionDate).toLocaleDateString('en-NG', {
                                                                weekday: 'short',
                                                                day: 'numeric',
                                                                month: 'short'
                                                            })
                                                            : 'TBD'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Location */}
                                            <div className="flex items-center gap-3">
                                                <MapPinIcon size={16} className="text-slate-400" />
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase text-slate-400">Pickup Location</p>
                                                    <p className="text-sm font-bold text-slate-700">
                                                        {order.product?.lga || 'Lagos'}, Lagos
                                                    </p>
                                                </div>
                                            </div>


                                        </div>

                                        {/* Instructions for pending orders */}
                                        {(order.status === 'AWAITING_PICKUP' || order.status === 'PAID') && (
                                            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                                <p className="text-xs text-amber-700">
                                                    <strong>📋 Next Step:</strong> Visit the pickup location on your collection date and show your token to the seller.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900">You Might Also Like</h2>
                            <Link href="/shop" className="text-sm font-bold text-[#05DF72] hover:underline">
                                View All
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Verification Modal */}
                <VerificationModal
                    isOpen={showVerificationModal}
                    onClose={() => setShowVerificationModal(false)}
                    userRole="BUYER"
                    onVerificationComplete={handleVerificationComplete}
                />
            </div>
        </div>
    )
}
