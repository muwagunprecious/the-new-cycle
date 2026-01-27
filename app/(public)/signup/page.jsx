'use client'
import { useState, Suspense, useEffect } from "react"
import { useDispatch } from "react-redux"
import { setCredentials } from "@/lib/features/auth/authSlice"
import { registerUser, loginUser, verifyOTP } from "@/backend/actions/auth"
import { useRouter, useSearchParams } from "next/navigation"
import { ShieldCheckIcon, UserIcon, MailIcon, LockIcon, PhoneIcon, CheckCircle2Icon, LoaderIcon, BuildingIcon } from "lucide-react"
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
            toast.success("Account created! Please verify your email.")

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
            const res = await verifyOTP(formData.email, otp, 'EMAIL')
            if (res.success) {
                // For MVP, we'll mark phone as verified too during this "Mock OTP" demo
                await verifyOTP(formData.email, otp, 'PHONE')

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
            const loginResult = await loginUser(formData.email, formData.password)

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

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-slate-900 p-10 text-white relative h-48 flex flex-col justify-end">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-[#05DF72] mb-2 font-black uppercase tracking-widest text-[10px]">
                            <ShieldCheckIcon size={16} />
                            {step === 'REGISTER' && 'Secure Registration'}
                            {step === 'VERIFY_EMAIL' && 'Account Verification'}
                        </div>
                        <h1 className="text-4xl font-black">
                            {step === 'REGISTER' && <>Join <span className="text-[#05DF72]">GoCycle</span></>}
                            {step === 'VERIFY_EMAIL' && <>Verify <span className="text-[#05DF72]">Account</span></>}
                        </h1>
                    </div>
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-[#05DF72]/10 rounded-full blur-[80px]"></div>
                </div>

                <div className="p-10">
                    {/* Step 1: Registration Form */}
                    {step === 'REGISTER' && (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative">
                                    <span className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                                        Full Name
                                    </span>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <span className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">WhatsApp Number</span>
                                    <div className="relative">
                                        <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            required
                                            type="tel"
                                            placeholder="+234 803-0818-868"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-mono font-bold"
                                            value={formData.whatsapp}
                                            onChange={handleWhatsAppChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Business Name for Sellers */}
                            {formData.role === 'SELLER' && (
                                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                                    <span className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Business Name (Optional)</span>
                                    <div className="relative">
                                        <BuildingIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Your business name"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

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
                                <span className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Create Password</span>
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
                                loadingText="Creating account..."
                                className="w-full !py-5 shadow-2xl shadow-[#05DF72]/20 mt-4"
                            >
                                {formData.role === 'SELLER' ? 'Create Seller Account' : 'Create Account'}
                            </Button>

                            {formData.role !== 'SELLER' && (
                                <div className="bg-slate-50 p-6 rounded-3xl mt-8 border border-slate-100 flex flex-col items-center gap-2 text-center">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Are you a seller?</p>
                                    <p className="text-[10px] text-slate-400 mb-2">Join our circular economy and start earning from scrap batteries.</p>
                                    <Link
                                        href="/signup?role=SELLER&redirect=/create-store"
                                        className="text-xs font-black text-white bg-slate-900 px-6 py-3 rounded-xl hover:bg-[#05DF72] transition-all"
                                    >
                                        Signup to Sell Here
                                    </Link>
                                </div>
                            )}

                            {formData.role === 'SELLER' && (
                                <div className="text-center mt-8">
                                    <Link href="/signup?role=BUYER" className="text-xs font-bold text-slate-400 hover:text-[#05DF72] transition-colors">
                                        ← Switch to Buyer Signup
                                    </Link>
                                </div>
                            )}

                            <p className="text-center text-sm text-slate-400 font-medium mt-6">
                                Already have an account? <Link href="/login" className="text-[#05DF72] font-black hover:underline ml-1">Sign In</Link>
                            </p>
                        </form>
                    )}

                    {/* Account Verification Step remains the same */}
                    {step === 'VERIFY_EMAIL' && (
                        <form className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300" onSubmit={handleVerifyEmail}>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-[#05DF72]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MailIcon className="text-[#05DF72]" size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Verify Your Account</h3>
                                <p className="text-sm text-slate-500 mt-2">
                                    Enter the code sent to <span className="font-semibold">{formData.email}</span>
                                </p>
                                <p className="text-xs text-slate-400 mt-1 font-bold">(Demo: use code <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-900">123456</span>)</p>
                            </div>

                            <div className="flex justify-center">
                                <input
                                    type="text"
                                    placeholder="000000"
                                    className="text-center text-2xl tracking-[0.5em] w-full max-w-xs py-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#05DF72] text-slate-900 font-mono"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                    maxLength={6}
                                />
                            </div>

                            <Button
                                type="submit"
                                loading={isLoading}
                                loadingText="Verifying..."
                                className="w-full !py-5 shadow-xl shadow-[#05DF72]/20"
                            >
                                Verify & Continue
                            </Button>

                            <button
                                type="button"
                                onClick={() => setStep('REGISTER')}
                                className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                            >
                                ← Back to Registration
                            </button>
                        </form>
                    )}
                </div>
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
