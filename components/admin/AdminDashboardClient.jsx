'use client'
import Loading from "@/components/Loading"
import { CircleDollarSign as CircleDollarSignIcon, ShoppingBasket as ShoppingBasketIcon, Store as StoreIcon, Tags as TagsIcon, Users as UsersIcon, PackageCheck as PackageCheckIcon, ShieldCheck as ShieldCheckIcon, ShieldX as ShieldXIcon, Ban as BanIcon, CheckCircle as CheckCircleIcon, AlertCircle as AlertCircleIcon, Wallet as WalletIcon, Eye as EyeIcon, Send as SendIcon, Trash2 as TrashIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Button from "@/components/Button"
import { getAdminDashboardSummary, getAllUsers, banUser, releasePayout, sendAdminNotification, getAdminPayoutHistory, getUserProfile, deleteUser } from "@/backend-actions/actions/admin"
import { getAllOrders } from "@/backend-actions/actions/order"
import dynamic from 'next/dynamic'
const AdminDiagnosticsPanel = dynamic(() => import('@/components/admin/AdminDiagnosticsPanel'), { ssr: false })

export default function AdminDashboardClient({ initialSummary, initialUsers, initialOrders, initialPayouts }) {
    const router = useRouter()
    const currency = '₦'

    const [loading, setLoading] = useState(false)



    const [activeTab, setActiveTab] = useState('overview') // overview | users | orders | payouts
    const [users, setUsers] = useState(initialUsers?.data || [])
    const [orders, setOrders] = useState(initialOrders?.data || [])
    const [payoutHistory, setPayoutHistory] = useState(initialPayouts?.data || [])
    
    const [dashboardData, setDashboardData] = useState(initialSummary || {
        products: 0,
        revenue: 0,
        orders: 0,
        stores: 0,
        pendingPayouts: 0,
        verifiedUsers: 0,
        unverifiedUsers: 0,
        totalUsers: 0,
        adminBalance: 0,
        pendingStats: {
            subtotal: 0,
            total: 0,
            sellerFee: 0,
            buyerFee: 0,
            payoutAmount: 0,
            platformEarnings: 0,
            adminBalance: 0
        }
    })
    const [sendingNotification, setSendingNotification] = useState(false)
    const [notificationForm, setNotificationForm] = useState({
        target: 'all',      // 'all' | 'buyers' | 'sellers' | 'specific'
        userId: '',
        title: '',
        message: '',
        type: 'SYSTEM',
        withEmail: false
    })

    const [fetchingData, setFetchingData] = useState({ users: false, orders: false, payouts: false })

    const [pagination, setPagination] = useState({
        users: initialUsers?.pagination || { page: 1, totalPages: 1 },
        orders: initialOrders?.pagination || { page: 1, totalPages: 1 },
        payouts: initialPayouts?.pagination || { page: 1, totalPages: 1 }
    })

    const [selectedUserProfile, setSelectedUserProfile] = useState(null)
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const [profileLoading, setProfileLoading] = useState(false)

    useEffect(() => {
        const handlePayoutReleased = async () => {
            try {
                const res = await getAdminDashboardSummary()
                if (res.success) {
                    setDashboardData(res.data)
                }
            } catch (err) {
                console.error("Failed to refresh dashboard data", err)
            }
        }
        window.addEventListener('payout-released', handlePayoutReleased)
        return () => window.removeEventListener('payout-released', handlePayoutReleased)
    }, [])

    const handleViewProfile = async (userId) => {
        setSelectedUserProfile(null)
        setProfileLoading(true)
        setIsProfileModalOpen(true)
        try {
            const res = await getUserProfile(userId)
            if (res.success) {
                setSelectedUserProfile(res.data)
            } else {
                toast.error(res.error || 'Failed to load profile')
                setIsProfileModalOpen(false)
            }
        } catch {
            toast.error('Failed to load profile')
            setIsProfileModalOpen(false)
        } finally {
            setProfileLoading(false)
        }
    }

    // Fetch data when switching tabs if it hasn't been loaded yet
    useEffect(() => {
        if ((activeTab === 'users' || activeTab === 'notify') && users.length === 0 && !fetchingData.users) {
            fetchUsers()
        }
        if ((activeTab === 'orders' || activeTab === 'payouts') && orders.length === 0 && !fetchingData.orders) {
            fetchOrders()
        }
        if (activeTab === 'payouts' && payoutHistory.length === 0 && !fetchingData.payouts) {
            fetchPayouts()
        }
    }, [activeTab])

    const fetchUsers = async () => {
        setFetchingData(prev => ({ ...prev, users: true }))
        const res = await getAllUsers(1, 50)
        if (res.success) {
            setUsers(res.data)
            setPagination(prev => ({ ...prev, users: res.pagination }))
        }
        setFetchingData(prev => ({ ...prev, users: false }))
    }

    const fetchOrders = async () => {
        setFetchingData(prev => ({ ...prev, orders: true }))
        const res = await getAllOrders(1, 50)
        if (res.success) {
            setOrders(res.data)
            setPagination(prev => ({ ...prev, orders: res.pagination }))
        }
        setFetchingData(prev => ({ ...prev, orders: false }))
    }

    const fetchPayouts = async () => {
        setFetchingData(prev => ({ ...prev, payouts: true }))
        const res = await getAdminPayoutHistory(1, 50)
        if (res.success) {
            setPayoutHistory(res.data)
            setPagination(prev => ({ ...prev, payouts: res.pagination }))
        }
        setFetchingData(prev => ({ ...prev, payouts: false }))
    }

    // Initial data is passed as props, removing Client-side initial waterfalls!

    const loadMorePayoutHistory = async () => {
        const nextPage = pagination.payouts.page + 1
        const res = await getAdminPayoutHistory(nextPage, 50)
        if (res.success) {
            setPayoutHistory([...payoutHistory, ...res.data])
            setPagination(prev => ({ ...prev, payouts: res.pagination }))
        }
    }

    const loadMoreUsers = async () => {
        const nextPage = pagination.users.page + 1
        const res = await getAllUsers(nextPage, 50)
        if (res.success) {
            setUsers([...users, ...res.data])
            setPagination(prev => ({ ...prev, users: res.pagination }))
        }
    }

    const loadMoreOrders = async () => {
        const nextPage = pagination.orders.page + 1
        const res = await getAllOrders(nextPage, 50)
        if (res.success) {
            setOrders([...orders, ...res.data])
            setPagination(prev => ({ ...prev, orders: res.pagination }))
        }
    }

    const handleBanUser = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'banned' : 'active'
        const result = await banUser(userId, newStatus === 'banned')
        if (result.success) {
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u))
            toast.success(`User ${newStatus === 'banned' ? 'banned' : 'unbanned'} successfully`)
        } else {
            toast.error(result.error || "Failed to update user status")
        }
    }

    const handleDeleteUser = async (userId, name) => {
        if (!confirm(`Are you sure you want to permanently delete ${name}? This action cannot be undone.`)) return
        const result = await deleteUser(userId)
        if (result.success) {
            setUsers(users.filter(u => u.id !== userId))
            toast.success(`${name} has been deleted successfully!`)
        } else {
            toast.error(result.error || "Failed to delete user")
        }
    }

    const handleSendNotification = async (e) => {
        e.preventDefault()
        if (!notificationForm.title || !notificationForm.message) {
            toast.error("Title and message are required")
            return
        }
        if (notificationForm.target === 'specific' && !notificationForm.userId) {
            toast.error("Please select a user")
            return
        }

        setSendingNotification(true)
        try {
            const result = await sendAdminNotification({
                target: notificationForm.target,
                userId: notificationForm.userId || undefined,
                title: notificationForm.title,
                message: notificationForm.message,
                type: notificationForm.type,
                sendEmail: notificationForm.withEmail
            })

            if (result.success) {
                toast.success(result.message || "Notification sent!")
                setNotificationForm(f => ({ ...f, title: '', message: '', userId: '' }))
            } else {
                toast.error(result.error || "Failed to send notification")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setSendingNotification(false)
        }
    }

    const handleReleasePayout = async (orderId) => {
        const result = await releasePayout(orderId)
        if (result.success) {
            setOrders(orders.map(o => o.id === orderId ? { ...o, payoutStatus: 'released' } : o))
            toast.success("Payout released to seller!")
            // Dispatch custom event to trigger real-time sidebar balance update
            window.dispatchEvent(new Event('payout-released'));
        } else {
            toast.error(result.error || "Failed to release payout")
        }
    }

    if (loading) return <Loading />

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'users', label: `Users (${dashboardData.totalUsers})` },
        { id: 'orders', label: `Orders (${dashboardData.orders})` },
        { id: 'payouts', label: 'Payouts' },
        { id: 'notify', label: '📣 Notify' },
        { id: 'diagnostics', label: '🩺 Diagnostics' },
    ]

    const statsCards = [
        { title: 'Total Sellers', value: dashboardData.stores, icon: StoreIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Verified Buyers', value: dashboardData.verifiedUsers, icon: ShieldCheckIcon, color: 'text-[#05DF72]', bg: 'bg-[#05DF72]/10' },
        { title: 'Total Listings', value: dashboardData.products, icon: ShoppingBasketIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
        { title: 'Total Orders', value: dashboardData.orders, icon: TagsIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
        { title: 'Platform Balance', value: currency + (dashboardData.adminBalance || 0).toLocaleString(), icon: CircleDollarSignIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { title: 'Total Revenue', value: currency + dashboardData.revenue.toLocaleString(), icon: CircleDollarSignIcon, color: 'text-green-600', bg: 'bg-green-50' },
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

                    {/* Quick Actions / Recent Orders */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Pending Verifications */}
                        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 shadow-sm flex flex-col">
                            <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2 shrink-0">
                                <AlertCircleIcon size={18} className="text-amber-500" />
                                Action Required
                            </h3>
                            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {(dashboardData.pendingVerifications || []).map(order => (
                                    <div key={order.id} className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-amber-100">
                                        <div className="flex justify-between items-center">
                                            <p className="font-black text-sm text-amber-900">₦{(order.total || 0).toLocaleString()}</p>
                                            <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">TRANSFER CHECK</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{order.paymentSenderName || 'No Name Provided'}</p>
                                        <button 
                                            onClick={() => {
                                                router.push('/admin/orders?orderId=' + order.id)
                                            }}
                                            className="mt-1 w-full py-2 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors"
                                        >
                                            Verify Transfer
                                        </button>
                                    </div>
                                ))}
                                {(!dashboardData.pendingVerifications || dashboardData.pendingVerifications.length === 0) && (
                                    <div className="text-center py-6 h-full flex flex-col items-center justify-center">
                                        <CheckCircleIcon className="mx-auto text-emerald-400 mb-2 opacity-50" size={32} />
                                        <p className="text-sm font-bold text-emerald-700 opacity-70">All caught up!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Orders</h3>
                            <div className="space-y-3">
                                {(dashboardData.recentOrders || []).map(order => (
                                    <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div>
                                            <p className="font-bold text-sm text-slate-900">{order.store?.name || 'Store Order'}</p>
                                            <p className="text-[10px] text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <p className="font-bold text-slate-900">{currency}{(order.total || 0).toLocaleString()}</p>
                                    </div>
                                ))}
                                {(!dashboardData.recentOrders || dashboardData.recentOrders.length === 0) && (
                                    <p className="text-center text-slate-500 py-4">No recent orders</p>
                                )}
                            </div>
                        </div>

                        {/* Send Notification */}
                        <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col">
                            <h3 className="text-lg font-bold mb-1 flex items-center gap-2 shrink-0">
                                <SendIcon size={18} className="text-[#05DF72]" />
                                Quick Notification
                            </h3>
                            <p className="text-slate-400 text-xs mb-4">Send to all users from the <span className="text-[#05DF72] font-bold">📣 Notify</span> tab</p>
                            <form onSubmit={handleSendNotification} className="space-y-3">
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
                                    Broadcast to All Users
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
                                            {user.accountStatus === 'approved' ? (
                                                <span className="flex items-center gap-1 text-[#05DF72] text-xs font-bold">
                                                    <CheckCircleIcon size={14} /> Verified
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
                                                {user.status || 'active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleViewProfile(user.id)}
                                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-500"
                                                    title="View profile"
                                                >
                                                    <EyeIcon size={16} />
                                                </button>
                                                {user.role !== 'ADMIN' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleBanUser(user.id, user.status || 'active')}
                                                            className={`p-2 hover:bg-slate-100 rounded-lg ${user.status === 'banned' ? 'text-green-500' : 'text-red-400 hover:text-red-500'
                                                                }`}
                                                        >
                                                            <BanIcon size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id, user.name)}
                                                            className="p-2 hover:bg-slate-100 rounded-lg text-red-500 hover:text-red-600"
                                                            title="Delete user"
                                                        >
                                                            <TrashIcon size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {pagination.users.page < pagination.users.totalPages && (
                        <div className="p-6 text-center border-t border-slate-100">
                            <button
                                onClick={loadMoreUsers}
                                className="text-sm font-bold text-[#05DF72] hover:underline"
                            >
                                Load More Users
                            </button>
                        </div>
                    )}
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
                                            <p className="font-bold text-slate-900">{currency}{(order.total || 0).toLocaleString()}</p>
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
                                            <span className="font-mono text-sm font-bold text-[#05DF72]">{order.verificationCode || '-'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {pagination.orders.page < pagination.orders.totalPages && (
                        <div className="p-6 text-center border-t border-slate-100">
                            <button
                                onClick={loadMoreOrders}
                                className="text-sm font-bold text-[#05DF72] hover:underline"
                            >
                                Load More Orders
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Payouts Tab */}
            {activeTab === 'payouts' && (
                <div className="space-y-8">
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
                                        <p className="text-sm text-slate-500 font-bold">Seller: {order.store?.name || 'Seller'}</p>
                                        {order.store?.accountNumber && (
                                            <div className="mt-1 p-2 bg-slate-50 rounded-lg border border-slate-100 text-[10px]">
                                                <p className="font-black text-slate-400 uppercase tracking-widest">Bank Details</p>
                                                <p className="text-slate-900 font-bold">{order.store.bankName} | {order.store.accountName}</p>
                                                <p className="text-slate-900 font-black font-mono mt-0.5">{order.store.accountNumber}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right mr-4">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Payout</p>
                                            <p className="text-lg font-bold text-[#05DF72] leading-none">{currency}{(order.payoutAmount || 0).toLocaleString()}</p>
                                        </div>
                                        <Button
                                            onClick={() => handleReleasePayout(order.id)}
                                            className="!py-2 !px-4 !text-sm border-none"
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

                    {/* Payout History Section */}
                    {payoutHistory.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900">Payout History</h3>
                                <div className="w-2 h-2 bg-[#05DF72] rounded-full animate-pulse"></div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                                        <tr>
                                            <th className="px-6 py-4 text-left">Released Date</th>
                                            <th className="px-6 py-4 text-left">Recipient (Seller)</th>
                                            <th className="px-6 py-4 text-left">Amount Transferred</th>
                                            <th className="px-6 py-4 text-left">Admin Fee Earned</th>
                                            <th className="px-6 py-4 text-right">Reference</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {payoutHistory.map(pay => (
                                            <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                                    {new Date(pay.updatedAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-slate-900">{pay.store?.name || 'Seller'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-black text-slate-900">{currency}{pay.payoutAmount.toLocaleString()}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-black text-[#05DF72]">{currency}{(pay.buyerFee + pay.sellerFee).toLocaleString()}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-mono text-[10px] text-slate-400">{pay.id}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {pagination.payouts.page < pagination.payouts.totalPages && (
                                <div className="p-6 text-center border-t border-slate-100">
                                    <button onClick={loadMorePayoutHistory} className="text-xs font-black uppercase tracking-widest text-[#05DF72] hover:underline">
                                        Load Full History
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Notify Tab */}
            {activeTab === 'notify' && (
                <div className="max-w-2xl space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#05DF72]/20 rounded-xl flex items-center justify-center">
                                <SendIcon className="text-[#05DF72]" size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Send Notification</h2>
                                <p className="text-slate-400 text-xs">Reach your users with in-app messages and optionally email</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <form onSubmit={handleSendNotification} className="space-y-5">

                            {/* Audience */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Audience</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { value: 'all', label: '🌐 Everyone', desc: `${dashboardData.totalUsers || 0} users` },
                                        { value: 'buyers', label: '🛒 Buyers', desc: `${(dashboardData.totalUsers || 0) - (dashboardData.stores || 0)} buyers` },
                                        { value: 'sellers', label: '🏪 Sellers', desc: `${dashboardData.stores || 0} sellers` },
                                        { value: 'specific', label: '👤 One User', desc: 'Pick from list' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setNotificationForm(f => ({ ...f, target: opt.value, userId: '' }))}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${notificationForm.target === opt.value
                                                ? 'border-[#05DF72] bg-[#05DF72]/5'
                                                : 'border-slate-100 hover:border-slate-200'
                                                }`}
                                        >
                                            <p className="font-bold text-sm text-slate-900">{opt.label}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Specific User Picker */}
                            {notificationForm.target === 'specific' && (
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Select User</label>
                                    <select
                                        value={notificationForm.userId}
                                        onChange={e => setNotificationForm(f => ({ ...f, userId: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                        required
                                    >
                                        <option value="">Choose a user...</option>
                                        {users.filter(u => u.role !== 'ADMIN').map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} – {u.role} ({u.email || u.phone})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Notification Type */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Type</label>
                                <select
                                    value={notificationForm.type}
                                    onChange={e => setNotificationForm(f => ({ ...f, type: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                >
                                    <option value="SYSTEM">📢 System Announcement</option>
                                    <option value="PROMO">🎁 Promotion / Offer</option>
                                    <option value="ORDER">📦 Order Update</option>
                                    <option value="PAYMENT">💳 Payment</option>
                                </select>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. New Feature Available!"
                                    value={notificationForm.title}
                                    onChange={e => setNotificationForm(f => ({ ...f, title: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                    maxLength={80}
                                    required
                                />
                                <p className="text-[10px] text-slate-400 mt-1 text-right">{notificationForm.title.length}/80</p>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Message</label>
                                <textarea
                                    placeholder="Write your message here..."
                                    value={notificationForm.message}
                                    onChange={e => setNotificationForm(f => ({ ...f, message: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium resize-none"
                                    rows={4}
                                    maxLength={500}
                                    required
                                />
                                <p className="text-[10px] text-slate-400 mt-1 text-right">{notificationForm.message.length}/500</p>
                            </div>

                            {/* Email Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="font-bold text-sm text-slate-900">Also send via Email</p>
                                    <p className="text-xs text-slate-400">Sends an email alongside the in-app notification</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setNotificationForm(f => ({ ...f, withEmail: !f.withEmail }))}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${notificationForm.withEmail ? 'bg-[#05DF72]' : 'bg-slate-200'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notificationForm.withEmail ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                loading={sendingNotification}
                                loadingText="Sending..."
                                className="w-full"
                            >
                                Send to {
                                    notificationForm.target === 'all' ? 'All Users' :
                                        notificationForm.target === 'buyers' ? 'All Buyers' :
                                            notificationForm.target === 'sellers' ? 'All Sellers' :
                                                'Selected User'
                                }
                            </Button>
                        </form>
                    </div>
                </div>
            )}
            {/* Diagnostics Tab */}
            {activeTab === 'diagnostics' && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                            <span className="text-lg">🩺</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Platform Diagnostics</h2>
                            <p className="text-sm text-slate-500">Real-time performance insights, active users, and system health</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-xs font-bold text-emerald-600">Live</span>
                        </div>
                    </div>
                    <AdminDiagnosticsPanel />
                </div>
            )}

            {/* ───── User Profile Modal ───── */}
            {isProfileModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) setIsProfileModalOpen(false) }}
                >
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#05DF72]/10 flex items-center justify-center">
                                    <EyeIcon size={18} className="text-[#05DF72]" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-base">User Profile</h3>
                                    <p className="text-xs text-slate-400">Full details as submitted</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsProfileModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors text-lg font-bold"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto flex-1 p-7">
                            {profileLoading ? (
                                <div className="py-24 flex flex-col items-center justify-center gap-3">
                                    <div className="w-10 h-10 border-4 border-[#05DF72]/30 border-t-[#05DF72] rounded-full animate-spin" />
                                    <p className="text-sm text-slate-400 font-medium">Loading profile...</p>
                                </div>
                            ) : selectedUserProfile ? (
                                <div className="space-y-6">
                                    {/* Avatar + Basic Info */}
                                    <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="w-16 h-16 rounded-2xl bg-[#05DF72]/10 flex items-center justify-center text-2xl font-black text-[#05DF72] shrink-0">
                                            {selectedUserProfile.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xl font-black text-slate-900 truncate">{selectedUserProfile.name}</h4>
                                            <p className="text-sm text-slate-500 truncate">{selectedUserProfile.email}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                                                    selectedUserProfile.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                    selectedUserProfile.role === 'SELLER' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>{selectedUserProfile.role}</span>
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                                                    selectedUserProfile.accountStatus === 'approved' ? 'bg-[#05DF72]/10 text-[#05DF72]' :
                                                    selectedUserProfile.accountStatus === 'rejected' ? 'bg-red-100 text-red-600' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>{selectedUserProfile.accountStatus || 'pending'}</span>
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                                                    selectedUserProfile.status === 'banned' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                                                }`}>{selectedUserProfile.status || 'active'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Details */}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Contact Details</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Phone</p>
                                                <p className="font-bold text-slate-800">{selectedUserProfile.phone || <span className="text-slate-300 font-medium">Not provided</span>}</p>
                                            </div>
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Email Verified</p>
                                                <p className={`font-bold ${selectedUserProfile.isEmailVerified ? 'text-[#05DF72]' : 'text-amber-500'}`}>
                                                    {selectedUserProfile.isEmailVerified ? '✓ Verified' : '✗ Unverified'}
                                                </p>
                                            </div>
                                            {selectedUserProfile.Address && selectedUserProfile.Address.length > 0 && (
                                                <div className="col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Address</p>
                                                    <p className="font-bold text-slate-800">{selectedUserProfile.Address[0]?.street}, {selectedUserProfile.Address[0]?.city}, {selectedUserProfile.Address[0]?.state}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Identity Documents */}
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Identity Documents</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">NIN Number</p>
                                                {selectedUserProfile.ninDocument ? (
                                                    <p className="text-slate-900 font-bold text-sm tracking-wide break-all">
                                                        {selectedUserProfile.ninDocument}
                                                    </p>
                                                ) : (
                                                    <p className="text-slate-300 font-medium text-sm">Not provided</p>
                                                )}
                                            </div>
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">CAC Document</p>
                                                {selectedUserProfile.cacDocument ? (
                                                    <a href={selectedUserProfile.cacDocument} target="_blank" rel="noreferrer"
                                                        className="text-blue-600 font-bold text-sm hover:underline break-all">
                                                        View CAC Doc ↗
                                                    </a>
                                                ) : (
                                                    <p className="text-slate-300 font-medium text-sm">Not provided</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Store Details (Sellers only) */}
                                    {selectedUserProfile.store && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Store Details</p>
                                            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                                        <StoreIcon size={18} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-blue-900">{selectedUserProfile.store.name}</p>
                                                        <p className="text-xs text-blue-500">@{selectedUserProfile.store.username}</p>
                                                    </div>
                                                    <span className={`ml-auto text-[10px] font-black px-3 py-1 rounded-full uppercase ${
                                                        selectedUserProfile.store.status === 'approved' ? 'bg-[#05DF72]/10 text-[#05DF72]' :
                                                        selectedUserProfile.store.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>{selectedUserProfile.store.status}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-100">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">NIN (Store)</p>
                                                        <p className="font-bold text-blue-900 text-sm">{selectedUserProfile.store.nin || <span className="text-blue-300 font-medium">N/A</span>}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">CAC Number</p>
                                                        <p className="font-bold text-blue-900 text-sm">{selectedUserProfile.store.cac || <span className="text-blue-300 font-medium">N/A</span>}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Bank Name</p>
                                                        <p className="font-bold text-blue-900 text-sm">{selectedUserProfile.store.bankName || <span className="text-blue-300 font-medium">N/A</span>}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Account Number</p>
                                                        <p className="font-mono font-black text-blue-900 text-sm">{selectedUserProfile.store.accountNumber || <span className="text-blue-300 font-medium">N/A</span>}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Account Name</p>
                                                        <p className="font-bold text-blue-900 text-sm">{selectedUserProfile.store.accountName || <span className="text-blue-300 font-medium">N/A</span>}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Address</p>
                                                        <p className="font-medium text-blue-800 text-sm">{selectedUserProfile.store.address || <span className="text-blue-300">N/A</span>}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Wallet Balance</p>
                                                        <p className="font-black text-[#05DF72] text-sm">₦{(selectedUserProfile.store.walletBalance || 0).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Timestamps */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Joined</p>
                                            <p className="font-bold text-slate-800 text-sm">
                                                {selectedUserProfile.createdAt ? new Date(selectedUserProfile.createdAt).toLocaleDateString('en-NG', { dateStyle: 'medium' }) : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Verified At</p>
                                            <p className="font-bold text-slate-800 text-sm">
                                                {selectedUserProfile.verifiedAt ? new Date(selectedUserProfile.verifiedAt).toLocaleDateString('en-NG', { dateStyle: 'medium' }) : 'Not verified'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-20 text-center text-slate-400">
                                    <p className="font-bold">Could not load profile.</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-7 py-4 border-t border-slate-100 shrink-0">
                            <button
                                onClick={() => setIsProfileModalOpen(false)}
                                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
