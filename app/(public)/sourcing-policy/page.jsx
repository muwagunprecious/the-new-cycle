'use client'
import React from 'react'
import { ShieldAlert, Fingerprint, Eye, ClipboardCheck, Scale, History } from 'lucide-react'

const SourcingPolicyPage = () => {
    return (
        <div className="bg-white min-h-screen pt-24 pb-32">
            {/* Header */}
            <section className="relative py-24 px-4 md:px-8 max-w-[1400px] mx-auto border-b border-slate-100">
                <div className="max-w-4xl space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#00D166]"></div>
                        <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#00D166]">
                            Governance & Ethics
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-medium text-slate-900 tracking-[-0.02em] leading-[1.1]">
                        Responsible Sourcing <br /><span className="text-[#00D166]">& Material Stewardship</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest pt-4">
                        Version: 2026.1
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 px-4 md:px-8 max-w-[1400px] mx-auto border-b border-slate-100">
                <div className="max-w-4xl space-y-8">
                    <h2 className="text-3xl font-medium text-slate-900 tracking-[-0.01em]">1. Mission Statement</h2>
                    <div className="space-y-6 text-xl leading-relaxed text-slate-600">
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
            <section className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto bg-slate-50/50 rounded-[40px] mt-12">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-medium text-slate-900 tracking-[-0.02em] mb-16">2. Core Governance Principles</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Env Integrity */}
                        <div className="bg-white border border-slate-100 p-10 rounded-[32px] space-y-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-[#F4F6F8] rounded-2xl flex items-center justify-center text-[#00D166]">
                                <Scale size={28} />
                            </div>
                            <h3 className="text-2xl font-medium text-slate-900 tracking-[-0.01em]">Environmental Integrity</h3>
                            <ul className="space-y-4 text-slate-600 font-medium">
                                <li className="flex items-start gap-3"><span className="text-[#00D166]">•</span> All Buyers must be well trained in hazardous waste management.</li>
                                <li className="flex items-start gap-3"><span className="text-[#00D166]">•</span> Prohibition of "open-burning" or acid-dumping.</li>
                            </ul>
                        </div>

                        {/* Ethical Supply Chain */}
                        <div className="bg-white border border-slate-100 p-10 rounded-[32px] space-y-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-[#F4F6F8] rounded-2xl flex items-center justify-center text-[#00D166]">
                                <ShieldAlert size={28} />
                            </div>
                            <h3 className="text-2xl font-medium text-slate-900 tracking-[-0.01em]">Ethical Supply Chain</h3>
                            <ul className="space-y-4 text-slate-600 font-medium">
                                <li className="flex items-start gap-3"><span className="text-[#00D166]">•</span> Zero-tolerance policy for child labor.</li>
                                <li className="flex items-start gap-3"><span className="text-[#00D166]">•</span> Cobalt, Lithium, and Lead tracked through formal channels.</li>
                            </ul>
                        </div>

                        {/* Traceability */}
                        <div className="bg-white border border-slate-100 p-10 rounded-[32px] space-y-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-[#F4F6F8] rounded-2xl flex items-center justify-center text-[#00D166]">
                                <Fingerprint size={28} />
                            </div>
                            <h3 className="text-2xl font-medium text-slate-900 tracking-[-0.01em]">Traceability</h3>
                            <ul className="space-y-4 text-slate-600 font-medium">
                                <li className="flex items-start gap-3"><span className="text-[#00D166]">•</span> Origin (GPS) and final destination captured for every trade.</li>
                                <li className="flex items-start gap-3"><span className="text-[#00D166]">•</span> "Downstream Transparency" for all sellers.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Operational Controls */}
            <section className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-4xl font-medium text-slate-900 tracking-[-0.02em]">3. Operational Controls</h2>
                            <p className="text-slate-500 text-lg leading-relaxed italic">To enforce this policy, Gocycle integrates the following into its product DNA:</p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex gap-6 items-start">
                                <div className="w-14 h-14 bg-[#F4F6F8] rounded-2xl flex items-center justify-center text-[#00D166] border border-slate-100 shrink-0">
                                    <ClipboardCheck size={28} />
                                </div>
                                <div className="space-y-2 mt-1">
                                    <h4 className="text-xl font-medium text-slate-900">The "Grey-List" Protocol</h4>
                                    <p className="text-slate-600 leading-relaxed font-medium">Merchants suspected of sourcing materials from protected ecological zones are immediately suspended.</p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-start">
                                <div className="w-14 h-14 bg-[#F4F6F8] rounded-2xl flex items-center justify-center text-[#00D166] border border-slate-100 shrink-0">
                                    <Fingerprint size={28} />
                                </div>
                                <div className="space-y-2 mt-1">
                                    <h4 className="text-xl font-medium text-slate-900">Tokenized Transfer</h4>
                                    <p className="text-slate-600 leading-relaxed font-medium">Physical handover of material is only valid via the Gocycle Secure Token.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#00D166] p-10 md:p-16 rounded-[40px] space-y-10 shadow-lg">
                        <h2 className="text-4xl font-medium text-white tracking-[-0.02em]">4. Impact Reporting</h2>
                        <div className="space-y-6">
                            {[
                                "Material Mass Balance: Lead, Lithium, and Plastic diverted.",
                                "GHG Offset: CO2e emissions avoided vs virgin mining.",
                                "Compliance Rate: environmental licensing audit results."
                            ].map((report, i) => (
                                <div key={i} className="flex items-center gap-4 text-white font-bold tracking-wide">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0">
                                        <History size={18} />
                                    </div>
                                    <span className="leading-snug">{report}</span>
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
