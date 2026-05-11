import { Search, ShoppingCart, BatteryCharging, Leaf as LeafIcon, Bell as BellIcon, LogOut as LogOutIcon, LayoutDashboard as LayoutDashboardIcon, Menu, X } from "lucide-react";
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
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const cartCount = useSelector(state => state.cart.total)
    const { user, isLoggedIn } = useSelector(state => state.auth)
    const notifications = useSelector(state => state.notifications.list)
    const unreadCount = notifications.filter(n => n.status === 'unread').length

    const handleNavigation = (href, message = "Loading...") => {
        setIsMenuOpen(false)
        if (href === '/shop') {
            dispatch(showLoader(message))
            setTimeout(() => {
                router.push(href)
                dispatch(hideLoader())
            }, 300)
        } else {
            router.push(href)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        handleNavigation(`/shop?search=${search}`, "Searching marketplace...")
    }

    const handleLogout = () => {
        setIsMenuOpen(false)
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
                <Link href="/" className="flex flex-col items-start gap-1 group z-50">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-emerald-500 p-2 rounded-xl shadow-sm transition-transform group-hover:scale-105">
                            <BatteryCharging className="text-white" size={20} />
                        </div>
                        <span className="text-2xl font-bold tracking-tighter text-slate-950">Go<span className="text-emerald-500">Cycle</span></span>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-600 ml-0.5">Africa’s e-waste market place</span>
                </Link>

                {/* Desktop Menu - Removed as per user request (moved to mobile only) */}

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="hidden xl:flex flex-1 max-w-sm relative group items-center">
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
                        <div className="hidden sm:flex items-center gap-2">
                            <button onClick={() => handleNavigation('/login', 'Redirecting to login...')} className="px-4 py-2 text-[12px] font-bold text-slate-600 hover:text-slate-950 transition-colors uppercase tracking-widest">
                                Sign In
                            </button>
                            <button onClick={() => handleNavigation('/signup', 'Redirecting to join...')} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-slate-900/10 whitespace-nowrap">
                                Sign Up
                            </button>
                        </div>
                    ) : (
                        <div className="hidden sm:flex items-center gap-2 pointer-events-auto">
                            <button onClick={() => handleNavigation(getDashboardLink(), 'Loading Portal...')} className="px-5 md:px-7 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2.5 group shadow-lg shadow-slate-900/10">
                                <LayoutDashboardIcon size={14} className="opacity-70" /> <span className="hidden md:inline">Portal</span>
                            </button>
                            <button onClick={handleLogout} className="p-2.5 bg-white border border-black/[0.08] text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all">
                                <LogOutIcon size={16} />
                            </button>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2.5 bg-slate-50 text-slate-600 rounded-xl lg:hidden hover:bg-emerald-50 hover:text-emerald-600 transition-all z-[60]"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm lg:hidden z-[55] transition-all duration-300" onClick={() => setIsMenuOpen(false)} />
            )}

            {/* Mobile Sidebar */}
            <div className={`fixed top-0 right-0 h-screen w-[280px] bg-white shadow-2xl z-[58] transform transition-transform duration-300 ease-in-out lg:hidden pt-24 px-6 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col gap-4">
                    <button 
                        onClick={() => handleNavigation('/shop', 'Opening Marketplace...')}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl text-slate-900 font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                    >
                        Marketplace <ArrowRight size={18} className="opacity-30" />
                    </button>

                    <button 
                        onClick={() => handleNavigation('/about')}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl text-slate-900 font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                    >
                        About Us <ArrowRight size={18} className="opacity-30" />
                    </button>

                    <button 
                        onClick={() => handleNavigation('/blog')}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl text-slate-900 font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                    >
                        Blogs <ArrowRight size={18} className="opacity-30" />
                    </button>

                    <div className="h-[1px] bg-slate-100 my-2"></div>

                    {!isLoggedIn ? (
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => handleNavigation('/login')}
                                className="w-full py-4 text-slate-600 font-bold text-sm border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all"
                            >
                                Sign In
                            </button>
                            <button 
                                onClick={() => handleNavigation('/signup')}
                                className="w-full py-4 bg-slate-900 text-white font-bold text-sm rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all"
                            >
                                Create Account
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => handleNavigation(getDashboardLink())}
                                className="w-full py-4 bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-500/10"
                            >
                                Go to Dashboard
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="w-full py-4 bg-white text-rose-500 border-2 border-rose-100 font-bold text-sm rounded-2xl"
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-10 left-6 right-6">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-center">GoCycle Africa v1.0</p>
                </div>
            </div>
        </nav>
    )
}

const ArrowRight = ({ size, className }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
)

export default Navbar;
