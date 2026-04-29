'use client'
import { useState, Suspense } from "react"
import { useDispatch } from "react-redux"
import { setCredentials } from "@/lib/features/auth/authSlice"
import { loginUser } from "@/backend-actions/actions/auth"
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
    const [step, setStep] = useState('LOGIN') // LOGIN | VERIFY
    const [otp, setOtp] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name === 'email' ? 'identifier' : e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        dispatch(showLoader("Signing you in..."))

        try {
            const result = await loginUser(formData.identifier, formData.password)

            if (!result.success) {
                throw new Error(result.error)
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
            
            // SYSTEM RULE: Explicit routing decision log
            console.log(`[AUTH SYSTEM] Redirection Decision`, {
                userId: user.id,
                role: userRole,
                target: redirect || 'INTERNAL_MAP',
                reason: redirect ? 'USER_REDIRECT_PARAM' : 'ROLE_BASED_MAPPING'
            })

            if (redirect) {
                router.push(redirect)
            } else {
                // REBUILD RULE: Deterministic explicit mapping only
                const ROLE_ROUTES = {
                    'SUPER_ADMIN': '/admin',
                    'ADMIN': '/admin',
                    'SELLER': '/seller',
                    'USER': '/buyer'
                }

                const destination = ROLE_ROUTES[userRole]
                
                if (destination) {
                    router.push(destination)
                } else {
                    // SECURITY FAILURE: Unknown role, force logout
                    console.error(`[SECURITY FAILURE] Unknown role detected: ${userRole}`)
                    toast.error("Account security violation: Unknown role")
                    // Immediate cleanup and redirect to login
                    dispatch(setCredentials(null))
                    localStorage.removeItem('gocycle_session')
                    router.push('/login')
                }
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
            const { verifyOTP } = await import("@/backend-actions/actions/auth")
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
                            {step === 'LOGIN' ? 'Welcome Back' : 'Security Check'}
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">
                            {step === 'LOGIN' ? 'Log in to your GoCycle account' : `Verifying ${formData.identifier}`}
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
                                    <button type="button" className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-500">Forgot?</button>
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
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div className="text-center">
                                <p className="text-slate-600 text-sm font-medium">
                                    Your account requires verification. Please use the demo code provided below:
                                </p>
                                <div className="mt-6 flex flex-col items-center gap-4">
                                    <div className="inline-flex items-center gap-3 bg-emerald-50 px-8 py-4 rounded-3xl border border-emerald-200 shadow-sm">
                                        <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
                                        <span className="text-sm font-bold text-emerald-600 uppercase tracking-[0.2em] animate-pulse">
                                            Demo Code: 123456
                                        </span>
                                    </div>
                                </div>
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
