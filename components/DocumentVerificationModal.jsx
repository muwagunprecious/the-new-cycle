'use client'
import { useState } from 'react'
import { X, Upload, FileText, Building2, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from './Button'

export default function DocumentVerificationModal({ user, onComplete }) {
    const [formData, setFormData] = useState({
        ninDocument: null,
        cacDocument: null,
        bankName: '',
        accountNumber: '',
        accountName: ''
    })
    const [loading, setLoading] = useState(false)

    const handleFileChange = (field, file) => {
        if (file) {
            // Validate file size (max 2MB for better performance)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('File size must be less than 2MB')
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [field]: reader.result }))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.ninDocument) {
            toast.error('NIN number is required')
            return
        }

        if (formData.ninDocument.length !== 11) {
            toast.error('NIN must be 11 digits')
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
                    ...formData
                })
            })

            const result = await response.json()

            if (result.success) {
                toast.success('Documents submitted successfully! Awaiting admin verification.')
                onComplete?.()
            } else {
                throw new Error(result.error)
            }
        } catch (error) {
            console.error('Submission error:', error)
            toast.error(error.message || 'Failed to submit documents')
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
                            <h2 className="text-2xl font-black">Complete Your Verification</h2>
                            <p className="text-white/80 text-sm">Provide your business details to access all features</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* NIN Number */}
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">
                            National Identity Number (NIN) *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter your 11-digit NIN"
                                required
                                maxLength={11}
                                inputMode="numeric"
                                pattern="\d{11}"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 focus:border-[#05DF72] font-medium"
                                value={formData.ninDocument || ''}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '')
                                    if (val.length <= 11) {
                                        setFormData({ ...formData, ninDocument: val })
                                    }
                                }}
                            />
                            <p className="text-xs text-slate-400 mt-2">
                                Please enter your 11-digit National Identity Number.
                            </p>
                        </div>
                    </div>

                    {/* CAC Number (Optional) */}
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">
                            CAC Registration Number (Optional)
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="RC123456"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 focus:border-[#05DF72] font-medium"
                                value={formData.cacDocument || ''}
                                onChange={(e) => setFormData({ ...formData, cacDocument: e.target.value })}
                            />
                            <p className="text-xs text-slate-400 mt-2">
                                For registered businesses only.
                            </p>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="border-t border-slate-200 pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="text-slate-600" size={20} />
                            <h3 className="text-sm font-bold text-slate-800">Bank Account Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Bank Name"
                                required
                                className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 focus:border-[#05DF72] font-medium text-sm"
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Account Number"
                                required
                                maxLength={10}
                                inputMode="numeric"
                                pattern="\d{10}"
                                className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 focus:border-[#05DF72] font-medium text-sm"
                                value={formData.accountNumber}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '')
                                    if (val.length <= 10) {
                                        setFormData({ ...formData, accountNumber: val })
                                    }
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Account Name"
                                required
                                className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 focus:border-[#05DF72] font-medium text-sm"
                                value={formData.accountName}
                                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Info Alert */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-800">
                            <strong>ℹ️ Why we need this:</strong> These documents help us verify your identity and ensure a safe marketplace for everyone. Your information is secure and will only be reviewed by our admin team.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        loading={loading}
                        loadingText="Uploading documents securely..."
                        className="w-full !py-4"
                    >
                        Submit Documents for Verification
                    </Button>
                </form>
            </div>
        </div>
    )
}
