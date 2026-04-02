'use client'
import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { getStoreDetails, updateStoreBankDetails } from "@/backend/actions/seller"
import { changePassword } from "@/backend/actions/auth"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"
import toast from "react-hot-toast"
import { CreditCard as CreditCardIcon, Save as SaveIcon, Lock as LockIcon } from "lucide-react"

export default function SellerSettings() {
    const { user } = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        bankName: '',
        accountNumber: '',
        accountName: ''
    })
    const [banks, setBanks] = useState({})

    useEffect(() => {
        const fetchBanks = async () => {
            const res = await fetch('/api/verify-bank')
            const data = await res.json()
            if (data.banks) setBanks(data.banks)
        }
        fetchBanks()
    }, [])

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const handleBankVerification = async (accountNumber, bankName) => {
        try {
            // Use banks from state
            const bankCode = banks[bankName]

            if (!bankCode) return

            toast.loading("Verifying account...", { id: 'bank-verify' })
            const res = await fetch('/api/verify-bank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountNumber, bankCode })
            })

            const data = await res.json()
            if (data.success) {
                setFormData(prev => ({ ...prev, accountName: data.accountName }))
                toast.success("Account verified: " + data.accountName, { id: 'bank-verify' })
            } else {
                toast.error(data.message || "Could not verify account", { id: 'bank-verify' })
            }
        } catch (error) {
            console.error("Bank verification error:", error)
            toast.error("Bank verification failed", { id: 'bank-verify' })
        }
    }

    const onBankInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // Trigger bank verification if account number is 10 digits and bank is selected
        if (name === 'accountNumber' && value.length === 10 && formData.bankName) {
            handleBankVerification(value, formData.bankName)
        } else if (name === 'bankName' && value && formData.accountNumber.length === 10) {
            handleBankVerification(formData.accountNumber, value)
        }
    }

    useEffect(() => {
        if (user?.id) {
            fetchStoreDetails()
        } else {
            setLoading(false)
        }
    }, [user])

    const fetchStoreDetails = async () => {
        setLoading(true)
        const res = await getStoreDetails(user.id)
        if (res.success && res.data) {
            setFormData({
                bankName: res.data.bankName || '',
                accountNumber: res.data.accountNumber || '',
                accountName: res.data.accountName || ''
            })
        }
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        dispatch(showLoader("Saving Bank Details..."))

        const res = await updateStoreBankDetails(user.id, formData)
        dispatch(hideLoader())

        if (res.success) {
            toast.success("Bank details saved successfully!")
        } else {
            toast.error(res.error || "Failed to save bank details")
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("New passwords do not match")
        }

        if (passwordData.newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters long")
        }

        dispatch(showLoader("Updating Password..."))
        const res = await changePassword(user.id, passwordData.currentPassword, passwordData.newPassword)
        dispatch(hideLoader())

        if (res.success) {
            toast.success("Password updated successfully!")
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })
        } else {
            toast.error(res.error || "Failed to update password")
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-[#05DF72] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Store <span className="text-[#05DF72]">Settings</span></h1>
                <p className="text-slate-500 mt-1">Manage your store's payout information and preferences.</p>
            </div>

            <div className="card bg-white p-8">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                    <div className="w-12 h-12 bg-[#05DF72]/10 rounded-2xl flex items-center justify-center text-[#05DF72]">
                        <CreditCardIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Payout Bank Details</h2>
                        <p className="text-sm text-slate-500">Ensure these are correct to receive your payments upon battery collection and its information is kept private, not public.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bank Name *</label>
                            <select
                                name="bankName"
                                value={formData.bankName}
                                onChange={onBankInputChange}
                                required
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm"
                            >
                                <option value="">Select Bank</option>
                                {Object.keys(banks).map(bankName => (
                                    <option key={bankName} value={bankName}>{bankName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Number *</label>
                            <input
                                value={formData.accountNumber}
                                onChange={onBankInputChange}
                                placeholder="10-digit account number"
                                maxLength={10}
                                required
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Name *</label>
                            <input
                                value={formData.accountName}
                                onChange={onBankInputChange}
                                placeholder="e.g. John Doe Enterprises"
                                required
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="btn-primary flex items-center gap-2">
                            <SaveIcon size={18} />
                            Save Bank Details
                        </button>
                    </div>
                </form>
                <div className="card bg-white p-8">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                        <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                            <LockIcon size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Security Settings</h2>
                            <p className="text-sm text-slate-500">Update your account password to stay secure.</p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Password *</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    placeholder="Enter current password"
                                    required
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/20 font-medium text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password *</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="Min. 6 characters"
                                    required
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm New Password *</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="Repeat new password"
                                    required
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button type="submit" className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2">
                                <SaveIcon size={18} />
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
