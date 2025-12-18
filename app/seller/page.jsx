'use client'
import { dummyStoreDashboardData } from "@/assets/assets"
import { BatteryIcon, CircleDollarSignIcon, PackageIcon, TrendingUpIcon, ClockIcon, PhoneIcon, ShieldCheckIcon } from "lucide-react"
import { useState, useEffect } from "react"
import Loading from "@/components/Loading"
import { useSelector } from "react-redux"

export default function SellerOverview() {
    const { user } = useSelector(state => state.auth)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)

    useEffect(() => {
        setData(dummyStoreDashboardData)
        setLoading(false)
    }, [])

    if (loading) return <Loading />

    const stats = [
        { label: 'Batteries Circulated', value: data.totalProducts * 5, icon: BatteryIcon, color: 'text-[#05DF72]', bg: 'bg-[#05DF72]/10' },
        { label: 'Business Revenue', value: '₦' + data.totalEarnings.toLocaleString(), icon: CircleDollarSignIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Logistics', value: data.pendingPickups, icon: ClockIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Lifecycle Completed', value: data.totalOrders, icon: PackageIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
    ]

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[#05DF72] mb-2 font-black uppercase tracking-widest text-[10px]">
                        <ShieldCheckIcon size={16} /> Verified Energy Partner
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 leading-tight">Business <span className="text-[#05DF72]">Command</span></h1>
                    <p className="text-slate-400 font-bold text-sm mt-1">Grow your circular footprint, {user?.businessName || user?.name || 'Partner'}.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="p-3 bg-slate-900 rounded-xl text-white">
                        <TrendingUpIcon size={20} />
                    </div>
                    <div className="pr-4">
                        <p className="text-[10px] font-black uppercase text-slate-400">Growth Rate</p>
                        <p className="text-sm font-black text-slate-900">+24.5% MOH</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl shadow-slate-200/50 border border-slate-100 group hover:border-[#05DF72]/30 transition-all duration-500">
                        <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 leading-none">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Recent Orders Preview */}
                <div className="lg:col-span-3 bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Recent Logistics</h2>
                        <button className="text-[10px] font-black uppercase tracking-widest text-[#05DF72] bg-[#05DF72]/5 px-4 py-2 rounded-full hover:bg-[#05DF72] hover:text-white transition-all">Export Report</button>
                    </div>
                    <div className="space-y-4">
                        {[
                            { name: 'Classic Car Battery', buyer: 'Emeka Obi', whatsapp: '+234 809 123 4567', price: 35000, status: 'PICKED' },
                            { name: 'Deep Cycle Inverter', buyer: 'Sarah Ahmed', whatsapp: '+234 701 987 6543', price: 95000, status: 'WAY' },
                            { name: 'Solar Lead Acid', buyer: 'Leke Benson', whatsapp: '+234 812 345 6789', price: 120000, status: 'PENDING' }
                        ].map((ord, i) => (
                            <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#05DF72] shadow-sm">
                                        <BatteryIcon size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="font-bold text-slate-900">{ord.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Buyer: {ord.buyer}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <a href={`https://wa.me/${ord.whatsapp.replace(/\D/g, '')}`} className="text-[10px] font-black text-[#05DF72] uppercase tracking-widest flex items-center gap-1 hover:underline">
                                                <PhoneIcon size={10} /> {ord.whatsapp}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900">₦{ord.price.toLocaleString()}</p>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full mt-2 inline-block ${ord.status === 'PICKED' ? 'bg-[#05DF72]/10 text-[#05DF72]' :
                                        ord.status === 'WAY' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'
                                        }`}>{ord.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular Products Preview */}
                <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-xl font-black uppercase tracking-tighter">Circular Metrics</h2>
                            <div className="w-2 h-2 rounded-full bg-[#05DF72] animate-ping"></div>
                        </div>
                        <div className="space-y-10">
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">
                                    <span>Acceptance Rating</span>
                                    <span className="text-[#05DF72]">94%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#05DF72] w-[94%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">
                                    <span>Carbon Avoidance</span>
                                    <span className="text-blue-400">12.5 TONS</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[78%]" />
                                </div>
                            </div>
                            <div className="pt-10 grid grid-cols-2 gap-6 border-t border-white/10">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Pick-up Avg</p>
                                    <p className="text-2xl font-black text-[#05DF72]">1.2h</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Trust Score</p>
                                    <p className="text-2xl font-black text-white">4.9<span className="text-xs opacity-40 ml-1">/ 5</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#05DF72]/10 rounded-full blur-[80px]"></div>
                </div>
            </div>
        </div>
    )
}
