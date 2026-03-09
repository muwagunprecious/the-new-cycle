'use client'
import React from 'react'
import { Leaf, BarChart3, Globe2, ShieldCheck, Recycle, Wind } from 'lucide-react'

const SustainabilityPage = () => {
    return (
        <div className="bg-slate-950 min-h-screen text-slate-300">
            {/* Header */}
            <section className="relative py-24 px-6 lg:px-10 overflow-hidden text-center bg-white/5 border-b border-white/10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] -mt-40"></div>
                <div className="max-w-4xl mx-auto relative z-10 space-y-6">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                            <Leaf size={32} />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                        Sustainability <br /><span className="text-emerald-500">Impact Statement</span>
                    </h1>
                </div>
            </section>

            {/* Core Content */}
            <section className="py-24 px-6 lg:px-10">
                <div className="max-w-4xl mx-auto space-y-16">
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <h2 className="text-3xl font-black text-white tracking-tight uppercase">Institutionalizing Recovery</h2>
                        <p className="text-xl leading-relaxed font-medium text-slate-400">
                            The Gocycle platform serves as a critical catalyst for Africa’s transition toward a circular economy by institutionalizing the recovery of hazardous electronic waste and end-of-life batteries.
                        </p>
                        <p className="text-lg leading-relaxed text-slate-500">
                            By replacing the historically fragmented and high-risk informal recycling sector with a transparent, digital-first marketplace, Gocycle effectively mitigates the severe environmental degradation associated with improper lead-acid and lithium-ion disposal.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 space-y-4">
                            <div className="text-emerald-500"><Globe2 size={24} /></div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Landfill Diversion</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Our impact is rooted in the systematic diversion of toxic materials from landfills and unauthorized dump sites.
                            </p>
                        </div>
                        <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 space-y-4">
                            <div className="text-emerald-500"><BarChart3 size={24} /></div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Traceable Impact</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Through our proprietary "Smart Transaction Records," we offer granular data on carbon sequestration and mass-balance recovery rates.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
                        <h2 className="text-3xl font-black text-white tracking-tight uppercase">Socio-Economic Shift</h2>
                        <p className="text-lg leading-relaxed text-slate-400 font-medium">
                            Beyond environmental remediation, Gocycle’s sustainability framework creates a profound socio-economic shift by formalizing the e-waste value chain.
                        </p>
                        <p className="text-lg leading-relaxed text-slate-500">
                            We provide verified collectors with a "digital compliance passport" that meets international standards, professionalizing a workforce and creating high-quality green jobs that contribute to regional economic stability.
                        </p>
                    </div>

                    <div className="bg-emerald-600 rounded-[3rem] p-12 md:p-20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white shrink-0">
                                <Wind size={40} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Carbon Offset Goal</h3>
                                <p className="text-emerald-50 font-medium">
                                    Every transaction on the platform contributes to a measurable reduction in greenhouse gas emissions by optimizing logistics and promoting the "Second-Life" application of battery cells.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default SustainabilityPage
