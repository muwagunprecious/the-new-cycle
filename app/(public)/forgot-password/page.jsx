'use client'
import { useState } from "react"
import { useDispatch } from "react-redux"
import { requestAdminPasswordReset } from "@/backend-actions/actions/auth"
import { ShieldCheck as ShieldCheckIcon, Mail as MailIcon, Loader as LoaderIcon, Zap as ZapIcon, ArrowLeft as ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"
import Button from "@/components/Button"

export default function ForgotPasswordPage() {
    const dispatch = useDispatch()
    const [email, setEmail] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) return toast.error("Please enter your email address")

        setIsLoading(true)
        dispatch(showLoader("Sending reset link..."))

        try {
            const res = await requestAdminPasswordReset(email)
            dispatch(hideLoader())
            setIsLoading(false)

            if (res.success) {
                setIsSubmitted(true)
                toast.success("Reset link sent!")
            } else {
                toast.error(res.error || "Failed to send reset link")
            }
        } catch (error) {
            dispatch(hideLoader())
            setIsLoading(false)
            toast.error("An unexpected error occurred")
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -mr-40 -mt-20 -z-0 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -ml-20 -mb-20 -z-0"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white rounded-[32px] p-10 sm:p-14 border border-black/[0.04] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100 rotate-3">
                            <ZapIcon className="text-emerald-500" size={40} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-950 mb-2 tracking-tight">
                            {isSubmitted ? 'Check Your Email' : 'Reset Password'}
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">
                            {isSubmitted 
                                ? `We've sent a password reset link to ${email}`
                                : 'Enter your email to receive a secure reset link'}
                        </p>
                    </div>

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Email Address</label>
                                <div className="relative group">
                                    <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        placeholder="admin@gocycle.ng"
                                        className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-medium text-slate-950 placeholder:text-slate-400"
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                loading={isLoading}
                                className="w-full !py-5 !rounded-2xl shadow-xl shadow-emerald-500/10 text-sm mt-4"
                            >
                                SEND RESET LINK
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                                <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                                    A secure link has been dispatched to your inbox. Please check your email (and spam folder) to proceed with your password reset.
                                </p>
                            </div>
                            <Button
                                onClick={() => setIsSubmitted(false)}
                                variant="outline"
                                className="w-full !py-4 !rounded-2xl"
                            >
                                TRY ANOTHER EMAIL
                            </Button>
                        </div>
                    )}

                    <div className="mt-10 text-center">
                        <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-emerald-500 transition-all uppercase tracking-widest">
                            <ArrowLeftIcon size={14} /> Back to Login
                        </Link>
                    </div>
                </div>

                <p className="text-center mt-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                    <ShieldCheckIcon size={14} className="text-emerald-500/50" /> Secured by GoCycle Core Auth
                </p>
            </div>
        </div>
    )
}
