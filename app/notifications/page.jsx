'use client'
import { useSelector, useDispatch } from "react-redux"
import { useState, useEffect } from "react"
import { markAsRead, markAllAsRead, addNotification } from "@/lib/features/notification/notificationSlice"
import { BellIcon, CheckIcon, TrashIcon, InfoIcon, ShieldAlertIcon, PackageIcon } from "lucide-react"
import { getNotifications, markNotificationAsRead } from "@/backend/actions/notification"
import Loading from "@/components/Loading"

export default function NotificationsPage() {
    const notifications = useSelector(state => state.notifications.list)
    const { user } = useSelector(state => state.auth)
    const [loading, setLoading] = useState(true)
    const [realNotifications, setRealNotifications] = useState([])
    const dispatch = useDispatch()

    useEffect(() => {
        const load = async () => {
            if (user?.id) {
                const result = await getNotifications(user.id)
                if (result.success) {
                    setRealNotifications(result.data)
                }
            }
            setLoading(false)
        }
        load()
    }, [user])

    const handleMarkAsRead = async (notifId) => {
        await markNotificationAsRead(notifId)
        setRealNotifications(prev => prev.map(n => n.id === notifId ? { ...n, status: 'read' } : n))
    }

    const getIcon = (type) => {
        switch (type) {
            case 'SYSTEM': return <ShieldAlertIcon className="text-amber-500" size={18} />
            case 'SUCCESS': return <CheckIcon className="text-[#05DF72]" size={18} />
            case 'ORDER': return <PackageIcon className="text-blue-500" size={18} />
            default: return <InfoIcon className="text-slate-400" size={18} />
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 sm:p-10">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 leading-tight">Your <span className="text-[#05DF72]">Alerts</span></h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Real-time system updates</p>
                    </div>
                    <button onClick={() => { }} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                        Mark all as read
                    </button>
                </div>

                <div className="space-y-4">
                    {loading ? <Loading /> : realNotifications.length > 0 ? realNotifications.map((notif) => (
                        <div key={notif.id} onClick={() => handleMarkAsRead(notif.id)}
                            className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex items-start gap-5 ${notif.status === 'unread' ? 'bg-white border-[#05DF72]/20 shadow-xl shadow-[#05DF72]/5' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                            <div className={`p-3 rounded-2xl ${notif.status === 'unread' ? 'bg-[#05DF72]/10' : 'bg-slate-200/50'}`}>
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={`font-black uppercase tracking-tight text-sm ${notif.status === 'unread' ? 'text-slate-900' : 'text-slate-500'}`}>{notif.title}</h3>
                                    <span className="text-[10px] font-bold text-slate-400">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{notif.message}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                            <BellIcon className="mx-auto text-slate-200 mb-4" size={48} />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No notifications yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
