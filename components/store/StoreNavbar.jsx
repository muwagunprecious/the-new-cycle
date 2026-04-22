'use client'
import Link from "next/link"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/features/auth/authSlice"
import { showLoader } from "@/lib/features/ui/uiSlice"
import { LogOut as LogOutIcon, Recycle as RecycleIcon } from "lucide-react"

const StoreNavbar = () => {
    const dispatch = useDispatch()
    const router = useRouter()

    const handleLogout = () => {
        dispatch(showLoader("Signing you out..."))
        setTimeout(() => {
            dispatch(logout())
            router.push('/')
        }, 800)
    }


    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="flex items-center gap-2.5 group relative">
                <div className="bg-emerald-500 p-2 rounded-xl shadow-sm transition-transform group-hover:scale-105">
                    <RecycleIcon className="text-white" size={20} />
                </div>
                <span className="text-2xl font-bold tracking-tighter text-slate-950">Go<span className="text-emerald-500">Cycle</span></span>
                <p className="absolute text-[9px] font-bold -top-2 -right-8 px-2 py-0.5 rounded-full flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-500/20 uppercase tracking-widest">
                    Store
                </p>
            </Link>
            <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-slate-700">Hi, Seller</p>
                <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100 rounded-lg"
                    title="Logout"
                >
                    <LogOutIcon size={20} />
                </button>
            </div>
        </div>
    )
}

export default StoreNavbar
