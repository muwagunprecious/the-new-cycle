'use client'

import { usePathname, useRouter } from "next/navigation"
import { Home as HomeIcon, ShieldCheck as ShieldCheckIcon, Store as StoreIcon, Users as UsersIcon, ShoppingBag as ShoppingBagIcon, Bell as BellIcon, LogOut as LogOutIcon } from "lucide-react"
import { useDispatch } from "react-redux"
import { showLoader } from "@/lib/features/ui/uiSlice"
import { logout } from "@/lib/features/auth/authSlice"

const AdminSidebar = () => {
    const pathname = usePathname()
    const router = useRouter()
    const dispatch = useDispatch()

    const sidebarLinks = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Pending Sellers', href: '/admin/approve', icon: ShieldCheckIcon },
        { name: 'Verified Sellers', href: '/admin/sellers', icon: StoreIcon },
        { name: 'Pending Buyers', href: '/admin/verify-buyers', icon: ShieldCheckIcon },
        { name: 'Verified Buyers', href: '/admin/users', icon: UsersIcon },
        { name: 'Pending Products', href: '/admin/pending-products', icon: ShoppingBagIcon },
        { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
        { name: 'Orders', href: '/admin/orders', icon: ShieldCheckIcon },
        { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
    ]

    const handleLogout = () => {
        dispatch(showLoader("Signing you out..."))
        setTimeout(() => {
            dispatch(logout())
            router.push('/')
        }, 800)
    }

    const handleNavigation = (href, message) => {
        dispatch(showLoader(message))
        setTimeout(() => {
            router.push(href)
        }, 500)
    }

    return (
        <div className="inline-flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-64 bg-white">
            <div className="flex flex-col gap-3 justify-center items-center pt-10 pb-6 max-sm:hidden">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-[#05DF72]">
                    <UsersIcon className="text-[#05DF72]" size={30} />
                </div>
                <div className="text-center">
                    <p className="text-slate-900 font-bold">Admin Portal</p>
                    <p className="text-slate-400 text-xs">Super Admin</p>
                </div>
            </div>

            <div className="max-sm:mt-6 flex flex-col gap-1 px-4">
                {
                    sidebarLinks.map((link, index) => (
                        <button
                            key={index}
                            onClick={() => handleNavigation(link.href, `Loading ${link.name} Panel...`)}
                            className={`relative flex items-center gap-4 text-slate-500 hover:bg-slate-50 p-3.5 rounded-xl transition w-full text-left ${pathname === link.href ? 'bg-slate-50 text-[#05DF72] font-semibold' : ''}`}
                        >
                            <link.icon size={20} />
                            <p className="max-sm:hidden text-sm">{link.name}</p>
                            {pathname === link.href && <span className="absolute bg-[#05DF72] left-0 top-3 bottom-3 w-1.5 rounded-r-full"></span>}
                        </button>
                    ))
                }
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 text-slate-500 hover:bg-rose-50 hover:text-rose-500 p-3.5 rounded-xl transition w-full text-left mt-4 border-t border-slate-50 pt-6"
                >
                    <LogOutIcon size={20} />
                    <p className="max-sm:hidden text-sm font-semibold">Sign Out</p>
                </button>
            </div>
        </div>
    )
}

export default AdminSidebar;
