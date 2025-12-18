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
        <nav className="relative bg-white border-b border-slate-50 sticky top-0 z-50">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-5 transition-all">

                    <div onClick={() => handleNavigation('/')} className="flex items-center gap-2 group cursor-pointer">
                        <div className="bg-[#05DF72] p-2 rounded-xl transition-transform group-hover:rotate-12 shadow-lg shadow-[#05DF72]/20">
                            <LeafIcon className="text-white fill-white" size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">Go<span className="text-[#05DF72]">Cycle</span></span>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Battery Loop</span>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-500 font-bold text-sm">
                        <button onClick={() => handleNavigation('/shop', 'Entering Marketplace...')} className="hover:text-[#05DF72] transition-colors uppercase tracking-widest text-[10px]">Marketplace</button>
                        <button onClick={() => handleNavigation('/about', 'Checking our impact...')} className="hover:text-[#05DF72] transition-colors uppercase tracking-widest text-[10px]">Eco Impact</button>
                        <button onClick={() => handleNavigation('/seller', 'Loading seller portal...')} className="text-[#05DF72] bg-[#05DF72]/5 px-4 py-2 rounded-full hover:bg-[#05DF72] hover:text-white transition-all uppercase tracking-widest text-[10px]">Sell Batteries</button>

                        <form onSubmit={handleSearch} className="hidden lg:flex items-center w-48 text-[10px] gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 focus-within:border-[#05DF72] transition-all">
                            <Search size={14} className="text-slate-400" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-400 text-slate-700 font-bold uppercase" type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <div className="flex items-center gap-2">
                            <button onClick={() => handleNavigation('/cart', 'Fetching your cart...')} className="relative p-2.5 hover:bg-slate-50 rounded-xl transition-all group">
                                <ShoppingCart size={20} className="text-slate-600 group-hover:text-[#05DF72]" />
                                {cartCount > 0 && <span key={cartCount} className="absolute -top-1 -right-1 text-[10px] text-white bg-slate-900 size-5 rounded-full flex items-center justify-center font-black shadow-lg animate-pop-badge">{cartCount}</span>}
                            </button>

                            {isLoggedIn && (
                                <button onClick={() => handleNavigation('/notifications', 'Fetching alerts...')} className="relative p-2.5 hover:bg-slate-50 rounded-xl transition-all group">
                                    <BellIcon size={20} className="text-slate-600 group-hover:text-[#05DF72]" />
                                    {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-[#05DF72] rounded-full ring-2 ring-white"></span>}
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3 ml-2">
                            {!isLoggedIn ? (
                                <button onClick={() => handleNavigation('/login', 'Redirecting to login...')} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200">
                                    Sign In
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleNavigation(getDashboardLink(), 'Loading Portal...')} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#05DF72] transition-all shadow-xl shadow-slate-200 flex items-center gap-2">
                                        <LayoutDashboardIcon size={14} /> Portal
                                    </button>
                                    <button onClick={handleLogout} className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all active:scale-95">
                                        <LogOutIcon size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Mobile Controls  */}
                    <div className="sm:hidden flex items-center gap-3">
                        <button onClick={() => handleNavigation('/cart')} className="relative p-2">
                            <ShoppingCart size={22} className="text-slate-700" />
                            {cartCount > 0 && <span className="absolute -top-1 -right-1 text-[8px] text-white bg-slate-900 size-4 rounded-full flex items-center justify-center font-black">{cartCount}</span>}
                        </button>
                        {!isLoggedIn ? (
                            <button onClick={() => handleNavigation('/login')} className="px-4 py-2 bg-[#05DF72] text-[10px] font-black text-white rounded-xl uppercase tracking-widest">
                                Login
                            </button>
                        ) : (
                            <button onClick={() => handleNavigation(getDashboardLink())} className="p-2 bg-slate-900 text-white rounded-xl">
                                <LayoutDashboardIcon size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;
