'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { registerAffiliate, verifyAffiliateOTP, loginAffiliate, resendAffiliateOTP } from '@/backend-actions/actions/affiliate'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Phone, Mail, User, Lock, Copy, CheckCircle, Zap, TrendingUp, Users, DollarSign, X } from 'lucide-react'
import Link from 'next/link'

export default function AffiliatePage() {
    const router = useRouter()
    const [tab, setTab] = useState('login') // login | register
    const [step, setStep] = useState('form') // form | otp | success
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [resendTimer, setResendTimer] = useState(0)
    const [otp, setOtp] = useState('')
    const [successData, setSuccessData] = useState(null)
    const [copied, setCopied] = useState(null)

    const [form, setForm] = useState({ name: '', email: '', phone: '+234 ', password: '' })
    const [loginForm, setLoginForm] = useState({ phone: '+234 ', password: '' })

    useEffect(() => {
        let t = null
        if (resendTimer > 0) t = setInterval(() => setResendTimer(p => p - 1), 1000)
        return () => clearInterval(t)
    }, [resendTimer])

    const formatPhone = (v) => {
        const nums = v.replace(/\D/g, '')
        let suffix = nums.startsWith('234') ? nums.slice(3) : nums
        suffix = suffix.slice(0, 10)
        let res = '+234 '
        if (suffix.length > 0) res += suffix.slice(0, 3)
        if (suffix.length > 3) res += '-' + suffix.slice(3, 7)
        if (suffix.length > 7) res += '-' + suffix.slice(7, 10)
        return res
    }

    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text)
        setCopied(key)
        setTimeout(() => setCopied(null), 2000)
        toast.success('Copied to clipboard')
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        const digits = form.phone.replace(/\D/g, '')
        if (digits.length !== 13) return toast.error('Enter a valid 10-digit phone number')
        if (form.password.length < 8) return toast.error('Password must be at least 8 characters')

        setLoading(true)
        try {
            const res = await registerAffiliate(form)
            if (!res.success) return toast.error(res.error || 'Registration failed')
            setStep('otp')
            setResendTimer(60)
            toast.success('Verification code sent to your phone')
        } catch { toast.error('Something went wrong') }
        finally { setLoading(false) }
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        if (otp.length !== 6) return toast.error('Enter the 6-digit code')
        setLoading(true)
        try {
            const res = await verifyAffiliateOTP(form.phone, otp)
            if (!res.success) return toast.error(res.error || 'Invalid code')
            setSuccessData(res.data)
            setStep('success')
        } catch { toast.error('Verification failed') }
        finally { setLoading(false) }
    }

    const handleResend = async () => {
        if (resendTimer > 0) return
        setLoading(true)
        const res = await resendAffiliateOTP(form.phone)
        setLoading(false)
        if (res.success) { setResendTimer(60); toast.success('Code resent') }
        else toast.error(res.error || 'Failed to resend')
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await loginAffiliate(loginForm.phone, loginForm.password)
            if (!res.success) return toast.error(res.error || 'Login failed')
            toast.success('Welcome back')
            router.push('/affiliate/dashboard')
        } catch { toast.error('Login failed') }
        finally { setLoading(false) }
    }

    // ── Success Modal ─────────────────────────────────────────────────────────
    if (step === 'success' && successData) {
        return (
            <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-6 bg-[#080b11]">
                <div className="bg-[#0c101b] border border-slate-800/80 rounded-md p-8 max-w-md w-full shadow-xl relative">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#05DF72]" />
                    
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-[#05DF72]/10 border border-[#05DF72]/20 rounded-sm flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-[#05DF72]" size={24} />
                        </div>
                        <h2 className="text-lg font-semibold text-white tracking-tight">Account Approved</h2>
                        <p className="text-slate-400 text-xs mt-1">Welcome to the GoCycle Partner Network, <span className="text-[#05DF72] font-medium">{successData.name}</span></p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="bg-[#111625] border border-slate-800 rounded-sm p-4">
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1 font-semibold">Partner Referral Code</p>
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-mono font-bold text-[#05DF72] tracking-wider">{successData.referralCode}</span>
                                <button onClick={() => copyToClipboard(successData.referralCode, 'code')}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-sm transition-colors border border-slate-700">
                                    {copied === 'code' ? <CheckCircle size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#111625] border border-slate-800 rounded-sm p-4">
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1 font-semibold">Shareable Referral Link</p>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs text-slate-300 truncate font-mono">{successData.referralLink}</span>
                                <button onClick={() => copyToClipboard(successData.referralLink, 'link')}
                                    className="flex-shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-sm transition-colors border border-slate-700">
                                    {copied === 'link' ? <CheckCircle size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#05DF72]/5 border border-[#05DF72]/10 rounded-sm p-4 text-xs text-slate-300 leading-relaxed">
                            <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
                                <span className="text-[#05DF72]">⚡</span> Program Policy:
                            </p>
                            <p className="text-slate-400">Referrals are tracked automatically. When a referred buyer completes an order, 2.5% of the subtotal (50% of our buyer fee) is instantly credited to your wallet.</p>
                        </div>
                    </div>

                    <button onClick={() => router.push('/affiliate/dashboard')}
                        className="w-full bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] text-slate-950 font-semibold text-xs uppercase tracking-wider py-3 rounded-sm transition-colors">
                        Launch Dashboard →
                    </button>
                </div>
            </div>
        )
    }

    // ── OTP Step ──────────────────────────────────────────────────────────────
    if (step === 'otp') {
        return (
            <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-6 bg-[#080b11]">
                <div className="bg-[#0c101b] border border-slate-800/80 rounded-md p-8 max-w-md w-full relative shadow-xl">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#05DF72]" />
                    
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-sm flex items-center justify-center mx-auto mb-4">
                            <Phone className="text-[#05DF72]" size={20} />
                        </div>
                        <h2 className="text-lg font-semibold text-white tracking-tight">Security Code</h2>
                        <p className="text-slate-400 text-xs mt-1">Enter the 6-digit verification code sent to <strong className="text-white">{form.phone}</strong></p>
                    </div>

                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <input
                            type="text"
                            maxLength={6}
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-[#111625] border border-slate-700/80 rounded-sm py-3 text-center text-xl font-bold font-mono text-white tracking-[0.4em] outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20"
                        />
                        <button type="submit" disabled={loading}
                            className="w-full bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] disabled:opacity-50 text-slate-950 font-semibold text-xs uppercase tracking-wider py-3 rounded-sm transition-colors">
                            {loading ? 'Verifying...' : 'Verify & Complete Setup'}
                        </button>
                        <button type="button" onClick={handleResend} disabled={resendTimer > 0 || loading}
                            className="w-full text-slate-400 hover:text-white text-xs font-semibold tracking-wider uppercase transition-colors disabled:opacity-40">
                            {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    // ── Main Page ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-[calc(100vh-60px)] bg-[#080b11] flex items-center py-10">
            <div className="max-w-6xl mx-auto px-6 w-full">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                    
                    {/* Left Column — Corporate Info */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-1.5 border border-slate-800 px-3 py-1 rounded-sm text-slate-400 text-[10px] uppercase tracking-wider bg-slate-900/40">
                            <Zap size={11} className="text-[#05DF72]" /> GoCycle Partnership Program
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-snug tracking-tight">
                            Refer Buyers. Earn Recurring Commissions.<br />
                            <span className="text-[#05DF72]">Environmental recovery network.</span>
                        </h1>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                            Join Nigeria's leading battery recycling and recovery platform. Refer commercial buyers to our marketplace and receive a <strong className="text-white font-medium">2.5% commission</strong> on transaction values, tracked transparently on your personal dashboard.
                        </p>

                        {/* Flat Minimalist Steps Grid */}
                        <div className="grid sm:grid-cols-3 gap-4 pt-2">
                            {[
                                { icon: Users, title: '1. Get Your Code', desc: 'Share your custom partner referral link or code.' },
                                { icon: TrendingUp, title: '2. Buyer Purchases', desc: 'Referred buyers complete orders on GoCycle.' },
                                { icon: DollarSign, title: '3. Collect Payout', desc: 'Earn 2.5% of order subtotal credited instantly.' },
                            ].map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="bg-[#0c101b] border border-slate-800/80 rounded-sm p-4 space-y-2">
                                    <div className="w-7 h-7 rounded-sm bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700/50">
                                        <Icon size={14} />
                                    </div>
                                    <p className="text-white font-semibold text-xs tracking-tight">{title}</p>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column — Professional Account Panel */}
                    <div className="lg:col-span-5">
                        <div className="bg-[#0c101b] border border-slate-800/80 rounded-md p-8 shadow-lg relative">
                            
                            {/* Flat Pivot Navigation (Microsoft Style) */}
                            <div className="flex border-b border-slate-800 mb-6">
                                <button onClick={() => { setTab('login'); setShowPassword(false) }} 
                                    className={`pb-2.5 px-3 font-semibold text-xs uppercase tracking-wider transition-colors border-b-2 -mb-[2px] ${tab === 'login' ? 'border-[#05DF72] text-[#05DF72]' : 'border-transparent text-slate-400 hover:text-white'}`}>
                                    Sign In
                                </button>
                                <button onClick={() => { setTab('register'); setShowPassword(false) }} 
                                    className={`pb-2.5 px-3 font-semibold text-xs uppercase tracking-wider transition-colors border-b-2 -mb-[2px] ${tab === 'register' ? 'border-[#05DF72] text-[#05DF72]' : 'border-transparent text-slate-400 hover:text-white'}`}>
                                    Register
                                </button>
                            </div>

                            {/* Login Form */}
                            {tab === 'login' && (
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                                            <input type="tel" required placeholder="+234 800-0000-000"
                                                className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#05DF72] rounded-sm py-2.5 pl-9 pr-4 text-white text-xs outline-none transition-all placeholder:text-slate-500"
                                                value={loginForm.phone}
                                                onChange={(e) => setLoginForm(p => ({ ...p, phone: formatPhone(e.target.value) }))} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                                            <input type={showPassword ? 'text' : 'password'} required placeholder="Password"
                                                className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#05DF72] rounded-sm py-2.5 pl-9 pr-10 text-white text-xs outline-none transition-all placeholder:text-slate-500"
                                                value={loginForm.password}
                                                onChange={(e) => setLoginForm(p => ({ ...p, password: e.target.value }))} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                                                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                                            </button>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={loading}
                                        className="w-full mt-2 bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] disabled:opacity-50 text-slate-950 font-semibold text-xs uppercase tracking-wider py-3 rounded-sm transition-colors">
                                        {loading ? 'Authenticating...' : 'Sign In'}
                                    </button>
                                </form>
                            )}

                            {/* Register Form */}
                            {tab === 'register' && (
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                                            <input type="text" required placeholder="John Doe"
                                                className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#05DF72] rounded-sm py-2.5 pl-9 pr-4 text-white text-xs outline-none transition-all placeholder:text-slate-500"
                                                value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                                            <input type="email" required placeholder="you@example.com"
                                                className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#05DF72] rounded-sm py-2.5 pl-9 pr-4 text-white text-xs outline-none transition-all placeholder:text-slate-500"
                                                value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                                            <input type="tel" required placeholder="+234 800-0000-000"
                                                className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#05DF72] rounded-sm py-2.5 pl-9 pr-4 text-white text-xs outline-none transition-all placeholder:text-slate-500"
                                                value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: formatPhone(e.target.value) }))} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                                            <input type={showPassword ? 'text' : 'password'} required minLength={8} placeholder="Min. 8 characters"
                                                className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#05DF72] rounded-sm py-2.5 pl-9 pr-10 text-white text-xs outline-none transition-all placeholder:text-slate-500"
                                                value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                                                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                                            </button>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={loading}
                                        className="w-full mt-2 bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] disabled:opacity-50 text-slate-950 font-semibold text-xs uppercase tracking-wider py-3 rounded-sm transition-colors">
                                        {loading ? 'Creating...' : 'Register as Partner'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
