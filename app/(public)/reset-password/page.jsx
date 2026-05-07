'use client'
import { useState, Suspense } from "react"
import { useDispatch } from "react-redux"
import { resetAdminPassword } from "@/backend-actions/actions/auth"
import { useRouter, useSearchParams } from "next/navigation"
import { ShieldCheck as ShieldCheckIcon, Lock as LockIcon, Loader as LoaderIcon, Zap as ZapIcon, Eye as EyeIcon, EyeOff as EyeOffIcon } from "lucide-react"
import toast from "react-hot-toast"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"
import Button from "@/components/Button"

function ResetPasswordContent() {
    const dispatch = useDispatch()
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!token) return toast.error("Invalid or missing reset token")
        if (formData.password.length < 8) return toast.error("Password must be at least 8 characters")
        if (formData.password !== formData.confirmPassword) return toast.error("Passwords do not match")

        setIsLoading(true)
        dispatch(showLoader("Resetting password..."))

        try {
            const res = await resetAdminPassword(token, formData.password)
            dispatch(hideLoader())
            setIsLoading(false)

            if (res.success) {
                toast.success("Password reset successful!")
                router.push('/login')
            } else {
                toast.error(res.error || "Failed to reset password")
            }
        } catch (error) {
            dispatch(hideLoader())
            setIsLoading(false)
            toast.error("An unexpected error occurred")
        }
    }

    if (!token) {
        return (
            <div className="text-center p-10 bg-white rounded-[32px] border border-red-100 shadow-xl">
                <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <ShieldCheckIcon className="text-red-500" size={40} />
                </div>
                <h1 className="text-2xl font-bold text-slate-950 mb-2">Invalid Token</h1>
                <p className="text-slate-500 mb-8">The password reset link is invalid or has expired.</p>
                <Button onClick={() => router.push('/forgot-password')} className="w-full">REQUEST NEW LINK</Button>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-[32px] p-10 sm:p-14 border border-black/[0.04] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-md relative z-10">
            <div className="text-center mb-10">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100 rotate-3">
                    <ZapIcon className="text-emerald-500" size={40} />
                </div>
                <h1 className="text-3xl font-bold text-slate-950 mb-2 tracking-tight">New Password</h1>
                <p className="text-slate-500 font-medium text-sm">Create a strong, secure password for your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">New Password</label>
                    <div className="relative group">
                        <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            placeholder="••••••••"
                            className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-12 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-medium text-slate-950 placeholder:text-slate-400"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Confirm Password</label>
                    <div className="relative group">
                        <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            placeholder="••••••••"
                            className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-12 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-medium text-slate-950 placeholder:text-slate-400"
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    loading={isLoading}
                    className="w-full !py-5 !rounded-2xl shadow-xl shadow-emerald-500/10 text-sm mt-4"
                >
                    RESET & SECURE ACCOUNT
                </Button>
            </form>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -mr-40 -mt-20 -z-0 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -ml-20 -mb-20 -z-0"></div>

            <Suspense fallback={<LoaderIcon className="animate-spin text-emerald-500" size={48} />}>
                <ResetPasswordContent />
            </Suspense>

            <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheckIcon size={14} className="text-emerald-500/50" /> Secured by GoCycle Core Auth
            </p>
        </div>
    )
}
