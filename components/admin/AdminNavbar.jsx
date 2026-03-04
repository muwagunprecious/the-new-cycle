'use client'
import Link from "next/link"
import { useState, useEffect, useCallback, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/features/auth/authSlice"
import { showLoader } from "@/lib/features/ui/uiSlice"
import { Bell as BellIcon, LogOut as LogOutIcon } from "lucide-react"
import { getNotifications } from "@/backend/actions/notification"
import toast from "react-hot-toast"

const AdminNavbar = () => {
    const { user } = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const router = useRouter()
    const [unreadCount, setUnreadCount] = useState(0)
    const lastNotifiedId = useRef(null)

    const handleLogout = () => {
        dispatch(showLoader("Signing you out..."))
        setTimeout(() => {
            dispatch(logout())
            router.push('/')
        }, 800)
    }

    const checkNotifications = useCallback(async () => {
        if (!user?.id) return
        const res = await getNotifications(user.id)
        if (res.success) {
            const unread = res.data.filter(n => n.status === 'unread')
            setUnreadCount(unread.length)

            // Show toast for the latest unread notification if it's new
            if (unread.length > 0) {
                const latest = unread[0]
                if (latest.id !== lastNotifiedId.current) {
                    lastNotifiedId.current = latest.id
                    // Only toast for critical types
                    if (['ORDER', 'PAYMENT'].includes(latest.type)) {
                        toast.success(latest.title + ": " + latest.message, {
                            duration: 5000,
                            position: 'top-right',
                            icon: '🔔'
                        })
                    }
                }
            }
        }
    }, [user?.id])

    useEffect(() => {
        checkNotifications()
        const interval = setInterval(checkNotifications, 10000) // Poll every 10 seconds
        return () => clearInterval(interval)
    }, [checkNotifications])

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                <span className="text-green-600">go</span>Cycle<span className="text-green-600 text-5xl leading-0">.</span>
                <p className="absolute text-xs font-semibold -top-1 -right-13 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                    Admin
                </p>
            </Link>
            <div className="flex items-center gap-6">
                <Link href="/admin/notifications" className="relative p-2 text-slate-400 hover:text-[#05DF72] transition-colors">
                    <BellIcon size={24} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-5 h-5 bg-[#05DF72] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                            {unreadCount}
                        </span>
                    )}
                </Link>
                <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-slate-700">Hi, Admin</p>
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                        A
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100 rounded-lg"
                    title="Logout"
                >
                    <LogOutIcon size={20} />
                </button>
            </div>
        </div>
    )
}

export default AdminNavbar