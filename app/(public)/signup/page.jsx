'use client'
import { useState } from "react"
import { useDispatch } from "react-redux"
import { setCredentials } from "@/lib/features/auth/authSlice"
import { mockAuthService, mockVerificationService, mockNotificationService } from "@/lib/mockService"
import { useRouter } from "next/navigation"
import { ShieldCheckIcon, UserIcon, MailIcon, LockIcon, PhoneIcon, UserCircleIcon, BriefcaseIcon, BuildingIcon, CheckCircle2Icon, AlertCircleIcon, LoaderIcon } from "lucide-react"
import Link from "next/link"
import { addNotification } from "@/lib/features/notification/notificationSlice"
import toast from "react-hot-toast"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"
import Button from "@/components/Button"

export default function SignupPage() {
    const dispatch = useDispatch()
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState('REGISTER') // REGISTER | VERIFY_EMAIL | VERIFY_PHONE | COMPLETE
    const [otp, setOtp] = useState('')
    const [phoneData, setPhoneData] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        whatsapp: '',
        role: 'BUYER',
        businessName: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        dispatch(showLoader("Creating your account..."))

        try {
            // Register with mock service
            const result = await mockAuthService.register(formData)

            if (!result.success) {
                throw new Error(result.error)
            }

            // Send email verification OTP
            await mockVerificationService.sendEmailOTP(formData.email)

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
            const res = await mockVerificationService.verifyEmailOTP(formData.email, otp)
            if (res.success) {
                // Check phone intelligence
                dispatch(showLoader("Checking phone..."))
                const phoneCheck = await mockVerificationService.checkPhoneIntelligence(formData.whatsapp)
                setPhoneData(phoneCheck.data)

                dispatch(hideLoader())
                setIsLoading(false)
                setStep('VERIFY_PHONE')
                toast.success("Email verified!")
            } else {
                throw new Error(res.error)
            }
        } catch (error) {
            dispatch(hideLoader())
            setIsLoading(false)
            toast.error(error.message)
        }
    }

    const handleContinueAfterPhone = async () => {
        setIsLoading(true)
        dispatch(showLoader("Completing registration..."))

        try {
            // Login with mock service
            const loginResult = await mockAuthService.login(formData.email, formData.password)

            if (loginResult.success) {
                // Update user with verification data
                await mockAuthService.updateUserVerification(loginResult.user.id, {
                    isEmailVerified: true,
                    isPhoneVerified: true,
                    phoneIntelligence: phoneData
                })

                // Trigger welcome notification
                await mockNotificationService.triggerWelcome(loginResult.user.id, formData.name)

                dispatch(setCredentials({
                    ...loginResult.user,
                    isEmailVerified: true,
                    isPhoneVerified: true,
                    phoneIntelligence: phoneData
                }))

                dispatch(hideLoader())
                toast.success(`Welcome to GoCycle, ${formData.name}!`)

                // Redirect based on role
                if (formData.role === 'BUYER') {
                    router.push('/buyer')
                } else {
                    router.push('/seller')
                }
            }
        } catch (error) {
            dispatch(hideLoader())
            setIsLoading(false)
            toast.error(error.message)
        }
    }

    const getRiskLevelColor = (level) => {
        switch (level) {
            case 'Low': return 'text-green-600 bg-green-50'
            case 'Medium': return 'text-yellow-600 bg-yellow-50'
            case 'High': return 'text-red-600 bg-red-50'
            default: return 'text-slate-600 bg-slate-50'
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
                            {step === 'VERIFY_EMAIL' && 'Email Verification'}
                            {step === 'VERIFY_PHONE' && 'Phone Verification'}
                        </div>
                        <h1 className="text-4xl font-black">
                            {step === 'REGISTER' && <>Join <span className="text-[#05DF72]">GoCycle</span></>}
                            {step === 'VERIFY_EMAIL' && <>Verify <span className="text-[#05DF72]">Email</span></>}
                            {step === 'VERIFY_PHONE' && <>Phone <span className="text-[#05DF72]">Check</span></>}
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
                                        {formData.role === 'SELLER' ? 'Business Name' : 'Full Name'}
                                    </span>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder={formData.role === 'SELLER' ? "EcoVolt Solutions" : "John Doe"}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <span className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Account Type</span>
                                    <div className="flex bg-slate-50 p-1 rounded-2xl">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: 'BUYER' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${formData.role === 'BUYER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                                        >
                                            <UserCircleIcon size={16} /> Buyer
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: 'SELLER' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${formData.role === 'SELLER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                                        >
                                            <BriefcaseIcon size={16} /> Seller
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Business Name for Sellers */}
                            {formData.role === 'SELLER' && (
                                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                                    <span className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Business/Store Name</span>
                                    <div className="relative">
                                        <BuildingIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            required
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
                                <span className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">WhatsApp Number</span>
                                <div className="relative">
                                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        required
                                        type="tel"
                                        placeholder="+234 801 234 5678"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
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
                                Create {formData.role.charAt(0) + formData.role.slice(1).toLowerCase()} Account
                            </Button>

                            <p className="text-center text-sm text-slate-400 font-medium mt-6">
                                Already have an account? <Link href="/login" className="text-[#05DF72] font-black hover:underline ml-1">Sign In</Link>
                            </p>
                        </form>
                    )}

                    {/* Step 2: Email Verification */}
                    {step === 'VERIFY_EMAIL' && (
                        <form className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300" onSubmit={handleVerifyEmail}>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-[#05DF72]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MailIcon className="text-[#05DF72]" size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Check Your Email</h3>
                                <p className="text-sm text-slate-500 mt-2">
                                    We sent a verification code to <span className="font-semibold">{formData.email}</span>
                                </p>
                                <p className="text-xs text-slate-400 mt-1">(Demo: use code <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">123456</span>)</p>
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
                                Verify Email
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

                    {/* Step 3: Phone Intelligence Check Results */}
                    {step === 'VERIFY_PHONE' && phoneData && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-[#05DF72]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2Icon className="text-[#05DF72]" size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Phone Verified</h3>
                                <p className="text-sm text-slate-500 mt-2">Your WhatsApp number has been validated</p>
                            </div>

                            {/* Phone Intelligence Display */}
                            <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                    <span className="text-xs font-bold uppercase text-slate-400">Phone Number</span>
                                    <span className="text-sm font-semibold text-slate-900">{formData.whatsapp}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase text-slate-400">Network Provider</span>
                                    <span className="text-sm font-semibold text-slate-900">{phoneData.networkProvider}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase text-slate-400">Registration Age</span>
                                    <span className="text-sm font-semibold text-green-600">{phoneData.registrationAge}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                                    <span className="text-xs font-bold uppercase text-slate-400">Risk Level</span>
                                    <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${getRiskLevelColor(phoneData.riskLevel)}`}>
                                        {phoneData.riskLevel}
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                onClick={handleContinueAfterPhone}
                                loading={isLoading}
                                loadingText="Completing..."
                                className="w-full !py-5 shadow-xl shadow-[#05DF72]/20"
                            >
                                Continue to Dashboard
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
