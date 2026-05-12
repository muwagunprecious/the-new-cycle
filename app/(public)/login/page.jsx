'use client'
import { useState, Suspense } from "react"
import { useDispatch } from "react-redux"
import { setCredentials } from "@/lib/features/auth/authSlice"
import { loginUser, verifyAdmin2FA, resendAdmin2FA, changePassword, verifyOTP } from "@/backend-actions/actions/auth"
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name === 'email' ? 'identifier' : e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        // Removed global showLoader to allow button-level loading for better UX

        // Clear any stale legacy localStorage state (safe — does not touch cookies)
        localStorage.removeItem('gocycle_session')

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

            dispatch(setCredentials(result.user))
            dispatch(hideLoader())
            setIsLoading(false)
            toast.success("Logged in successfully!")

            const user = result.user
            const userRole = (user.role || '').toUpperCase()
            
            const ROLE_ROUTES = {
                'SUPER_ADMIN': '/admin',
                'ADMIN': '/admin',
                'SELLER': '/seller',
                'USER': '/buyer'
            }

            // SYSTEM RULE: Explicit routing decision log
            console.log(`[AUTH SYSTEM] Redirection Decision`, {
                userId: user.id,
                role: userRole,
                email: user.email,
                destination: redirect || ROLE_ROUTES[userRole] || 'NONE',
                reason: redirect ? 'USER_REDIRECT_PARAM' : 'ROLE_BASED_MAPPING'
            })

            try {
                if (redirect) {
                    router.push(redirect)
                } else {
                    const destination = ROLE_ROUTES[userRole]
                    
                    if (destination) {
                        router.push(destination)
                    } else {
                        // SECURITY FAILURE: Unknown role, force logout
                        console.error(`[SECURITY FAILURE] Unknown role detected: ${userRole}`)
                        toast.error("Account security violation: Unknown role")
                        // Immediate cleanup and redirect to login
                        await logoutUser()
                        dispatch(setCredentials(null))
                        localStorage.removeItem('gocycle_session')
                        router.push('/login')
                    }
                }
            } catch (redirError) {
                console.error("[AUTH SYSTEM] Redirection Error:", redirError)
                toast.error("Navigation failed. Please try manual reload.")
            }

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
                        'USER': '/buyer'
                    }

                    const destination = ROLE_ROUTES[role]

                    if (destination) {
                        router.push(destination)
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
            router.push('/admin')
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
                router.push('/admin')
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -mr-40 -mt-20 -z-0 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -ml-20 -mb-20 -z-0"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white rounded-[32px] p-10 sm:p-14 border border-black/[0.04] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100 rotate-3">
                            <ZapIcon className="text-emerald-500" size={40} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-950 mb-2 tracking-tight">
                            {step === 'LOGIN' ? 'Welcome Back' : step === 'ADMIN_2FA' ? 'Admin Verification' : step === 'CHANGE_PASSWORD' ? 'Update Password' : 'Security Check'}
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">
                            {step === 'LOGIN' ? 'Log in to your GoCycle account' : step === 'ADMIN_2FA' ? `Code sent to ${twoFAData?.email || 'your email'}` : step === 'CHANGE_PASSWORD' ? 'One-time security update required' : `Verifying ${formData.identifier}`}
                        </p>
                    </div>

                    {step === 'LOGIN' ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Email or Phone</label>
                                <div className="relative group">
                                    <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        name="identifier"
                                        value={formData.identifier}
                                        placeholder="Enter email or phone"
                                        className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-medium text-slate-950 placeholder:text-slate-400"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Password</label>
                                    <Link href="/forgot-password" size="sm" className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-500">Forgot?</Link>
                                </div>
                                <div className="relative group">
                                    <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-12 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-medium text-slate-950 placeholder:text-slate-400"
                                        onChange={handleChange}
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

                            <Button
                                type="submit"
                                loading={isLoading}
                                loadingText="AUTHENTICATING..."
                                className="w-full !py-5 !rounded-2xl shadow-xl shadow-emerald-500/10 text-sm mt-4"
                            >
                                SECURE LOGIN
                            </Button>
                        </form>
                    ) : step === 'ADMIN_2FA' ? (
                        <form onSubmit={handleAdmin2FA} className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-3xl border border-emerald-200 shadow-sm mx-auto mb-4">
                                    <span className="text-4xl">🔐</span>
                                </div>
                                <p className="text-slate-600 text-sm font-medium">
                                    A 6-digit verification code has been sent to your admin email address. Enter it below to complete your secure login.
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <input
                                    type="text"
                                    placeholder="0 0 0 0 0 0"
                                    className="text-center text-4xl tracking-[0.5em] w-full max-w-sm py-6 bg-slate-50 border border-black/[0.06] rounded-2xl outline-none focus:border-emerald-500/50 focus:bg-white text-slate-950 font-bold placeholder:text-slate-300 transition-all shadow-inner"
                                    value={twoFACode}
                                    onChange={e => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    loading={isLoading}
                                    loadingText="VERIFYING..."
                                    className="w-full !py-5 !rounded-2xl shadow-xl shadow-emerald-500/10 text-sm"
                                >
                                    VERIFY & LOGIN
                                </Button>
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => { setStep('LOGIN'); setTwoFACode(''); setTwoFAData(null); }}
                                        className="text-[10px] font-black text-slate-500 hover:text-emerald-400 transition-all uppercase tracking-widest"
                                    >
                                        ← Back to Login
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResend2FA}
                                        className="text-[10px] font-black text-emerald-600 hover:text-emerald-400 transition-all uppercase tracking-widest"
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : step === 'CHANGE_PASSWORD' ? (
                        <form onSubmit={handlePasswordChange} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-sm mx-auto mb-4">
                                    <ShieldCheckIcon className="text-emerald-500" size={32} />
                                </div>
                                <p className="text-slate-600 text-sm font-medium mb-6">
                                    For security purposes, please set a new strong password for your admin account.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">New Password</label>
                                <div className="relative group">
                                    <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={formData.newPassword}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-12 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-medium text-slate-950 placeholder:text-slate-400"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Confirm New Password</label>
                                <div className="relative group">
                                    <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border border-black/[0.06] rounded-2xl py-4 pl-12 pr-12 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:shadow-sm font-medium text-slate-950 placeholder:text-slate-400"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                loading={isLoading}
                                loadingText="UPDATING..."
                                className="w-full !py-5 !rounded-2xl shadow-xl shadow-emerald-500/10 text-sm mt-4"
                            >
                                UPDATE PASSWORD & LOGIN
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div className="text-center">
                                <p className="text-slate-600 text-sm font-medium">
                                    Your account requires verification.
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <input
                                    type="text"
                                    placeholder="0 0 0 0 0 0"
                                    className="text-center text-4xl tracking-[0.5em] w-full max-w-sm py-6 bg-slate-50 border border-black/[0.06] rounded-2xl outline-none focus:border-emerald-500/50 focus:bg-white text-slate-950 font-bold placeholder:text-slate-300 transition-all shadow-inner"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                    maxLength={6}
                                />
                            </div>

                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    loading={isLoading}
                                    loadingText="VERIFYING CODE..."
                                    className="w-full !py-5 !rounded-2xl shadow-xl shadow-emerald-500/10 text-sm"
                                >
                                    VERIFY & LOGIN
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setStep('LOGIN')}
                                    className="w-full text-[10px] font-black text-slate-500 hover:text-emerald-400 transition-all uppercase tracking-widest"
                                >
                                    ← Back to Login
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-10 text-center space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/[0.04]"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-400"><span className="bg-white px-4">New to GoCycle?</span></div>
                        </div>
                        <p className="text-slate-500 font-medium text-sm">
                            Don't have an account? {' '}
                            <Link href="/signup" className="text-emerald-600 font-bold hover:text-emerald-500 transition-colors border-b-2 border-emerald-500/20 hover:border-emerald-500">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                    <ShieldCheckIcon size={14} className="text-emerald-500/50" /> Secured by GoCycle Core Auth
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
