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
            const nameParts = user.name.split(' ')
            const firstname = nameParts[0]
            const lastname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''

            const result = await performNINVerification(user.id, formData.ninDocument, {
                firstname,
                lastname
            })

            if (result.success) {
                toast.success('NIN Verified Successfully!')
                setNinVerified(true)
            } else {
                toast.error(result.error || 'NIN Verification Failed')
            }
        } catch (error) {
            toast.error('Verification service error')
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
                    accountStatus: 'approved' // Auto-approved since they verified NIN
                })
            })

            const result = await response.json()

            if (result.success) {
                toast.success('Verification complete! Your account is now fully verified.')

                dispatch(updateProfile({
                    ...formData,
                    accountStatus: 'approved'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#05DF72] to-emerald-400 p-8 text-white sticky top-0 z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText size={32} />
                        <div>
                            <h2 className="text-2xl font-black">Identity Verification</h2>
                            <p className="text-white/80 text-sm">Powered by QoreID Secure Verification</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* NIN Verification Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-slate-800">
                                National Identity Number (NIN) *
                            </label>
                            {ninVerified && (
                                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#05DF72] bg-[#05DF72]/10 px-2 py-1 rounded">
                                    ✓ Verified
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter your 11-digit NIN"
                                required
                                disabled={ninVerified || verifyingNIN}
                                maxLength={11}
                                inputMode="numeric"
                                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 focus:border-[#05DF72] font-medium disabled:bg-slate-50 disabled:text-slate-500"
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
                                    className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                                >
                                    {verifyingNIN ? 'Verifying...' : 'Verify NIN'}
                                </button>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                            Verification is performed in real-time. Name on NIN must match your registered name: <strong>{user.name}</strong>
                        </p>
                    </div>

                    {/* CAC Verification Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-slate-800">
                                CAC Registration Number (Optional)
                            </label>
                            {cacVerified && (
                                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#05DF72] bg-[#05DF72]/10 px-2 py-1 rounded">
                                    ✓ Verified
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="RC123456"
                                disabled={cacVerified || verifyingCAC}
                                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 focus:border-[#05DF72] font-medium disabled:bg-slate-50 disabled:text-slate-500"
                                value={formData.cacDocument || ''}
                                onChange={(e) => setFormData({ ...formData, cacDocument: e.target.value })}
                            />
                            {!cacVerified && formData.cacDocument && (
                                <button
                                    type="button"
                                    onClick={handleVerifyCAC}
                                    disabled={verifyingCAC}
                                    className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                                >
                                    {verifyingCAC ? 'Verifying...' : 'Verify CAC'}
                                </button>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                            For registered businesses only. Provide your RC or BN number.
                        </p>
                    </div>

                    {/* Bank Details */}
                    <div className="border-t border-slate-100 pt-8 mt-4">
                        <div className="flex items-center gap-2 mb-6">
                            <CreditCard className="text-slate-600" size={20} />
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Settlement Account</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Bank Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. GTBank"
                                    required
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 focus:border-[#05DF72] font-medium text-sm"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Account Number</label>
                                <input
                                    type="text"
                                    placeholder="10 Digits"
                                    required
                                    maxLength={10}
                                    inputMode="numeric"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 focus:border-[#05DF72] font-medium text-sm"
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
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Account Holder Name</label>
                            <input
                                type="text"
                                placeholder="Name on Bank Account"
                                required
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 focus:border-[#05DF72] font-medium text-sm"
                                value={formData.accountName}
                                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <Button
                            type="submit"
                            loading={loading}
                            disabled={!ninVerified}
                            loadingText="Finalizing verification..."
                            className="w-full !py-4 shadow-xl shadow-[#05DF72]/20"
                        >
                            Complete Verification
                        </Button>
                        {!ninVerified && (
                            <p className="text-center text-[10px] text-red-400 mt-2 font-bold uppercase tracking-widest">
                                Verification of NIN is required to continue
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
