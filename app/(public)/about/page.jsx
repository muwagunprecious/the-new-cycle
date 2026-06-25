'use client'
import React from 'react'
import Image from 'next/image'
import { Leaf, Target, Shield, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react'

const AboutPage = () => {
    return (
        <div className="bg-[#0f172a] text-white min-h-screen pt-32 pb-36 relative overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#05DF72]/[0.02] rounded-full blur-[130px] pointer-events-none -mr-40 -mt-20" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#05DF72]/[0.02] rounded-full blur-[120px] pointer-events-none -ml-40 -mb-20" />
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

            {/* Hero Section */}
            <section className="relative py-20 px-4 md:px-8 max-w-[1400px] mx-auto z-10">
                <div className="max-w-4xl space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#05DF72] animate-pulse"></div>
                        <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#05DF72]">
                            Company Profile
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-light text-white tracking-tight leading-[1.05]">
                        About <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#05DF72] to-[#05DF72]/85">Gocycle.ng</span>
                    </h1>
                    <p className="text-xl md:text-2xl font-light text-slate-400 leading-relaxed max-w-3xl">
                        Architecting Nigeria's sustainable circular economy infrastructure.
                    </p>
                </div>
            </section>

            {/* Vision Section */}
            <section className="py-12 px-4 md:px-8 max-w-[1400px] mx-auto relative z-10">
                <div className="bg-slate-900/40 backdrop-blur-md rounded-[32px] border border-slate-800 p-8 md:p-16 lg:p-20 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center shadow-2xl">
                    <div className="space-y-8">
                        <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-[#05DF72] shadow-inner border border-slate-800">
                            <Target size={28} />
                        </div>
                        <h2 className="text-4xl font-semibold text-white tracking-tight">Our Vision</h2>
                        <div className="space-y-6 text-slate-400 text-[16px] md:text-lg leading-relaxed">
                            <p>
                                Gocycle was founded on a singular, urgent realization: Africa’s rapid digitalization is creating a monumental environmental challenge in the form of e-waste, yet within this challenge lies a multi-billion dollar opportunity to power a sustainable future.
                            </p>
                            <p>
                                We serve as the digital bridge between creators of end-of-life batteries and the global material recovery supply chain. By formalizing the informal sector, we build a secure, transparent, and high-integrity marketplace that turns hazardous waste into high-value secondary resources.
                            </p>
                        </div>
                    </div>
                    <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square w-full rounded-[24px] overflow-hidden bg-slate-950 border border-slate-850 flex items-center justify-center group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#05DF72]/[0.02] to-transparent pointer-events-none" />
                        <Leaf className="text-[#05DF72]/10 group-hover:scale-110 group-hover:text-[#05DF72]/15 transition-all duration-700" size={140} />
                    </div>
                </div>
            </section>

            {/* Leadership Section */}
            <section className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto space-y-16 relative z-10">
                <div className="space-y-6 max-w-3xl">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#05DF72] animate-pulse"></div>
                        <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#05DF72]">
                            The Leadership
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">
                        Synthesis of Scale & Innovation
                    </h2>
                    <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-light">
                        Combining deep-rooted expertise in digital infrastructure with a passion for environmental transformation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Emmanuel Okoegwale */}
                    <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 hover:border-[#05DF72]/20 transition-all duration-500 rounded-[28px] p-8 md:p-12 space-y-6 flex flex-col group">
                        {/* Circular photo with subtle neon border */}
                        <div className="relative p-1 rounded-full w-fit bg-slate-850 group-hover:bg-[#05DF72]/30 transition-all duration-500">
                            <div className="w-[140px] h-[140px] rounded-full overflow-hidden bg-slate-950 border-4 border-slate-900">
                                <Image
                                    src="/images/emmanuel-okoegwale.jpg"
                                    alt="Emmanuel Okoegwale"
                                    width={140}
                                    height={140}
                                    className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
                                />
                            </div>
                        </div>

                        {/* Name & Title */}
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-white group-hover:text-[#05DF72] transition-colors duration-300">
                                Emmanuel Okoegwale
                            </h3>
                            <p className="text-[#05DF72] text-[10px] font-bold uppercase tracking-widest">
                                Distribution Network Architect
                            </p>
                        </div>

                        {/* Description */}
                        <div className="space-y-4 text-slate-400 leading-relaxed text-[15px] font-light">
                            <p>With over two decades of experience at the intersection of Digital Finance and Distribution, Emmanuel is a master of building &quot;last-mile&quot; networks in complex markets.</p>
                            <p>Having held leadership roles at Save the Children and MobileMoneyAfrica, his career has been defined by the creation of proprietary distribution systems that drive financial inclusion. At Gocycle, he applies the rigorous logic of fintech to the waste sector.</p>
                        </div>
                    </div>

                    {/* Adenle Tuwase */}
                    <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 hover:border-[#05DF72]/20 transition-all duration-500 rounded-[28px] p-8 md:p-12 space-y-6 flex flex-col group">
                        {/* Circular photo with subtle neon border */}
                        <div className="relative p-1 rounded-full w-fit bg-slate-850 group-hover:bg-[#05DF72]/30 transition-all duration-500">
                            <div className="w-[140px] h-[140px] rounded-full overflow-hidden bg-slate-950 border-4 border-slate-900">
                                <Image
                                    src="/images/adetunwase-adenle.jpg"
                                    alt="Adetunwase Adenle"
                                    width={140}
                                    height={140}
                                    className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
                                />
                            </div>
                        </div>

                        {/* Name & Title */}
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-white group-hover:text-[#05DF72] transition-colors duration-300">
                                Adetunwase Adenle
                            </h3>
                            <p className="text-[#05DF72] text-[10px] font-bold uppercase tracking-widest">
                                The E-waste Innovator
                            </p>
                        </div>

                        {/* Description */}
                        <div className="space-y-4 text-slate-400 leading-relaxed text-[15px] font-light">
                            <p>A visionary social entrepreneur and a 4× Guinness World Record Holder, Adenle represents the spirit of waste-to-value innovation.</p>
                            <p>His career is a testament to the power of creative environmentalism and operational excellence. At Gocycle, Adenle spearheads the social and marketing drive required to divert hazardous materials from the environment.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Market Challenge Section */}
            <section className="py-12 px-4 md:px-8 max-w-[1400px] mx-auto relative z-10">
                <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-[32px] p-8 md:p-16 lg:p-20 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center shadow-2xl">
                    <div className="space-y-8">
                        <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight leading-[1.1]">
                            Formalizing <br />
                            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#05DF72] to-[#05DF72]/70">
                                the Informal Sector
                            </span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed font-light">
                            The African e-waste market has historically operated in the shadows. Gocycle is changing this narrative. We provide the digital tools that allow informal collectors to transition into verified, high-value market participants.
                        </p>
                        <ul className="space-y-5 pt-2">
                            {[
                                "Secure Escrow: Ensuring payment parity for every gram of material.",
                                "AI Discovery: Providing real-time, global-market-aligned pricing.",
                                "Verification: Optimizing authentication and price discovery."
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-4 text-slate-300 font-medium text-sm md:text-base">
                                    <div className="w-6 h-6 rounded-full bg-[#05DF72]/10 border border-[#05DF72]/30 flex items-center justify-center text-[#05DF72] shrink-0 mt-0.5 shadow-sm">
                                        <Shield size={12} />
                                    </div>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="bg-slate-900/80 backdrop-blur-md p-8 md:p-10 rounded-[24px] border border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#05DF72]/[0.02] rounded-full blur-2xl" />
                        <p className="text-3xl font-semibold text-white tracking-tight mb-4">Lagos Scale-up</p>
                        <p className="text-slate-400 text-[15px] leading-relaxed font-light mb-8">
                            Currently scaling across 5 LGAs with a frontline force of 20 professionalized Collectors, proving that a structured marketplace can thrive even in the most complex urban environments.
                        </p>
                        <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-2xl md:text-3xl font-semibold text-white group-hover:text-[#05DF72] transition-colors">5+</p>
                                <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">LGAs Covered</p>
                            </div>
                            <div>
                                <p className="text-2xl md:text-3xl font-semibold text-white group-hover:text-[#05DF72] transition-colors">20+</p>
                                <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Collectors</p>
                            </div>
                            <div>
                                <p className="text-2xl md:text-3xl font-semibold text-white group-hover:text-[#05DF72] transition-colors">Chain</p>
                                <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Of Custody</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Footer Banner */}
            <section className="py-16 px-4 md:px-8 max-w-[1400px] mx-auto relative z-10">
                <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-[32px] p-10 md:p-20 text-center space-y-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#05DF72]/[0.01] to-transparent pointer-events-none" />
                    
                    <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">
                        Join the <span className="font-semibold text-[#05DF72]">Circular Revolution</span>
                    </h2>
                    
                    <div className="flex flex-wrap justify-center gap-6 md:gap-12 pt-4">
                        <div className="flex items-center gap-3.5 text-slate-300 font-bold uppercase tracking-wider text-xs bg-slate-950/80 px-6 py-4 rounded-2xl border border-slate-850 hover:border-[#05DF72]/30 transition-colors">
                            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-[#05DF72]">
                                <Mail size={16} />
                            </div>
                            Hello@Gocycle.ng
                        </div>
                        <div className="flex items-center gap-3.5 text-slate-300 font-bold uppercase tracking-wider text-xs bg-slate-950/80 px-6 py-4 rounded-2xl border border-slate-850 hover:border-[#05DF72]/30 transition-colors">
                            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-[#05DF72]">
                                <Phone size={16} />
                            </div>
                            +234 704-728-3000
                        </div>
                        <div className="flex items-center gap-3.5 text-slate-300 font-bold uppercase tracking-wider text-xs bg-slate-950/80 px-6 py-4 rounded-2xl border border-slate-850 hover:border-[#05DF72]/30 transition-colors">
                            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-[#05DF72]">
                                <MapPin size={16} />
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
