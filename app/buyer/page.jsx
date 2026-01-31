'use client'
import { PackageIcon, ShoppingCartIcon, CreditCardIcon, ShieldCheckIcon, MapPinIcon, CalendarIcon, CopyIcon, CheckCircleIcon, AlertCircleIcon, ClockIcon } from "lucide-react"
import Loading from "@/components/Loading"
import { useState, useEffect } from "react"
import { productDummyData, orderDummyData } from "@/assets/assets"
import Link from "next/link"
import { useSelector } from "react-redux"
import ProductCard from "@/components/ProductCard"
import { mockOrderService } from "@/lib/mockService"
import VerificationModal from "@/components/VerificationModal"
import toast from "react-hot-toast"

export default function BuyerDashboard() {
    const { user, isLoggedIn } = useSelector(state => state.auth)
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState([])
    const [showVerificationModal, setShowVerificationModal] = useState(false)
    const [copiedToken, setCopiedToken] = useState(null)

    useEffect(() => {
        const load = async () => {
            if (user?.id) {
                // Load buyer orders from mock service
                const result = await mockOrderService.getOrders({ buyerId: user.id })
                if (result.success && result.orders.length > 0) {
                    setOrders(result.orders)
                } else {
                    // Fallback to dummy data
                    setOrders(orderDummyData.filter(o => o.buyerId === user.id))
                }
            } else {
                setOrders(orderDummyData)
            }
            setLoading(false)
        }
        load()
    }, [user])

    const copyToken = (token) => {
        navigator.clipboard.writeText(token)
        setCopiedToken(token)
        toast.success("Token copied!")
        setTimeout(() => setCopiedToken(null), 2000)
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
                return { bg: 'bg-amber-50 text-amber-600', label: 'Awaiting Pickup' }
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

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        {user?.verificationStatus === 'verified' ? (
                            <span className="flex items-center gap-1 text-[#05DF72] font-black uppercase tracking-widest text-[10px]">
                                <ShieldCheckIcon size={16} /> Verified Buyer
                            </span>
                        ) : (
                            <button
                                onClick={() => setShowVerificationModal(true)}
                                className="flex items-center gap-1 text-amber-500 font-black uppercase tracking-widest text-[10px] hover:underline"
                            >
                                <AlertCircleIcon size={16} /> Complete Verification
                            </button>
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
                    href="/shop"
                    className="btn-primary"
                >
                    <ShoppingCartIcon size={18} />
                    Browse Batteries
                </Link>
            </div>

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

                                        {/* Collection Token */}
                                        {order.collectionToken && order.status !== 'COMPLETED' && (
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-slate-900 rounded-xl p-3 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase text-slate-400">Collection Token</p>
                                                        <p className="text-lg font-mono font-black text-[#05DF72] tracking-widest">
                                                            {order.collectionToken}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => copyToken(order.collectionToken)}
                                                        className={`p-2 rounded-lg transition-colors ${copiedToken === order.collectionToken
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-white/10 text-white hover:bg-white/20'
                                                            }`}
                                                    >
                                                        {copiedToken === order.collectionToken
                                                            ? <CheckCircleIcon size={16} />
                                                            : <CopyIcon size={16} />
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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
    )
}
