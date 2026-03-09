'use client'
import React from 'react'
import { Crown, Sparkles, Truck, ShieldCheck, BarChart4, Zap, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const Sell4MePage = () => {
    const router = useRouter()

    return (
        <div className="bg-slate-950 min-h-screen text-slate-300">
            {/* Hero Section */}
            <section className="relative py-32 px-6 lg:px-10 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-emerald-500/10 rounded-full blur-[150px] -mt-60"></div>
                <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">
                            <Crown size={14} /> Premium Service
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                            Sell4me <br /><span className="text-emerald-500">by Gocycle</span>
                        </h1>
                        <p className="text-xl font-bold text-slate-400 tracking-tight uppercase leading-tight">
                            The Premium, Hands-Free E-Waste Liquidation Service
                        </p>
                        <p className="text-lg leading-relaxed text-slate-500">
                            Engineered for corporate organizations, telecom providers, and high-volume recyclers who prioritize operational efficiency and regulatory compliance over DIY trading.
                        </p>
                        <button
                            onClick={() => router.push('/signup')}
                            className="px-10 py-5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center gap-3 w-fit"
                        >
                            Request Managed Service <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-12 rounded-[3.5rem] relative group">
                        <div className="absolute -inset-1 bg-emerald-500/20 rounded-[3.6rem] blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative space-y-8">
                            <div className="flex items-center gap-4">
                                <Sparkles className="text-emerald-500" size={32} />
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">White-Glove Experience</h3>
                            </div>
                            <p className="text-slate-400 leading-relaxed font-medium">
                                Gocycle acts as your dedicated consignment agent, providing an end-to-end experience that transforms environmental liabilities into immediate liquid capital.
                            </p>
                            <div className="pt-8 grid grid-cols-2 gap-6 border-t border-white/10">
                                <div>
                                    <p className="text-2xl font-black text-white">$O</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Upfront Cost</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-white">Full</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Compliance</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Value Section */}
            <section className="py-24 px-6 lg:px-10 bg-white/2 border-y border-white/5">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Expert Logistics",
                            desc: "Deploy Gocycle-verified logistics partners trained in the safe handling of hazardous materials.",
                            icon: Truck
                        },
                        {
                            title: "Risk-Mitigated Model",
                            desc: "We manage the entire trade cycle—from AI-driven price optimization to buyer negotiation.",
                            icon: ShieldCheck
                        },
                        {
                            title: "Economies of Scale",
                            desc: "By consolidating e-waste through our hubs, we attract top-tier global material recovery specialists.",
                            icon: BarChart4
                        }
                    ].map((feature, i) => (
                        <div key={i} className="bg-slate-900/50 p-12 rounded-[3rem] border border-white/5 space-y-6">
                            <div className="text-emerald-500"><feature.icon size={32} /></div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{feature.title}</h3>
                            <p className="text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Managed Process */}
            <section className="py-32 px-6 lg:px-10">
                <div className="max-w-3xl mx-auto space-y-12">
                    <h2 className="text-4xl font-black text-white tracking-tight uppercase text-center">Net-Settlement Payout</h2>
                    <div className="space-y-6">
                        {[
                            "Initiate a Request via the platform",
                            "Professional Valuation by our AI engineers",
                            "High-Speed Hub Consolidation for top pricing",
                            "Transparent Net-Settlement to your corporate wallet"
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/5">
                                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-black shrink-0">
                                    {i + 1}
                                </div>
                                <p className="text-lg font-black text-slate-300 uppercase tracking-tight">{step}</p>
                            </div>
                        ))}
                    </div>
                    <div className="p-10 bg-emerald-600/10 border border-emerald-500/20 rounded-[2.5rem] mt-12 text-center">
                        <p className="text-emerald-400 font-bold">
                            "With Sell4me, you don’t just dispose of waste; you access a professionalized, transparent, and sustainable supply chain."
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Sell4MePage
