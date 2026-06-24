'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAffiliateDashboard, requestAffiliatePayout, updateAffiliateBankDetails, logoutAffiliate, sendPayoutOTP } from '@/backend-actions/actions/affiliate'
import toast from 'react-hot-toast'
import { Copy, CheckCircle, DollarSign, Users, TrendingUp, Wallet, LogOut, ExternalLink, CreditCard, Clock, CheckCircle2, XCircle, ChevronRight, X, Menu, Download } from 'lucide-react'
import { assets } from '@/assets/assets'
import Image from 'next/image'

export default function AffiliateDashboard() {
    const router = useRouter()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(null)
    const [showPayoutModal, setShowPayoutModal] = useState(false)
    const [payoutForm, setPayoutForm] = useState({ amount: '', bankName: '', accountNumber: '', accountName: '' })
    const [bankForm, setBankForm] = useState({ bankName: '', accountNumber: '', accountName: '' })
    const [submitting, setSubmitting] = useState(false)
    const [dashTab, setDashTab] = useState('overview') // overview | earnings | payouts | settings
    const [showMobileSidebar, setShowMobileSidebar] = useState(false)
    const [showIDCardModal, setShowIDCardModal] = useState(false)

    // Payout OTP state variables
    const [payoutStep, setPayoutStep] = useState('form') // form | otp
    const [payoutOtp, setPayoutOtp] = useState('')
    const [payoutResendTimer, setPayoutResendTimer] = useState(0)

    useEffect(() => { fetchDashboard() }, [])

    useEffect(() => {
        if (data) {
            // Auto popup for previously created accounts on load, once per session
            const hasShown = sessionStorage.getItem('gocycle_affiliate_idcard_shown')
            if (!hasShown) {
                setShowIDCardModal(true)
                sessionStorage.setItem('gocycle_affiliate_idcard_shown', 'true')
            }
        }
    }, [data])

    useEffect(() => {
        let t = null
        if (payoutResendTimer > 0) t = setInterval(() => setPayoutResendTimer(p => p - 1), 1000)
        return () => clearInterval(t)
    }, [payoutResendTimer])

    const fetchDashboard = async () => {
        setLoading(true)
        try {
            const res = await getAffiliateDashboard()
            if (!res.success) { router.push('/affiliate'); return }
            setData(res.data)
            const aff = res.data.affiliate
            setPayoutForm(p => ({ ...p, bankName: aff.bankName || '', accountNumber: aff.accountNumber || '', accountName: aff.accountName || '' }))
            setBankForm({ bankName: aff.bankName || '', accountNumber: aff.accountNumber || '', accountName: aff.accountName || '' })
        } catch { router.push('/affiliate') }
        finally { setLoading(false) }
    }

    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text)
        setCopied(key)
        setTimeout(() => setCopied(null), 2000)
        toast.success('Copied to clipboard')
    }

    const handlePayoutSubmit = async (e) => {
        e.preventDefault()
        if (!payoutForm.bankName || !payoutForm.accountNumber || !payoutForm.accountName) {
            return toast.error('Please configure your bank details in settings first')
        }
        const amount = parseFloat(payoutForm.amount)
        if (!amount || amount <= 0) return toast.error('Enter a valid amount')

        setSubmitting(true)
        try {
            const res = await sendPayoutOTP()
            if (!res.success) {
                toast.error(res.error || 'Failed to send verification code')
                return
            }
            setPayoutStep('otp')
            setPayoutResendTimer(60)
            toast.success('Verification code sent to your phone')
        } catch {
            toast.error('Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }

    const handleConfirmPayout = async (e) => {
        e.preventDefault()
        if (payoutOtp.length !== 6) return toast.error('Enter the 6-digit code')
        const amount = parseFloat(payoutForm.amount)

        setSubmitting(true)
        try {
            const res = await requestAffiliatePayout({ ...payoutForm, amount, otp: payoutOtp })
            if (!res.success) return toast.error(res.error)
            toast.success(res.data.message)
            setShowPayoutModal(false)
            setPayoutStep('form')
            setPayoutOtp('')
            fetchDashboard()
        } catch { toast.error('Failed to submit payout request') }
        finally { setSubmitting(false) }
    }

    const handleResendPayoutOtp = async () => {
        if (payoutResendTimer > 0) return
        setSubmitting(true)
        try {
            const res = await sendPayoutOTP()
            if (res.success) {
                setPayoutResendTimer(60)
                toast.success('Verification code resent')
            } else {
                toast.error(res.error || 'Failed to send verification code')
            }
        } catch {
            toast.error('Failed to send verification code')
        } finally {
            setSubmitting(false)
        }
    }

    const handleSaveBank = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await updateAffiliateBankDetails(bankForm)
            if (!res.success) return toast.error(res.error)
            toast.success('Bank details saved successfully')
            fetchDashboard()
        } catch { toast.error('Failed to save bank details') }
        finally { setSubmitting(false) }
    }

    const handleDownloadIDCard = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 600
        canvas.height = 900
        const ctx = canvas.getContext('2d')

        // 1. Clean off-white background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, 600, 900)

        // Subtle thin outline border
        ctx.strokeStyle = '#e2e8f0'
        ctx.lineWidth = 2
        ctx.strokeRect(10, 10, 580, 880)

        // 2. Geometric Accent Shapes
        // Top-Right green gradient circle/arc
        const topArcGrad = ctx.createLinearGradient(400, 0, 600, 200)
        topArcGrad.addColorStop(0, '#05DF72')
        topArcGrad.addColorStop(1, '#029e4f')
        ctx.fillStyle = topArcGrad
        ctx.beginPath()
        ctx.arc(600, 0, 240, 0, Math.PI * 2)
        ctx.fill()

        // Bottom-Left dark slate arc
        ctx.fillStyle = '#0f172a'
        ctx.beginPath()
        ctx.arc(0, 900, 200, 0, Math.PI * 2)
        ctx.fill()

        // Little green accent arc bottom-left edge
        ctx.fillStyle = '#05DF72'
        ctx.beginPath()
        ctx.arc(0, 900, 215, 0, Math.PI * 2)
        ctx.strokeStyle = '#05DF72'
        ctx.lineWidth = 6
        ctx.stroke()

        // 3. Dot Grid Patterns (inspired by reference image)
        // Dot Grid 1 (Top-Left, black/grey dots)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                ctx.beginPath()
                ctx.arc(60 + c * 18, 160 + r * 18, 3.5, 0, Math.PI * 2)
                ctx.fill()
            }
        }

        // Dot Grid 2 (Bottom-Right, green dots)
        ctx.fillStyle = 'rgba(5, 223, 114, 0.4)'
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 6; c++) {
                ctx.beginPath()
                ctx.arc(460 + c * 18, 680 + r * 18, 3.5, 0, Math.PI * 2)
                ctx.fill()
            }
        }

        // 4. Abstract Triangles & Wavy Lines (inspired by red/blue shapes in reference)
        // Triangles
        ctx.fillStyle = '#05DF72'
        ctx.beginPath()
        ctx.moveTo(80, 360)
        ctx.lineTo(105, 380)
        ctx.lineTo(75, 395)
        ctx.closePath()
        ctx.fill()

        ctx.fillStyle = 'rgba(15, 23, 42, 0.08)'
        ctx.beginPath()
        ctx.moveTo(500, 280)
        ctx.lineTo(530, 310)
        ctx.lineTo(480, 320)
        ctx.closePath()
        ctx.fill()

        // Wavy lines
        ctx.strokeStyle = '#0f172a'
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.moveTo(80, 480)
        ctx.bezierCurveTo(95, 470, 105, 490, 120, 480)
        ctx.stroke()

        ctx.strokeStyle = '#05DF72'
        ctx.beginPath()
        ctx.moveTo(480, 420)
        ctx.bezierCurveTo(495, 410, 505, 430, 520, 420)
        ctx.stroke()

        // 5. Render GoCycle Logo
        const logoImg = new window.Image()
        const logoSrc = assets.gs_logo?.src || assets.gs_logo || '/assets/gocycle.png'
        logoImg.src = logoSrc
        logoImg.onload = () => {
            ctx.drawImage(logoImg, 300 - 80, 75, 160, 40)
            finalizeDrawing()
        }
        logoImg.onerror = () => {
            ctx.fillStyle = '#0f172a'
            ctx.font = '900 36px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('GoCycle', 300, 105)

            ctx.fillStyle = '#05DF72'
            ctx.font = 'bold 12px sans-serif'
            ctx.fillText('NIGERIA\'S E-WASTE HUB', 300, 125)
            finalizeDrawing()
        }

        function finalizeDrawing() {
            // Header Text (Date or verified tag)
            ctx.fillStyle = 'rgba(15, 23, 42, 0.5)'
            ctx.font = 'bold 11px monospace'
            ctx.textAlign = 'center'
            ctx.fillText('EST. 2026 • DIGITAL OFFICIAL ID', 300, 160)

            // Circular avatar with double border
            ctx.beginPath()
            ctx.arc(300, 280, 72, 0, Math.PI * 2)
            ctx.strokeStyle = '#0f172a'
            ctx.lineWidth = 3
            ctx.stroke()

            ctx.beginPath()
            ctx.arc(300, 280, 65, 0, Math.PI * 2)
            ctx.strokeStyle = '#05DF72'
            ctx.lineWidth = 3
            ctx.stroke()

            ctx.fillStyle = 'rgba(5, 223, 114, 0.05)'
            ctx.beginPath()
            ctx.arc(300, 280, 62, 0, Math.PI * 2)
            ctx.fill()

            // Avatar Silhouette
            ctx.fillStyle = '#0f172a'
            ctx.beginPath()
            ctx.arc(300, 260, 20, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(300, 320, 40, Math.PI, 0)
            ctx.fill()

            // Verification Checkmark icon
            ctx.fillStyle = '#05DF72'
            ctx.beginPath()
            ctx.arc(350, 230, 12, 0, Math.PI * 2)
            ctx.fill()
            ctx.strokeStyle = '#ffffff'
            ctx.lineWidth = 2.5
            ctx.beginPath()
            ctx.moveTo(345, 230)
            ctx.lineTo(349, 234)
            ctx.lineTo(356, 226)
            ctx.stroke()

            // "EVENT CREW" equivalent -> "OFFICIAL PARTNER" label
            ctx.fillStyle = '#05DF72'
            ctx.fillRect(200, 385, 200, 28)
            ctx.fillStyle = '#ffffff'
            ctx.font = '900 11px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('OFFICIAL PARTNER', 300, 403)

            // Large Uppercase Name (Inspired by "JOHN" in reference)
            ctx.fillStyle = '#0f172a'
            ctx.font = '900 48px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(affiliate.name.toUpperCase(), 300, 470)

            // Sub-title
            ctx.fillStyle = 'rgba(15, 23, 42, 0.6)'
            ctx.font = 'bold 12px sans-serif'
            ctx.fillText('GoCycle Ambassador Network', 300, 495)

            // Referral Code Section (Clean white card box with black border)
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(170, 540, 260, 65)
            ctx.strokeStyle = '#0f172a'
            ctx.lineWidth = 2
            ctx.strokeRect(170, 540, 260, 65)

            ctx.fillStyle = '#0f172a'
            ctx.font = 'bold 10px monospace'
            ctx.fillText('REFERRAL CODE', 300, 560)
            ctx.fillStyle = '#05DF72'
            ctx.font = '900 26px monospace'
            ctx.fillText(referralCode, 300, 592)

            // Link section
            ctx.fillStyle = 'rgba(15, 23, 42, 0.5)'
            ctx.font = 'bold 10px monospace'
            ctx.fillText('SHAREABLE SIGN-UP LINK:', 300, 680)

            ctx.fillStyle = '#0f172a'
            ctx.font = 'bold 13px monospace'
            ctx.fillText(referralLink, 300, 705)

            // Barcode Pattern at the bottom
            const barcodeX = 180
            const barcodeY = 750
            const barcodeHeight = 35
            const barcodePattern = [2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 2, 1, 3, 4, 1, 2, 3, 1, 2, 4]
            let currentX = barcodeX
            barcodePattern.forEach((width, index) => {
                ctx.fillStyle = index % 2 === 0 ? '#0f172a' : 'rgba(5, 223, 114, 0.15)'
                ctx.fillRect(currentX, barcodeY, width * 3, barcodeHeight)
                currentX += width * 3 + 2
            })

            // Footer tagline
            ctx.fillStyle = '#05DF72'
            ctx.font = 'black 11px sans-serif'
            ctx.fillText('RECYCLE. EARN. SUSTAIN.', 300, 815)

            ctx.fillStyle = 'rgba(15, 23, 42, 0.4)'
            ctx.font = 'normal 9px sans-serif'
            ctx.fillText('This digital ID is a verified ambassador token of GoCycle.ng.', 300, 840)
            ctx.fillText('All transactions made using this code generate active rewards.', 300, 855)

            // Save and download
            const imgURL = canvas.toDataURL('image/png')
            const downloadLink = document.createElement('a')
            downloadLink.href = imgURL
            downloadLink.download = `GoCycle_Partner_${affiliate.name.replace(/\s+/g, '_')}_ID.png`
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)
            toast.success('Professional ID Card downloaded!')
        }
    }

    const handleLogout = async () => {
        await logoutAffiliate()
        router.push('/affiliate')
    }

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#05DF72] border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!data) return null

    const { affiliate, stats, referralCode, referralLink, earnings, payoutRequests } = data

    const statCards = [
        { label: 'Wallet Balance', value: `₦${stats.walletBalance.toLocaleString()}`, icon: Wallet, color: 'emerald', sub: 'Available for immediate payout' },
        { label: 'Total Earned', value: `₦${stats.totalEarned.toLocaleString()}`, icon: TrendingUp, color: 'blue', sub: 'All-time earned commissions' },
        { label: 'Total Referrals', value: stats.referralCount, icon: Users, color: 'purple', sub: 'Registered referred sellers' },
        { label: 'Pending Commission', value: `₦${stats.pendingEarnings.toLocaleString()}`, icon: DollarSign, color: 'amber', sub: 'Awaiting order completion' },
    ]

    const colorMap = {
        emerald: 'border-l-[#05DF72]',
        blue: 'border-l-blue-550',
        purple: 'border-l-purple-550',
        amber: 'border-l-amber-550',
    }

    const navItems = [
        { id: 'overview', label: 'Overview', icon: Wallet },
        { id: 'earnings', label: `Earnings Log (${earnings.length})`, icon: TrendingUp },
        { id: 'payouts', label: `Payout Requests (${payoutRequests.length})`, icon: Clock },
        { id: 'settings', label: 'Bank Settings', icon: CreditCard }
    ]

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">

            {/* Header */}
            <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3.5 sticky top-0 z-40 backdrop-blur-md">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Hamburger menu button for mobile */}
                        <button onClick={() => setShowMobileSidebar(true)} className="md:hidden p-1.5 border border-slate-200 rounded-sm hover:bg-slate-50 text-slate-600 mr-1 flex-shrink-0">
                            <Menu size={15} />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-slate-900 font-semibold text-sm sm:text-base truncate">Partner: {affiliate.name}</h1>
                            <p className="text-slate-500 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider">{referralCode}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="hidden sm:inline-flex flex-shrink-0 items-center gap-1.5 text-slate-600 hover:text-slate-900 text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-colors border border-slate-200 hover:bg-slate-50 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-sm bg-white">
                        <LogOut size={12} /> Sign Out
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {showMobileSidebar && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 md:hidden flex justify-start">
                    <div className="bg-white w-64 h-full border-r border-slate-200 flex flex-col p-6 space-y-6 shadow-xl animate-in slide-in-from-left duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Partner Portal</span>
                                <p className="font-semibold text-slate-900 text-xs truncate mt-0.5">{affiliate.name}</p>
                            </div>
                            <button onClick={() => setShowMobileSidebar(false)} className="text-slate-400 hover:text-slate-600 p-1 border border-slate-200 rounded-sm bg-white hover:bg-slate-50">
                                <X size={14} />
                            </button>
                        </div>
                        <nav className="space-y-1.5 flex-1">
                            {navItems.map(item => {
                                const Icon = item.icon
                                const isActive = dashTab === item.id
                                return (
                                    <button key={item.id}
                                        onClick={() => { setDashTab(item.id); setShowMobileSidebar(false) }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider border-l-2 rounded-sm transition-colors text-left ${isActive ? 'bg-slate-50 border-[#05DF72] text-emerald-700 font-bold' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950'}`}>
                                        <Icon size={13} />
                                        <span>{item.label}</span>
                                    </button>
                                )
                            })}
                        </nav>
                        <div className="border-t border-slate-150 pt-4">
                            <button onClick={() => { handleLogout(); setShowMobileSidebar(false) }}
                                className="w-full flex items-center justify-center gap-1.5 text-red-600 hover:bg-red-50 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider border border-red-100 transition-colors">
                                <LogOut size={12} /> Sign Out
                            </button>
                        </div>
                    </div>
                    <div className="flex-1" onClick={() => setShowMobileSidebar(false)} />
                </div>
            )}


            <div className="flex-1 max-w-6xl w-full mx-auto flex flex-col md:flex-row relative">

                {/* ── Desktop Sidebar (Permanent left panel) ────────────────────── */}
                <aside className="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-slate-200/80 bg-white py-8 px-4 space-y-6 sticky top-[60px] h-[calc(100vh-60px)]">
                    <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block px-3">Navigation</span>
                    </div>
                    <nav className="space-y-1.5 flex-1">
                        {navItems.map(item => {
                            const Icon = item.icon
                            const isActive = dashTab === item.id
                            return (
                                <button key={item.id}
                                    onClick={() => setDashTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider border-l-2 rounded-sm transition-colors text-left ${isActive ? 'bg-slate-50 border-[#05DF72] text-emerald-700 font-bold' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950'}`}>
                                    <Icon size={13} />
                                    <span>{item.label}</span>
                                </button>
                            )
                        })}
                    </nav>
                </aside>

                {/* ── Main Tab Content ──────────────────────────────────────────── */}
                <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 min-w-0 overflow-hidden space-y-6">
                    {/* OVERVIEW TAB */}
                    {dashTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {statCards.map(({ label, value, icon: Icon, color, sub }) => (
                                    <div key={label} className={`bg-white border border-slate-200/85 border-l-[3px] ${colorMap[color]} rounded-sm p-4 space-y-1`}>
                                        <p className="text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
                                        <p className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-mono">{value}</p>
                                        <p className="text-[9px] sm:text-[10px] text-slate-450 leading-normal">{sub}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Referral Details Panel */}
                            <div className="bg-white border border-slate-200 rounded-sm p-4 sm:p-6 space-y-4 min-w-0">
                                <h2 className="text-slate-900 font-semibold text-xs sm:text-sm">Partner Referral Tracking Coordinates</h2>
                                <div className="grid sm:grid-cols-2 gap-4 min-w-0">
                                    <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-2 min-w-0">
                                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Your Referral Code</p>
                                        <div className="flex items-center justify-between gap-2 min-w-0">
                                            <span className="text-base sm:text-lg font-mono font-bold text-emerald-650 tracking-wider truncate">{referralCode}</span>
                                            <button onClick={() => copyToClipboard(referralCode, 'code')}
                                                className="flex-shrink-0 bg-white hover:bg-slate-50 text-slate-600 p-1.5 rounded-sm transition-colors border border-slate-200">
                                                {copied === 'code' ? <CheckCircle size={14} className="text-[#05DF72]" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-2 min-w-0">
                                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Shareable Sign-Up Link</p>
                                        <div className="flex items-center justify-between gap-3 min-w-0">
                                            <span className="text-xs text-slate-700 truncate font-mono min-w-0">{referralLink}</span>
                                            <button onClick={() => copyToClipboard(referralLink, 'link')}
                                                className="flex-shrink-0 bg-white hover:bg-slate-50 text-slate-600 p-1.5 rounded-sm transition-colors border border-slate-200">
                                                {copied === 'link' ? <CheckCircle size={14} className="text-[#05DF72]" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ID Card Banner */}
                            <div className="bg-white border border-slate-200 rounded-sm p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-slate-900 font-semibold text-xs sm:text-sm">Official Partner ID Card</h3>
                                    <p className="text-slate-500 text-[11px] sm:text-xs mt-1">Get your verified digital ID card and share it on social media to promote your referral code.</p>
                                </div>
                                <button onClick={() => setShowIDCardModal(true)}
                                    className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-sm transition-colors border border-transparent">
                                    <CreditCard size={14} /> View ID Card
                                </button>
                            </div>

                            {/* Quick Payout Callout */}
                            <div className="bg-white border border-slate-200 rounded-sm p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-slate-900 font-semibold text-xs sm:text-sm">Payout Management</h3>
                                    <p className="text-slate-500 text-[11px] sm:text-xs mt-1">Submit earnings directly to your bank account. OTP verification is requested on every transfer request.</p>
                                </div>
                                <button onClick={() => {
                                    if (!affiliate.bankName || !affiliate.accountNumber) {
                                        toast.error('Please configure your bank details in settings tab first')
                                        setDashTab('settings')
                                    } else {
                                        setShowPayoutModal(true)
                                    }
                                }}
                                    className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-1.5 bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] text-slate-950 font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-sm transition-colors">
                                    <Wallet size={14} /> Request Payout
                                </button>
                            </div>
                        </div>
                    )}

                    {/* EARNINGS TAB */}
                    {dashTab === 'earnings' && (
                        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-150">
                                <h2 className="text-slate-900 font-semibold text-sm">Commissions History</h2>
                                <p className="text-slate-500 text-xs mt-0.5">Commissions are calculated as 2.5% of referred seller orders and released on order completion</p>
                            </div>
                            {earnings.length === 0 ? (
                                <div className="p-12 text-center space-y-2">
                                    <TrendingUp className="text-slate-300 mx-auto" size={32} />
                                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">No earnings recorded</p>
                                    <p className="text-slate-500 text-xs">Share your referral link to refer active battery sellers and earn commission.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="text-left text-slate-400 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                                                <th className="px-6 py-3 font-semibold">Order Reference</th>
                                                <th className="px-6 py-3 font-semibold">Date</th>
                                                <th className="px-6 py-3 font-semibold">Order Subtotal</th>
                                                <th className="px-6 py-3 font-semibold">Your Commission (2.5%)</th>
                                                <th className="px-6 py-3 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-150">
                                            {earnings.map((e) => (
                                                <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-6 py-4 text-slate-800 font-mono text-[11px]">{e.orderId}</td>
                                                    <td className="px-6 py-4 text-slate-500">{new Date(e.createdAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</td>
                                                    <td className="px-6 py-4 text-slate-700 font-mono font-medium">₦{e.subtotal.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-emerald-600 font-mono font-bold">+₦{e.commission.toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-[10px] font-semibold border ${e.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-amber-50 text-amber-700 border-amber-250'}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${e.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                            {e.status === 'paid' ? 'Paid' : 'Pending'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PAYOUTS TAB */}
                    {dashTab === 'payouts' && (
                        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-150">
                                <h2 className="text-slate-900 font-semibold text-sm">Payout History</h2>
                                <p className="text-slate-500 text-xs mt-0.5">Summary and status of your payout logs</p>
                            </div>
                            {payoutRequests.length === 0 ? (
                                <div className="p-12 text-center space-y-2">
                                    <Wallet className="text-slate-300 mx-auto" size={32} />
                                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">No payout requests</p>
                                    <p className="text-slate-550 text-xs">Request a payout when you have a balance to clear.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="text-left text-slate-400 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                                                <th className="px-6 py-3 font-semibold">Request Date</th>
                                                <th className="px-6 py-3 font-semibold">Amount Requested</th>
                                                <th className="px-6 py-3 font-semibold">Bank Information</th>
                                                <th className="px-6 py-3 font-semibold">Status</th>
                                                <th className="px-6 py-3 font-semibold">Admin Note</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-150">
                                            {payoutRequests.map((p) => (
                                                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-6 py-4 text-slate-500">{new Date(p.createdAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</td>
                                                    <td className="px-6 py-4 text-slate-900 font-mono font-bold">₦{p.amount.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-slate-700 font-mono text-[11px]">{p.bankName} — {p.accountNumber}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-semibold border ${p.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : p.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-250'}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'approved' ? 'bg-emerald-500' : p.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate">{p.note || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {dashTab === 'settings' && (
                        <div className="bg-white border border-slate-200 rounded-sm max-w-xl">
                            <div className="px-6 py-4 border-b border-slate-150">
                                <h2 className="text-slate-900 font-semibold text-sm">Configure Bank Details</h2>
                                <p className="text-slate-500 text-xs mt-0.5">Please provide valid local bank account details where payouts will be transferred</p>
                            </div>
                            <form onSubmit={handleSaveBank} className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">Bank Name</label>
                                    <input type="text" required placeholder="e.g. First Bank of Nigeria"
                                        className="w-full bg-white border border-slate-200 focus:border-[#05DF72] rounded-sm py-2 px-3 text-slate-950 text-xs outline-none transition-all placeholder:text-slate-400"
                                        value={bankForm.bankName} onChange={(e) => setBankForm(p => ({ ...p, bankName: e.target.value }))} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">Account Number</label>
                                    <input type="text" required placeholder="10-digit NUBAN" maxLength={10}
                                        className="w-full bg-white border border-slate-200 focus:border-[#05DF72] rounded-sm py-2 px-3 text-slate-950 text-xs outline-none transition-all placeholder:text-slate-400 font-mono"
                                        value={bankForm.accountNumber} onChange={(e) => setBankForm(p => ({ ...p, accountNumber: e.target.value.replace(/\D/g, '') }))} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">Account Name</label>
                                    <input type="text" required placeholder="Account Holder Name"
                                        className="w-full bg-white border border-slate-200 focus:border-[#05DF72] rounded-sm py-2 px-3 text-slate-950 text-xs outline-none transition-all placeholder:text-slate-400"
                                        value={bankForm.accountName} onChange={(e) => setBankForm(p => ({ ...p, accountName: e.target.value }))} />
                                </div>
                                <button type="submit" disabled={submitting}
                                    className="w-full bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] disabled:opacity-50 text-slate-950 font-semibold text-xs uppercase tracking-wider py-2.5 rounded-sm transition-colors mt-2">
                                    {submitting ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </form>
                        </div>
                    )}
                </main>
            </div>

            {/* Payout Modal */}
            {showPayoutModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-md p-8 w-full max-w-md shadow-xl relative">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-slate-900 font-semibold text-sm uppercase tracking-wider">Request Payout</h3>
                            <button onClick={() => { setShowPayoutModal(false); setPayoutStep('form'); setPayoutOtp('') }} className="text-slate-450 hover:text-slate-600"><X size={18} /></button>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 mb-5 flex justify-between items-center text-xs">
                            <span className="text-slate-500">Available Balance:</span>
                            <strong className="text-emerald-650 font-mono">₦{stats.walletBalance.toLocaleString()}</strong>
                        </div>
                        
                        {payoutStep === 'form' ? (
                            <form onSubmit={handlePayoutSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">Amount (₦)</label>
                                    <input type="number" required min={1} max={stats.walletBalance} placeholder="Enter amount to withdraw"
                                        className="w-full bg-white border border-slate-200 focus:border-[#05DF72] rounded-sm py-2 px-3 text-slate-900 text-xs outline-none transition-all placeholder:text-slate-400 font-mono"
                                        value={payoutForm.amount} onChange={(e) => setPayoutForm(p => ({ ...p, amount: e.target.value }))} />
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded-sm p-3 space-y-1 text-xs">
                                    <p className="text-[9px] text-slate-500 uppercase font-semibold">Target Destination Bank</p>
                                    <p className="text-slate-900 font-semibold">{payoutForm.bankName}</p>
                                    <p className="text-slate-500 font-mono text-[10px]">{payoutForm.accountNumber} — {payoutForm.accountName}</p>
                                </div>
                                <button type="submit" disabled={submitting}
                                    className="w-full bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] disabled:opacity-50 text-slate-950 font-semibold text-xs uppercase tracking-wider py-3 rounded-sm transition-colors">
                                    {submitting ? 'Generating security code...' : 'Send Verification OTP'}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-5">
                                <div className="text-center">
                                    <p className="text-slate-500 text-xs">We sent a 6-digit confirmation code to your phone number <strong className="text-slate-900">{affiliate.phone}</strong> to authorize this payout.</p>
                                </div>
                                <form onSubmit={handleConfirmPayout} className="space-y-4">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={payoutOtp}
                                        onChange={(e) => setPayoutOtp(e.target.value.replace(/\D/g, ''))}
                                        className="w-full bg-white border border-slate-200 rounded-sm py-3 text-center text-xl font-bold font-mono text-slate-900 tracking-[0.4em] outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20"
                                    />
                                    <button type="submit" disabled={submitting}
                                        className="w-full bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] disabled:opacity-50 text-slate-950 font-semibold text-xs uppercase tracking-wider py-3 rounded-sm transition-colors">
                                        {submitting ? 'Confirming...' : 'Authorize Payout'}
                                    </button>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={handleResendPayoutOtp} disabled={payoutResendTimer > 0 || submitting}
                                            className="flex-1 text-slate-500 hover:text-slate-800 text-xs font-semibold py-1 transition-colors disabled:opacity-40">
                                            {payoutResendTimer > 0 ? `Resend in ${payoutResendTimer}s` : 'Resend Code'}
                                        </button>
                                        <button type="button" onClick={() => { setPayoutStep('form'); setPayoutOtp('') }}
                                            className="flex-1 text-slate-500 hover:text-slate-800 text-xs font-semibold py-1 transition-colors">
                                            Edit Amount
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ID Card Modal */}
            {showIDCardModal && (
                <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 w-full max-w-sm sm:max-w-md shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-slate-900 font-bold text-sm uppercase tracking-wider">Partner Identity Card</h3>
                            <button onClick={() => setShowIDCardModal(false)} className="text-slate-400 hover:text-slate-600 p-1 border border-slate-200 rounded-sm bg-white hover:bg-slate-50">
                                <X size={16} />
                            </button>
                        </div>

                        {/* ID Card HTML Display */}
                        <div className="relative w-full max-w-[320px] mx-auto bg-white border border-slate-200 rounded-sm overflow-hidden p-6 text-center shadow-xl space-y-6 select-none min-h-[460px]">
                            {/* Geometric Accents */}
                            {/* Top-Right green gradient circle/arc */}
                            <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-[#05DF72] to-[#029e4f] rounded-full z-0"></div>
                            
                            {/* Bottom-Left dark slate arc with green border */}
                            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#0f172a] rounded-full border-4 border-[#05DF72] z-0"></div>

                            {/* Dot Grids */}
                            <div className="absolute top-20 left-4 grid grid-cols-5 gap-1 opacity-20 text-slate-900 pointer-events-none">
                                {Array.from({ length: 25 }).map((_, i) => (
                                    <div key={i} className="w-1 h-1 bg-current rounded-full" />
                                ))}
                            </div>
                            <div className="absolute bottom-28 right-4 grid grid-cols-6 gap-1 opacity-35 text-[#05DF72] pointer-events-none">
                                {Array.from({ length: 36 }).map((_, i) => (
                                    <div key={i} className="w-1 h-1 bg-current rounded-full" />
                                ))}
                            </div>

                            {/* Abstract Triangles & Waves */}
                            <div className="absolute top-[32%] left-[6%] w-0 h-0 border-t-[8px] border-t-transparent border-l-[16px] border-l-[#05DF72] border-b-[8px] border-b-transparent transform rotate-[15deg] pointer-events-none"></div>
                            <div className="absolute top-[28%] right-[25%] w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-slate-200 border-b-[10px] border-b-transparent transform -rotate-[45deg] pointer-events-none"></div>
                            
                            <svg className="absolute top-[48%] left-[8%] w-8 h-2 text-slate-900 opacity-20 pointer-events-none" viewBox="0 0 40 10" fill="none">
                                <path d="M0,5 Q10,0 20,5 T40,5" stroke="currentColor" strokeWidth="3" fill="none"/>
                            </svg>
                            <svg className="absolute top-[42%] right-[8%] w-8 h-2 text-[#05DF72] opacity-60 pointer-events-none" viewBox="0 0 40 10" fill="none">
                                <path d="M0,5 Q10,0 20,5 T40,5" stroke="currentColor" strokeWidth="3" fill="none"/>
                            </svg>

                            {/* Header Logo */}
                            <div className="pt-2 flex flex-col items-center justify-center relative z-10">
                                <Image 
                                    src={assets.gs_logo} 
                                    alt="GoCycle" 
                                    width={110} 
                                    height={28} 
                                    className="h-5 w-auto object-contain mx-auto filter brightness-95"
                                />
                                <span className="text-slate-400 text-[8px] font-mono tracking-wider uppercase mt-2 block">
                                    EST. 2026 • DIGITAL OFFICIAL ID
                                </span>
                            </div>

                            {/* Circular avatar with double border and badge */}
                            <div className="relative w-28 h-28 mx-auto rounded-full border-2 border-slate-900 p-1 bg-white shadow-sm z-10">
                                <div className="relative w-full h-full rounded-full border-2 border-[#05DF72] bg-[#05DF72]/5 flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0.5 rounded-full bg-[#05DF72]/10 flex flex-col justify-end items-center">
                                        <div className="w-7 h-7 rounded-full bg-[#0f172a] mb-1"></div>
                                        <div className="w-14 h-8 rounded-t-full bg-[#0f172a]"></div>
                                    </div>
                                </div>
                                {/* Verified Check Badge */}
                                <div className="absolute top-2 right-2 w-6 h-6 bg-[#05DF72] rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                    <svg className="w-3.5 h-3.5 text-white stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Name & Title */}
                            <div className="space-y-1 relative z-10">
                                {/* Partner Label (event crew style pill) */}
                                <div className="inline-block bg-[#05DF72] text-white text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-sm mb-1">
                                    OFFICIAL PARTNER
                                </div>
                                <h4 className="text-[#0f172a] font-black text-2xl tracking-tight uppercase truncate max-w-full px-2">
                                    {affiliate.name}
                                </h4>
                                <span className="text-slate-550 text-[9px] font-semibold tracking-wider block">
                                    GoCycle Ambassador Network
                                </span>
                            </div>

                            {/* Referral Code Container */}
                            <div className="bg-white border-2 border-slate-900 rounded-sm py-2 px-4 max-w-[200px] mx-auto shadow-sm relative z-10">
                                <span className="text-slate-400 text-[7px] font-mono tracking-wider block uppercase mb-0.5">Referral Code</span>
                                <span className="text-[#05DF72] font-mono font-black text-lg tracking-widest">{referralCode}</span>
                            </div>

                            {/* Fake Barcode */}
                            <div className="flex items-center justify-center gap-[1.5px] h-6 opacity-85 pointer-events-none relative z-10">
                                {[2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 2, 1, 3, 4, 1, 2, 3].map((val, idx) => (
                                    <div 
                                        key={idx} 
                                        style={{ width: `${val}px` }} 
                                        className={`h-full ${idx % 2 === 0 ? 'bg-slate-900' : 'bg-[#05DF72]/15'}`}
                                    />
                                ))}
                            </div>

                            {/* Referral Link block */}
                            <div className="space-y-0.5 relative z-10">
                                <span className="text-slate-400 text-[7px] font-mono uppercase tracking-wider block">Exclusive Sign-Up Link</span>
                                <span className="text-slate-800 text-[9px] font-mono truncate block max-w-full px-4">{referralLink}</span>
                            </div>

                            {/* Footer slogans */}
                            <div className="pt-2 border-t border-slate-100 relative z-10">
                                <p className="text-[#05DF72] text-[9px] font-extrabold uppercase tracking-widest">Recycle. Earn. Sustain.</p>
                                <span className="text-slate-400 text-[6px] block mt-0.5">Powered by GoCycle.ng • E-waste Revolution</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleDownloadIDCard}
                                className="w-full flex items-center justify-center gap-2 bg-[#05DF72] hover:bg-[#04c865] text-slate-950 font-bold py-3 px-4 rounded-sm text-xs uppercase tracking-wider shadow-md transition-colors"
                            >
                                <Download size={14} /> Download Card Image
                            </button>
                            <button
                                onClick={() => setShowIDCardModal(false)}
                                className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-3 px-4 rounded-sm text-xs uppercase tracking-wider shadow-sm transition-colors"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


