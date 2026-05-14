'use client'
import React from 'react'
import { Leaf, BarChart3, Globe2, ShieldCheck, Recycle, Wind } from 'lucide-react'

const SustainabilityPage = () => {
    return (
        <div className="bg-white min-h-screen pt-24 pb-32">
            {/* Header */}
            <section className="relative py-24 px-4 md:px-8 max-w-[1400px] mx-auto text-center flex flex-col items-center">
                <div className="max-w-4xl space-y-8 flex flex-col items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#00D166]"></div>
                        <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#00D166]">
                            Company Impact
                        </span>
                    </div>
                    <div className="w-20 h-20 bg-[#F4F6F8] rounded-[24px] flex items-center justify-center text-[#00D166] border border-slate-100 shadow-sm">
                        <Leaf size={40} />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-medium text-slate-900 tracking-[-0.02em] leading-[1.1]">
                        Sustainability <br /><span className="text-[#00D166]">Impact Statement</span>
                    </h1>
                </div>
            </section>

            {/* Core Content */}
            <section className="py-12 px-4 md:px-8 max-w-[1000px] mx-auto">
                <div className="space-y-16">
                    <div className="space-y-8">
                        <h2 className="text-4xl font-medium text-slate-900 tracking-[-0.02em]">Institutionalizing Recovery</h2>
                        <div className="space-y-6 text-slate-600 text-xl leading-relaxed">
                            <p>
                                The Gocycle platform serves as a critical catalyst for Africa’s transition toward a circular economy by institutionalizing the recovery of hazardous electronic waste and end-of-life batteries.
                            </p>
                            <p>
                                By replacing the historically fragmented and high-risk informal recycling sector with a transparent, digital-first marketplace, Gocycle effectively mitigates the severe environmental degradation associated with improper lead-acid and lithium-ion disposal.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-[#F4F6F8] p-10 md:p-12 rounded-[32px] border border-slate-100 space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#00D166] shadow-sm">
                                <Globe2 size={24} />
                            </div>
                            <h3 className="text-2xl font-medium text-slate-900 tracking-[-0.01em]">Landfill Diversion</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                Our impact is rooted in the systematic diversion of toxic materials from landfills and unauthorized dump sites.
                            </p>
                        </div>
                        <div className="bg-[#F4F6F8] p-10 md:p-12 rounded-[32px] border border-slate-100 space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#00D166] shadow-sm">
                                <BarChart3 size={24} />
                            </div>
                            <h3 className="text-2xl font-medium text-slate-900 tracking-[-0.01em]">Traceable Impact</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                Through our proprietary "Smart Transaction Records," we offer granular data on carbon sequestration and mass-balance recovery rates.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8 pt-8">
                        <h2 className="text-4xl font-medium text-slate-900 tracking-[-0.02em]">Socio-Economic Shift</h2>
                        <div className="space-y-6 text-slate-600 text-xl leading-relaxed">
                            <p>
                                Beyond environmental remediation, Gocycle’s sustainability framework creates a profound socio-economic shift by formalizing the e-waste value chain.
                            </p>
                            <p>
                                We provide verified collectors with a "digital compliance passport" that meets international standards, professionalizing a workforce and creating high-quality green jobs that contribute to regional economic stability.
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#00D166] rounded-[40px] p-10 md:p-16 lg:p-20 relative overflow-hidden mt-12">
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white shrink-0 backdrop-blur-sm">
                                <Wind size={40} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-medium text-white tracking-[-0.02em]">Carbon Offset Goal</h3>
                                <p className="text-white/90 text-lg leading-relaxed max-w-2xl">
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
