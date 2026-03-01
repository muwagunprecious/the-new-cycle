'use client'
import { useState } from 'react'
import { XIcon, ShieldCheckIcon, PhoneIcon, BuildingIcon, CreditCardIcon, LoaderIcon, CheckCircleIcon, AlertCircleIcon, UserIcon } from 'lucide-react'
import { mockVerificationService } from '@/lib/mockService'
import Button from './Button'

/**
 * VerificationModal - Modal for Buyer/Seller verification
 * 
 * Buyer verification: CAC Number OR NIN + Bank Account
 * Seller verification: Phone Intelligence + Bank Account Validation
 */
export default function VerificationModal({ isOpen, onClose, userRole, onVerificationComplete }) {
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [verificationMethod, setVerificationMethod] = useState(null) // 'CAC' | 'NIN' for buyers
    const [verificationResult, setVerificationResult] = useState(null)
    const [bankResult, setBankResult] = useState(null)
    const [phoneResult, setPhoneResult] = useState(null)

    const [formData, setFormData] = useState({
        cacNumber: '',
        ninNumber: '',
        accountNumber: '',
        bankCode: '',
        phoneNumber: ''
    })

    if (!isOpen) return null

    const handleBuyerVerification = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            let result
            if (verificationMethod === 'CAC') {
                result = await mockVerificationService.verifyCAC(formData.cacNumber)
            } else {
                result = await mockVerificationService.verifyNIN(formData.ninNumber)
            }

            if (result.success) {
                setVerificationResult(result.data)
                setStep(2) // Move to bank verification
            } else {
                throw new Error(result.error)
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setIsLoading(false)
        }
    }


    const handleSellerPhoneSubmit = (e) => {
        e.preventDefault()
        if (!formData.phoneNumber.trim()) return
        setStep(2)
    }

    const handleBankVerification = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await mockVerificationService.validateBankAccount(
                formData.accountNumber,
                formData.bankCode
            )

            if (result.success) {
                setBankResult(result.data)
                setStep(3) // Success
            } else {
                throw new Error(result.error)
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleComplete = () => {
        onVerificationComplete({
            verificationMethod,
            verificationResult,
            bankResult,
            phoneResult,
            status: 'verified'
        })
        onClose()
    }

    const getRiskLevelColor = (level) => {
        switch (level) {
            case 'Low': return 'text-green-600 bg-green-50 border-green-200'
            case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
            case 'High': return 'text-red-600 bg-red-50 border-red-200'
            default: return 'text-slate-600 bg-slate-50 border-slate-200'
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-slate-900 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <XIcon size={20} />
                    </button>
                    {userRole !== 'SELLER' && (
                        <div className="flex items-center gap-2 text-[#05DF72] mb-2 font-black uppercase tracking-widest text-[10px]">
                            <ShieldCheckIcon size={14} /> Account Verification
                        </div>
                    )}
                    <h2 className="text-xl font-bold">
                        {(userRole === 'BUYER' || userRole === 'USER') ? 'Buyer Verification' : (userRole === 'SELLER' ? '' : 'Verification')}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        {step === 1 && ((userRole === 'BUYER' || userRole === 'USER') ? 'Verify via CAC or NIN' : 'Enter your phone number')}
                        {step === 2 && (userRole !== 'SELLER' ? 'Validate your bank account' : '')}
                        {step === 3 && 'Verification complete!'}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* BUYER FLOW - Step 1: Choose verification method */}
                    {(userRole === 'BUYER' || userRole === 'USER') && step === 1 && !verificationMethod && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500 text-center mb-6">
                                Choose one verification method to proceed
                            </p>
                            <button
                                onClick={() => setVerificationMethod('CAC')}
                                className="w-full p-4 border-2 border-slate-100 rounded-2xl hover:border-[#05DF72] hover:bg-[#05DF72]/5 transition-all flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <BuildingIcon className="text-blue-600" size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-900">CAC Registration</p>
                                    <p className="text-xs text-slate-500">Verify using your business CAC number</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setVerificationMethod('NIN')}
                                className="w-full p-4 border-2 border-slate-100 rounded-2xl hover:border-[#05DF72] hover:bg-[#05DF72]/5 transition-all flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <UserIcon className="text-purple-600" size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-900">NIN Verification</p>
                                    <p className="text-xs text-slate-500">Verify using your National ID Number</p>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* BUYER FLOW - Step 1: Enter CAC or NIN */}
                    {(userRole === 'BUYER' || userRole === 'USER') && step === 1 && verificationMethod && (
                        <form onSubmit={handleBuyerVerification} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                                    {verificationMethod === 'CAC' ? 'CAC Registration Number' : 'National ID Number (NIN)'}
                                </label>
                                <input
                                    type="text"
                                    placeholder={verificationMethod === 'CAC' ? 'RC123456' : '12345678901'}
                                    className="w-full px-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                    value={verificationMethod === 'CAC' ? formData.cacNumber : formData.ninNumber}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        [verificationMethod === 'CAC' ? 'cacNumber' : 'ninNumber']: e.target.value
                                    })}
                                    required
                                />
                                <p className="text-xs text-slate-400 mt-2 ml-4">
                                    {verificationMethod === 'NIN' && 'NIN must be 11 digits'}
                                    {verificationMethod === 'CAC' && 'Enter your CAC registration number'}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setVerificationMethod(null)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Back
                                </button>
                                <Button
                                    type="submit"
                                    loading={isLoading}
                                    loadingText="Verifying..."
                                    className="flex-1"
                                >
                                    Verify
                                </Button>
                            </div>
                        </form>
                    )}
                    {/* SELLER FLOW - Step 1: Phone Number */}
                    {userRole === 'SELLER' && step === 1 && (
                        <form onSubmit={handleSellerPhoneSubmit} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="e.g. 08012345678"
                                    className="w-full px-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-slate-400 mt-2 ml-4">Enter the phone number linked to this account</p>
                            </div>
                            <Button type="submit" className="w-full">
                                Continue
                            </Button>
                        </form>
                    )}


                    {/* Step 2: Bank Account Verification */}
                    {step === 2 && (
                        <form onSubmit={handleBankVerification} className="space-y-6">
                            {/* Show verification result for buyer */}
                            {(userRole === 'BUYER' || userRole === 'USER') && verificationResult && (
                                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 mb-4">
                                    <CheckCircleIcon className="text-green-600" size={20} />
                                    <span className="text-sm text-green-700 font-medium">
                                        {verificationMethod} verification successful
                                    </span>
                                </div>
                            )}

                            {/* Show phone intelligence for seller */}
                            {/* Show phone intelligence for seller - REMOVED AS REQUESTED */}
                            {/* {userRole === 'SELLER' && phoneResult && (
                                <div className="bg-slate-50 rounded-2xl p-4 space-y-3 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Network</span>
                                        <span className="font-semibold">{phoneResult.networkProvider}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Registration</span>
                                        <span className="font-semibold text-green-600">{phoneResult.registrationAge}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-slate-500">Risk Level</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getRiskLevelColor(phoneResult.riskLevel)}`}>
                                            {phoneResult.riskLevel}
                                        </span>
                                    </div>
                                </div>
                            )} */}

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                                    Bank Account Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="0123456789"
                                    className="w-full px-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                                    maxLength={10}
                                    required
                                />
                                <p className="text-xs text-slate-400 mt-2 ml-4">Must be 10 digits</p>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                                    Select Bank
                                </label>
                                <select
                                    className="w-full px-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                    value={formData.bankCode}
                                    onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
                                    required
                                >
                                    <option value="">Choose a bank</option>
                                    <option value="044">Access Bank</option>
                                    <option value="058">GTBank</option>
                                    <option value="011">First Bank</option>
                                    <option value="033">UBA</option>
                                    <option value="057">Zenith Bank</option>
                                    <option value="035">Wema Bank</option>
                                    <option value="050">Ecobank</option>
                                </select>
                            </div>

                            <Button
                                type="submit"
                                loading={isLoading}
                                loadingText="Validating..."
                                className="w-full"
                            >
                                Validate Bank Account
                            </Button>
                        </form>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-[#05DF72]/10 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircleIcon className="text-[#05DF72]" size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Verification Complete!</h3>
                                <p className="text-sm text-slate-500 mt-2">
                                    Your account is now verified. You can access all platform features.
                                </p>
                            </div>

                            {bankResult && (
                                <div className="bg-slate-50 rounded-2xl p-4 text-left">
                                    <p className="text-xs font-bold uppercase text-slate-400 mb-3">Bank Account Details</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Account Name</span>
                                            <span className="font-semibold">{bankResult.accountName}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Bank</span>
                                            <span className="font-semibold">{bankResult.bankName}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Account Number</span>
                                            <span className="font-mono font-semibold">{bankResult.accountNumber}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button onClick={handleComplete} className="w-full">
                                Continue
                            </Button>
                        </div>
                    )}
                </div>

                {/* Progress Indicator */}
                <div className="px-6 pb-6">
                    <div className="flex gap-2">
                        {[1, 2, 3].map(s => (
                            <div
                                key={s}
                                className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[#05DF72]' : 'bg-slate-100'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
