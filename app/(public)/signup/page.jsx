'use client'
import { useState, Suspense, useEffect } from "react"
import { useDispatch } from "react-redux"
import { setCredentials } from "@/lib/features/auth/authSlice"
import { registerUser, loginUser, verifyOTP } from "@/backend/actions/auth"
import { useRouter, useSearchParams } from "next/navigation"
import { ShieldCheckIcon, UserIcon, MailIcon, LockIcon, PhoneIcon, CheckCircleIcon, LoaderIcon, BuildingIcon, ZapIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"
import Button from "@/components/Button"

function SignupContent() {
    const dispatch = useDispatch()
    const router = useRouter()
    const searchParams = useSearchParams()

    const redirect = searchParams.get('redirect')
    const roleParam = searchParams.get('role') || 'BUYER'

    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState('REGISTER') // REGISTER | VERIFY_EMAIL | VERIFY_PHONE | COMPLETE
    const [otp, setOtp] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        whatsapp: '+234 ',
        role: roleParam,
        businessName: ''
    })

    // Sync role with URL parameters
    useEffect(() => {
        if (roleParam) {
            setFormData(prev => ({ ...prev, role: roleParam }))
        }
    }, [roleParam])

    const formatWhatsApp = (value) => {
        // Strip everything but numbers
        const numbers = value.replace(/\D/g, '')

        // Keep 234 as prefix
        let suffix = numbers.startsWith('234') ? numbers.slice(3) : numbers

        // Max 10 digits for the suffix
        const cleanSuffix = suffix.slice(0, 10)

        // Build the formatted string: +234 XXX-XXXX-XXX
        let res = '+234 '
        if (cleanSuffix.length > 0) {
            res += cleanSuffix.slice(0, 3)
        }
        if (cleanSuffix.length > 3) {
            res += '-' + cleanSuffix.slice(3, 7)
        }
        if (cleanSuffix.length > 7) {
            res += '-' + cleanSuffix.slice(7, 10)
        }

        return res
    }

    const handleWhatsAppChange = (e) => {
        const formatted = formatWhatsApp(e.target.value)
        setFormData({ ...formData, whatsapp: formatted })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate WhatsApp number length (must have 10 digits after +234)
        const digits = formData.whatsapp.replace(/\D/g, '')
        if (digits.length !== 13) { // 234 + 10 digits
            return toast.error("Please enter a valid 10-digit WhatsApp number after +234")
        }

        setIsLoading(true)
        dispatch(showLoader("Creating your account..."))

        try {
            // Register with real server action
            const result = await registerUser(formData)

            if (!result.success) {
                throw new Error(result.error)
            }

            dispatch(hideLoader())
            setIsLoading(false)
            setStep('VERIFY_EMAIL')
            toast.success("Account created! Please verify your account.")

        } catch (error) {
            dispatch(hideLoader())
            setIsLoading(false)
            toast.error(error.message)
        }
    }

    const handleVerifyEmail = async (e) => {
        e.preventDefault()
        if (!otp) return toast.error("Enter verification code")

        setIsLoading(true)
        dispatch(showLoader("Verifying email..."))

        try {
            const res = await verifyOTP(formData.whatsapp, otp, 'PHONE')
            if (res.success) {
                dispatch(hideLoader())
                setIsLoading(false)
                toast.success("Account verified!")

                // Automatically login
                handleAutoLogin()
            } else {
                throw new Error(res.error)
            }
        } catch (error) {
            dispatch(hideLoader())
            setIsLoading(false)
            toast.error(error.message)
        }
    }

    const handleAutoLogin = async () => {
        setIsLoading(true)
        dispatch(showLoader("Signing you in..."))

        try {
            const loginResult = await loginUser(formData.whatsapp, formData.password)

            if (loginResult.success) {
                dispatch(setCredentials(loginResult.user))
                dispatch(hideLoader())
                toast.success(`Welcome to GoCycle, ${formData.name}!`)

                // Redirect based on role or param
                if (redirect) {
                    router.push(redirect)
                } else if (formData.role === 'BUYER') {
                    router.push('/buyer')
                } else {
                    router.push('/seller')
                }
            }
        } catch (error) {
            dispatch(hideLoader())
            setIsLoading(false)
            toast.error(error.message)
            router.push('/login')
        }
    }

    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] -mr-60 -mt-40 -z-0 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -ml-20 -mb-20 -z-0"></div>

            <div className="w-full max-w-2xl relative z-10">
                <div className="bg-white/5 backdrop-blur-xl rounded-[3.5rem] p-10 sm:p-14 border border-white/10 shadow-2xl">

                    {/* Progress Header */}
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20 rotate-3">
                            <ZapIcon className="text-white" size={40} />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                            {step === 'REGISTER' ? 'Join the Future' : 'Secure Verification'}
                        </h1>
                        <p className="text-slate-400 font-medium">
                            {step === 'REGISTER' ? 'Create your professional GoCycle account' : `Enter the code sent to ${formData.whatsapp} ${formData.email ? `and ${formData.email}` : ''}`}
                        </p>
                    </div>

                    {/* Step 1: Registration Form */}
                    {step === 'REGISTER' && (
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Full Name</label>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10 font-medium text-white placeholder:text-slate-600"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">WhatsApp Number</label>
                                    <div className="relative group">
                                        <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            required
                                            type="tel"
                                            placeholder="+234 803-0818-868"
                                            className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10 font-black text-white tracking-wider placeholder:text-slate-600"
                                            value={formData.whatsapp}
                                            onChange={handleWhatsAppChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Business Name for Sellers */}
                            {formData.role === 'SELLER' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Business Name (Optional)</label>
                                    <div className="relative group">
                                        <BuildingIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Your business name"
                                            className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10 font-medium text-white placeholder:text-slate-600"
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Email (Optional)</label>
                                    <div className="relative group">
                                        <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10 font-medium text-white placeholder:text-slate-600"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Create Password</label>
                                    <div className="relative group">
                                        <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            required
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-12 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10 font-medium text-white placeholder:text-slate-600"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                loading={isLoading}
                                loadingText="INITIALIZING SECURITY..."
                                className="w-full !py-5 !rounded-2xl shadow-xl shadow-emerald-500/10 text-sm"
                            >
                                {formData.role === 'SELLER' ? 'CREATE SELLER PORTAL' : 'CREATE ACCOUNT'}
                            </Button>

                            <div className="pt-8 border-t border-white/5">
                                {formData.role !== 'SELLER' ? (
                                    <div className="glass-dark p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group/banner">
                                        <div className="relative z-10">
                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">Grow with us</p>
                                            <h3 className="text-xl font-black text-white">Are you a merchant?</h3>
                                            <p className="text-slate-400 text-xs mt-2 font-medium">Join Nigeria's largest battery recycling network.</p>
                                        </div>
                                        <Link
                                            href="/signup?role=SELLER&redirect=/create-store"
                                            className="relative z-10 bg-white text-slate-900 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-xl"
                                        >
                                            BECOME A SELLER
                                        </Link>
                                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/10 blur-[60px] group-hover/banner:bg-emerald-500/20 transition-all"></div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Link href="/signup?role=BUYER" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-emerald-400 transition-all flex items-center justify-center gap-2">
                                            ← Switch to Private Buyer Account
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <p className="text-center text-slate-500 font-medium text-sm pt-4">
                                Already part of the movement? {' '}
                                <Link href="/login" className="text-emerald-400 font-black hover:text-emerald-300 transition-colors border-b-2 border-emerald-400/10 hover:border-emerald-400">
                                    Secure Log In
                                </Link>
                            </p>
                        </form>
                    )}

                    {/* Step 2: Verification Form */}
                    {step === 'VERIFY_EMAIL' && (
                        <form className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500" onSubmit={handleVerifyEmail}>
                            <div className="text-center">
                                <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-float border border-emerald-500/20">
                                    <ShieldCheckIcon className="text-emerald-400" size={48} />
                                </div>
                                <p className="text-slate-300 text-lg font-medium max-w-xs mx-auto">
                                    Enter the 6-digit security code sent to your device and email.
                                </p>
                                <div className="mt-4 inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Demo Code: 123456</span>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <input
                                    type="text"
                                    placeholder="0 0 0 0 0 0"
                                    className="text-center text-4xl tracking-[0.5em] w-full max-w-sm py-8 bg-white/5 border-2 border-white/5 rounded-[2rem] outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 text-white font-black placeholder:text-slate-700"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                    maxLength={6}
                                />
                            </div>

                            <div className="space-y-6">
                                <Button
                                    type="submit"
                                    loading={isLoading}
                                    loadingText="VERIFYING SECURITY CODE..."
                                    className="w-full !py-6 !rounded-[2rem] shadow-xl shadow-emerald-500/10 text-md"
                                >
                                    VERIFY & INITIALIZE ACCOUNT
                                </Button>

                                <button
                                    type="button"
                                    onClick={() => setStep('REGISTER')}
                                    className="w-full text-[10px] font-black text-slate-500 hover:text-emerald-400 transition-all uppercase tracking-[1em] flex items-center justify-center gap-2"
                                >
                                    ← Resend or Update Details
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <p className="text-center mt-10 text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-center gap-2">
                    <ShieldCheckIcon size={14} className="text-emerald-500/50" /> End-to-End Encryption Enabled
                </p>
            </div>
        </div>
    )
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoaderIcon className="animate-spin text-[#05DF72]" size={48} /></div>}>
            <SignupContent />
        </Suspense>
    )
}
