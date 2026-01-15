'use client'
import { dummyAdminDashboardData, productDummyData, orderDummyData, dummyUsers } from "@/assets/assets"
import Loading from "@/components/Loading"
import { CircleDollarSignIcon, ShoppingBasketIcon, StoreIcon, TagsIcon, UsersIcon, PackageCheckIcon, ShieldCheckIcon, ShieldXIcon, BanIcon, CheckCircle2Icon, AlertCircleIcon, WalletIcon, EyeIcon, SendIcon } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { mockAdminService, mockNotificationService } from "@/lib/mockService"
import Button from "@/components/Button"

export default function AdminDashboard() {
    const currency = '₦'

    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview') // overview | users | orders | payouts
    const [users, setUsers] = useState([])
    const [orders, setOrders] = useState([])
    const [products, setProducts] = useState([])
    const [dashboardData, setDashboardData] = useState({
        products: 0,
        revenue: 0,
        orders: 0,
        stores: 0,
        pendingPayouts: 0,
        verifiedUsers: 0,
        unverifiedUsers: 0
    })
    const [sendingNotification, setSendingNotification] = useState(false)
    const [notificationForm, setNotificationForm] = useState({
        userId: '',
        title: '',
        message: ''
    })

    useEffect(() => {
        const fetchData = async () => {
            // Load users
            setUsers(dummyUsers)
            // Load orders
            setOrders(orderDummyData)
            // Load products
            setProducts(productDummyData)

            // Calculate dashboard stats
            const verifiedCount = dummyUsers.filter(u => u.verificationStatus === 'verified').length
            const pendingPayouts = orderDummyData
                .filter(o => o.status === 'COMPLETED' && o.payoutStatus === 'pending')
                .reduce((sum, o) => sum + (o.totalAmount || 0), 0)

            setDashboardData({
                products: productDummyData.length,
                revenue: orderDummyData.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
                orders: orderDummyData.length,
                stores: dummyUsers.filter(u => u.role === 'SELLER').length,
                pendingPayouts,
                verifiedUsers: verifiedCount,
                unverifiedUsers: dummyUsers.length - verifiedCount
            })

            setLoading(false)
        }
        fetchData()
    }, [])

    const handleBanUser = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'banned' : 'active'
        const result = await mockAdminService.banUser(userId, newStatus === 'banned')
        if (result.success) {
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u))
            toast.success(`User ${newStatus === 'banned' ? 'banned' : 'unbanned'} successfully`)
        }
    }

    const handleSendNotification = async (e) => {
        e.preventDefault()
        if (!notificationForm.userId || !notificationForm.title || !notificationForm.message) {
            toast.error("All fields are required")
            return
        }

        setSendingNotification(true)
        const result = await mockAdminService.sendNotification(
            notificationForm.userId,
            notificationForm.title,
            notificationForm.message
        )
        setSendingNotification(false)

        if (result.success) {
            toast.success("Notification sent!")
            setNotificationForm({ userId: '', title: '', message: '' })
        }
    }

    const handleReleasePayout = async (orderId) => {
        const result = await mockAdminService.releasePayout(orderId)
        if (result.success) {
            setOrders(orders.map(o => o.id === orderId ? { ...o, payoutStatus: 'released' } : o))
            toast.success("Payout released to seller!")
        }
    }

    if (loading) return <Loading />

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'users', label: `Users (${users.length})` },
        { id: 'orders', label: `Orders (${orders.length})` },
        { id: 'payouts', label: 'Payouts' },
    ]

    const statsCards = [
        { title: 'Total Sellers', value: dashboardData.stores, icon: StoreIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Total Listings', value: dashboardData.products, icon: ShoppingBasketIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
        { title: 'Total Orders', value: dashboardData.orders, icon: TagsIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
        { title: 'Total Revenue', value: currency + dashboardData.revenue.toLocaleString(), icon: CircleDollarSignIcon, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Verified Users', value: dashboardData.verifiedUsers, icon: ShieldCheckIcon, color: 'text-[#05DF72]', bg: 'bg-[#05DF72]/10' },
        { title: 'Pending Payouts', value: currency + dashboardData.pendingPayouts.toLocaleString(), icon: WalletIcon, color: 'text-rose-600', bg: 'bg-rose-50' },
    ]

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Admin <span className="text-[#05DF72]">Dashboard</span></h1>
                <p className="text-slate-500 mt-1">Platform management and oversight.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === tab.id
                                ? 'text-[#05DF72] border-b-2 border-[#05DF72]'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {statsCards.map((card, index) => (
                            <div key={index} className="card p-6 flex items-center justify-between group bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium text-slate-500">{card.title}</p>
                                    <b className="text-2xl font-bold text-slate-800">{card.value}</b>
                                </div>
                                <div className={`${card.bg} ${card.color} p-4 rounded-2xl transition-transform group-hover:scale-110`}>
                                    <card.icon size={28} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Orders */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Orders</h3>
                            <div className="space-y-3">
                                {orders.slice(0, 5).map(order => (
                                    <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div>
                                            <p className="font-bold text-sm text-slate-900">{order.product?.name || 'Battery Order'}</p>
                                            <p className="text-xs text-slate-500">{order.status}</p>
                                        </div>
                                        <p className="font-bold text-slate-900">{currency}{(order.totalAmount || 0).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Send Notification */}
                        <div className="bg-slate-900 rounded-2xl p-6 text-white">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <SendIcon size={18} className="text-[#05DF72]" />
                                Send Notification
                            </h3>
                            <form onSubmit={handleSendNotification} className="space-y-4">
                                <select
                                    value={notificationForm.userId}
                                    onChange={e => setNotificationForm({ ...notificationForm, userId: e.target.value })}
                                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white"
                                >
                                    <option value="" className="text-slate-900">Select user</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id} className="text-slate-900">
                                            {u.name} ({u.email})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    placeholder="Notification title"
                                    value={notificationForm.title}
                                    onChange={e => setNotificationForm({ ...notificationForm, title: e.target.value })}
                                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-400"
                                />
                                <textarea
                                    placeholder="Message..."
                                    value={notificationForm.message}
                                    onChange={e => setNotificationForm({ ...notificationForm, message: e.target.value })}
                                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-400 resize-none"
                                    rows={2}
                                />
                                <Button
                                    type="submit"
                                    loading={sendingNotification}
                                    loadingText="Sending..."
                                    className="w-full"
                                >
                                    Send Notification
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">All Users</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold">User</th>
                                    <th className="px-6 py-4 text-left font-semibold">Role</th>
                                    <th className="px-6 py-4 text-left font-semibold">Verification</th>
                                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-slate-900">{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' :
                                                    user.role === 'SELLER' ? 'bg-blue-50 text-blue-600' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.verificationStatus === 'verified' ? (
                                                <span className="flex items-center gap-1 text-[#05DF72] text-xs font-bold">
                                                    <CheckCircle2Icon size={14} /> Verified
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                                    <AlertCircleIcon size={14} /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${user.status === 'banned' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                                }`}>
                                                {user.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-500">
                                                    <EyeIcon size={16} />
                                                </button>
                                                {user.role !== 'ADMIN' && (
                                                    <button
                                                        onClick={() => handleBanUser(user.id, user.status || 'active')}
                                                        className={`p-2 hover:bg-slate-100 rounded-lg ${user.status === 'banned' ? 'text-green-500' : 'text-red-400 hover:text-red-500'
                                                            }`}
                                                    >
                                                        <BanIcon size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">All Orders</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold">Order ID</th>
                                    <th className="px-6 py-4 text-left font-semibold">Product</th>
                                    <th className="px-6 py-4 text-left font-semibold">Amount</th>
                                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                                    <th className="px-6 py-4 text-left font-semibold">Collection Token</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm text-slate-600">{order.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">{order.product?.name || 'Battery'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">{currency}{(order.totalAmount || 0).toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${order.status === 'COMPLETED' ? 'bg-green-50 text-green-600' :
                                                    order.status === 'PICKED_UP' ? 'bg-blue-50 text-blue-600' :
                                                        'bg-amber-50 text-amber-600'
                                                }`}>
                                                {order.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-bold text-[#05DF72]">{order.collectionToken || '-'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payouts Tab */}
            {activeTab === 'payouts' && (
                <div className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2">
                            <WalletIcon size={20} /> Pending Payouts
                        </h3>
                        <p className="text-3xl font-black text-amber-900 mt-2">
                            {currency}{dashboardData.pendingPayouts.toLocaleString()}
                        </p>
                        <p className="text-sm text-amber-700 mt-1">To be released to sellers after collection confirmation</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">Completed Orders (Pending Payout)</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {orders.filter(o => o.status === 'COMPLETED' && o.payoutStatus === 'pending').map(order => (
                                <div key={order.id} className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-900">{order.product?.name || 'Battery Order'}</p>
                                        <p className="text-sm text-slate-500">Seller: {order.sellerId}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-lg font-bold text-slate-900">{currency}{(order.totalAmount || 0).toLocaleString()}</p>
                                        <Button
                                            onClick={() => handleReleasePayout(order.id)}
                                            className="!py-2 !px-4 !text-sm"
                                        >
                                            Release Payout
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {orders.filter(o => o.status === 'COMPLETED' && o.payoutStatus === 'pending').length === 0 && (
                                <div className="p-12 text-center text-slate-500">
                                    No pending payouts
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
