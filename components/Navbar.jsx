'use client'
import { ShoppingCart, BatteryCharging, LogOut as LogOutIcon, LayoutDashboard as LayoutDashboardIcon, Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/lib/features/auth/authSlice";
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice";
import { assets } from "../assets/assets";

const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();

    const isHomePage = pathname === '/'
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    // On non-home pages, always use dark/solid navbar style, or if the mobile menu is open
    const isDark = (isHomePage && !scrolled) || isMenuOpen
    
    const cartCount = useSelector(state => state.cart.total)
    const { user, isLoggedIn } = useSelector(state => state.auth)
    const notifications = useSelector(state => state.notifications.list)
    const unreadCount = notifications.filter(n => n.status === 'unread').length

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isMenuOpen])

    const handleNavigation = (href, message = "Loading...") => {
        setIsMenuOpen(false)
        router.push(href)
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
        const roleRoutes = {
            ADMIN: '/admin',
            SELLER: '/seller',
            DELIVERY: '/delivery',
            USER: '/buyer'
        }
        return roleRoutes[user.role] || '/buyer'
    }

    return (
        <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isMenuOpen ? 'py-5 bg-black' : isDark ? 'py-5' : 'py-3 bg-white/80 backdrop-blur-xl shadow-sm'}`}>
            <div className="max-container">
                <nav className="flex items-center justify-between">
                    
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                        <Image 
                            src={assets.gs_logo} 
                            alt="GoCycle" 
                            width={120} 
                            height={32} 
                            className="w-auto h-7 md:h-9 object-contain transition-transform group-hover:scale-105 duration-500"
                        />
                    </Link>

                    {/* Center Navigation — Pill Container (like Circunomics) */}
                    <div className={`hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-full border transition-all duration-300 ${
                        isDark 
                            ? 'bg-white/[0.08] backdrop-blur-md border-white/[0.12]' 
                            : 'bg-white/90 backdrop-blur-xl border-black/[0.06] shadow-lg'
                    }`}>
                        <Link href="/shop" prefetch={true} className={`px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                            isDark ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                        }`}>
                            Market place
                        </Link>
                        <Link href="/price-check" prefetch={true} className={`px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                            isDark ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                        }`}>
                            Price check
                        </Link>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Cart */}
                        <button onClick={() => handleNavigation('/cart')} className={`relative p-2.5 rounded-full transition-all hidden sm:flex ${
                            isDark ? 'text-white/70 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-50'
                        }`}>
                            <ShoppingCart size={18} />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 text-[8px] text-white bg-[#00D166] size-4 rounded-full flex items-center justify-center font-black">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {!isLoggedIn ? (
                            <button 
                                onClick={() => handleNavigation('/signup')} 
                                className="hidden sm:flex items-center gap-2 bg-[#00D166] text-white px-7 py-3 rounded-full text-[13px] font-semibold hover:bg-[#00A350] transition-all duration-300 hover:shadow-lg hover:shadow-[#00D166]/25"
                            >
                                Enter the Platform
                            </button>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <button 
                                    onClick={() => handleNavigation(getDashboardLink())} 
                                    className="flex items-center gap-2 bg-[#00D166] text-white px-7 py-3 rounded-full text-[13px] font-semibold hover:bg-[#00A350] transition-all duration-300 hover:shadow-lg hover:shadow-[#00D166]/25"
                                >
                                    <LayoutDashboardIcon size={15} /> Dashboard
                                </button>
                                <button 
                                    onClick={handleLogout} 
                                    className={`p-3 rounded-full transition-all duration-300 ${
                                        isDark 
                                            ? 'text-white/50 hover:bg-white/10 hover:text-rose-400' 
                                            : 'text-slate-400 hover:bg-rose-50 hover:text-rose-500'
                                    }`}
                                >
                                    <LogOutIcon size={16} />
                                </button>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`p-3 rounded-full lg:hidden transition-all ${
                                isDark ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-600'
                            }`}
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu — Dark Fullscreen Overlay */}
            <div className={`fixed inset-0 bg-black z-[90] lg:hidden transition-all duration-500 ease-in-out pt-28 px-6 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
                <div className="flex flex-col gap-2">
                    <Link href="/shop" prefetch={true} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between py-5 border-b border-white/[0.06] text-xl font-bold text-white">
                        Market place <ChevronRight size={20} className="text-[#00D166]" />
                    </Link>
                    <Link href="/price-check" prefetch={true} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between py-5 border-b border-white/[0.06] text-xl font-bold text-white">
                        Price check <ChevronRight size={20} className="text-[#00D166]" />
                    </Link>
                    
                    <div className="mt-10 flex flex-col gap-4">
                        {!isLoggedIn ? (
                            <>
                                <button onClick={() => handleNavigation('/login')} className="w-full py-4 rounded-full border border-white/10 text-white font-semibold hover:bg-white/5 transition-all">Sign In</button>
                                <button onClick={() => handleNavigation('/signup')} className="w-full py-4 rounded-full bg-[#00D166] text-white font-semibold hover:bg-[#00A350] transition-all">Enter the Platform</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => handleNavigation(getDashboardLink())} className="w-full py-4 rounded-full bg-[#00D166] text-white font-semibold hover:bg-[#00A350] transition-all">Dashboard</button>
                                <button onClick={handleLogout} className="w-full py-4 rounded-full border border-white/10 text-rose-400 font-semibold hover:bg-white/5 transition-all">Sign Out</button>
                            </>
                        )}
                        
                        <button onClick={() => setIsMenuOpen(false)} className="w-full py-4 mt-2 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                            <X size={18} /> Cancel
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar;
