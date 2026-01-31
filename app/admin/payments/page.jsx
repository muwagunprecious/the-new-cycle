'use client'
import { useState } from "react"
import { CircleDollarSignIcon, SearchIcon, ArrowUpRightIcon, ArrowDownLeftIcon, FilterIcon, MoreVerticalIcon, AlertCircleIcon, CheckCircleIcon } from "lucide-react"

export default function AdminPayments() {
    const [filter, setFilter] = useState('All')

    // Mock Data for Payments
    const transactions = [
        { id: 'TRX-9821', type: 'Incoming', user: 'Emeka Obi', amount: 35000, status: 'Held (Escrow)', date: '2 mins ago', reference: 'ORD-1029' },
        { id: 'TRX-9820', type: 'Outgoing', user: 'GreenEnergy Ltd', amount: 120000, status: 'Released', date: '2 hours ago', reference: 'ORD-9921' },
        { id: 'TRX-9819', type: 'Incoming', user: 'Sarah Ahmed', amount: 95000, status: 'Held (Escrow)', date: '5 hours ago', reference: 'ORD-9918' },
        { id: 'TRX-9818', type: 'Outgoing', user: 'Solar Solutions', amount: 45000, status: 'Pending Verification', date: '1 day ago', reference: 'PAY-8821' },
        { id: 'TRX-9817', type: 'Incoming', user: 'Leke Benson', amount: 120000, status: 'Failed', date: '1 day ago', reference: 'ORD-9800' },
    ]

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Payment <span className="text-[#05DF72]">Hub</span></h1>
                    <p className="text-slate-500 font-medium mt-1">Manage platform escrow, payouts, and verified accounts.</p>
                </div>
                <button className="btn-primary !py-3 !px-6 bg-slate-900">Download Reports</button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Escrow Held</p>
                        <h3 className="text-4xl font-black">₦2,450,000</h3>
                        <div className="mt-4 flex items-center gap-2 text-[#05DF72] text-xs font-bold">
                            <ArrowUpRightIcon size={16} /> +12% this week
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#05DF72]/10 rounded-full blur-2xl"></div>
                </div>
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 relative overflow-hidden shadow-xl shadow-slate-200/50">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pending Payouts</p>
                        <h3 className="text-4xl font-black text-slate-900">₦850,000</h3>
                        <div className="mt-4 flex items-center gap-2 text-amber-500 text-xs font-bold">
                            <AlertCircleIcon size={16} /> 12 Requests
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 relative overflow-hidden shadow-xl shadow-slate-200/50">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Platform Revenue</p>
                        <h3 className="text-4xl font-black text-slate-900">₦125,400</h3>
                        <div className="mt-4 flex items-center gap-2 text-[#05DF72] text-xs font-bold">
                            <CircleDollarSignIcon size={16} /> All time
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" placeholder="Search Amount, ID..." className="pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm w-64" />
                        </div>
                        <div className="flex gap-2">
                            {['All', 'Incoming', 'Outgoing'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                        <FilterIcon size={18} className="text-slate-500" />
                    </button>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <tr>
                            <th className="p-6 pl-8">Transaction ID</th>
                            <th className="p-6">Type</th>
                            <th className="p-6">User / Entity</th>
                            <th className="p-6">Amount</th>
                            <th className="p-6">Status</th>
                            <th className="p-6 min-w-[200px]">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {transactions.map((trx) => (
                            <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-6 pl-8 font-bold text-slate-900">{trx.id}<br /><span className="text-[10px] text-slate-400 font-medium">{trx.date}</span></td>
                                <td className="p-6">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${trx.type === 'Incoming' ? 'bg-[#05DF72]/10 text-[#05DF72]' : 'bg-red-50 text-red-500'}`}>
                                        {trx.type === 'Incoming' ? <ArrowDownLeftIcon size={12} /> : <ArrowUpRightIcon size={12} />}
                                        {trx.type}
                                    </div>
                                </td>
                                <td className="p-6 font-medium text-slate-600">
                                    {trx.user}
                                    <span className="block text-[10px] text-slate-400">Ref: {trx.reference}</span>
                                </td>
                                <td className="p-6 font-black text-slate-900">₦{trx.amount.toLocaleString()}</td>
                                <td className="p-6">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${trx.status.includes('Held') ? 'text-amber-500' :
                                        trx.status === 'Released' ? 'text-[#05DF72]' :
                                            trx.status === 'Failed' ? 'text-red-500' :
                                                'text-blue-500'
                                        }`}>
                                        {trx.status}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors">View Details</button>
                                        <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                                            <MoreVerticalIcon size={16} className="text-slate-400" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bank Verification Section (Mock) */}
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black mb-2">Bank Account Verification</h2>
                        <p className="text-slate-400 font-medium max-w-lg">Review and approve seller bank accounts to enable payouts. Manual verification required for simulation.</p>
                    </div>
                    <button className="bg-[#05DF72] text-slate-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-colors">
                        Review Requests (3)
                    </button>
                </div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#05DF72]/10 rounded-full blur-[100px]"></div>
            </div>
        </div>
    )
}
