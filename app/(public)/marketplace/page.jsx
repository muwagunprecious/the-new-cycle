'use client'
import React from 'react'
import { Globe, ShieldCheck, Zap, History, LayoutDashboard, Wallet, UserCheck, BarChart3, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

const MarketplacePage = () => {
    const router = useRouter()

    return (
        <div className="bg-white min-h-screen text-slate-600">
            {/* Hero */}
            <section className="relative py-24 px-6 lg:px-10 overflow-hidden bg-slate-950 border-b border-white/[0.08]">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-[120px] -mr-40 -mt-20"></div>
                <div className="max-w-[1200px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h3 className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em]">E-Waste Infrastructure</h3>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                            The Gocycle <br /><span className="text-emerald-500">Marketplace</span>
                        </h1>
                        <p className="text-xl font-bold text-slate-400 tracking-tight uppercase">
                            Digital Trading Powering Africa’s Circular Economy
                        </p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-[2rem] border border-white/[0.05] shadow-2xl">
                        <div className="bg-white/[0.03] rounded-[1.5rem] p-10 space-y-6 border border-white/[0.05]">
                            <div className="flex items-center gap-4 text-emerald-400">
                                <Zap size={24} />
                                <h3 className="font-bold uppercase tracking-widest text-sm text-white">Transparency Goal</h3>
                            </div>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                Our platform ensures transparent pricing, secure escrow payments, and verified market participants for the responsible trade of electronic waste across Africa. ♻️
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Functions */}
            <section className="py-24 px-6 lg:px-10">
                <div className="max-w-[1200px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: "Participant Verification", icon: UserCheck, desc: "Rigorous KYB/KYC for every organization joining the ecosystem." },
                            { title: "AI Price Discovery", icon: BarChart3, desc: "Leveraging market data to guide sellers with dynamic pricing." },
                            { title: "Secure Escrow", icon: Wallet, desc: "Payment-before-collection model to eliminate trade default." },
                            { title: "Chain-of-Custody", icon: History, desc: "Digital tracking of materials from collection to final recovery." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-[24px] border border-black/[0.06] space-y-4 shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-300">
                                <div className="text-emerald-600 bg-emerald-50 w-12 h-12 flex items-center justify-center rounded-xl"><item.icon size={24} /></div>
                                <h4 className="text-lg font-bold text-slate-950 uppercase tracking-tight leading-tight">{item.title}</h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Detailed Description */}
            <section className="py-32 px-6 lg:px-10 bg-slate-50/50 border-y border-black/[0.04]">
                <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
                    <div className="space-y-8">
                        <h2 className="text-4xl font-bold text-slate-950 tracking-tight uppercase">Connecting<br /> Value Chains</h2>
                        <p className="text-lg leading-relaxed text-slate-500 font-medium">
                            The Gocycle Marketplace connects verified sellers of end-of-life batteries with collectors, licensed recyclers, and material recovery companies.
                        </p>
                        <ul className="space-y-4 pt-4">
                            {[
                                "Lithium-ion & Lead-acid Batteries",
                                "Solar & Telecom Power Storage",
                                "Corporate E-Waste Inventories",
                                "Material Recovery Aggregates"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-[13px] font-bold uppercase tracking-widest text-slate-600">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-8">
                        <div className="bg-white p-10 rounded-[32px] border border-black/[0.06] shadow-premium space-y-6">
                            <h3 className="text-2xl font-bold text-slate-950 uppercase tracking-tight">Access Controlled</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                "Every organization joining the platform undergoes a mandatory onboarding and verification process before being allowed to trade."
                            </p>
                            <div className="pt-6 border-t border-black/[0.04] flex flex-col gap-4">
                                <button
                                    onClick={() => router.push('/signup?role=BUYER')}
                                    className="w-full py-4 bg-slate-50 border border-black/[0.08] hover:bg-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] text-slate-950 transition-all hover:-translate-y-0.5"
                                >
                                    Onboard as Buyer
                                </button>
                                <button
                                    onClick={() => router.push('/signup?role=SELLER')}
                                    className="w-full py-4 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all hover:-translate-y-0.5"
                                >
                                    Join as Seller
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default MarketplacePage
