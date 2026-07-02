'use client'
import { usePathname, useRouter } from "next/navigation"
import { Home as HomeIcon, ShoppingBag as ShoppingBagIcon, Package as PackageIcon, Heart as HeartIcon, LogOut as LogOutIcon, Menu as MenuIcon, X as XIcon, User as UserIcon, Bell as BellIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { showLoader } from "@/lib/features/ui/uiSlice"
import { logout } from "@/lib/features/auth/authSlice"

export default function BuyerLayout({ children }) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, isLoggedIn, isHydrated } = useSelector((state) => state.auth)
    const [loading, setLoading] = useState(true)

    // Auth Protection
    useEffect(() => {
        if (!isHydrated) return

        // If Redux says we are logged in, but we don't have user data yet, 
        // wait for the user object to be populated before making a decision.
        if (isLoggedIn && !user?.id) {
            console.log(`[AUTH CHECK] Logged in but waiting for user data...`)
            return
        }

        if (!isLoggedIn) {
            console.warn(`[AUTH CHECK] User not logged in (isHydrated: ${isHydrated}). Redirecting to /login. LocalStorage: ${typeof window !== 'undefined' ? !!localStorage.getItem('gocycle_session') : 'N/A'}`)
            router.replace('/login') // Use replace to avoid history clutter
            return
        }

        const userRole = (user?.role || '').toUpperCase()
        console.log(`[AUTH CHECK] Verified user role: ${userRole}`)

        if (userRole !== 'USER' && userRole !== 'BUYER') {
            console.error(`[SECURITY] Unauthorized access attempt to Buyer Dashboard`, {
                userId: user?.id,
                role: userRole
            })
            
            const ROLE_ROUTES = {
                'SUPER_ADMIN': '/admin',
                'ADMIN': '/admin',
                'SELLER': '/seller'
            }
            const destination = ROLE_ROUTES[userRole] || '/login'
            console.log(`[SECURITY] Redirecting to correct dashboard: ${destination}`)
            router.replace(destination)
            return
        }

        setLoading(false)
    }, [isLoggedIn, user, isHydrated, router, pathname])

    const dispatch = useDispatch()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const buyerLinks = [
        { name: 'Dashboard', href: '/buyer', icon: HomeIcon },
        { name: 'My Purchases', href: '/buyer/orders', icon: PackageIcon },
        { name: 'Collection Schedule', href: '/buyer/schedule', icon: ShoppingBagIcon },
        { name: 'Notifications', href: '/buyer/notifications', icon: BellIcon },
        { name: 'Profile Settings', href: '/buyer/profile', icon: UserIcon },
    ]

    const handleLogout = async () => {
        dispatch(showLoader("Signing you out..."))
        try {
            // Import the server action dynamically to avoid bundle issues if needed, 
            // but standard import is better.
            const { logoutUser } = await import("@/backend-actions/actions/auth")
            await logoutUser()
            dispatch(logout())
            router.push('/')
        } catch (err) {
            console.error("Logout failed", err)
            dispatch(logout())
            router.push('/')
        }
    }

    const handleNavigation = (href, message) => {
        dispatch(showLoader(message))
        setTimeout(() => {
            router.push(href)
        }, 500)
    }

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#05DF72]"></div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 transition-all">
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight cursor-pointer" onClick={() => handleNavigation('/')} >GoCycle <span className="text-[#05DF72]">Buyer</span></h1>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    {buyerLinks.map((link) => (
                        <button
                            key={link.name}
                            onClick={() => handleNavigation(link.href, `Loading ${link.name}...`)}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-sm transition-all w-full text-left ${pathname === link.href ? 'bg-[#05DF72]/10 text-[#05DF72] font-bold border-l-4 border-[#05DF72]' : 'text-slate-500 hover:bg-slate-50 border-l-4 border-transparent'}`}
                        >
                            <link.icon size={20} />
                            {link.name}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-sm w-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                        <LogOutIcon size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-6">
                <h1 className="font-bold text-slate-900" onClick={() => handleNavigation('/')}>GoCycle Buyer</h1>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500">
                    {isSidebarOpen ? <XIcon /> : <MenuIcon />}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}>
                    <aside className="w-64 h-full bg-white p-6" onClick={(e) => e.stopPropagation()}>
                        <nav className="space-y-4 mt-12">
                            {buyerLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => {
                                        setIsSidebarOpen(false)
                                        handleNavigation(link.href, `Loading ${link.name}...`)
                                    }}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-sm w-full text-left ${pathname === link.href ? 'bg-[#05DF72]/10 text-[#05DF72] font-bold border-l-4 border-[#05DF72]' : 'text-slate-500 border-l-4 border-transparent'}`}
                                >
                                    <link.icon size={20} />
                                    {link.name}
                                </button>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 rounded-sm w-full text-left text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                            >
                                <LogOutIcon size={20} />
                                Logout
                            </button>
                        </nav>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 md:p-10 md:pt-10 pt-20 no-scrollbar">
                {children}
            </main>
        </div>
    )
}
