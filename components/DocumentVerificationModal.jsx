import { useState } from 'react'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { updateProfile } from '@/lib/features/auth/authSlice'
import { XIcon, FileText, CreditCard, ShieldCheckIcon, LockIcon, CheckCircleIcon, LoaderIcon, ZapIcon, BuildingIcon } from 'lucide-react'
import Button from './Button'
import { performNINVerification, performCACVerification } from '@/backend/actions/verification'

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
                dispatch(updateProfile({
                    ninDocument: formData.ninDocument,
                    isPhoneVerified: true
                }))
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
            const result = await performCACVerification(user.id, formData.cacDocument, user.name)

            if (result.success) {
                toast.success('CAC Verified Successfully!')
                setCacVerified(true)
                dispatch(updateProfile({
                    cacDocument: formData.cacDocument
                }))
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
            <div className="glass rounded-[3.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-glass border border-white/40 animate-in zoom-in-95 duration-500">
                {/* Header */}
                <div className="bg-slate-900/95 p-10 text-white sticky top-0 z-20 border-b border-white/10 backdrop-blur-xl">
                    <button
                        onClick={onComplete}
                        className="absolute top-8 right-8 p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/10"
                    >
                        <XIcon size={18} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 rotate-3">
                            <ShieldCheckIcon size={32} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Identity Trust Engine</p>
                            <h2 className="text-3xl font-black tracking-tight">Secure Verification</h2>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-10 space-y-12 bg-white/60">

                    {/* Trust Banner */}
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-6 flex items-start gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-500">
                            <LockIcon size={20} />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 text-sm">End-to-End Encrypted</h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                                Your data is protected by GoCycle's military-grade encryption and processed securely through QoreID infrastructure.
                            </p>
                        </div>
                    </div>

                    {/* NIN Verification Section */}
                    <div className="space-y-6 relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">1</span>
                                <label className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                    Identity Verification (NIN)
                                </label>
                            </div>
                            {ninVerified && (
                                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white bg-emerald-500 px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/20">
                                    <CheckCircleIcon size={12} /> Verified
                                </span>
                            )}
                        </div>

                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                <CreditCard size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="11-digit NIN Number"
                                required
                                disabled={ninVerified || verifyingNIN}
                                maxLength={11}
                                inputMode="numeric"
                                className="w-full pl-14 pr-32 py-5 bg-white border-2 border-slate-100 rounded-[1.5rem] outline-none transition-all focus:border-emerald-500 font-black text-slate-900 tracking-[0.2em] placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-300 text-lg disabled:bg-slate-50 disabled:text-slate-400"
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
                                    className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-900/10"
                                >
                                    {verifyingNIN ? <LoaderIcon className="animate-spin" size={14} /> : 'Authenticate'}
                                </button>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-2">
                            <p className="text-[10px] text-slate-400 font-medium">
                                Name mismatch protection enabled. Registered name: <span className="text-slate-900 font-black">{user.name}</span>
                            </p>
                            {!ninVerified && (
                                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                    <ZapIcon size={10} /> Test NIN: 70123456789
                                </p>
                            )}
                        </div>
                    </div>

                    {/* CAC Verification Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-black text-xs">2</span>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                    Business Verification (Optional)
                                </label>
                            </div>
                            {cacVerified && (
                                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white bg-emerald-500 px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/20">
                                    <CheckCircleIcon size={12} /> Verified
                                </span>
                            )}
                        </div>

                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                <BuildingIcon size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="CAC RC Number (e.g. RC123456)"
                                disabled={cacVerified || verifyingCAC}
                                className="w-full pl-14 pr-32 py-5 bg-white/50 border-2 border-slate-100 rounded-[1.5rem] outline-none transition-all focus:border-emerald-500 font-black text-slate-900 tracking-wider placeholder:font-medium placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-400"
                                value={formData.cacDocument || ''}
                                onChange={(e) => setFormData({ ...formData, cacDocument: e.target.value })}
                            />
                            {!cacVerified && formData.cacDocument && (
                                <button
                                    type="button"
                                    onClick={handleVerifyCAC}
                                    disabled={verifyingCAC}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 shadow-sm"
                                >
                                    {verifyingCAC ? <LoaderIcon className="animate-spin" size={14} /> : 'Verify'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="pt-10 border-t-2 border-dashed border-slate-100">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-black text-xs">3</span>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Financial Settlement</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Bank Institution</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Zenith Bank"
                                    required
                                    className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-bold text-slate-900 text-sm"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Account Number</label>
                                <input
                                    type="text"
                                    placeholder="10-digit number"
                                    required
                                    maxLength={10}
                                    inputMode="numeric"
                                    className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-black text-slate-900 tracking-wider text-sm"
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
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Beneficiary Name</label>
                            <input
                                type="text"
                                placeholder="Full Name on Account"
                                required
                                className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-bold text-slate-900 text-sm"
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
                            className="w-full !py-6 !rounded-[2rem] shadow-2xl shadow-emerald-500/20 text-sm font-black uppercase tracking-widest"
                        >
                            Complete Verification
                        </Button>
                        {!ninVerified && (
                            <div className="flex items-center justify-center gap-2 mt-4 text-[9px] font-black text-red-400 uppercase tracking-[0.2em]">
                                <LockIcon size={12} /> Stage 1 Completion Required
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
