'use client'
import React from 'react'
import { Crown, Sparkles, Truck, ShieldCheck, BarChart4, Zap, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const Sell4MePage = () => {
    const router = useRouter()

    return (
        <div className="bg-white min-h-screen pt-24 pb-32">
            {/* Hero Section */}
            <section className="relative py-24 px-4 md:px-8 max-w-[1400px] mx-auto border-b border-slate-100">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <div className="space-y-10">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00D166]/10 rounded-full text-[#00D166] text-[11px] font-bold uppercase tracking-[0.15em]">
                            <Crown size={16} /> Premium Service
                        </div>
                        <h1 className="text-5xl md:text-7xl font-medium text-slate-900 tracking-[-0.02em] leading-[1.1]">
                            Sell4me <br /><span className="text-[#00D166]">by Gocycle</span>
                        </h1>
                        <p className="text-2xl font-medium text-slate-600 tracking-tight leading-tight">
                            The Premium, Hands-Free E-Waste Liquidation Service
                        </p>
                        <p className="text-lg leading-relaxed text-slate-500 max-w-xl">
                            Engineered for corporate organizations, telecom providers, and high-volume recyclers who prioritize operational efficiency and regulatory compliance over DIY trading.
                        </p>
                        <button
                            onClick={() => router.push('/contact')}
                            className="bg-[#00D166] text-white px-10 py-5 rounded-[20px] text-[14px] font-bold uppercase tracking-widest shadow-xl hover:bg-[#00B859] hover:-translate-y-1 transition-all flex items-center gap-3 w-fit"
                        >
                            Request Managed Service <ArrowRight size={20} />
                        </button>
                    </div>

                    <div className="bg-[#F4F6F8] p-10 md:p-16 rounded-[40px] relative overflow-hidden group border border-slate-100">
                        <div className="relative space-y-8 z-10">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#00D166] shadow-sm">
                                <Sparkles size={32} />
                            </div>
                            <h3 className="text-3xl font-medium text-slate-900 tracking-[-0.01em]">White-Glove Experience</h3>
                            <p className="text-slate-600 leading-relaxed font-medium text-lg">
                                Gocycle acts as your dedicated consignment agent, providing an end-to-end experience that transforms environmental liabilities into immediate liquid capital.
                            </p>
                            <div className="pt-8 grid grid-cols-2 gap-6 border-t border-slate-200">
                                <div>
                                    <p className="text-4xl font-medium text-slate-900">$O</p>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-2">Upfront Cost</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-medium text-slate-900">Full</p>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-2">Compliance</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Value Section */}
            <section className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto border-b border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                        <div key={i} className="bg-white p-10 md:p-12 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-8">
                            <div className="w-14 h-14 bg-[#F4F6F8] rounded-2xl flex items-center justify-center text-[#00D166]">
                                <feature.icon size={28} />
                            </div>
                            <h3 className="text-2xl font-medium text-slate-900 tracking-[-0.01em]">{feature.title}</h3>
                            <p className="text-slate-600 font-medium leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Managed Process */}
            <section className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto">
                <div className="max-w-4xl mx-auto space-y-16">
                    <h2 className="text-4xl md:text-5xl font-medium text-slate-900 tracking-[-0.02em] text-center">Net-Settlement Payout</h2>
                    <div className="space-y-6">
                        {[
                            "Initiate a Request via the platform",
                            "Professional Valuation by our AI engineers",
                            "High-Speed Hub Consolidation for top pricing",
                            "Transparent Net-Settlement to your corporate wallet"
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-6 p-8 bg-[#F4F6F8] rounded-[32px] border border-slate-100 hover:border-slate-300 transition-colors">
                                <div className="w-12 h-12 bg-[#00D166] rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
                                    {i + 1}
                                </div>
                                <p className="text-xl font-medium text-slate-800 tracking-[-0.01em]">{step}</p>
                            </div>
                        ))}
                    </div>
                    <div className="p-10 md:p-16 bg-[#00D166] rounded-[40px] mt-16 text-center shadow-lg">
                        <p className="text-white text-2xl font-medium leading-relaxed tracking-[-0.01em]">
                            "With Sell4me, you don’t just dispose of waste; you access a professionalized, transparent, and sustainable supply chain."
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Sell4MePage
