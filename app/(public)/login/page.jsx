'use client'
import { useState } from "react"
import { useDispatch } from "react-redux"
import { setCredentials } from "@/lib/features/auth/authSlice"
import { loginUser } from "@/backend/actions/auth"
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        dispatch(showLoader("Signing you in..."))

        try {
            // Login with real server action
            const result = await loginUser(formData.email, formData.password)

            if (!result.success) {
                throw new Error(result.error)
            }

            if (result.requiresVerification) {
                // If backend says unverified, maybe redirect to an OTP page?
                // For now, let's just warn them or handle if it's the admin flow.
                // But admin is now verified.
                toast("Please check your email/phone to verify your account.", { icon: "⚠️" })
            }

            // Sync with Redux
            dispatch(setCredentials(result.user))
            dispatch(hideLoader())
            setIsLoading(false)
            toast.success("Logged in successfully!")

            // Redirect based on role
            const user = result.user
            if (user.role === 'ADMIN') router.push('/admin')
            else if (user.role === 'SELLER') router.push('/seller')
            else router.push('/buyer')

        } catch (error) {
            dispatch(hideLoader())
            setIsLoading(false)
            toast.error(error.message)
        }
    }

    const demoAccounts = [
        { email: 'admin@gocycle.com', password: 'admin123', label: 'Admin' },
        { email: 'adebayo@ecovolt.com', password: 'seller123', label: 'Seller' },
        { email: 'emeka@example.com', password: 'buyer123', label: 'Buyer' }
    ]

    const handleDemoLogin = (account) => {
        setFormData({ email: account.email, password: account.password })
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
                            <input
                                required
                                type="email"
                                placeholder="you@example.com"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <span className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Password</span>
                        <div className="relative">
                            <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                required
                                type="password"
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
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

                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest text-center mb-4">Demo Accounts</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {demoAccounts.map(account => (
                                <button
                                    key={account.email}
                                    type="button"
                                    onClick={() => handleDemoLogin(account)}
                                    className={`text-xs px-4 py-2 rounded-xl font-bold transition-all ${formData.email === account.email
                                        ? 'bg-[#05DF72] text-white'
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                        }`}
                                >
                                    {account.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-[9px] text-slate-400 text-center mt-3">
                            Click to auto-fill credentials
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
