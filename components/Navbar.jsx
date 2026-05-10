import { Search, ShoppingCart, BatteryCharging, Leaf as LeafIcon, Bell as BellIcon, LogOut as LogOutIcon, LayoutDashboard as LayoutDashboardIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/lib/features/auth/authSlice";
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice";

const Navbar = () => {

    const router = useRouter();
    const dispatch = useDispatch();

    const [search, setSearch] = useState('')
    const cartCount = useSelector(state => state.cart.total)
    const { user, isLoggedIn } = useSelector(state => state.auth)
    const notifications = useSelector(state => state.notifications.list)
    const unreadCount = notifications.filter(n => n.status === 'unread').length

    const handleNavigation = (href, message = "Loading...") => {
        // Removed manual loader dispatch to allow for smoother, instant-feeling transitions
        router.push(href)
    }

    const handleSearch = (e) => {
        e.preventDefault()
        handleNavigation(`/shop?search=${search}`, "Searching marketplace...")
    }

    const handleLogout = () => {
        dispatch(showLoader("Signing you out..."))
        setTimeout(() => {
            dispatch(logout())
            dispatch(hideLoader())
            router.push('/')
        }, 500)
    }

    const getDashboardLink = () => {
        if (!user) return '/login'
        if (user.role === 'ADMIN') return '/admin'
        if (user.role === 'SELLER') return '/seller'
        if (user.role === 'DELIVERY') return '/delivery'
        return '/buyer'
    }

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-black/[0.04]">
            <div className={`max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between`}>

                {/* Logo */}
                <Link href="/" className="flex flex-col items-start gap-1 group">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-emerald-500 p-2 rounded-xl shadow-sm transition-transform group-hover:scale-105">
                            <BatteryCharging className="text-white" size={20} />
                        </div>
                        <span className="text-2xl font-bold tracking-tighter text-slate-950">Go<span className="text-emerald-500">Cycle</span></span>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-600 ml-0.5">Africa’s e-waste market place</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-10">
                    <button onClick={() => handleNavigation('/shop', 'Entering Marketplace...')} className="text-[13px] font-medium text-slate-600 hover:text-emerald-600 transition-colors relative group py-2">
                        Marketplace
                        <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                    </button>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm relative group items-center">
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={15} />
                        <input
                            type="text"
                            placeholder="Search for scrapped batteries..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border border-black/[0.05] rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500/40 transition-all"
                        />
                    </div>
                </form>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2">
                        <button onClick={() => handleNavigation('/cart', 'Fetching your cart...')} className="relative p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all group">
                            <ShoppingCart size={18} className="group-hover:text-emerald-600 transition-colors" />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 text-[8px] text-white bg-emerald-600 size-4.5 rounded-full flex items-center justify-center font-black border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {isLoggedIn && (
                            <button onClick={() => handleNavigation('/notifications', 'Fetching alerts...')} className="relative p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all group">
                                <BellIcon size={18} className="group-hover:text-emerald-600 transition-colors" />
                                {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>}
                            </button>
                        )}
                    </div>

                    <div className="h-6 w-[1px] bg-black/[0.06] hidden sm:block"></div>

                    {!isLoggedIn ? (
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleNavigation('/login', 'Redirecting to login...')} className="px-4 py-2 text-[12px] font-bold text-slate-600 hover:text-slate-950 transition-colors uppercase tracking-widest">
                                Sign In
                            </button>
                            <button onClick={() => handleNavigation('/signup', 'Redirecting to join...')} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-slate-900/10 whitespace-nowrap">
                                Sign Up
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 pointer-events-auto">
                            <button onClick={() => handleNavigation(getDashboardLink(), 'Loading Portal...')} className="px-5 md:px-7 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2.5 group shadow-lg shadow-slate-900/10">
                                <LayoutDashboardIcon size={14} className="opacity-70" /> <span className="hidden md:inline">Portal</span>
                            </button>
                            <button onClick={handleLogout} className="p-2.5 bg-white border border-black/[0.08] text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all">
                                <LogOutIcon size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar;
