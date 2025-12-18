'use client'
import { useState } from "react"
import { useDispatch } from "react-redux"
import { login } from "@/lib/features/auth/authSlice"
import { useRouter } from "next/navigation"
import { ShieldCheckIcon, MailIcon, LockIcon } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"
import Button from "@/components/Button"

export default function LoginPage() {
    const dispatch = useDispatch()
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsLoading(true)
        dispatch(showLoader("Signing you in..."))

        setTimeout(() => {
            try {
                dispatch(login(formData))
                dispatch(hideLoader())
                setIsLoading(false)
                toast.success("Logged in successfully!")

                const saved = localStorage.getItem('gocycle_session')
                if (saved) {
                    const user = JSON.parse(saved)
                    if (user.role === 'ADMIN') router.push('/admin')
                    else if (user.role === 'SELLER') router.push('/seller')
                    else if (user.role === 'DELIVERY') router.push('/delivery')
                    else router.push('/buyer')
                }
            } catch (error) {
                dispatch(hideLoader())
                setIsLoading(false)
                toast.error(error.message)
            }
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-slate-900 p-10 text-white relative h-48 flex flex-col justify-end">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-[#05DF72] mb-2 font-black uppercase tracking-widest text-[10px]">
                            <ShieldCheckIcon size={16} /> Welcome Back
                        </div>
                        <h1 className="text-4xl font-black">Sign <span className="text-[#05DF72]">In</span></h1>
                    </div>
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 bg-[#05DF72]/10 rounded-full blur-[80px]"></div>
                </div>

                <form className="p-10 space-y-6" onSubmit={handleSubmit}>
                    <div className="relative">
                        <span className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Email Address</span>
                        <div className="relative">
                            <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input required type="email" placeholder="email@gocycle.com" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                    </div>

                    <div className="relative">
                        <span className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Password</span>
                        <div className="relative">
                            <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input required type="password" placeholder="••••••••" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        loading={isLoading}
                        loadingText="Authenticating..."
                        className="w-full !py-5 shadow-2xl shadow-[#05DF72]/20 mt-4"
                    >
                        Sign In & Access Portal
                    </Button>

                    <p className="text-center text-sm text-slate-400 font-medium mt-6">
                        Don't have an account? <Link href="/signup" className="text-[#05DF72] font-black hover:underline ml-1">Create One</Link>
                    </p>

                    <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-2">
                        <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest text-center mb-2">Demo Accounts</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {['admin@gocycle.com', 'adebayo@ecovolt.com', 'emeka@example.com', 'chidi@deliver.com'].map(email => (
                                <button key={email} type="button" onClick={() => setFormData({ ...formData, email })} className="text-[9px] bg-slate-50 px-2 py-1 rounded-md text-slate-500 hover:bg-slate-100 transition-colors">
                                    {email.split('@')[0]}
                                </button>
                            ))}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
