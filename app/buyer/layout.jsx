'use client'
import { usePathname, useRouter } from "next/navigation"
import { HomeIcon, ShoppingBagIcon, PackageIcon, HeartIcon, LogOutIcon, MenuIcon, XIcon, UserIcon } from "lucide-react"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { showLoader } from "@/lib/features/ui/uiSlice"

export default function BuyerLayout({ children }) {
    const pathname = usePathname()
    const router = useRouter()
    const dispatch = useDispatch()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const buyerLinks = [
        { name: 'Dashboard', href: '/buyer', icon: HomeIcon },
        { name: 'My Purchases', href: '/buyer/orders', icon: PackageIcon },
        { name: 'Collection Schedule', href: '/buyer/schedule', icon: ShoppingBagIcon },
        { name: 'Profile Settings', href: '/buyer/profile', icon: UserIcon },
    ]

    const handleNavigation = (href, message) => {
        dispatch(showLoader(message))
        setTimeout(() => {
            router.push(href)
        }, 500)
    }

    return (
        <div className="flex h-screen bg-[#f9fafb]">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200">
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight cursor-pointer" onClick={() => handleNavigation('/')} >GoCycle <span className="text-[#05DF72]">Buyer</span></h1>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    {buyerLinks.map((link) => (
                        <button
                            key={link.name}
                            onClick={() => handleNavigation(link.href, `Loading ${link.name}...`)}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all w-full text-left ${pathname === link.href ? 'bg-[#05DF72]/10 text-[#05DF72] font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <link.icon size={20} />
                            {link.name}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-rose-500 transition-colors">
                        <LogOutIcon size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
                {children}
            </main>
        </div>
    )
}
