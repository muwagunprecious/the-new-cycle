import { Search, ShoppingCart, LeafIcon, BellIcon, LogOutIcon, LayoutDashboardIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/lib/features/auth/authSlice";
import { showLoader } from "@/lib/features/ui/uiSlice";

const Navbar = () => {

    const router = useRouter();
    const dispatch = useDispatch();

    const [search, setSearch] = useState('')
    const cartCount = useSelector(state => state.cart.total)
    const { user, isLoggedIn } = useSelector(state => state.auth)
    const notifications = useSelector(state => state.notifications.list)
    const unreadCount = notifications.filter(n => n.status === 'unread').length

    const handleNavigation = (href, message = "Loading...") => {
        dispatch(showLoader(message))
        setTimeout(() => {
            router.push(href)
        }, 500)
    }

    const handleSearch = (e) => {
        e.preventDefault()
        handleNavigation(`/shop?search=${search}`, "Searching marketplace...")
    }

    const handleLogout = () => {
        dispatch(showLoader("Signing you out..."))
        setTimeout(() => {
            dispatch(logout())
            router.push('/')
        }, 800)
    }

    const getDashboardLink = () => {
        if (!user) return '/login'
        if (user.role === 'ADMIN') return '/admin'
        if (user.role === 'SELLER') return '/seller'
        if (user.role === 'DELIVERY') return '/delivery'
        return '/buyer'
    }

    return (
        <nav className="sticky top-0 z-[60] bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-glass-sm font-sans transition-all">
            <div className="mx-6 lg:mx-10">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4">

                    <div onClick={() => handleNavigation('/')} className="flex items-center gap-3 group cursor-pointer">
                        <div className="bg-emerald-500 p-2.5 rounded-[1.2rem] shadow-2xl shadow-emerald-500/20 rotate-3 transition-transform group-hover:rotate-12">
                            <LeafIcon className="text-white fill-white" size={22} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">Go<span className="text-emerald-500">Cycle</span></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Battery Loop</span>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6 lg:gap-10">
                        <div className="flex items-center gap-6 text-slate-500 font-black uppercase tracking-[0.1em] text-[10px]">
                            <button onClick={() => handleNavigation('/shop', 'Entering Marketplace...')} className="hover:text-emerald-500 transition-colors">Marketplace</button>
                            <button onClick={() => handleNavigation('/seller', 'Loading seller portal...')} className="text-emerald-500 bg-emerald-500/5 px-5 py-2.5 rounded-full hover:bg-emerald-500 hover:text-white transition-all shadow-sm">Sell Battery</button>
                        </div>

                        <form onSubmit={handleSearch} className="hidden lg:flex items-center w-64 gap-3 bg-slate-50/50 border-2 border-slate-100/50 rounded-2xl px-5 py-2.5 focus-within:border-emerald-500 focus-within:bg-white transition-all group">
                            <Search size={16} className="text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                            <input className="w-full bg-transparent outline-none placeholder:text-slate-300 text-slate-900 font-bold text-[11px] uppercase tracking-wider" type="text" placeholder="Search eco-batteries..." value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <div className="h-8 w-px bg-slate-200/50"></div>

                        <div className="flex items-center gap-3">
                            <button onClick={() => handleNavigation('/cart', 'Fetching your cart...')} className="relative p-3 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-slate-100">
                                <ShoppingCart size={20} className="text-slate-600 group-hover:text-emerald-500 transition-colors" />
                                {cartCount > 0 && (
                                    <span key={cartCount} className="absolute -top-1.5 -right-1.5 text-[10px] text-white bg-slate-900 size-5.5 rounded-full flex items-center justify-center font-black shadow-xl border-2 border-white animate-pop-badge">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {isLoggedIn && (
                                <button onClick={() => handleNavigation('/notifications', 'Fetching alerts...')} className="relative p-3 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-slate-100">
                                    <BellIcon size={20} className="text-slate-600 group-hover:text-emerald-500 transition-colors" />
                                    {unreadCount > 0 && <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>}
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-6">
                            {!isLoggedIn ? (
                                <div className="flex items-center gap-6">
                                    <button onClick={() => handleNavigation('/login', 'Redirecting to login...')} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors whitespace-nowrap">
                                        Log In
                                    </button>
                                    <button onClick={() => handleNavigation('/signup', 'Redirecting to join...')} className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all shadow-2xl shadow-slate-900/10 whitespace-nowrap">
                                        Sign Up
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 pr-1">
                                    <button onClick={() => handleNavigation(getDashboardLink(), 'Loading Portal...')} className="px-8 py-3.5 bg-slate-900 text-white rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-2xl shadow-slate-900/10 flex items-center gap-3">
                                        <LayoutDashboardIcon size={14} className="opacity-60" /> Portal
                                    </button>
                                    <button onClick={handleLogout} className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100">
                                        <LogOutIcon size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Mobile Controls  */}
                    <div className="md:hidden flex items-center gap-4">
                        <button onClick={() => handleNavigation('/cart')} className="relative p-2.5 bg-slate-50 rounded-xl">
                            <ShoppingCart size={20} className="text-slate-900" />
                            {cartCount > 0 && <span className="absolute -top-1 -right-1 text-[8px] text-white bg-emerald-500 size-4.5 rounded-full flex items-center justify-center font-black border-2 border-white">{cartCount}</span>}
                        </button>
                        {!isLoggedIn ? (
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleNavigation('/login')} className="px-4 py-2.5 bg-slate-100 text-[9px] font-black text-slate-600 rounded-xl uppercase tracking-widest">
                                    Login
                                </button>
                                <button onClick={() => handleNavigation('/signup')} className="px-5 py-2.5 bg-emerald-500 text-[9px] font-black text-white rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                    Sign Up
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => handleNavigation(getDashboardLink())} className="p-3 bg-slate-900 text-white rounded-xl shadow-lg">
                                <LayoutDashboardIcon size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;
