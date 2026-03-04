'use client'
import Link from "next/link"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/features/auth/authSlice"
import { showLoader } from "@/lib/features/ui/uiSlice"
import { LogOut as LogOutIcon } from "lucide-react"

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
            <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                <span className="text-green-600">go</span>Cycle<span className="text-green-600 text-5xl leading-0">.</span>
                <p className="absolute text-xs font-semibold -top-1 -right-11 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-emerald-500">
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