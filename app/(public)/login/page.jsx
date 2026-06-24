'use client'
import { useState, Suspense, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setCredentials, logout } from "@/lib/features/auth/authSlice"
import { loginUser, logoutUser, verifyAdmin2FA, resendAdmin2FA, changePassword, verifyOTP } from "@/backend-actions/actions/auth"
import { useRouter, useSearchParams } from "next/navigation"
import { ShieldCheck as ShieldCheckIcon, Mail as MailIcon, Lock as LockIcon, Loader as LoaderIcon, Zap as ZapIcon, Eye as EyeIcon, EyeOff as EyeOffIcon } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"
import Button from "@/components/Button"

function LoginContent() {
    const dispatch = useDispatch()
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect')

    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState('LOGIN') // LOGIN | VERIFY | ADMIN_2FA
    const [otp, setOtp] = useState('')
    const [twoFACode, setTwoFACode] = useState('')
    const [twoFAData, setTwoFAData] = useState(null) // { userId, email, user }
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
        newPassword: '',
        confirmPassword: ''
    })

    const { user, isLoggedIn, isHydrated } = useSelector((state) => state.auth)

    const ROLE_ROUTES = {
        'SUPER_ADMIN': '/admin',
        'ADMIN': '/admin',
        'SELLER': '/seller',
        'USER': '/buyer',
        'BUYER': '/buyer'
    }

    // REMOVED AUTO-REDIRECT to break infinite loops on production/Vercel
    // Redirection now only happens explicitly after successful handleSubmit

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name === 'email' ? 'identifier' : e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await loginUser(formData.identifier, formData.password)

            if (!result.success) {
                throw new Error(result.error)
            }

            // ─── Admin 2FA Gate ───
            if (result.requires2FA || result.data?.requires2FA) {
                const data = result.data || result;
                dispatch(hideLoader())
                setIsLoading(false)
                setTwoFAData({
                    userId: data.userId,
                    email: data.email,
                    user: data.user
                })
                setStep('ADMIN_2FA')
                toast("2FA code sent to your email.", { icon: "🔐" })
                return
            }

            if (result.requiresVerification) {
                dispatch(hideLoader())
                setIsLoading(false)
                setStep('VERIFY')
                toast("Please verify your account to continue.", { icon: "🔐" })
                return
            }

            // ─── Resolve User and Data Consistency ───
            const userData = result.user || result.data?.user;
            
            if (!userData) {
                console.error("[AUTH SYSTEM] Login returned success but no user data found", result);
                setIsLoading(false);
                toast.error("Account data sync failed. Please try again.");
                return;
            }

            // Save session to localStorage BEFORE navigating
            dispatch(setCredentials(userData))
            dispatch(hideLoader())

            const userRole = (userData.role || '').toUpperCase()
            const safeRedirect = (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) ? redirect : null
            const destination = safeRedirect || ROLE_ROUTES[userRole]

            console.log(`[AUTH SYSTEM] Login SUCCESS. Role: ${userRole}, Destination: ${destination}, UserID: ${userData.id}`)

            if (!destination) {
                setIsLoading(false)
                toast.error(`Unknown account role: "${userRole}". Please contact support.`)
                return
            }

            toast.success("Logged in successfully!")

            // Use window.location.href to guarantee navigation and a fresh state load
            // The session is already saved to localStorage by setCredentials above
            window.location.href = destination

        } catch (error) {
            dispatch(hideLoader())
            setIsLoading(false)
            toast.error(error.message)
        }
    }

    const handleVerify = async (e) => {
        e.preventDefault()
        if (!otp) return toast.error("Enter verification code")

        setIsLoading(true)
        dispatch(showLoader("Verifying account..."))

        try {
            const res = await verifyOTP(formData.identifier, otp)

            if (res.success) {
                toast.success("Account verified!")
                // Now proceed to login again or use the same credentials
                const loginResult = await loginUser(formData.identifier, formData.password)
                if (loginResult.success) {
                    dispatch(setCredentials(loginResult.user))
                    dispatch(hideLoader())
                    
                    const role = (loginResult.user.role || '').toUpperCase()
                    
                    // SYSTEM RULE: Explicit routing decision log (Post-Verification)
                    console.log(`[AUTH SYSTEM] Verification Redirection Decision`, {
                        userId: loginResult.user.id,
                        role: role,
                        target: 'ROLE_BASED_MAPPING'
                    })

                    const ROLE_ROUTES = {
                        'SUPER_ADMIN': '/admin',
                        'ADMIN': '/admin',
                        'SELLER': '/seller',
                        'USER': '/buyer',
                        'BUYER': '/buyer'
                    }

                    const destination = ROLE_ROUTES[role]

                    if (destination) {
                        setTimeout(() => window.location.replace(destination), 100)
                    } else {
                        console.error(`[SECURITY FAILURE] Unknown role after verification: ${role}`)
                        toast.error("Account security violation")
                        await logoutUser()
                        dispatch(setCredentials(null))
                        localStorage.removeItem('gocycle_session')
                        router.push('/login')
                    }
                }
            } else {
                throw new Error(res.error)
            }
        } catch (error) {
            dispatch(hideLoader())
            setIsLoading(false)
            toast.error(error.message)
        }
    }

    const handleAdmin2FA = async (e) => {
        e.preventDefault()
        if (!twoFACode || twoFACode.length !== 6) {
            return toast.error("Please enter the 6-digit code from your email")
        }

        setIsLoading(true)
        dispatch(showLoader("Verifying 2FA code..."))

        try {
            const result = await verifyAdmin2FA(twoFAData.userId, twoFACode)

            if (!result.success) {
                throw new Error(result.error)
            }

            if (result.data.user.needsPasswordChange) {
                setStep('CHANGE_PASSWORD')
                toast("Please set a new password for your admin account.", { icon: "🔐" })
                return
            }

            dispatch(setCredentials(result.data.user))
            dispatch(hideLoader())
            setIsLoading(false)
            toast.success("2FA verified! Welcome back, Admin.")
            setTimeout(() => window.location.replace('/admin'), 100)
        } catch (error) {
            dispatch(hideLoader())
            setIsLoading(false)
            toast.error(error.message)
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        if (!formData.newPassword || !formData.confirmPassword) {
            return toast.error("Please fill in both password fields")
        }
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error("Passwords do not match")
        }
        if (formData.newPassword.length < 8) {
            return toast.error("Password must be at least 8 characters long")
        }

        setIsLoading(true)
        dispatch(showLoader("Updating password..."))

        try {
            const res = await changePassword(twoFAData.userId, formData.password, formData.newPassword)

            if (res.success) {
                toast.success("Password updated successfully!")
                // Now complete the login
                dispatch(setCredentials(twoFAData.user))
                dispatch(hideLoader())
                setIsLoading(false)
                setTimeout(() => window.location.replace('/admin'), 100)
            } else {
                throw new Error(res.error)
            }
        } catch (error) {
            dispatch(hideLoader())
            setIsLoading(false)
            toast.error(error.message)
        }
    }

    const handleResend2FA = async () => {
        if (!twoFAData?.userId) return
        dispatch(showLoader("Resending 2FA code..."))
        try {
            const res = await resendAdmin2FA(twoFAData.userId)
            dispatch(hideLoader())
            if (res.success) {
                toast.success("New 2FA code sent to your email.")
            } else {
                toast.error(res.error || "Failed to resend code")
            }
        } catch (error) {
            dispatch(hideLoader())
            toast.error("Failed to resend code")
        }
    }


    return (
        <div className="min-h-screen bg-[#080b11] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="w-full max-w-md relative z-10">
                <div className="bg-[#0c101b] rounded-sm p-8 sm:p-12 border border-slate-800 shadow-xl relative">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-sm flex items-center justify-center mx-auto mb-4">
                            <ZapIcon className="text-[#05DF72]" size={20} fill="currentColor" fillOpacity={0.2} />
                        </div>
                        <h1 className="text-xl font-bold text-white mb-1.5 tracking-tight">
                            {step === 'LOGIN' ? 'Welcome Back' : step === 'ADMIN_2FA' ? 'Admin Verification' : step === 'CHANGE_PASSWORD' ? 'Update Password' : 'Security Check'}
                        </h1>
                        <p className="text-slate-400 font-medium text-xs">
                            {isLoggedIn && !isLoading ? 'Authentication successful. Redirecting...' : step === 'LOGIN' ? 'Log in to your GoCycle account' : step === 'ADMIN_2FA' ? `Code sent to ${twoFAData?.email || 'your email'}` : step === 'CHANGE_PASSWORD' ? 'One-time security update required' : `Verifying ${formData.identifier}`}
                        </p>
                    </div>

                    {step === 'LOGIN' ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-semibold text-slate-450 uppercase tracking-wider block">Email or Phone</label>
                                <div className="relative group">
                                    <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#05DF72] transition-colors" size={13} />
                                    <input
                                        type="text"
                                        name="identifier"
                                        value={formData.identifier}
                                        placeholder="Enter email or phone"
                                        className="w-full bg-[#111625] border border-slate-700 focus:border-[#05DF72] rounded-sm py-2.5 pl-9 pr-4 text-white text-xs outline-none transition-all placeholder:text-slate-600"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-[9px] font-semibold text-slate-450 uppercase tracking-wider block">Password</label>
                                    <Link href="/forgot-password" className="text-[9px] font-semibold text-[#05DF72] uppercase tracking-wider hover:underline">Forgot?</Link>
                                </div>
                                <div className="relative group">
                                    <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#05DF72] transition-colors" size={13} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        placeholder="••••••••"
                                        className="w-full bg-[#111625] border border-slate-700 focus:border-[#05DF72] rounded-sm py-2.5 pl-9 pr-10 text-white text-xs outline-none transition-all placeholder:text-slate-600"
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOffIcon size={13} /> : <EyeIcon size={13} />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                loading={isLoading}
                                loadingText="AUTHENTICATING..."
                                className="w-full bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] text-slate-950 font-semibold text-xs uppercase tracking-wider py-3 rounded-sm transition-colors mt-2"
                            >
                                SECURE LOGIN
                            </Button>
                        </form>
                    ) : step === 'ADMIN_2FA' ? (
                        <form onSubmit={handleAdmin2FA} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 border border-slate-700 rounded-sm mx-auto">
                                    <span className="text-xl">🔐</span>
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    A 6-digit verification code has been sent to your admin email address. Enter it below to complete your secure login.
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <input
                                    type="text"
                                    placeholder="000000"
                                    className="w-full bg-[#111625] border border-slate-700/80 rounded-sm py-3 text-center text-xl font-bold font-mono text-white tracking-[0.4em] outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20"
                                    value={twoFACode}
                                    onChange={e => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-3">
                                <Button
                                    type="submit"
                                    loading={isLoading}
                                    loadingText="VERIFYING..."
                                    className="w-full bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] text-slate-950 font-semibold text-xs uppercase tracking-wider py-3 rounded-sm transition-colors"
                                >
                                    VERIFY & LOGIN
                                </Button>
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => { setStep('LOGIN'); setTwoFACode(''); setTwoFAData(null); }}
                                        className="text-[9px] font-bold text-slate-400 hover:text-white transition-all uppercase tracking-wider"
                                    >
                                        ← Back to Login
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResend2FA}
                                        className="text-[9px] font-bold text-[#05DF72] hover:text-white transition-all uppercase tracking-wider"
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : step === 'CHANGE_PASSWORD' ? (
                        <form onSubmit={handlePasswordChange} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 border border-slate-700 rounded-sm mx-auto">
                                    <ShieldCheckIcon className="text-[#05DF72]" size={20} />
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    For security purposes, please set a new strong password for your admin account.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-semibold text-slate-450 uppercase tracking-wider block">New Password</label>
                                <div className="relative group">
                                    <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#05DF72] transition-colors" size={13} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={formData.newPassword}
                                        placeholder="••••••••"
                                        className="w-full bg-[#111625] border border-slate-700 focus:border-[#05DF72] rounded-sm py-2.5 pl-9 pr-10 text-white text-xs outline-none transition-all placeholder:text-slate-655"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-semibold text-slate-450 uppercase tracking-wider block">Confirm New Password</label>
                                <div className="relative group">
                                    <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#05DF72] transition-colors" size={13} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        placeholder="••••••••"
                                        className="w-full bg-[#111625] border border-slate-700 focus:border-[#05DF72] rounded-sm py-2.5 pl-9 pr-10 text-white text-xs outline-none transition-all placeholder:text-slate-655"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                loading={isLoading}
                                loadingText="UPDATING..."
                                className="w-full bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] text-slate-950 font-semibold text-xs uppercase tracking-wider py-3 rounded-sm transition-colors mt-2"
                            >
                                UPDATE PASSWORD & LOGIN
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="text-center">
                                <p className="text-slate-400 text-xs">
                                    Your account requires verification.
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <input
                                    type="text"
                                    placeholder="000000"
                                    className="w-full bg-[#111625] border border-slate-700/80 rounded-sm py-3 text-center text-xl font-bold font-mono text-white tracking-[0.4em] outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                    maxLength={6}
                                />
                            </div>

                            <div className="space-y-3">
                                <Button
                                    type="submit"
                                    loading={isLoading}
                                    loadingText="VERIFYING CODE..."
                                    className="w-full bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] text-slate-950 font-semibold text-xs uppercase tracking-wider py-3 rounded-sm transition-colors"
                                >
                                    VERIFY & LOGIN
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setStep('LOGIN')}
                                    className="w-full text-[9px] font-bold text-slate-400 hover:text-white transition-all uppercase tracking-wider"
                                >
                                    ← Back to Login
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-8 text-center space-y-3">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                            <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-wider text-slate-500"><span className="bg-[#0c101b] px-3">New to GoCycle?</span></div>
                        </div>
                        <p className="text-slate-400 font-medium text-xs">
                            Don't have an account? {' '}
                            <Link href="/signup" className="text-[#05DF72] font-semibold hover:underline">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-8 text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <ShieldCheckIcon size={12} className="text-[#05DF72]/60" /> Secured by GoCycle Core Auth
                </p>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoaderIcon className="animate-spin text-[#05DF72]" size={48} /></div>}>
            <LoginContent />
        </Suspense>
    )
}
