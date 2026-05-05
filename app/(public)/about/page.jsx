'use client'
import React from 'react'
import { Leaf, Award, Target, Shield, Users, Mail, Phone, MapPin } from 'lucide-react'
import Image from 'next/image'

const AboutPage = () => {
    return (
        <div className="bg-slate-950 min-h-screen text-slate-300">
            {/* Hero Section */}
            <section className="relative py-24 px-6 lg:px-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -mr-40 -mt-20"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="max-w-3xl space-y-6">
                        <h3 className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em]">Company Profile</h3>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                            About <span className="text-emerald-500">Gocycle.ng</span>
                        </h1>
                        <p className="text-xl font-bold text-slate-400 tracking-tight uppercase">
                            The Architects of Nigeria’s Circular Economy
                        </p>
                    </div>
                </div>
            </section>

            {/* Vision Section */}
            <section className="py-24 px-6 lg:px-10 bg-white/5 border-y border-white/5">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                            <Target size={32} />
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight uppercase">Our Vision</h2>
                        <p className="text-lg leading-relaxed font-medium">
                            Gocycle was founded on a singular, urgent realization: Africa’s rapid digitalization is creating a monumental environmental challenge in the form of e-waste, yet within this challenge lies a multi-billion dollar opportunity to power a sustainable future.
                        </p>
                        <p className="text-lg leading-relaxed font-medium">
                            We are the digital bridge between the generators of end-of-life batteries and the global material recovery supply chain. By formalizing the informal, we are building a secure, transparent, and high-integrity marketplace that turns hazardous waste into high-value secondary resources.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-emerald-500/10 rounded-[3rem] blur-2xl"></div>
                        <div className="relative rounded-[3rem] overflow-hidden border border-white/10 aspect-video lg:aspect-square bg-slate-900 flex items-center justify-center">
                            <Leaf className="text-emerald-500/20" size={120} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Leadership Section */}
            <section className="py-32 px-6 lg:px-10">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="text-center space-y-4">
                        <h3 className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em]">The Leadership</h3>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">A Synthesis of Scale & Innovation</h2>
                        <p className="text-slate-400 font-bold max-w-2xl mx-auto">
                            Combining deep-rooted expertise in digital infrastructure with a passion for environmental transformation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Emmanuel Okoegwale */}
                        <div className="bg-white/5 p-1 rounded-[3rem] border border-white/10 group overflow-hidden">
                            <div className="bg-slate-900 rounded-[2.8rem] p-12 space-y-8 h-full">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Emmanuel Okoegwale</h3>
                                    <p className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">Distribution Network Architect</p>
                                </div>
                                <div className="space-y-6 text-sm leading-relaxed font-medium text-slate-400">
                                    <p>With over two decades of experience at the intersection of Digital Finance and Distribution, Emmanuel is a master of building "last-mile" networks in complex markets.</p>
                                    <p>Having held leadership roles at Save the Children and MobileMoneyAfrica, his career has been defined by the creation of proprietary distribution systems that drive financial inclusion. At Gocycle, he applies the rigorous logic of fintech to the waste sector.</p>
                                </div>
                                <div className="pt-6 border-t border-white/5 flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500">
                                        <Shield size={18} />
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500">
                                        <Users size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Adenle Tuwase */}
                        <div className="bg-white/5 p-1 rounded-[3rem] border border-white/10 group overflow-hidden">
                            <div className="bg-slate-900 rounded-[2.8rem] p-12 space-y-8 h-full">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Adenle Tuwase</h3>
                                    <p className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">The E-waste Innovator</p>
                                </div>
                                <div className="space-y-6 text-sm leading-relaxed font-medium text-slate-400">
                                    <p>A visionary social entrepreneur and a 4× Guinness World Record Holder, Adenle represents the spirit of waste-to-value innovation.</p>
                                    <p>His career is a testament to the power of creative environmentalism and operational excellence. At Gocycle, Adenle spearheads the social and marketing drive required to divert hazardous materials from the environment.</p>
                                </div>
                                <div className="pt-6 border-t border-white/5 flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500">
                                        <Award size={18} />
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500">
                                        <Leaf size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Market Challenge Section */}
            <section className="py-32 px-6 lg:px-10 bg-emerald-600 text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">Formalizing <br /> the Informal</h2>
                        <p className="text-lg md:text-xl font-medium text-emerald-50 leading-relaxed">
                            The African e-waste market has historically operated in the shadows. Gocycle is changing this narrative through Formalization. We provide the digital tools that allow informal collectors to transition into verified market participants.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Secure Escrow: Ensuring payment parity for every gram of material.",
                                "AI Discovery: Providing real-time, global-market-aligned pricing.",
                                "Verification: Optimizing authentication and price discovery."
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
                                        <Shield size={12} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-black/20 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/10">
                        <p className="text-5xl font-black tracking-tighter mb-4">Lagos Scale-up</p>
                        <p className="text-emerald-100 font-medium leading-relaxed">
                            Currently scaling across 5 LGAs with a frontline force of 20 professionalized Collectors, proving that a structured marketplace can thrive even in the most complex urban environments.
                        </p>
                        <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-6">
                            <div>
                                <p className="text-3xl font-black">5+</p>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">LGAs</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black">20+</p>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Collectors</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black">Chain</p>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">of Custody</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Footer Banner */}
            <section className="py-24 px-6 lg:px-10">
                <div className="max-w-7xl mx-auto bg-white/5 border border-white/10 rounded-[3rem] p-12 md:p-20 text-center space-y-8">
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">Join the Circular Revolution</h2>
                    <div className="flex flex-wrap justify-center gap-10">
                        <div className="flex items-center gap-3 text-emerald-500 font-bold uppercase tracking-widest text-xs">
                            <Mail size={18} /> Hello@Gocycle.ng
                        </div>
                        <div className="flex items-center gap-3 text-emerald-500 font-bold uppercase tracking-widest text-xs">
                            <Phone size={18} /> +234 704-728-3000
                        </div>
                        <div className="flex items-center gap-3 text-emerald-500 font-bold uppercase tracking-widest text-xs">
                            <MapPin size={18} /> Lagos, Nigeria
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default AboutPage
