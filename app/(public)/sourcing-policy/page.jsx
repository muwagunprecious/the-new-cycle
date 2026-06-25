'use client'
import React from 'react'
import { ShieldAlert, Fingerprint, Eye, ClipboardCheck, Scale, History } from 'lucide-react'

const SourcingPolicyPage = () => {
    return (
        <div className="bg-[#0f172a] text-white min-h-screen pt-24 pb-32 relative overflow-hidden">
            {/* Decorative background glows */}
            <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-[#05DF72]/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-slate-800/30 rounded-full blur-[150px] pointer-events-none"></div>

            {/* Header */}
            <section className="relative py-20 px-4 md:px-8 max-w-[1400px] mx-auto border-b border-slate-800/60 z-10">
                <div className="max-w-4xl space-y-6">
                    <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 w-fit px-4 py-2 rounded-full backdrop-blur-md">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#05DF72] animate-pulse"></div>
                        <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#05DF72]">
                            Governance & Ethics
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
                        Responsible Sourcing <br />
                        <span className="bg-gradient-to-r from-[#05DF72] to-[#00f28f] bg-clip-text text-transparent">
                            & Material Stewardship
                        </span>
                    </h1>
                    <div className="inline-flex items-center gap-2 bg-[#05DF72]/10 border border-[#05DF72]/20 px-3 py-1.5 rounded-md text-xs font-bold text-[#05DF72] uppercase tracking-widest mt-4">
                        Version: 2026.1
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="relative py-16 px-4 md:px-8 max-w-[1400px] mx-auto border-b border-slate-800/60 z-10">
                <div className="max-w-4xl space-y-8">
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <span className="text-[#05DF72]">01.</span> Mission Statement
                    </h2>
                    <div className="space-y-6 text-lg md:text-xl leading-relaxed text-slate-300 font-light">
                        <p>
                            Gocycle is committed to powering Africa’s circular economy by ensuring that the recovery of e-waste and end-of-life batteries contributes to environmental restoration and social equity.
                        </p>
                        <p>
                            We mitigate the risks of "informal leakage," child labor, and environmental contamination by enforcing rigorous standards for every participant in our marketplace.
                        </p>
                    </div>
                </div>
            </section>

            {/* Core Pillars */}
            <section className="relative py-24 px-4 md:px-8 max-w-[1400px] mx-auto z-10">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-16 flex items-center gap-3">
                        <span className="text-[#05DF72]">02.</span> Core Governance Principles
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Env Integrity */}
                        <div className="group bg-slate-900/30 border border-slate-800/80 hover:border-[#05DF72]/30 p-10 rounded-[32px] space-y-6 transition-all duration-300 hover:-translate-y-1">
                            <div className="w-14 h-14 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-[#05DF72] group-hover:scale-110 transition-transform duration-300">
                                <Scale size={28} className="stroke-[1.5]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Environmental Integrity</h3>
                            <ul className="space-y-4 text-slate-400 font-light text-base">
                                <li className="flex items-start gap-3">
                                    <span className="text-[#05DF72] mt-1.5 block w-1.5 h-1.5 rounded-full bg-[#05DF72]"></span>
                                    <span>All Buyers must be well trained in hazardous waste management.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#05DF72] mt-1.5 block w-1.5 h-1.5 rounded-full bg-[#05DF72]"></span>
                                    <span>Prohibition of "open-burning" or acid-dumping.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Ethical Supply Chain */}
                        <div className="group bg-slate-900/30 border border-slate-800/80 hover:border-[#05DF72]/30 p-10 rounded-[32px] space-y-6 transition-all duration-300 hover:-translate-y-1">
                            <div className="w-14 h-14 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-[#05DF72] group-hover:scale-110 transition-transform duration-300">
                                <ShieldAlert size={28} className="stroke-[1.5]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Ethical Supply Chain</h3>
                            <ul className="space-y-4 text-slate-400 font-light text-base">
                                <li className="flex items-start gap-3">
                                    <span className="text-[#05DF72] mt-1.5 block w-1.5 h-1.5 rounded-full bg-[#05DF72]"></span>
                                    <span>Zero-tolerance policy for child labor.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#05DF72] mt-1.5 block w-1.5 h-1.5 rounded-full bg-[#05DF72]"></span>
                                    <span>Cobalt, Lithium, and Lead tracked through formal channels.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Traceability */}
                        <div className="group bg-slate-900/30 border border-slate-800/80 hover:border-[#05DF72]/30 p-10 rounded-[32px] space-y-6 transition-all duration-300 hover:-translate-y-1">
                            <div className="w-14 h-14 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-[#05DF72] group-hover:scale-110 transition-transform duration-300">
                                <Fingerprint size={28} className="stroke-[1.5]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Traceability</h3>
                            <ul className="space-y-4 text-slate-400 font-light text-base">
                                <li className="flex items-start gap-3">
                                    <span className="text-[#05DF72] mt-1.5 block w-1.5 h-1.5 rounded-full bg-[#05DF72]"></span>
                                    <span>Origin (GPS) and final destination captured for every trade.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#05DF72] mt-1.5 block w-1.5 h-1.5 rounded-full bg-[#05DF72]"></span>
                                    <span>"Downstream Transparency" for all sellers.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Operational Controls */}
            <section className="relative py-24 px-4 md:px-8 max-w-[1400px] mx-auto z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                                <span className="text-[#05DF72]">03.</span> Operational Controls
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed font-light italic">
                                To enforce this policy, Gocycle integrates the following into its product DNA:
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex gap-6 items-start group">
                                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-[#05DF72] border border-slate-800 shrink-0 group-hover:border-[#05DF72]/30 transition-colors">
                                    <ClipboardCheck size={28} className="stroke-[1.5]" />
                                </div>
                                <div className="space-y-2 mt-1">
                                    <h4 className="text-xl font-bold text-white">The "Grey-List" Protocol</h4>
                                    <p className="text-slate-400 leading-relaxed font-light">
                                        Merchants suspected of sourcing materials from protected ecological zones are immediately suspended.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-start group">
                                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-[#05DF72] border border-slate-800 shrink-0 group-hover:border-[#05DF72]/30 transition-colors">
                                    <Fingerprint size={28} className="stroke-[1.5]" />
                                </div>
                                <div className="space-y-2 mt-1">
                                    <h4 className="text-xl font-bold text-white">Tokenized Transfer</h4>
                                    <p className="text-slate-400 leading-relaxed font-light">
                                        Physical handover of material is only valid via the Gocycle Secure Token.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative rounded-[40px] p-10 md:p-16 border border-[#05DF72]/30 bg-gradient-to-br from-slate-900 via-slate-950 to-[#05DF72]/10 space-y-10 group overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#05DF72]/5 rounded-full blur-[80px] pointer-events-none"></div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                            <span className="text-[#05DF72]">04.</span> Impact Reporting
                        </h2>
                        <div className="space-y-6 relative z-10">
                            {[
                                "Material Mass Balance: Lead, Lithium, and Plastic diverted.",
                                "GHG Offset: CO2e emissions avoided vs virgin mining.",
                                "Compliance Rate: environmental licensing audit results."
                            ].map((report, i) => (
                                <div key={i} className="flex items-center gap-4 text-slate-200 font-medium tracking-wide">
                                    <div className="w-10 h-10 bg-[#05DF72]/10 border border-[#05DF72]/20 text-[#05DF72] rounded-full flex items-center justify-center backdrop-blur-sm shrink-0">
                                        <History size={18} />
                                    </div>
                                    <span className="leading-snug text-base font-light">{report}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default SourcingPolicyPage

