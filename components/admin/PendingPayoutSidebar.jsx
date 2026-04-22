'use client'
import { useEffect, useState } from "react"
import { getAdminDashboardSummary } from "@/backend-actions/actions/admin"

export default function PendingPayoutSidebar() {
    const currency = '₦'
    const [stats, setStats] = useState({
        subtotal: 0,
        total: 0,
        sellerFee: 0,
        buyerFee: 0,
        payoutAmount: 0,
        platformEarnings: 0
    })
    const [loading, setLoading] = useState(true)

    const fetchStats = async () => {
        try {
            const res = await getAdminDashboardSummary()
            if (res.success && res.data.pendingStats) {
                setStats(res.data.pendingStats)
            }
        } catch (error) {
            console.error("Sidebar Stats Error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
        // Listen for custom events to refresh stats if needed
        window.addEventListener('payout-released', fetchStats)
        return () => window.removeEventListener('payout-released', fetchStats)
    }, [])

    if (loading) return (
        <div className="xl:w-80 h-full p-8 border-l border-slate-100 bg-white hidden xl:block animate-pulse">
            <div className="h-8 bg-slate-100 rounded-full w-3/4 mb-10"></div>
            <div className="h-32 bg-slate-100 rounded-2xl mb-8"></div>
            <div className="space-y-4">
                <div className="h-4 bg-slate-100 rounded w-full"></div>
                <div className="h-4 bg-slate-100 rounded w-full"></div>
                <div className="h-4 bg-slate-100 rounded w-full"></div>
            </div>
        </div>
    )

    return (
        <div className="xl:min-w-80 xl:w-80 h-full p-8 border-l border-slate-100 bg-white hidden xl:block overflow-y-auto no-scrollbar">
            <div className="flex items-center gap-2 mb-8">
                <div className="w-2 h-8 bg-[#05DF72] rounded-full"></div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Pending Payout</h2>
            </div>

            <div className="space-y-8">
                {/* Platform Earnings Hero */}
                <div className="bg-slate-900 rounded-2xl p-6 text-center shadow-xl shadow-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#05DF72] mb-2">Platform Earnings</p>
                    <h3 className="text-3xl font-black text-white">{currency}{(stats.platformEarnings || 0).toLocaleString()}</h3>
                </div>

                {/* Breakdown */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold">Base Price (Subtotal)</span>
                        <span className="text-slate-900 font-black">{currency}{stats.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold">Buyer Paid (+5% Fee)</span>
                        <span className="text-slate-900 font-black text-[#05DF72]">{currency}{stats.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold">Seller -5% Fee</span>
                        <span className="text-rose-500 font-black">- {currency}{stats.sellerFee.toLocaleString()}</span>
                    </div>

                    <div className="pt-4 border-t border-dashed border-slate-200 mt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-900 font-black text-[10px] uppercase tracking-widest">Net Payout</span>
                            <span className="text-2xl font-black text-slate-900">{currency}{stats.payoutAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                    <p className="text-[10px] text-emerald-700 font-bold leading-relaxed">
                        ⚠️ Aggregate totals for all orders awaiting payout release.
                    </p>
                </div>

                <div className="pt-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Financial Summary</p>
                    <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                        <div className="bg-[#05DF72] h-full w-2/3"></div>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-2 italic">* Data refreshed in real-time</p>
                </div>
            </div>
        </div>
    )
}
