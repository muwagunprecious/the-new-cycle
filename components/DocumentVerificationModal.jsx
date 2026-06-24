import { useState } from 'react'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { updateProfile } from '@/lib/features/auth/authSlice'
import { X as XIcon, FileText, CreditCard, ShieldCheck as ShieldCheckIcon, Lock as LockIcon, CheckCircle as CheckCircleIcon, Loader as LoaderIcon, Zap as ZapIcon, Building as BuildingIcon } from 'lucide-react'
import Button from './Button'
import { performNINVerification, performCACVerification } from '@/backend-actions/actions/verification'

export default function DocumentVerificationModal({ user, onComplete }) {
    const dispatch = useDispatch()
    const [formData, setFormData] = useState({
        ninDocument: user?.ninDocument || '',
        cacDocument: user?.cacDocument || '',
        bankName: user?.bankName || '',
        accountNumber: user?.accountNumber || '',
        accountName: user?.accountName || ''
    })
    const [verifyingNIN, setVerifyingNIN] = useState(false)
    const [verifyingCAC, setVerifyingCAC] = useState(false)
    const [ninVerified, setNinVerified] = useState(!!user?.ninDocument)
    const [cacVerified, setCacVerified] = useState(!!user?.cacDocument)
    const [isDirectorVerified, setIsDirectorVerified] = useState(!!user?.isDirectorVerified)
    const [businessInfo, setBusinessInfo] = useState({
        name: user?.businessName || '',
        type: user?.businessType || ''
    })
    const [loading, setLoading] = useState(false)

    const handleVerifyNIN = async () => {
        if (!formData.ninDocument || formData.ninDocument.length !== 11) {
            toast.error('Please enter a valid 11-digit NIN')
            return
        }

        setVerifyingNIN(true)
        try {
            // Split name into first and last for QoreID
            const nameParts = (user.name || '').trim().split(/\s+/)
            const firstname = nameParts[0] || 'User'
            const lastname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : (nameParts[0] || 'User')

            console.log('Sending NIN verification for:', { firstname, lastname, nin: formData.ninDocument })

            const result = await performNINVerification(user.id, formData.ninDocument, {
                firstname,
                lastname
            })

            if (result.success) {
                toast.success('NIN Verified Successfully!')
                setNinVerified(true)
            } else {
                // If it's a name mismatch, give a hint
                let errorMsg = result.error || 'NIN Verification Failed'

                // Filter out technical/HTML responses
                if (errorMsg.includes('Cannot POST') || errorMsg.includes('<!DOCTYPE') || errorMsg.includes('Forbidden resource')) {
                    errorMsg = 'Access Denied: Forbidden resource. Please check if your QoreID API keys are valid for this environment (Sandbox vs Production).';
                }

                if (errorMsg.toLowerCase().includes('match')) {
                    errorMsg += ". Please ensure your registered name matches your NIN records."
                }
                toast.error(errorMsg, { duration: 6000 })
            }
        } catch (error) {
            toast.error('Verification service error: ' + error.message)
        } finally {
            setVerifyingNIN(false)
        }
    }

    const handleVerifyCAC = async () => {
        if (!formData.cacDocument) {
            toast.error('Please enter a CAC RC number')
            return
        }

        setVerifyingCAC(true)
        try {
            const result = await performCACVerification(user.id, formData.cacDocument)

            if (result.success) {
                toast.success('CAC Verified Successfully!')
                setCacVerified(true)
                setIsDirectorVerified(result.data?.isDirectorVerified || false)
                setBusinessInfo({
                    name: result.data?.businessName || '',
                    type: result.data?.businessType || ''
                })
                
                if (result.data?.isDirectorVerified) {
                    toast.success('Identity Match: You are confirmed as a Director!', { icon: '🤝', duration: 4000 })
                }
            } else {
                toast.error(result.error || 'CAC Verification Failed')
            }
        } catch (error) {
            toast.error('Verification service error')
        } finally {
            setVerifyingCAC(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!ninVerified) {
            toast.error('NIN must be verified first')
            return
        }

        if (!formData.bankName || !formData.accountNumber || !formData.accountName) {
            toast.error('All bank details are required')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/submit-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    ...formData,
                    accountStatus: 'pending' // Requires Admin Approval
                })
            })

            const result = await response.json()

            if (result.success) {
                toast.success('Documents submitted! Your account is now under review by our admin team.', { duration: 5000 })

                dispatch(updateProfile({
                    ...formData,
                    accountStatus: 'pending'
                }))

                onComplete?.()
            } else {
                throw new Error(result.error)
            }
        } catch (error) {
            console.error('Submission error:', error)
            toast.error(error.message || 'Failed to complete verification')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 animate-in zoom-in-95 duration-500">
                {/* Header */}
                <div className="bg-slate-50 p-8 sticky top-0 z-20 border-b border-slate-200 backdrop-blur-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#05DF72]/10 border border-[#05DF72]/20 rounded-sm flex items-center justify-center text-[#05DF72]">
                            <ShieldCheckIcon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[#05DF72] uppercase tracking-[0.2em] mb-0.5">Identity Trust Engine</p>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Secure Verification</h2>
                        </div>
                    </div>
                    <button
                        onClick={onComplete}
                        className="p-2 rounded-sm bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"
                    >
                        <XIcon size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-10 bg-white">

                    {/* Trust Banner */}
                    <div className="bg-[#05DF72]/5 border border-[#05DF72]/20 rounded-sm p-6 flex items-start gap-4">
                        <div className="p-3 bg-white border border-slate-200 rounded-sm shadow-sm text-[#05DF72]">
                            <LockIcon size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm">End-to-End Encrypted</h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                                Your data is protected by GoCycle's encryption protocol and processed securely through QoreID infrastructure.
                            </p>
                        </div>
                    </div>

                    {/* NIN Verification Section */}
                    <div className="space-y-4 relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-sm bg-slate-950 text-white flex items-center justify-center font-bold text-xs">1</span>
                                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    Identity Verification (NIN)
                                </label>
                            </div>
                            {ninVerified && (
                                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-950 bg-[#05DF72] px-2 py-0.5 rounded-sm border border-[#05DF72]/20">
                                    <CheckCircleIcon size={12} /> Verified
                                </span>
                            )}
                        </div>

                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#05DF72] transition-colors">
                                <CreditCard size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="11-digit NIN Number"
                                required
                                disabled={ninVerified || verifyingNIN}
                                maxLength={11}
                                inputMode="numeric"
                                className="w-full pl-12 pr-4 sm:pr-36 py-3.5 bg-slate-50 border border-slate-200 rounded-sm outline-none transition-all focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20 font-bold text-slate-900 tracking-[0.2em] placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-400 text-base disabled:bg-slate-100 disabled:text-slate-400"
                                value={formData.ninDocument || ''}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '')
                                    if (val.length <= 11) {
                                        setFormData({ ...formData, ninDocument: val })
                                    }
                                }}
                            />
                            {!ninVerified && (
                                <button
                                    type="button"
                                    onClick={handleVerifyNIN}
                                    disabled={verifyingNIN || !formData.ninDocument || formData.ninDocument.length !== 11}
                                    className="relative sm:absolute mt-3 sm:mt-0 sm:right-2 sm:top-1/2 sm:-translate-y-1/2 w-full sm:w-auto px-5 py-2 bg-slate-900 text-white rounded-sm text-[10px] font-bold uppercase tracking-wider hover:bg-[#05DF72] hover:text-slate-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {verifyingNIN ? <LoaderIcon className="animate-spin" size={14} /> : 'Authenticate'}
                                </button>
                            )}
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm">
                            <p className="text-[10px] text-slate-500 font-medium">
                                Name mismatch protection enabled. Registered name: <span className="text-slate-900 font-bold">{user.name}</span>
                            </p>
                        </div>
                    </div>

                    {/* CAC Verification Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-sm bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">2</span>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Business Verification (Optional)
                                </label>
                            </div>
                            {cacVerified && (
                                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-950 bg-[#05DF72] px-2 py-0.5 rounded-sm border border-[#05DF72]/20">
                                    <CheckCircleIcon size={12} /> Verified
                                </span>
                            )}
                        </div>

                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#05DF72] transition-colors">
                                <BuildingIcon size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="CAC RC Number (e.g. RC123456)"
                                disabled={cacVerified || verifyingCAC}
                                className="w-full pl-12 pr-4 sm:pr-36 py-3.5 bg-slate-50 border border-slate-200 rounded-sm outline-none transition-all focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20 font-bold text-slate-900 tracking-wider placeholder:font-medium placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-400"
                                value={formData.cacDocument || ''}
                                onChange={(e) => setFormData({ ...formData, cacDocument: e.target.value })}
                            />
                            {!cacVerified && formData.cacDocument && (
                                <button
                                    type="button"
                                    onClick={handleVerifyCAC}
                                    disabled={verifyingCAC}
                                    className="relative sm:absolute mt-3 sm:mt-0 sm:right-2 sm:top-1/2 sm:-translate-y-1/2 w-full sm:w-auto px-5 py-2 bg-slate-900 text-white rounded-sm text-[10px] font-bold uppercase tracking-wider hover:bg-[#05DF72] hover:text-slate-950 transition-all disabled:opacity-50"
                                >
                                    {verifyingCAC ? <LoaderIcon className="animate-spin" size={14} /> : 'Verify Business'}
                                </button>
                            )}
                        </div>

                        {cacVerified && (
                            <div className="p-5 bg-slate-50 border border-slate-200 rounded-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Registered Entity</p>
                                        <h4 className="text-sm font-bold text-slate-900 uppercase">{businessInfo.name}</h4>
                                        <p className="text-[11px] text-slate-500 font-bold mt-0.5">{businessInfo.type}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-white rounded-sm border border-slate-200">
                                            <div className="w-1.5 h-1.5 rounded-sm bg-[#05DF72] animate-pulse"></div>
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Active Status</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {isDirectorVerified ? (
                                    <div className="flex items-center gap-2 py-2 px-3 bg-[#05DF72]/15 border border-[#05DF72]/30 text-slate-900 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                                        <ShieldCheckIcon size={14} className="text-[#05DF72]" />
                                        Director Identity Confirmed (NIN Match)
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 py-2 px-3 bg-amber-50 text-amber-600 border border-amber-100 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                                        <ZapIcon size={14} />
                                        Manual Director Review Required
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bank Details */}
                    <div className="pt-8 border-t border-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-6 h-6 rounded-sm bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">3</span>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Financial Settlement</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Bank Institution</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Zenith Bank"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20 font-bold text-slate-900 text-sm"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Account Number</label>
                                <input
                                    type="text"
                                    placeholder="10-digit number"
                                    required
                                    maxLength={10}
                                    inputMode="numeric"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20 font-bold text-slate-900 text-sm"
                                    value={formData.accountNumber}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '')
                                        if (val.length <= 10) {
                                            setFormData({ ...formData, accountNumber: val })
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Beneficiary Name</label>
                            <input
                                type="text"
                                placeholder="Full Name on Account"
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20 font-bold text-slate-900 text-sm"
                                value={formData.accountName}
                                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            loading={loading}
                            disabled={!ninVerified}
                            loadingText="FINALIZING PROTOCOL..."
                            className="w-full !py-4 !rounded-sm text-sm font-bold uppercase tracking-wider"
                        >
                            Complete Verification
                        </Button>
                        {!ninVerified && (
                            <div className="flex items-center justify-center gap-2 mt-4 text-[9px] font-bold text-rose-500 uppercase tracking-widest">
                                <LockIcon size={12} /> Stage 1 Completion Required
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
