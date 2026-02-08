'use client'
import { BellIcon, CheckCircleIcon, AlertTriangleIcon, PackageIcon, UserCheckIcon, InfoIcon } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useSelector } from "react-redux"
import { getNotifications, markNotificationAsRead } from "@/backend/actions/notification"
import Loading from "@/components/Loading"
import toast from "react-hot-toast"

export default function AdminNotifications() {
    const { user } = useSelector(state => state.auth)
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchNotifications = useCallback(async () => {
        if (!user?.id) return
        const res = await getNotifications(user.id)
        if (res.success) {
            setNotifications(res.data)
        }
        setLoading(false)
    }, [user?.id])

    useEffect(() => {
        fetchNotifications()
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [fetchNotifications])

    const handleMarkRead = async (id) => {
        const res = await markNotificationAsRead(id)
        if (res.success) {
            setNotifications(notifications.map(n => n.id === id ? { ...n, status: 'read' } : n))
        }
    }

    const markAllRead = async () => {
        const unread = notifications.filter(n => n.status === 'unread')
        await Promise.all(unread.map(n => markNotificationAsRead(n.id)))
        setNotifications(notifications.map(n => ({ ...n, status: 'read' })))
        toast.success("All notifications marked as read")
    }

    const getIcon = (type) => {
        switch (type) {
            case 'ORDER': return PackageIcon;
            case 'PAYMENT': return CheckCircleIcon;
            case 'SYSTEM': return InfoIcon;
            default: return BellIcon;
        }
    }

    const getColor = (type) => {
        switch (type) {
            case 'ORDER': return { text: 'text-purple-500', bg: 'bg-purple-50' };
            case 'PAYMENT': return { text: 'text-[#05DF72]', bg: 'bg-green-50' };
            case 'SYSTEM': return { text: 'text-blue-500', bg: 'bg-blue-50' };
            default: return { text: 'text-slate-500', bg: 'bg-slate-50' };
        }
    }

    if (loading) return <Loading />

    return (
        <div className="p-6 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System <span className="text-[#05DF72]">Notifications</span></h1>
                    <p className="text-slate-500 mt-1">Stay updated with platform activities and logistics alerts.</p>
                </div>
                {notifications.some(n => n.status === 'unread') && (
                    <button onClick={markAllRead} className="text-sm font-bold text-[#05DF72] hover:underline">
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((note) => {
                        const Icon = getIcon(note.type)
                        const colors = getColor(note.type)
                        return (
                            <div
                                key={note.id}
                                onClick={() => note.status === 'unread' && handleMarkRead(note.id)}
                                className={`card p-5 flex gap-5 items-start transition-all cursor-pointer hover:border-[#05DF72]/30 ${note.status === 'unread' ? 'border-l-4 border-l-[#05DF72] bg-white shadow-md' : 'bg-slate-50/50 opacity-80'}`}
                            >
                                <div className={`${colors.bg} ${colors.text} p-3 rounded-2xl shrink-0`}>
                                    <Icon size={22} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-bold ${note.status === 'unread' ? 'text-slate-900' : 'text-slate-600'}`}>{note.title}</h3>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {new Date(note.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 leading-relaxed">{note.message}</p>
                                    <div className="flex items-center gap-3 mt-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${note.status === 'unread' ? 'bg-[#05DF72] text-white' : 'bg-slate-200 text-slate-500'}`}>
                                            {note.status}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Type: {note.type}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="mt-12 text-center p-10 border-2 border-dashed border-slate-100 rounded-[2rem]">
                        <BellIcon className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-slate-400 font-medium">No system notifications yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
