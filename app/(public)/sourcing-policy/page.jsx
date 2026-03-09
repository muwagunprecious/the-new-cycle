'use client'
import React from 'react'
import { ShieldAlert, Fingerprint, Eye, ClipboardCheck, Scale, History } from 'lucide-react'

const SourcingPolicyPage = () => {
    return (
        <div className="bg-slate-950 min-h-screen text-slate-300">
            {/* Header */}
            <section className="relative py-24 px-6 lg:px-10 overflow-hidden bg-white/5 border-b border-white/10">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -mr-40 -mt-20"></div>
                <div className="max-w-7xl mx-auto relative z-10 space-y-6">
                    <h3 className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em]">Governance & Ethics</h3>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                        Responsible Sourcing <br /><span className="text-emerald-500">& Material Stewardship</span>
                    </h1>
                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest pt-4">
                        Version: 2026.1
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 px-6 lg:px-10 border-b border-white/5">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-3xl font-black text-white tracking-tight uppercase">1. Mission Statement</h2>
                        <p className="text-xl leading-relaxed font-medium text-slate-400">
                            Gocycle is committed to powering Africa’s circular economy by ensuring that the recovery of e-waste and end-of-life batteries contributes to environmental restoration and social equity.
                        </p>
                        <p className="text-lg leading-relaxed text-slate-500">
                            We mitigate the risks of "informal leakage," child labor, and environmental contamination by enforcing rigorous standards for every participant in our marketplace.
                        </p>
                    </div>
                </div>
            </section>

            {/* Core Pillars */}
            <section className="py-32 px-6 lg:px-10 bg-white/2">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-16 px-4">2. Core Governance Principles</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Env Integrity */}
                        <div className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] space-y-6 hover:border-emerald-500/30 transition-all">
                            <div className="text-emerald-500"><Scale size={28} /></div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Environmental Integrity</h3>
                            <ul className="space-y-4 text-sm text-slate-400 font-medium">
                                <li className="flex items-start gap-2">• All Buyers must be well trained in hazardous waste management.</li>
                                <li className="flex items-start gap-2">• Prohibition of "open-burning" or acid-dumping.</li>
                            </ul>
                        </div>

                        {/* Ethical Supply Chain */}
                        <div className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] space-y-6 hover:border-emerald-500/30 transition-all">
                            <div className="text-emerald-500"><ShieldAlert size={28} /></div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Ethical Supply Chain</h3>
                            <ul className="space-y-4 text-sm text-slate-400 font-medium">
                                <li className="flex items-start gap-2">• Zero-tolerance policy for child labor.</li>
                                <li className="flex items-start gap-2">• Cobalt, Lithium, and Lead tracked through formal channels.</li>
                            </ul>
                        </div>

                        {/* Traceability */}
                        <div className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] space-y-6 hover:border-emerald-500/30 transition-all">
                            <div className="text-emerald-500"><Fingerprint size={28} /></div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Traceability</h3>
                            <ul className="space-y-4 text-sm text-slate-400 font-medium">
                                <li className="flex items-start gap-2">• Origin (GPS) and final destination captured for every trade.</li>
                                <li className="flex items-start gap-2">• "Downstream Transparency" for all sellers.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Operational Controls */}
            <section className="py-24 px-6 lg:px-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-black text-white tracking-tight uppercase">3. Operational Controls</h2>
                            <p className="text-slate-400 leading-relaxed italic">To enforce this policy, Gocycle integrates the following into its product DNA:</p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex gap-6">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 border border-white/10 shrink-0">
                                    <ClipboardCheck size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-black text-white uppercase tracking-wide">The "Grey-List" Protocol</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed">Merchants suspected of sourcing materials from protected ecological zones are immediately suspended.</p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 border border-white/10 shrink-0">
                                    <Fingerprint size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-black text-white uppercase tracking-wide">Tokenized Transfer</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed">Physical handover of material is only valid via the Gocycle Secure Token.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10 space-y-8">
                        <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-none">4. Impact Reporting</h2>
                        <div className="grid grid-cols-1 gap-6">
                            {[
                                "Material Mass Balance: Lead, Lithium, and Plastic diverted.",
                                "GHG Offset: CO2e emissions avoided vs virgin mining.",
                                "Compliance Rate: environmental licensing audit results."
                            ].map((report, i) => (
                                <div key={i} className="flex items-center gap-4 text-emerald-100 font-bold uppercase tracking-widest text-xs">
                                    <History className="text-emerald-500" size={16} />
                                    {report}
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
