'use client'

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Home as HomeIcon, ShieldCheck as ShieldCheckIcon, Store as StoreIcon, Users as UsersIcon, ShoppingBag as ShoppingBagIcon, Bell as BellIcon, LogOut as LogOutIcon, Settings as SettingsIcon, DollarSign as DollarSignIcon, FileText as FileTextIcon, UserPlus as UserPlusIcon, MapPin as MapPinIcon, Mail as MailIcon, CheckCircle as CheckCircleIcon, Truck as TruckIcon, Banknote as BanknoteIcon, Mailbox as MailboxIcon } from "lucide-react"
import { useDispatch } from "react-redux"
import { showLoader } from "@/lib/features/ui/uiSlice"
import { logout } from "@/lib/features/auth/authSlice"

const AdminSidebar = () => {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const dispatch = useDispatch()
    
    const currentSearch = searchParams.toString()
    const fullPath = currentSearch ? `${pathname}?${currentSearch}` : pathname

    const sidebarLinks = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Pending Sellers', href: '/admin/approve', icon: ShieldCheckIcon },
        { name: 'Manual Verifications', href: '/admin/manual-verifications', icon: CheckCircleIcon },
        { name: 'Verified Sellers', href: '/admin/sellers', icon: StoreIcon },
        { name: 'Verified Buyers', href: '/admin/users', icon: UsersIcon },
        { name: 'Pending Products', href: '/admin/pending-products', icon: ShoppingBagIcon },
        { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
        { name: 'Orders', href: '/admin/orders', icon: ShieldCheckIcon },
        { name: 'Approve Pickups', href: '/admin/approve-pickups', icon: TruckIcon },
        { name: 'Pending Cashouts', href: '/admin/payments', icon: BanknoteIcon },
        { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
        { name: 'Pricing Formula', href: '/admin/settings?tab=pricing', icon: DollarSignIcon },
        { name: 'Blogs & Articles', href: '/admin/blogs', icon: FileTextIcon },
        { name: 'Contact Messages', href: '/admin/messages', icon: MailIcon },
        { name: 'Create Admin', href: '/admin/users?action=create-admin', icon: UserPlusIcon },
        { name: 'System Settings', href: '/admin/settings', icon: SettingsIcon },
        { name: 'Newsletter', href: '/admin/newsletter', icon: MailboxIcon },
        { name: 'Visual Sitemap', href: '/admin/sitemap', icon: MapPinIcon },
    ]

    const handleLogout = () => {
        dispatch(showLoader("Signing you out..."))
        setTimeout(() => {
            dispatch(logout())
            router.push('/')
        }, 800)
    }

    const handleNavigation = (href) => {
        // Direct navigation for instant feel
        router.push(href)
    }

    return (
        <div className="inline-flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-64 bg-white overflow-y-auto no-scrollbar">
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
                            className={`relative flex items-center gap-4 text-slate-500 hover:bg-slate-50 p-3.5 rounded-xl transition w-full text-left ${fullPath === link.href ? 'bg-slate-50 text-[#05DF72] font-semibold' : ''}`}
                        >
                            <link.icon size={20} />
                            <p className="max-sm:hidden text-sm">{link.name}</p>
                            {fullPath === link.href && <span className="absolute bg-[#05DF72] left-0 top-3 bottom-3 w-1.5 rounded-r-full"></span>}
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
