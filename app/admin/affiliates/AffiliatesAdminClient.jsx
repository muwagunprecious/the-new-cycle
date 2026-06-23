'use client'
import { useState } from 'react'
import { getAffiliateDetail, approveAffiliatePayout, rejectAffiliatePayout, toggleAffiliateSuspension, deleteAffiliate } from '@/backend-actions/actions/admin-affiliates'
import toast from 'react-hot-toast'
import { Users, TrendingUp, Wallet, DollarSign, Search, Eye, CheckCircle, XCircle, Clock, ChevronRight, X, UserCheck, UserX, Trash2 } from 'lucide-react'

export default function AffiliatesAdminClient({ stats, affiliates: initialAffiliates }) {
    const [affiliates, setAffiliates] = useState(initialAffiliates)
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState(null)
    const [detail, setDetail] = useState(null)
    const [loadingDetail, setLoadingDetail] = useState(false)
    const [rejectModal, setRejectModal] = useState(null)
    const [rejectReason, setRejectReason] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const filtered = affiliates.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.referralCode.toLowerCase().includes(search.toLowerCase()) ||
        a.phone.includes(search) ||
        a.email.toLowerCase().includes(search.toLowerCase())
    )

    const loadDetail = async (affiliate) => {
        setSelected(affiliate)
        setLoadingDetail(true)
        try {
            const res = await getAffiliateDetail(affiliate.id)
            if (res.success) setDetail(res.data)
            else toast.error('Failed to load details')
        } catch { toast.error('Error loading details') }
        finally { setLoadingDetail(false) }
    }

    const handleApprove = async (requestId) => {
        setSubmitting(true)
        try {
            const res = await approveAffiliatePayout(requestId)
            if (!res.success) return toast.error(res.error)
            toast.success(res.data.message)
            if (selected) loadDetail(selected)
        } catch { toast.error('Failed to approve') }
        finally { setSubmitting(false) }
    }

    const handleReject = async () => {
        setSubmitting(true)
        try {
            const res = await rejectAffiliatePayout(rejectModal, rejectReason)
            if (!res.success) return toast.error(res.error)
            toast.success('Payout rejected')
            setRejectModal(null)
            setRejectReason('')
            if (selected) loadDetail(selected)
        } catch { toast.error('Failed to reject') }
        finally { setSubmitting(false) }
    }

    const handleToggleSuspend = async (affiliateId) => {
        setSubmitting(true)
        try {
            const res = await toggleAffiliateSuspension(affiliateId)
            if (!res.success) return toast.error(res.error)
            toast.success(res.data.message)
            setAffiliates(prev => prev.map(a => a.id === affiliateId ? { ...a, status: res.data.status } : a))
            if (detail) setDetail(prev => ({ ...prev, affiliate: { ...prev.affiliate, status: res.data.status } }))
            if (selected && selected.id === affiliateId) {
                setSelected(prev => ({ ...prev, status: res.data.status }))
            }
        } catch { toast.error('Failed to update status') }
        finally { setSubmitting(false) }
    }

    const handleDeleteAffiliate = async (affiliateId) => {
        const confirmDelete = confirm("Are you sure you want to permanently delete this partner? This will cascade-delete all their earnings and payout requests, and cannot be undone.")
        if (!confirmDelete) return

        setSubmitting(true)
        try {
            const res = await deleteAffiliate(affiliateId)
            if (!res.success) return toast.error(res.error)

            toast.success(res.data.message)
            setAffiliates(prev => prev.filter(a => a.id !== affiliateId))
            setSelected(null)
            setDetail(null)
        } catch {
            toast.error('Failed to delete affiliate')
        } finally {
            setSubmitting(false)
        }
    }

    const statCards = [
        { label: 'Total Partners', value: stats.totalAffiliates || 0, icon: Users, color: 'text-blue-500 bg-blue-50 border-blue-100' },
        { label: 'Active Partners', value: stats.activeAffiliates || 0, icon: UserCheck, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
        { label: 'Total Commissions', value: `₦${(stats.totalCommissionsPaid || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-purple-500 bg-purple-50 border-purple-100' },
        { label: 'Pending Payouts', value: `₦${(stats.pendingPayoutAmount || 0).toLocaleString()} (${stats.pendingPayoutCount || 0})`, icon: Wallet, color: 'text-amber-500 bg-amber-50 border-amber-100' },
    ]

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800">
            <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Partner Affiliate Management</h1>
                <p className="text-slate-500 text-xs mt-0.5">Audit registered affiliates, referred buyers, commissions, and payout schedules</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white border border-slate-200/80 rounded-sm p-4 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-sm flex items-center justify-center border ${color.split(' ').slice(1).join(' ')}`}>
                            <Icon className={color.split(' ')[0]} size={16} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">{label}</p>
                            <p className="text-lg font-bold text-slate-900 font-mono tracking-tight mt-0.5">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Panel */}
            <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                        <input placeholder="Search partners..."
                            className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-sm py-1.5 pl-8 pr-3 text-xs outline-none transition-colors"
                            value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{filtered.length} Partners found</span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-left text-slate-400 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                                <th className="px-5 py-3 font-semibold">Partner Affiliate</th>
                                <th className="px-5 py-3 font-semibold">Referral Code</th>
                                <th className="px-5 py-3 font-semibold">Referrals</th>
                                <th className="px-5 py-3 font-semibold">Total Earned</th>
                                <th className="px-5 py-3 font-semibold">Available Wallet</th>
                                <th className="px-5 py-3 font-semibold">Status</th>
                                <th className="px-5 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400 font-medium">No partners match the query</td></tr>
                            ) : filtered.map((aff) => (
                                <tr key={aff.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <p className="font-semibold text-slate-900">{aff.name}</p>
                                        <p className="text-slate-450 font-mono text-[10px]">{aff.phone}</p>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="font-mono text-[11px] border border-slate-200 bg-slate-50 text-slate-700 px-1.5 py-0.5 rounded-sm">{aff.referralCode}</span>
                                    </td>
                                    <td className="px-5 py-3.5 font-semibold text-slate-650 font-mono">{aff.referralCount || 0}</td>
                                    <td className="px-5 py-3.5 font-semibold text-slate-650 font-mono">₦{(aff.totalEarned || 0).toLocaleString()}</td>
                                    <td className="px-5 py-3.5 font-semibold text-emerald-600 font-mono">₦{(aff.walletBalance || 0).toLocaleString()}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold border ${aff.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-red-50 text-red-700 border-red-250'}`}>
                                            <span className={`w-1 h-1 rounded-full ${aff.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            {aff.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <button onClick={() => loadDetail(aff)}
                                            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-950 font-semibold border border-slate-200 hover:border-slate-400 bg-white px-2.5 py-1 rounded-sm transition-colors">
                                            <Eye size={12} /> View Details
                                        </button>
                                    </td>
                                </tr>
                             ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Slide-over Detail Panel */}
            {selected && (
                <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-50 flex items-start justify-end">
                    <div className="bg-white w-full max-w-xl h-full border-l border-slate-200 flex flex-col shadow-2xl">
                        
                        {/* Drawer Header */}
                        <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                            <div>
                                <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">{selected.name}</h2>
                                <p className="text-slate-500 text-xs font-mono tracking-tight mt-0.5">{selected.referralCode} — {selected.phone}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleToggleSuspend(selected.id)} disabled={submitting}
                                    className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-sm border transition-colors ${(detail?.affiliate?.status || selected.status) === 'active' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}>
                                    {(detail?.affiliate?.status || selected.status) === 'active' ? <><UserX size={12} /> Suspend</> : <><UserCheck size={12} /> Unsuspend</>}
                                </button>
                                <button onClick={() => { setSelected(null); setDetail(null) }}
                                    className="text-slate-400 hover:text-slate-600 p-1.5 border border-slate-200 bg-white rounded-sm hover:bg-slate-50"><X size={15} /></button>
                            </div>
                        </div>

                        {/* Drawer Body */}
                        {loadingDetail ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : detail ? (
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Stats Summary Grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Referral Buyers', value: detail.stats.referralCount },
                                        { label: 'Total Earnings', value: `₦${detail.stats.totalEarned.toLocaleString()}` },
                                        { label: 'Unpaid Balance', value: `₦${detail.stats.walletBalance.toLocaleString()}` },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="bg-slate-50 border border-slate-200 rounded-sm p-3 text-center">
                                            <p className="font-bold text-slate-900 text-sm font-mono">{value}</p>
                                            <p className="text-slate-450 text-[9px] uppercase font-semibold tracking-wider mt-0.5">{label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Partner Profile Details */}
                                <div className="border border-slate-200 rounded-sm p-4 bg-slate-50/20 space-y-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Partner Profile Details</p>
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                                        <div>
                                            <p className="text-slate-400 text-[10px] uppercase font-semibold">Email Address</p>
                                            <p className="font-medium text-slate-950 mt-0.5 break-all">{detail.affiliate.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-[10px] uppercase font-semibold">Phone Number</p>
                                            <p className="font-medium text-slate-950 mt-0.5">{detail.affiliate.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-[10px] uppercase font-semibold">Date Joined</p>
                                            <p className="font-medium text-slate-950 mt-0.5">
                                                {new Date(detail.affiliate.createdAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-[10px] uppercase font-semibold">Number of Referrals</p>
                                            <p className="font-semibold text-slate-950 mt-0.5 font-mono">{detail.stats.referralCount}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bank details Card */}
                                {detail.affiliate.bankName && (
                                    <div className="border border-slate-200 rounded-sm p-4 space-y-2">
                                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Bank Details Coordination</p>
                                        <div className="space-y-0.5">
                                            <p className="font-semibold text-slate-900 text-xs">{detail.affiliate.bankName}</p>
                                            <p className="text-slate-600 text-xs font-mono">{detail.affiliate.accountNumber} — {detail.affiliate.accountName}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Payout Requests Log */}
                                <div className="space-y-2.5">
                                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-150 pb-1.5">Payout Requests</h3>
                                    {detail.payoutRequests.length === 0 ? (
                                        <p className="text-slate-400 text-xs font-medium">No payout requests have been submitted</p>
                                    ) : detail.payoutRequests.map((req) => (
                                        <div key={req.id} className="border border-slate-200 rounded-sm p-4 space-y-3 bg-slate-50/20">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-slate-900 text-xs font-mono">₦{req.amount.toLocaleString()}</span>
                                                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-sm border uppercase ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : req.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 leading-normal space-y-0.5">
                                                <p className="font-mono">{req.bankName} — {req.accountNumber} ({req.accountName})</p>
                                                <p>{new Date(req.createdAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</p>
                                                {req.note && <p className="text-red-600 mt-1.5 font-medium border-t border-slate-200/60 pt-1">Reject Reason: {req.note}</p>}
                                            </div>
                                            {req.status === 'pending' && (
                                                <div className="flex gap-2 pt-1 border-t border-slate-200/60">
                                                    <button onClick={() => handleApprove(req.id)} disabled={submitting}
                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold uppercase tracking-wider py-1.5 rounded-sm transition-colors">
                                                        Approve Payout
                                                    </button>
                                                    <button onClick={() => setRejectModal(req.id)} disabled={submitting}
                                                        className="flex-1 border border-red-200 text-red-600 hover:bg-red-55/40 text-[10px] font-semibold uppercase tracking-wider py-1.5 rounded-sm transition-colors bg-white">
                                                        Reject Payout
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Referred Users List */}
                                <div className="space-y-2.5">
                                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-150 pb-1.5">Referred Buyers ({detail.referredUsers.length})</h3>
                                    {detail.referredUsers.length === 0 ? (
                                        <p className="text-slate-400 text-xs font-medium">No buyers referred yet</p>
                                    ) : (
                                        <div className="space-y-1.5">
                                            {detail.referredUsers.map((u) => (
                                                <div key={u.id} className="flex items-center justify-between border border-slate-200 bg-slate-50/40 rounded-sm px-3.5 py-2">
                                                    <div>
                                                        <p className="font-semibold text-slate-800 text-xs">{u.name}</p>
                                                        <p className="text-slate-450 font-mono text-[9px]">{u.phone}</p>
                                                    </div>
                                                    <span className={`text-[9px] font-semibold px-2 py-0.5 border rounded-sm uppercase tracking-wide ${u.accountStatus === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                        {u.accountStatus}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Earnings History Log */}
                                <div className="space-y-2.5">
                                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-150 pb-1.5">Earnings History</h3>
                                    {detail.earnings.length === 0 ? (
                                        <p className="text-slate-400 text-xs font-medium">No earnings recorded</p>
                                    ) : detail.earnings.slice(0, 10).map((e) => (
                                        <div key={e.id} className="flex items-center justify-between py-2 text-xs border-b border-slate-100">
                                            <span className="text-slate-450 font-mono text-[10px]">{e.orderId}</span>
                                            <span className="text-emerald-600 font-mono font-bold">+₦{e.commission.toLocaleString()}</span>
                                            <span className={`text-[9px] border px-1.5 py-0.5 rounded-sm uppercase tracking-wide font-semibold ${e.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{e.status}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Danger Zone */}
                                <div className="border border-red-200 bg-red-50/10 rounded-sm p-4 space-y-3">
                                    <div>
                                        <h3 className="text-[10px] font-bold text-red-750 uppercase tracking-wider">Danger Zone</h3>
                                        <p className="text-slate-550 text-[10px] mt-0.5">Permanently suspend or delete this partner. Deleting is irreversible and will delete all historical earnings and payout records.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleToggleSuspend(detail.affiliate.id)} disabled={submitting}
                                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-sm text-[11px] font-semibold border transition-colors ${(detail?.affiliate?.status || selected.status) === 'active' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}>
                                            {(detail?.affiliate?.status || selected.status) === 'active' ? <><UserX size={13} /> Suspend Partner</> : <><UserCheck size={13} /> Unsuspend Partner</>}
                                        </button>
                                        <button onClick={() => handleDeleteAffiliate(detail.affiliate.id)} disabled={submitting}
                                            className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-sm text-[11px] font-semibold transition-colors">
                                            <Trash2 size={13} /> Delete Partner
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal && (
                <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-sm p-6 w-full max-w-sm shadow-xl space-y-4">
                        <div>
                            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Reject Payout Request</h3>
                            <p className="text-slate-550 text-[11px] mt-0.5">Please provide a reason why this payout is rejected. This will be visible to the partner.</p>
                        </div>
                        <textarea placeholder="Reason for rejection (e.g. invalid account holder name)"
                            rows={3}
                            className="w-full border border-slate-200 rounded-sm p-2 text-xs outline-none focus:border-slate-400 resize-none"
                            value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                        <div className="flex gap-2">
                            <button onClick={() => setRejectModal(null)} className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2 rounded-sm text-xs transition-colors hover:bg-slate-50">Cancel</button>
                            <button onClick={handleReject} disabled={submitting} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-sm text-xs transition-colors">
                                {submitting ? 'Rejecting...' : 'Reject Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

