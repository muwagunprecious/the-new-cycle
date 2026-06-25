'use client'
import React from 'react'
import { Crown, Sparkles, Truck, ShieldCheck, BarChart4, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

const Sell4MePage = () => {
    const router = useRouter()

    return (
        <div className="bg-[#0f172a] text-slate-100 min-h-screen pt-28 pb-32 overflow-hidden relative selection:bg-[#05DF72]/30 selection:text-white">
            {/* Background Decorative Blobs */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#05DF72]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-[#05DF72]/10 rounded-full blur-[150px] pointer-events-none" />

            {/* Hero Section */}
            <section className="relative py-24 px-4 md:px-8 max-w-[1400px] mx-auto border-b border-slate-800/60">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#05DF72]/10 border border-[#05DF72]/20 rounded-full text-[#05DF72] text-[11px] font-bold uppercase tracking-[0.2em] animate-pulse">
                            <Crown size={14} /> Premium Service
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
                            Sell4me <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#05DF72] via-emerald-400 to-[#05DF72]">
                                by Gocycle
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl font-light text-slate-300 tracking-tight leading-relaxed">
                            The Premium, Hands-Free E-Waste Liquidation Service
                        </p>
                        <p className="text-base leading-relaxed text-slate-400 font-light max-w-xl">
                            Engineered for corporate organizations, telecom providers, and high-volume recyclers who prioritize operational efficiency and regulatory compliance over DIY trading.
                        </p>
                        <button
                            onClick={() => router.push('/contact')}
                            className="group bg-[#05DF72] text-slate-950 px-8 py-4.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#05DF72]/20 hover:shadow-[#05DF72]/40 hover:-translate-y-0.5 transition-all flex items-center gap-3 w-fit"
                        >
                            Request Managed Service 
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    <div className="bg-slate-900/60 backdrop-blur-md p-10 md:p-14 rounded-[32px] relative overflow-hidden group border border-slate-800/80 shadow-2xl">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#05DF72]/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="relative space-y-8 z-10">
                            <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-slate-850 rounded-2xl flex items-center justify-center text-[#05DF72] border border-slate-850 shadow-inner">
                                <Sparkles size={26} />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold text-white tracking-tight">White-Glove Experience</h3>
                                <p className="text-slate-400 leading-relaxed font-light text-sm">
                                    Gocycle acts as your dedicated consignment agent, providing an end-to-end experience that transforms environmental liabilities into immediate liquid capital.
                                </p>
                            </div>
                            <div className="pt-8 grid grid-cols-2 gap-6 border-t border-slate-800">
                                <div>
                                    <p className="text-4xl font-extrabold text-white tracking-tight">$0</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-2">Upfront Cost</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-extrabold text-[#05DF72] tracking-tight">Full</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-2">Compliance</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Value Section */}
            <section className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto border-b border-slate-800/60">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Expert Logistics",
                            desc: "Deploy Gocycle-verified logistics partners trained in the safe handling and transport of hazardous materials.",
                            icon: Truck
                        },
                        {
                            title: "Risk-Mitigated Model",
                            desc: "We manage the entire trade cycle—from AI-driven price optimization to buyer negotiation and settlement.",
                            icon: ShieldCheck
                        },
                        {
                            title: "Economies of Scale",
                            desc: "By consolidating electronic waste through our hubs, we attract top-tier global recovery specialists.",
                            icon: BarChart4
                        }
                    ].map((feature, i) => (
                        <div key={i} className="group bg-slate-900/40 hover:bg-slate-900/80 p-8 md:p-10 rounded-[28px] border border-slate-800 hover:border-[#05DF72]/20 shadow-xl transition-all duration-300">
                            <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-[#05DF72] mb-6 group-hover:scale-110 transition-transform">
                                <feature.icon size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight mb-3">{feature.title}</h3>
                            <p className="text-slate-400 font-light text-sm leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Managed Process */}
            <section className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto relative z-10">
                <div className="max-w-4xl mx-auto space-y-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight text-center">
                        Net-Settlement Payout
                    </h2>
                    <div className="space-y-4">
                        {[
                            "Initiate a Request via the platform",
                            "Professional Valuation by our AI engineers",
                            "High-Speed Hub Consolidation for top pricing",
                            "Transparent Net-Settlement to your corporate wallet"
                        ].map((step, i) => (
                            <div key={i} className="group flex items-center gap-6 p-6 bg-slate-900/40 hover:bg-slate-900/70 rounded-[24px] border border-slate-800 hover:border-slate-700/80 transition-all duration-300">
                                <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center text-[#05DF72] font-mono text-sm font-bold shrink-0 shadow-md">
                                    0{i + 1}
                                </div>
                                <p className="text-lg font-light text-slate-300 group-hover:text-white transition-colors">{step}</p>
                            </div>
                        ))}
                    </div>
                    <div className="p-10 md:p-14 bg-gradient-to-b from-[#05DF72]/10 to-slate-900 border border-slate-800 rounded-[32px] mt-16 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#05DF72]/5 rounded-full blur-[80px]" />
                        <p className="text-slate-200 text-xl md:text-2xl font-light leading-relaxed tracking-tight relative z-10 max-w-2xl mx-auto italic">
                            "With Sell4me, you don’t just dispose of waste; you access a professionalized, transparent, and sustainable supply chain."
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Sell4MePage

