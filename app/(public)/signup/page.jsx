'use client'
import { useState, Suspense, useEffect } from "react"
import { useDispatch } from "react-redux"
import { setCredentials } from "@/lib/features/auth/authSlice"
import { registerUser, loginUser, verifyOTP, checkPhoneAvailability, verifyPhoneStandalone } from "@/backend/actions/auth"
import { useRouter, useSearchParams } from "next/navigation"
import { ShieldCheck as ShieldCheckIcon, User as UserIcon, Mail as MailIcon, Lock as LockIcon, Phone as PhoneIcon, CheckCircle as CheckCircleIcon, Loader as LoaderIcon, Building as BuildingIcon, Zap as ZapIcon, Eye as EyeIcon, EyeOff as EyeOffIcon, Search as SearchIcon, ChevronDown as ChevronDownIcon } from "lucide-react"
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
    const [step, setStep] = useState(roleParam === 'SELLER' ? 'REGISTER' : 'IDENTITY_VERIFY') // IDENTITY_VERIFY | REGISTER | VERIFY_EMAIL | VERIFY_PHONE | COMPLETE
    const [isPhoneVerified, setIsPhoneVerified] = useState(false)
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
    const [tempOtp, setTempOtp] = useState('')
    const [otp, setOtp] = useState('')
    const [verifyType, setVerifyType] = useState('NIN') // NIN | CAC
    const [formData, setFormData] = useState({
        nin: '',
        firstName: '',
        lastName: '',
        cacNumber: '',
        name: '', // Combined name for the rest of the app
        email: '',
        password: '',
        whatsapp: '+234 ',
        role: roleParam,
        businessName: '',
        state: 'Lagos',
        lga: '',
        gender: '',
        address: ''
    })

    const LAGOS_LGAS = [
        "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa",
        "Badagry", "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye",
        "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland",
        "Mushin", "Ojo", "Oshodi-Isolo", "Somolu", "Surulere"
    ]

    // Sync role with URL parameters
    useEffect(() => {
        if (roleParam) {
            setFormData(prev => ({ ...prev, role: roleParam }))
            // If seller, start at registration. If buyer, start at identity verification.
            if (roleParam === 'SELLER') {
                setStep('REGISTER')
            } else {
                setStep('IDENTITY_VERIFY')
            }
        }
    }, [roleParam])

    // Auto-scroll to form top when step changes so user doesn't have to scroll down
    useEffect(() => {
        const formTop = document.getElementById('signup-form-card')
        if (formTop) {
            // Slight delay to allow DOM to render
            setTimeout(() => {
                const yOffset = -100; // Account for 80px fixed navbar
                const y = formTop.getBoundingClientRect().top + window.scrollY + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }, 100)
        }
    }, [step, roleParam])

    // Dismiss global loader on mount
    useEffect(() => {
        dispatch(hideLoader())
    }, [dispatch])

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
        // Reset verification if number changes
        if (isPhoneVerified) setIsPhoneVerified(false)
    }

    const handleInitiatePhoneVerify = async () => {
        const digits = formData.whatsapp.replace(/\D/g, '')
        if (digits.length !== 13) {
            return toast.error("Please enter a valid 10-digit number")
        }

        setIsLoading(true)
        dispatch(showLoader("Checking phone status..."))

        try {
            const check = await checkPhoneAvailability(formData.whatsapp)
            if (!check.success) {
                return toast.error(check.message)
            }

            // In a real app, this is where SMS would be sent
            setIsOtpModalOpen(true)
            toast.success("Verification code sent!")
        } catch (error) {
            toast.error("Process failed. Please try again.")
        } finally {
            setIsLoading(false)
            dispatch(hideLoader())
        }
    }

    const handleConfirmPhoneOTP = async () => {
        if (tempOtp.length !== 6) return toast.error("Enter 6-digit code")

        setIsLoading(true)
        try {
            const res = await verifyPhoneStandalone(formData.whatsapp, tempOtp)
            if (res.success) {
                setIsPhoneVerified(true)
                setIsOtpModalOpen(false)
                toast.success("Phone number verified!")
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error("Verification failed")
        } finally {
            setIsLoading(false)
        }
    }

    const handleNINVerify = async (e) => {
        e.preventDefault()
        if (formData.nin.length !== 11) {
            return toast.error("Please enter an 11-digit NIN")
        }
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            return toast.error("Please enter your First and Last name exactly as they appear on your NIN slip")
        }

        setIsLoading(true)
        dispatch(showLoader("Verifying identity with NIMC..."))

        try {
            const response = await fetch("/api/verify-nin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nin: formData.nin,
                    firstname: formData.firstName.trim(),
                    lastname: formData.lastName.trim()
                }),
            })

            const data = await response.json()

            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    name: `${data.firstname} ${data.lastname}`.trim()
                }))
                setStep('REGISTER')
                toast.success(`Identity Verified: Welcome ${data.firstname}!`)
            } else {
                toast.error(data.message || "Identity verification failed.")
            }
        } catch (error) {
            toast.error("Could not connect to verification server.")
        } finally {
            setIsLoading(false)
            dispatch(hideLoader())
        }
    }

    const handleCACVerify = async (e) => {
        e.preventDefault()
        if (!formData.cacNumber.trim()) {
            return toast.error("Please enter your RC/BN/IT number")
        }
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            return toast.error("Please enter the name of the business owner/director")
        }

        setIsLoading(true)
        dispatch(showLoader("Verifying business with CAC..."))

        try {
            const response = await fetch("/api/verify-cac", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ regNumber: formData.cacNumber.trim() }),
            })

            const data = await response.json()

            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    name: `${prev.firstName} ${prev.lastName}`.trim(),
                    businessName: data.companyName || prev.businessName
                }))
                setStep('REGISTER')
                toast.success(`Business Verified: ${data.companyName}!`)
            } else {
                toast.error(data.message || "Business verification failed.")
            }
        } catch (error) {
            toast.error("Could not connect to verification server.")
        } finally {
            setIsLoading(false)
            dispatch(hideLoader())
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate Phone number length (must have 10 digits after +234)
        const digits = formData.whatsapp.replace(/\D/g, '')
        if (digits.length !== 13) { // 234 + 10 digits
            return toast.error("Please enter a valid 10-digit Phone number after +234")
        }

        setIsLoading(true)
        dispatch(showLoader("Creating your account..."))

        try {
            // Register with real server action
            const result = await registerUser({
                ...formData,
                isPhoneVerified, // Pass pre-verified status
                ninDocument: formData.role === 'SELLER' ? 'NOT_REQUIRED' : (verifyType === 'NIN' ? formData.nin : `CAC:${formData.cacNumber}`)
            })

            if (!result.success) {
                throw new Error(result.error)
            }

            dispatch(hideLoader())
            setIsLoading(false)

            if (isPhoneVerified) {
                toast.success("Registration successful! Signing you in...")
                handleAutoLogin()
            } else {
                setStep('VERIFY_EMAIL')
                toast.success("Account created! Please verify your account.")
            }

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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] -mr-60 -mt-40 -z-0 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -ml-20 -mb-20 -z-0"></div>

            <div className="w-full max-w-2xl relative z-10">
                <div className="bg-white rounded-[32px] sm:rounded-[40px] p-8 sm:p-14 border border-black/[0.04] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">

                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100 rotate-3">
                            <ZapIcon className="text-emerald-500" size={40} />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-950 mb-2 tracking-tight">
                            {step === 'IDENTITY_VERIFY' ? 'Verify Identity' : step === 'REGISTER' ? 'Join the Future' : 'Secure Verification'}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {step === 'IDENTITY_VERIFY' ? 'Verify your identity using NIN or CAC registration' : step === 'REGISTER' ? 'Complete your registration details' : `Enter the code sent to ${formData.whatsapp}`}
                        </p>
                    </div>

                    {step === 'IDENTITY_VERIFY' && (
                        <form className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500" onSubmit={verifyType === 'NIN' ? handleNINVerify : handleCACVerify}>
                            {/* Verification Type Dropdown */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Verification Method</label>
                                <div className="relative group">
                                    <ShieldCheckIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <select
                                        className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-12 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-bold text-slate-950 text-lg appearance-none cursor-pointer"
                                        value={verifyType}
                                        onChange={(e) => setVerifyType(e.target.value)}
                                    >
                                        <option value="NIN">NIN — National Identity Number</option>
                                        <option value="CAC">CAC — Business Registration</option>
                                    </select>
                                    <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                </div>
                            </div>

                            {/* Name Fields (shared for both NIN and CAC) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">First Name</label>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="John"
                                            className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-bold text-slate-950 text-lg placeholder:text-slate-400"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Last Name</label>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Doe"
                                            className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-bold text-slate-950 text-lg placeholder:text-slate-400"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* NIN-specific field */}
                            {verifyType === 'NIN' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">National Identity Number (NIN)</label>
                                    <div className="relative group">
                                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            required
                                            type="text"
                                            maxLength={11}
                                            placeholder="12345678901"
                                            className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-5 pl-12 pr-4 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-bold text-slate-950 text-xl tracking-[0.2em] placeholder:text-slate-400 placeholder:tracking-normal"
                                            value={formData.nin}
                                            onChange={(e) => setFormData({ ...formData, nin: e.target.value.replace(/\D/g, '') })}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 ml-2 font-medium">Verify your identity instantly via NIMC secure portal.</p>
                                </div>
                            )}

                            {/* CAC-specific field */}
                            {verifyType === 'CAC' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">RC / BN / IT Number</label>
                                    <div className="relative group">
                                        <BuildingIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="RC1234567"
                                            className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-5 pl-12 pr-4 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-bold text-slate-950 text-xl tracking-[0.1em] placeholder:text-slate-400 placeholder:tracking-normal"
                                            value={formData.cacNumber}
                                            onChange={(e) => setFormData({ ...formData, cacNumber: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 ml-2 font-medium">Verify your business registration via CAC.</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                loading={isLoading}
                                loadingText={verifyType === 'NIN' ? "VERIFYING WITH NIMC..." : "VERIFYING WITH CAC..."}
                                className="w-full !py-5 !rounded-2xl shadow-xl shadow-emerald-500/10 text-sm font-black uppercase tracking-widest"
                            >
                                CONTINUE TO SIGNUP
                            </Button>

                            <div className="pt-8 border-t border-black/[0.04]">
                                <p className="text-center text-slate-500 font-medium text-sm">
                                    Already have an account? {' '}
                                    <Link href="/login" className="text-emerald-600 font-bold hover:text-emerald-500 transition-colors border-b-2 border-emerald-500/20 hover:border-emerald-500">
                                        Log In
                                    </Link>
                                </p>
                            </div>
                        </form>
                    )}

                    {/* Step 1: Registration Form */}
                    {step === 'REGISTER' && (
                        <form className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Full Name</label>
                                        {formData.role === 'BUYER' && (
                                            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                <ShieldCheckIcon size={10} /> NIN Verified
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            required
                                            type="text"
                                            readOnly={formData.role === 'BUYER'} // Only readOnly for verified buyers
                                            placeholder="John Doe"
                                            className={`w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-medium text-slate-950 placeholder:text-slate-400 ${formData.role === 'BUYER' ? 'cursor-default' : 'cursor-text'}`}
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Phone Number</label>
                                        {isPhoneVerified && (
                                            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                <ShieldCheckIcon size={10} /> Verified
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative group flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                            <input
                                                required
                                                type="tel"
                                                readOnly={isPhoneVerified}
                                                placeholder="+234 803-0818-868"
                                                className={`w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-bold text-slate-950 tracking-wider placeholder:text-slate-400 ${isPhoneVerified ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                value={formData.whatsapp}
                                                onChange={handleWhatsAppChange}
                                            />
                                        </div>
                                        {formData.whatsapp.replace(/\D/g, '').length === 13 && !isPhoneVerified && !isLoading && (
                                            <button
                                                type="button"
                                                onClick={handleInitiatePhoneVerify}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                                            >
                                                Verify
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {formData.role === 'SELLER' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Gender</label>
                                            <div className="flex gap-4">
                                                {['Male', 'Female'].map((g) => (
                                                    <label key={g} className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${formData.gender === g ? 'bg-emerald-50 border-emerald-500/30 text-emerald-700 shadow-sm' : 'bg-slate-50 border-black/[0.04] text-slate-500 hover:bg-white hover:shadow-sm'}`}>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.gender === g ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                                                            {formData.gender === g && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                                                        </div>
                                                        <input
                                                            type="radio"
                                                            name="gender"
                                                            value={g}
                                                            required
                                                            className="hidden"
                                                            checked={formData.gender === g}
                                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                        />
                                                        <span className="text-sm font-bold uppercase tracking-widest text-slate-950">{g}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">State</label>
                                                <input
                                                    disabled
                                                    value="Lagos"
                                                    className="w-full bg-slate-50 border border-black/[0.04] rounded-2xl py-4 px-6 font-bold text-slate-400 tracking-widest cursor-not-allowed"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">LGA</label>
                                                <div className="relative group">
                                                    <select
                                                        required
                                                        className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 px-6 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-bold text-slate-950 appearance-none cursor-pointer"
                                                        value={formData.lga}
                                                        onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                                                    >
                                                        <option value="" disabled>Select LGA</option>
                                                        {LAGOS_LGAS.map(lga => (
                                                            <option key={lga} value={lga}>{lga}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 col-span-full">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Full Address</label>
                                            <textarea
                                                required
                                                placeholder="Enter your street address, building number, and landmark..."
                                                rows={2}
                                                className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 px-6 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-medium text-slate-950 placeholder:text-slate-400 resize-none"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}

                            </div>

                            {/* Business Name for Sellers */}
                            {formData.role === 'SELLER' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Business Name (Optional)</label>
                                    <div className="relative group">
                                        <BuildingIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Your business name"
                                            className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-medium text-slate-950 placeholder:text-slate-400"
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Email (Optional)</label>
                                    <div className="relative group">
                                        <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-medium text-slate-950 placeholder:text-slate-400"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Create Password</label>
                                    <div className="relative group">
                                        <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            required
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-12 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-medium text-slate-950 placeholder:text-slate-400"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                            </div>

                            <Button
                                type="submit"
                                loading={isLoading}
                                loadingText="INITIALIZING SECURITY..."
                                className="w-full !py-5 !rounded-2xl shadow-xl shadow-emerald-500/10 text-sm"
                            >
                                {formData.role === 'SELLER' ? 'CREATE SELLER PORTAL' : 'CREATE ACCOUNT'}
                            </Button>

                            <div className="pt-8 border-t border-black/[0.04]">
                                {formData.role !== 'SELLER' ? (
                                    <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group/banner shadow-sm">
                                        <div className="relative z-10">
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-2">Grow with us</p>
                                            <h3 className="text-xl font-bold text-slate-950">Are you a merchant?</h3>
                                            <p className="text-slate-600 text-xs mt-2 font-medium">Join Nigeria's largest battery recycling network.</p>
                                        </div>
                                        <Link
                                            href="/signup?role=SELLER&redirect=/create-store"
                                            className="relative z-10 bg-white text-slate-950 px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-black/[0.04]"
                                        >
                                            BECOME A SELLER
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Link href="/signup?role=BUYER" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-emerald-500 transition-all flex items-center justify-center gap-2">
                                            ← Switch to a Buyer Account
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <p className="text-center text-slate-500 font-medium text-sm pt-4">
                                Already part of the movement? {' '}
                                <Link href="/login" className="text-emerald-600 font-bold hover:text-emerald-500 transition-colors border-b-2 border-emerald-500/20 hover:border-emerald-500">
                                    Secure Log In
                                </Link>
                            </p>
                        </form>
                    )}

                    {/* Step 2: Verification Form */}
                    {step === 'VERIFY_EMAIL' && (
                        <form className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500" onSubmit={handleVerifyEmail}>
                            <div className="text-center">
                                <div className="w-24 h-24 bg-emerald-50 rounded-[24px] flex items-center justify-center mx-auto mb-8 animate-float border border-emerald-100 shadow-sm">
                                    <ShieldCheckIcon className="text-emerald-500" size={48} />
                                </div>
                                <p className="text-slate-600 text-lg font-medium max-w-xs mx-auto">
                                    Enter the 6-digit security code sent to your device and email.
                                </p>
                                <div className="mt-6 flex flex-col items-center gap-4">
                                    <div className="inline-flex items-center gap-3 bg-emerald-50 px-8 py-4 rounded-3xl border border-emerald-200 shadow-sm">
                                        <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
                                        <span className="text-sm font-bold text-emerald-600 uppercase tracking-[0.2em] animate-pulse">
                                            Demo Code: 123456
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center max-w-[200px]">
                                        Use this universal code for the demo environment
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <input
                                    type="text"
                                    placeholder="0 0 0 0 0 0"
                                    className="text-center text-4xl tracking-[0.5em] w-full max-w-sm py-8 bg-slate-50 border border-black/[0.06] rounded-[2rem] outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 focus:bg-white text-slate-950 font-bold placeholder:text-slate-300 shadow-inner transition-all"
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
                                    className="w-full text-[10px] font-bold text-slate-500 hover:text-emerald-500 transition-all uppercase tracking-[0.4em] flex items-center justify-center gap-2"
                                >
                                    ← Resend or Update Details
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <p className="text-center mt-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                    <ShieldCheckIcon size={14} className="text-emerald-500/50" /> End-to-End Encryption Enabled
                </p>
            </div>

            {/* Phone Verification Modal */}
            {isOtpModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white border border-black/[0.04] rounded-[32px] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-emerald-50 rounded-[24px] flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                                <ShieldCheckIcon className="text-emerald-500" size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-slate-950">Verify Phone</h3>
                                <p className="text-slate-500 text-sm font-medium">
                                    We've sent a 6-digit code to <br />
                                    <span className="text-slate-950 font-bold">{formData.whatsapp}</span>
                                </p>
                            </div>

                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100/50">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1">Demo Environment</p>
                                <p className="text-lg font-bold text-slate-950 tracking-[0.3em]">123456</p>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="000000"
                                    className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-5 text-center text-3xl font-bold text-slate-950 tracking-[0.5em] outline-none focus:border-emerald-500/50 focus:bg-white focus:shadow-sm transition-all placeholder:text-slate-300 shadow-inner"
                                    value={tempOtp}
                                    onChange={(e) => setTempOtp(e.target.value.replace(/\D/g, ''))}
                                />
                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsOtpModalOpen(false)}
                                        className="flex-1 px-6 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-950 transition-colors bg-slate-50 hover:bg-slate-100 border border-black/[0.04]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmPhoneOTP}
                                        disabled={tempOtp.length !== 6 || isLoading}
                                        className="flex-[2] bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white px-6 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                                    >
                                        {isLoading ? 'Verifying...' : 'Confirm Code'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
