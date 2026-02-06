'use client'
import { useState, useEffect } from "react"
import { getPendingBuyers, approveBuyer, rejectBuyer } from "@/backend/actions/admin"
import { UserCircleIcon, CheckCircleIcon, XCircleIcon, FileText, CreditCardIcon } from "lucide-react"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import Image from "next/image"

export default function VerifyBuyers() {
    const [buyers, setBuyers] = useState([])
    const [loading, setLoading] = useState(true)
    const [rejectionReason, setRejectionReason] = useState({})

    const fetchBuyers = async () => {
        setLoading(true)
        const result = await getPendingBuyers()
        if (result.success) {
            setBuyers(result.data)
        } else {
            toast.error(result.error)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchBuyers()
    }, [])

    const handleApprove = async (userId, userName) => {
        if (confirm(`Approve buyer account for ${userName}?`)) {
            const result = await approveBuyer(userId)
            if (result.success) {
                toast.success("Buyer approved successfully!")
                fetchBuyers()
            } else {
                toast.error(result.error)
            }
        }
    }

    const handleReject = async (userId, userName) => {
        const reason = rejectionReason[userId] || ""
        if (!reason.trim()) {
            toast.error("Please provide a rejection reason")
            return
        }

        if (confirm(`Reject buyer account for ${userName}?`)) {
            const result = await rejectBuyer(userId, reason)
            if (result.success) {
                toast.success("Buyer rejected")
                setRejectionReason({ ...rejectionReason, [userId]: "" })
                fetchBuyers()
            } else {
                toast.error(result.error)
            }
        }
    }

    return !loading ? (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Verify Buyers</h1>
                <p className="text-slate-500">Review and approve buyer account verification requests</p>
            </div>

            {buyers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserCircleIcon size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Pending Verifications</h3>
                    <p className="text-slate-500">All buyer accounts have been reviewed</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {buyers.map((buyer) => (
                        <div key={buyer.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                            {/* Header */}
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#05DF72] to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    {buyer.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-900">{buyer.name}</h3>
                                    <p className="text-slate-500 text-sm">{buyer.email}</p>
                                    <p className="text-slate-400 text-xs mt-1">{buyer.phone}</p>
                                </div>
                                <span className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-bold">
                                    Pending Verification
                                </span>
                            </div>

                            {/* Documents Section */}
                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                {/* NIN Document */}
                                <div className="border border-slate-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText size={18} className="text-[#05DF72]" />
                                        <span className="font-bold text-slate-700 text-sm">NIN Number</span>
                                    </div>
                                    {buyer.ninDocument ? (
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <p className="text-xl font-mono font-bold text-slate-900 tracking-wider">
                                                {buyer.ninDocument}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 text-sm italic">Not provided</p>
                                    )}
                                </div>

                                {/* CAC Document */}
                                <div className="border border-slate-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText size={18} className="text-blue-500" />
                                        <span className="font-bold text-slate-700 text-sm">CAC Number (Optional)</span>
                                    </div>
                                    {buyer.cacDocument ? (
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <p className="text-lg font-mono font-bold text-slate-900">
                                                {buyer.cacDocument}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 text-sm italic">Not provided</p>
                                    )}
                                </div>
                            </div>

                            {/* Bank Details */}
                            <div className="border border-slate-200 rounded-xl p-4 mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <CreditCardIcon size={18} className="text-purple-500" />
                                    <span className="font-bold text-slate-700 text-sm">Bank Account Details</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Bank Name</p>
                                        <p className="font-medium text-slate-700">{buyer.bankName || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Account Number</p>
                                        <p className="font-medium text-slate-700">{buyer.accountNumber || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Account Name</p>
                                        <p className="font-medium text-slate-700">{buyer.accountName || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleApprove(buyer.id, buyer.name)}
                                        className="flex-1 bg-[#05DF72] text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircleIcon size={20} />
                                        Approve Buyer
                                    </button>
                                </div>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Rejection reason (required)"
                                        value={rejectionReason[buyer.id] || ""}
                                        onChange={(e) => setRejectionReason({ ...rejectionReason, [buyer.id]: e.target.value })}
                                        className="flex-1 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400 transition-colors"
                                    />
                                    <button
                                        onClick={() => handleReject(buyer.id, buyer.name)}
                                        className="bg-rose-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-600 transition-colors flex items-center gap-2"
                                    >
                                        <XCircleIcon size={20} />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    ) : <Loading />
}
