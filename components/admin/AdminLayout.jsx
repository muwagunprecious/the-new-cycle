'use client'
import { useEffect, useState, Suspense } from "react"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRight as ArrowRightIcon } from "lucide-react"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"
import dynamic from "next/dynamic"

const PendingPayoutSidebar = dynamic(() => import("./PendingPayoutSidebar"), { ssr: false })

const AdminLayout = ({ children }) => {

    const { user, isLoggedIn, isHydrated } = useSelector((state) => state.auth)
    const router = useRouter()
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isHydrated) return

        if (!isLoggedIn) {
            router.push('/login')
            return
        }

        const userRole = (user?.role || '').toUpperCase()
        const allowedAdminRoles = ['ADMIN', 'SUPER_ADMIN']
        if (user && allowedAdminRoles.includes(userRole)) {
            setIsAdmin(true)
        } else {
            setIsAdmin(false)
            // SYSTEM RULE: Strict rejection of non-admin roles in admin dashboard
            console.error(`[SECURITY] Unauthorized access attempt to Admin Dashboard`, {
                userId: user?.id,
                role: userRole
            })
        }
        setLoading(false)
    }, [user, isLoggedIn, router, isHydrated])

    return loading ? (
        <Loading />
    ) : isAdmin ? (
        <div className="flex flex-col h-screen overflow-hidden">
            <AdminNavbar />
            <div className="flex flex-1 items-start h-full overflow-hidden">
                <Suspense fallback={<div className="w-64 bg-white border-r animate-pulse"></div>}>
                    <AdminSidebar />
                </Suspense>
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll no-scrollbar">
                    <Suspense fallback={<Loading />}>
                        {children}
                    </Suspense>
                </div>
                <PendingPayoutSidebar />
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">You are not authorized to access this page</h1>
            <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 mt-8 p-2 px-6 max-sm:text-sm rounded-full">
                Go to home <ArrowRightIcon size={18} />
            </Link>
        </div>
    )
}

export default AdminLayout
