'use client'
import { BatteryIcon, CircleDollarSignIcon, PackageIcon, ClockIcon, PhoneIcon, ShieldCheckIcon, CheckCircleIcon, AlertCircleIcon, WalletIcon, CopyIcon } from "lucide-react"
import { useState, useEffect } from "react"
import Loading from "@/components/Loading"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"
import VerificationModal from "@/components/VerificationModal"
import Button from "@/components/Button"
import { getSellerOrders, updateOrderStatus } from "@/backend/actions/order"
import { getSellerProducts } from "@/backend/actions/product"
import { getStoreDetails, updateStoreBankDetails } from "@/backend/actions/seller"

export default function SellerOverview() {
    const { user } = useSelector(state => state.auth)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState({ totalProducts: 0 })
    const [orders, setOrders] = useState([])
    const [store, setStore] = useState(null)
    const [showVerificationModal, setShowVerificationModal] = useState(false)

    useEffect(() => {
        const load = async () => {
            if (user?.id) {
                // Load store details
                const storeResult = await getStoreDetails(user.id)
                if (storeResult.success) {
                    setStore(storeResult.data)
                }

                // Load seller orders
                const orderResult = await getSellerOrders(user.id)
                if (orderResult.success) {
                    setOrders(orderResult.orders)
                }

                // Load seller products count
                const productResult = await getSellerProducts(user.id)
                if (productResult.success) {
                    setData({ totalProducts: productResult.products.length })
                }
            }
            setLoading(false)
        }
        load()
    }, [user])


    const handleCompleteOrder = async (orderId) => {
        const result = await updateOrderStatus(orderId, 'COMPLETED')
        if (result.success) {
            toast.success("Order completed! Payout pending.")
            setOrders(orders.map(o =>
                o.id === orderId
                    ? { ...o, status: 'COMPLETED', payoutStatus: 'pending' }
                    : o
            ))
        }
    }

    const handleVerificationComplete = async (vData) => {
        if (vData.bankResult) {
            const result = await updateStoreBankDetails(user.id, vData.bankResult)
            if (result.success) {
                toast.success("Bank details saved successfully!")
                // Refresh store local state
                setStore({
                    ...store,
                    bankName: vData.bankResult.bankName,
                    accountNumber: vData.bankResult.accountNumber,
                    accountName: vData.bankResult.accountName
                })
            } else {
                toast.error("Failed to save bank details")
            }
        } else {
            toast.success("Verification complete!")
        }
    }

    if (loading) return <Loading />

    const pendingOrders = orders.filter(o => ['AWAITING_PICKUP', 'PAID', 'ORDER_PLACED', 'APPROVED'].includes(o.status))
    const completedOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'PICKED_UP')
    const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const pendingPayouts = orders.filter(o => o.payoutStatus === 'pending').reduce((sum, o) => sum + (o.total || 0), 0)

    const stats = [
        { label: 'Listed Batteries', value: data.totalProducts, icon: BatteryIcon, color: 'text-[#05DF72]', bg: 'bg-[#05DF72]/10' },
        { label: 'Total Earnings', value: '₦' + totalEarnings.toLocaleString(), icon: CircleDollarSignIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Pickups', value: pendingOrders.length, icon: ClockIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Completed Orders', value: completedOrders.length, icon: PackageIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
    ]

    const getStatusBadge = (status) => {
        switch (status) {
            case 'AWAITING_PICKUP':
            case 'PAID':
                return 'bg-amber-50 text-amber-600'
            case 'PICKED_UP':
                return 'bg-blue-50 text-blue-600'
            case 'COMPLETED':
                return 'bg-[#05DF72]/10 text-[#05DF72]'
            default:
                return 'bg-slate-100 text-slate-500'
        }
    }

    return (
        <div className="space-y-12">
            {/* Header with Verification Status */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        {(user?.isEmailVerified || user?.isPhoneVerified) ? (
                            <span className="flex items-center gap-1 text-[#05DF72] font-black uppercase tracking-widest text-[10px]">
                                <ShieldCheckIcon size={16} /> Contact Verified
                            </span>
                        ) : (
                            <button
                                onClick={() => setShowVerificationModal(true)}
                                className="flex items-center gap-1 text-amber-500 font-black uppercase tracking-widest text-[10px] hover:underline"
                            >
                                <AlertCircleIcon size={16} /> Verify Phone / Email
                            </button>
                        )}
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 leading-tight">Seller <span className="text-[#05DF72]">Dashboard</span></h1>
                    <p className="text-slate-400 font-bold text-sm mt-1">Welcome back, {user?.businessName || user?.name || 'Seller'}!</p>
                </div>

                <div className="flex-1 max-w-md">
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl shadow-slate-200/50 border border-slate-100 group hover:border-[#05DF72]/30 transition-all duration-500">
                        <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 leading-none">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Incoming Orders */}
                <div className="lg:col-span-3 bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Incoming Orders</h2>
                        <span className="text-xs font-bold text-slate-400">{orders.length} total</span>
                    </div>

                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                            <PackageIcon className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-500">No orders yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.slice(0, 5).map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#05DF72] shadow-sm">
                                            <BatteryIcon size={24} />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="font-bold text-slate-900">{order.product?.name || 'Battery Order'}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    Collection: {order.collectionDate ? new Date(order.collectionDate).toLocaleDateString() : 'TBD'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900">₦{(order.total || 0).toLocaleString()}</p>
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full mt-2 inline-block ${getStatusBadge(order.status)}`}>
                                            {order.status?.replace('_', ' ')}
                                        </span>
                                        {order.status === 'PICKED_UP' && (
                                            <button
                                                onClick={() => handleCompleteOrder(order.id)}
                                                className="ml-2 text-[10px] font-bold text-[#05DF72] hover:underline"
                                            >
                                                Mark Complete
                                            </button>
                                        )}
                                        {order.status === 'APPROVED' && (
                                            <div className="mt-2 flex flex-col items-end">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Collection Token</span>
                                                <span className="font-mono font-black text-[#05DF72] text-lg bg-[#05DF72]/10 px-2 rounded-md border border-[#05DF72]/20">
                                                    {order.collectionToken}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Payout Section */}
                <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-xl font-black uppercase tracking-tighter">Payouts</h2>
                            {(user?.isEmailVerified || user?.isPhoneVerified) && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-[#05DF72]">
                                    <CheckCircleIcon size={12} /> Identity Verified
                                </span>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white/10 rounded-2xl p-6">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Pending Payout</p>
                                <p className="text-3xl font-black text-[#05DF72]">₦{pendingPayouts.toLocaleString()}</p>
                                <p className="text-xs text-slate-400 mt-2">Released after buyer confirms collection</p>
                            </div>

                            {store?.bankName ? (
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 group/bank relative">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3">Bank Account</p>
                                    <button
                                        onClick={() => setShowVerificationModal(true)}
                                        className="absolute top-6 right-6 text-[10px] font-black uppercase tracking-widest text-[#05DF72] hover:underline opacity-0 group-hover/bank:opacity-100 transition-opacity"
                                    >
                                        Edit
                                    </button>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Bank</span>
                                            <span className="font-bold">{store.bankName}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Account</span>
                                            <span className="font-mono">{store.accountNumber}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Name</span>
                                            <span className="font-bold">{store.accountName}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowVerificationModal(true)}
                                    className="w-full py-4 bg-white/10 border border-white/20 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors"
                                >
                                    Add Bank Details
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#05DF72]/10 rounded-full blur-[80px]"></div>
                </div>
            </div>

            {/* Verification Modal */}
            <VerificationModal
                isOpen={showVerificationModal}
                onClose={() => setShowVerificationModal(false)}
                userRole="SELLER"
                onVerificationComplete={handleVerificationComplete}
            />
        </div>
    )
}
