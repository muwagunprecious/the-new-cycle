'use client'
import React from 'react'
import Image from 'next/image'
import { Leaf, Award, Target, Shield, Users, Mail, Phone, MapPin } from 'lucide-react'

const AboutPage = () => {
    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-32 relative overflow-hidden">
            {/* Decorative background blurs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#00D166]/[0.03] rounded-full blur-[120px] pointer-events-none -mr-40 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#00D166]/[0.02] rounded-full blur-[100px] pointer-events-none -ml-40 -mb-20"></div>
            
            {/* Hero Section */}
            <section className="relative py-24 px-4 md:px-8 max-w-[1400px] mx-auto z-10">
                <div className="max-w-4xl space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#00D166]"></div>
                        <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#00D166]">
                            Company Profile
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-medium text-slate-900 tracking-[-0.02em] leading-[1.1]">
                        About <span className="text-[#00D166]">Gocycle.ng</span>
                    </h1>
                    <p className="text-2xl font-medium text-slate-600 leading-relaxed max-w-3xl">
                        The Architects of Nigeria’s Circular Economy
                    </p>
                </div>
            </section>

            {/* Vision Section */}
            <section className="py-12 px-4 md:px-8 max-w-[1400px] mx-auto">
                <div className="bg-white rounded-[40px] p-8 md:p-16 lg:p-24 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center shadow-sm border border-slate-100">
                    <div className="space-y-8">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#00D166] shadow-md border border-slate-100">
                            <Target size={32} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-medium text-slate-900 tracking-[-0.02em] leading-[1.1]">Our Vision</h2>
                        <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                            <p>
                                Gocycle was founded on a singular, urgent realization: Africa’s rapid digitalization is creating a monumental environmental challenge in the form of e-waste, yet within this challenge lies a multi-billion dollar opportunity to power a sustainable future.
                            </p>
                            <p>
                                We are the digital bridge between the generators of end-of-life batteries and the global material recovery supply chain. By formalizing the informal, we are building a secure, transparent, and high-integrity marketplace that turns hazardous waste into high-value secondary resources.
                            </p>
                        </div>
                    </div>
                    <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square w-full rounded-[32px] overflow-hidden bg-[#F4F6F8] border border-slate-100 flex items-center justify-center">
                        <Leaf className="text-[#00D166]/20" size={160} />
                    </div>
                </div>
            </section>

            {/* Leadership Section */}
            <section className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto space-y-16">
                <div className="space-y-6 max-w-3xl">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#00D166]"></div>
                        <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#00D166]">
                            The Leadership
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-medium text-slate-900 tracking-[-0.02em] leading-[1.1]">
                        A Synthesis of Scale & Innovation
                    </h2>
                    <p className="text-xl font-medium text-slate-600 leading-relaxed">
                        Combining deep-rooted expertise in digital infrastructure with a passion for environmental transformation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Emmanuel Okoegwale */}
                    <div className="bg-white border border-slate-100 shadow-sm rounded-[32px] p-8 md:p-12 space-y-8 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 shadow-sm mb-6 bg-slate-100">
                                <Image src="/images/emmanuel-okoegwale.jpg" alt="Emmanuel Okoegwale" width={96} height={96} className="object-cover w-full h-full" />
                            </div>
                            <h3 className="text-3xl font-medium text-slate-900 leading-[1.1]">Emmanuel Okoegwale</h3>
                            <p className="text-[#00D166] font-bold text-[12px] uppercase tracking-widest">Distribution Network Architect</p>
                            <div className="space-y-6 text-slate-600 leading-relaxed">
                                <p>With over two decades of experience at the intersection of Digital Finance and Distribution, Emmanuel is a master of building "last-mile" networks in complex markets.</p>
                                <p>Having held leadership roles at Save the Children and MobileMoneyAfrica, his career has been defined by the creation of proprietary distribution systems that drive financial inclusion. At Gocycle, he applies the rigorous logic of fintech to the waste sector.</p>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-slate-200 flex gap-4">
                            <div className="w-12 h-12 rounded-[16px] bg-[#F4F6F8] flex items-center justify-center text-[#00D166] shadow-sm border border-slate-100">
                                <Shield size={20} />
                            </div>
                            <div className="w-12 h-12 rounded-[16px] bg-[#F4F6F8] flex items-center justify-center text-[#00D166] shadow-sm border border-slate-100">
                                <Users size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Adenle Tuwase */}
                    <div className="bg-white border border-slate-100 shadow-sm rounded-[32px] p-8 md:p-12 space-y-8 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 shadow-sm mb-6 bg-slate-100">
                                <Image src="/images/adetunwase-adenle.jpg" alt="Adenle Tuwase" width={96} height={96} className="object-cover w-full h-full" />
                            </div>
                            <h3 className="text-3xl font-medium text-slate-900 leading-[1.1]">Adenle Tuwase</h3>
                            <p className="text-[#00D166] font-bold text-[12px] uppercase tracking-widest">The E-waste Innovator</p>
                            <div className="space-y-6 text-slate-600 leading-relaxed">
                                <p>A visionary social entrepreneur and a 4× Guinness World Record Holder, Adenle represents the spirit of waste-to-value innovation.</p>
                                <p>His career is a testament to the power of creative environmentalism and operational excellence. At Gocycle, Adenle spearheads the social and marketing drive required to divert hazardous materials from the environment.</p>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-slate-200 flex gap-4">
                            <div className="w-12 h-12 rounded-[16px] bg-[#F4F6F8] flex items-center justify-center text-[#00D166] shadow-sm border border-slate-100">
                                <Award size={20} />
                            </div>
                            <div className="w-12 h-12 rounded-[16px] bg-[#F4F6F8] flex items-center justify-center text-[#00D166] shadow-sm border border-slate-100">
                                <Leaf size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Market Challenge Section */}
            <section className="py-12 px-4 md:px-8 max-w-[1400px] mx-auto">
                <div className="bg-[#00D166] rounded-[40px] p-8 md:p-16 lg:p-24 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <div className="space-y-8">
                        <h2 className="text-4xl md:text-5xl lg:text-[56px] font-medium text-white tracking-[-0.02em] leading-[1.1]">Formalizing <br /> the Informal</h2>
                        <p className="text-xl text-white/90 leading-relaxed">
                            The African e-waste market has historically operated in the shadows. Gocycle is changing this narrative through Formalization. We provide the digital tools that allow informal collectors to transition into verified market participants.
                        </p>
                        <ul className="space-y-6 pt-4">
                            {[
                                "Secure Escrow: Ensuring payment parity for every gram of material.",
                                "AI Discovery: Providing real-time, global-market-aligned pricing.",
                                "Verification: Optimizing authentication and price discovery."
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-white font-bold tracking-wide">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#00D166] shrink-0 shadow-sm">
                                        <Shield size={16} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-xl p-8 md:p-12 rounded-[32px] border border-white/20">
                        <p className="text-4xl font-medium text-white tracking-tight mb-6">Lagos Scale-up</p>
                        <p className="text-white/90 text-lg leading-relaxed">
                            Currently scaling across 5 LGAs with a frontline force of 20 professionalized Collectors, proving that a structured marketplace can thrive even in the most complex urban environments.
                        </p>
                        <div className="mt-10 pt-10 border-t border-white/20 grid grid-cols-3 gap-4 md:gap-6">
                            <div>
                                <p className="text-3xl md:text-4xl font-medium text-white">5+</p>
                                <p className="text-[10px] md:text-[11px] font-bold text-white uppercase tracking-widest mt-2">LGAs</p>
                            </div>
                            <div>
                                <p className="text-3xl md:text-4xl font-medium text-white">20+</p>
                                <p className="text-[10px] md:text-[11px] font-bold text-white uppercase tracking-widest mt-2">Collectors</p>
                            </div>
                            <div>
                                <p className="text-3xl md:text-4xl font-medium text-white">Chain</p>
                                <p className="text-[10px] md:text-[11px] font-bold text-white uppercase tracking-widest mt-2">of Custody</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Footer Banner */}
            <section className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto">
                <div className="bg-white border border-slate-100 shadow-sm rounded-[40px] p-10 md:p-20 text-center space-y-12">
                    <h2 className="text-4xl md:text-5xl font-medium text-slate-900 tracking-[-0.02em]">Join the Circular Revolution</h2>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                        <div className="flex items-center gap-3 text-slate-700 font-bold uppercase tracking-widest text-sm">
                            <div className="w-10 h-10 rounded-full bg-[#F4F6F8] flex items-center justify-center text-[#00D166] border border-slate-100">
                                <Mail size={18} />
                            </div>
                            Hello@Gocycle.ng
                        </div>
                        <div className="flex items-center gap-3 text-slate-700 font-bold uppercase tracking-widest text-sm">
                            <div className="w-10 h-10 rounded-full bg-[#F4F6F8] flex items-center justify-center text-[#00D166] border border-slate-100">
                                <Phone size={18} />
                            </div>
                            +234 704-728-3000
                        </div>
                        <div className="flex items-center gap-3 text-slate-700 font-bold uppercase tracking-widest text-sm">
                            <div className="w-10 h-10 rounded-full bg-[#F4F6F8] flex items-center justify-center text-[#00D166] border border-slate-100">
                                <MapPin size={18} />
                            </div>
                            Lagos, Nigeria
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default AboutPage
