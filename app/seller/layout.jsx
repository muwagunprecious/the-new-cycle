'use client'
import { usePathname, useRouter } from "next/navigation"
import { HomeIcon, ShoppingBagIcon, PackageIcon, SettingsIcon, LogOutIcon, MenuIcon, XIcon, BatteryIcon } from "lucide-react"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { showLoader } from "@/lib/features/ui/uiSlice"

export default function SellerLayout({ children }) {
    const pathname = usePathname()
    const router = useRouter()
    const dispatch = useDispatch()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const sellerLinks = [
        { name: 'Overview', href: '/seller', icon: HomeIcon },
        { name: 'My Batteries', href: '/seller/products', icon: BatteryIcon },
        { name: 'Incoming Orders', href: '/seller/orders', icon: PackageIcon },
        { name: 'Settings', href: '/seller/settings', icon: SettingsIcon },
    ]

    const handleNavigation = (href, message) => {
        dispatch(showLoader(message))
        setTimeout(() => {
            router.push(href)
        }, 500)
    }

    return (
        <div className="flex h-screen bg-[#f9fafb]">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200">
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight cursor-pointer" onClick={() => handleNavigation('/')}>GoCycle <span className="text-[#05DF72]">Seller</span></h1>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    {sellerLinks.map((link) => (
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

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-6">
                <h1 className="font-bold text-slate-900" onClick={() => handleNavigation('/')}>GoCycle Seller</h1>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500">
                    {isSidebarOpen ? <XIcon /> : <MenuIcon />}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}>
                    <aside className="w-64 h-full bg-white p-6" onClick={(e) => e.stopPropagation()}>
                        <nav className="space-y-4 mt-12">
                            {sellerLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => {
                                        setIsSidebarOpen(false)
                                        handleNavigation(link.href, `Loading ${link.name}...`)
                                    }}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left ${pathname === link.href ? 'bg-[#05DF72]/10 text-[#05DF72] font-semibold' : 'text-slate-500'}`}
                                >
                                    <link.icon size={20} />
                                    {link.name}
                                </button>
                            ))}
                        </nav>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:pt-10 pt-20 no-scrollbar">
                {children}
            </main>
        </div>
    )
}
