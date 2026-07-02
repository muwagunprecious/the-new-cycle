'use client'
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { Bell as BellIcon, Check as CheckIcon, Info as InfoIcon, ShieldAlert as ShieldAlertIcon, Package as PackageIcon, Calendar as CalendarIcon, ArrowRight as ArrowRightIcon } from "lucide-react"
import { getNotifications, markNotificationAsRead } from "@/backend-actions/actions/notification"
import Loading from "@/components/Loading"
import toast from "react-hot-toast"

export default function SellerNotifications() {
    const { user } = useSelector(state => state.auth)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [notifications, setNotifications] = useState([])

    const loadNotifications = async () => {
        if (user?.id) {
            const result = await getNotifications(user.id)
            if (result.success) {
                setNotifications(result.data)
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        loadNotifications()
        // Poll every 30s for new notifications
        const interval = setInterval(loadNotifications, 30000)
        return () => clearInterval(interval)
    }, [user])

    const handleMarkAsRead = async (notifId) => {
        await markNotificationAsRead(notifId)
        setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, status: 'read' } : n))
    }

    const handleMarkAllAsRead = async () => {
        const unread = notifications.filter(n => n.status === 'unread')
        if (unread.length === 0) return

        await Promise.all(unread.map(n => markNotificationAsRead(n.id)))
        setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })))
        toast.success("All notifications marked as read")
    }

    const handleNotificationClick = async (notif) => {
        await handleMarkAsRead(notif.id)

        // Navigate to orders page for reschedule and order notifications
        if (notif.type === 'RESCHEDULE' || notif.type === 'ORDER') {
            router.push('/seller/orders')
        }
    }

    const getIcon = (type) => {
        switch (type) {
            case 'SYSTEM': return <ShieldAlertIcon className="text-amber-500" size={18} />
            case 'SUCCESS': return <CheckIcon className="text-[#05DF72]" size={18} />
            case 'ORDER': return <PackageIcon className="text-blue-500" size={18} />
            case 'RESCHEDULE': return <CalendarIcon className="text-amber-500" size={18} />
            default: return <InfoIcon className="text-slate-400" size={18} />
        }
    }

    const getAccentColor = (type) => {
        switch (type) {
            case 'RESCHEDULE': return { bg: 'bg-amber-50', border: 'border-amber-200/60', activeBorder: 'hover:border-amber-300', iconBg: 'bg-amber-100' }
            case 'ORDER': return { bg: 'bg-white', border: 'border-[#05DF72]/20', activeBorder: 'hover:border-[#05DF72]/45', iconBg: 'bg-[#05DF72]/10' }
            case 'SUCCESS': return { bg: 'bg-white', border: 'border-[#05DF72]/20', activeBorder: 'hover:border-[#05DF72]/45', iconBg: 'bg-[#05DF72]/10' }
            default: return { bg: 'bg-white', border: 'border-slate-200/60', activeBorder: 'hover:border-slate-300', iconBg: 'bg-slate-100' }
        }
    }

    const getTypeLabel = (type) => {
        switch (type) {
            case 'RESCHEDULE': return 'Reschedule'
            case 'ORDER': return 'Order'
            case 'SUCCESS': return 'Success'
            case 'SYSTEM': return 'System'
            default: return 'Alert'
        }
    }

    const unreadCount = notifications.filter(n => n.status === 'unread').length

    return (
        <div className="space-y-10">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900">Seller <span className="text-[#05DF72]">Alerts</span></h1>
                        {unreadCount > 0 && (
                            <span className="bg-[#05DF72] text-white text-[10px] font-black px-2.5 py-1 rounded-sm">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 mt-1">System notifications, payout updates, reschedule requests, and new orders.</p>
                </div>
                {unreadCount > 0 && (
                    <button 
                        onClick={handleMarkAllAsRead} 
                        className="px-5 py-3 bg-white border border-slate-200 text-slate-900 rounded-sm font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-center"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="space-y-4 max-w-4xl">
                {loading ? (
                    <Loading />
                ) : notifications.length > 0 ? (
                    notifications.map((notif) => {
                        const colors = notif.status === 'unread' ? getAccentColor(notif.type) : { bg: 'bg-slate-50', border: 'border-slate-200/60', activeBorder: 'hover:opacity-100', iconBg: 'bg-slate-200/50' }
                        const isActionable = notif.type === 'RESCHEDULE' || notif.type === 'ORDER'

                        return (
                            <div 
                                key={notif.id} 
                                onClick={() => handleNotificationClick(notif)}
                                className={`p-6 rounded-sm border transition-all cursor-pointer flex items-start gap-5 ${colors.bg} ${colors.border} ${colors.activeBorder} ${
                                    notif.status === 'unread' ? 'shadow-sm' : 'opacity-60'
                                }`}
                            >
                                <div className={`p-3 rounded-sm shrink-0 ${colors.iconBg}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4 mb-1.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border shrink-0 ${
                                                notif.type === 'RESCHEDULE' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                notif.type === 'ORDER' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                notif.type === 'SUCCESS' ? 'bg-green-50 text-[#05DF72] border-green-100' :
                                                'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                                {getTypeLabel(notif.type)}
                                            </span>
                                            <h3 className={`font-bold uppercase tracking-tight text-sm truncate ${notif.status === 'unread' ? 'text-slate-950 font-black' : 'text-slate-500'}`}>
                                                {notif.title}
                                            </h3>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                            {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{notif.message}</p>

                                    {/* Action hint for reschedule/order notifications */}
                                    {isActionable && notif.status === 'unread' && (
                                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#05DF72]">
                                            <ArrowRightIcon size={12} /> View & Respond
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-20 bg-white rounded-sm border border-dashed border-slate-200">
                        <BellIcon className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No notifications yet</p>
                    </div>
                )}
            </div>
        </div>
    )
}
