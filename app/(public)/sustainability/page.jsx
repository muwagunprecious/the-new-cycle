'use client'
import React from 'react'
import { Leaf, BarChart3, Globe2, ShieldCheck, Recycle, Wind } from 'lucide-react'

const SustainabilityPage = () => {
    return (
        <div className="bg-[#0f172a] text-white min-h-screen pt-24 pb-32 relative overflow-hidden">
            {/* Decorative background glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#05DF72]/10 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-slate-800/50 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Header */}
            <section className="relative py-20 px-4 md:px-8 max-w-[1400px] mx-auto text-center flex flex-col items-center z-10">
                <div className="max-w-4xl space-y-8 flex flex-col items-center">
                    <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-full backdrop-blur-md">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#05DF72] animate-pulse"></div>
                        <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#05DF72]">
                            Company Impact
                        </span>
                    </div>
                    
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[28px] flex items-center justify-center text-[#05DF72] border border-[#05DF72]/20 shadow-[0_0_30px_rgba(5,223,114,0.15)] hover:scale-105 transition-transform duration-350">
                        <Leaf size={44} className="stroke-[1.5]" />
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
                        Sustainability <br />
                        <span className="bg-gradient-to-r from-[#05DF72] to-[#00f28f] bg-clip-text text-transparent">
                            Impact Statement
                        </span>
                    </h1>
                </div>
            </section>

            {/* Core Content */}
            <section className="relative py-12 px-4 md:px-8 max-w-[1000px] mx-auto z-10">
                <div className="space-y-20">
                    <div className="space-y-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight border-l-4 border-[#05DF72] pl-6">
                            Institutionalizing Recovery
                        </h2>
                        <div className="space-y-6 text-slate-300 text-lg md:text-xl leading-relaxed font-light">
                            <p>
                                The Gocycle platform serves as a critical catalyst for Africa’s transition toward a circular economy by institutionalizing the recovery of hazardous electronic waste and end-of-life batteries.
                            </p>
                            <p>
                                By replacing the historically fragmented and high-risk informal recycling sector with a transparent, digital-first marketplace, Gocycle effectively mitigates the severe environmental degradation associated with improper lead-acid and lithium-ion disposal.
                            </p>
                        </div>
                    </div>

                    {/* Feature Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Card 1 */}
                        <div className="group bg-slate-900/40 backdrop-blur-md p-10 md:p-12 rounded-[32px] border border-slate-800/80 hover:border-[#05DF72]/45 space-y-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(5,223,114,0.05)]">
                            <div className="w-14 h-14 rounded-2xl bg-[#05DF72]/10 border border-[#05DF72]/20 flex items-center justify-center text-[#05DF72] group-hover:scale-110 transition-transform duration-300">
                                <Globe2 size={28} className="stroke-[1.5]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Landfill Diversion</h3>
                            <p className="text-slate-400 leading-relaxed font-normal">
                                Our impact is rooted in the systematic diversion of toxic materials from landfills and unauthorized dump sites.
                            </p>
                        </div>
                        
                        {/* Card 2 */}
                        <div className="group bg-slate-900/40 backdrop-blur-md p-10 md:p-12 rounded-[32px] border border-slate-800/80 hover:border-[#05DF72]/45 space-y-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(5,223,114,0.05)]">
                            <div className="w-14 h-14 rounded-2xl bg-[#05DF72]/10 border border-[#05DF72]/20 flex items-center justify-center text-[#05DF72] group-hover:scale-110 transition-transform duration-300">
                                <BarChart3 size={28} className="stroke-[1.5]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Traceable Impact</h3>
                            <p className="text-slate-400 leading-relaxed font-normal">
                                Through our proprietary "Smart Transaction Records," we offer granular data on carbon sequestration and mass-balance recovery rates.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8 pt-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight border-l-4 border-[#05DF72] pl-6">
                            Socio-Economic Shift
                        </h2>
                        <div className="space-y-6 text-slate-300 text-lg md:text-xl leading-relaxed font-light">
                            <p>
                                Beyond environmental remediation, Gocycle’s sustainability framework creates a profound socio-economic shift by formalizing the e-waste value chain.
                            </p>
                            <p>
                                We provide verified collectors with a "digital compliance passport" that meets international standards, professionalizing a workforce and creating high-quality green jobs that contribute to regional economic stability.
                            </p>
                        </div>
                    </div>

                    {/* Banner Section */}
                    <div className="relative rounded-[40px] p-10 md:p-16 overflow-hidden border border-[#05DF72]/30 bg-gradient-to-br from-slate-900 via-slate-950 to-[#05DF72]/20 group">
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#05DF72]/10 rounded-full blur-[80px] group-hover:bg-[#05DF72]/15 transition-colors duration-500"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="w-20 h-20 bg-[#05DF72] text-[#0f172a] rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(5,223,114,0.4)] group-hover:scale-105 transition-transform duration-300">
                                <Wind size={36} className="stroke-[2]" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-extrabold text-white tracking-tight">Carbon Offset Goal</h3>
                                <p className="text-slate-300 text-lg leading-relaxed max-w-2xl font-light">
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

