'use client'
import React from 'react'
import { ClipboardList, ShieldCheck, Zap, Camera, Search, ArrowRight, UserCheck, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

const TradeProcessPage = () => {
    const router = useRouter()

    return (
        <div className="bg-[#0f172a] text-slate-100 min-h-screen pt-28 pb-32 overflow-hidden relative selection:bg-[#05DF72]/30 selection:text-white">
            {/* Background Decorative Gradients */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#05DF72]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
            
            {/* Header */}
            <section className="relative py-24 px-4 md:px-8 max-w-[1400px] mx-auto text-center flex flex-col items-center border-b border-slate-800/60">
                <div className="max-w-4xl space-y-6 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md">
                        <div className="w-2 h-2 rounded-full bg-[#05DF72] animate-pulse"></div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#05DF72]">
                            Operations & Workflow
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
                        The Gocycle <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#05DF72] via-emerald-400 to-[#05DF72]">
                            Trade Process
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
                        A secure, compliant, and optimized ecosystem designed to streamline e-waste trading across the African continent.
                    </p>
                </div>
            </section>

            {/* Onboarding Section */}
            <section id="onboarding" className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-stretch">
                    <div className="space-y-10 flex flex-col justify-center">
                        <div className="space-y-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center text-[#05DF72] border border-slate-800/80 shadow-lg">
                                <UserCheck size={28} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-none">
                                Onboarding & <br />
                                <span className="text-[#05DF72]">Verification</span>
                            </h2>
                            <p className="text-lg leading-relaxed text-slate-400 font-light">
                                Every organization joining the Gocycle Marketplace undergoes a rigorous onboarding and validation process before initiating trades, securing the entire supply chain.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="group p-8 bg-slate-900/40 hover:bg-slate-900/80 rounded-[24px] border border-slate-800 hover:border-[#05DF72]/30 transition-all duration-300 shadow-xl backdrop-blur-sm">
                                <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#05DF72]"></span>
                                    Buyers & Collectors
                                </h4>
                                <p className="text-slate-400 leading-relaxed text-sm font-light group-hover:text-slate-300 transition-colors">
                                    Onboarding begins with thorough KYC verification of business promoters and confirmation of operational readiness. Verified buyers gain comprehensive dashboard access for trading and scheduling.
                                </p>
                            </div>
                            
                            <div className="group p-8 bg-slate-900/40 hover:bg-slate-900/80 rounded-[24px] border border-slate-800 hover:border-[#05DF72]/30 transition-all duration-300 shadow-xl backdrop-blur-sm">
                                <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#05DF72]"></span>
                                    Sellers & End-Users
                                </h4>
                                <p className="text-slate-400 leading-relaxed text-sm font-light group-hover:text-slate-300 transition-colors">
                                    A streamlined experience authorizing quick listing of e-waste materials by category, quantity, and location, fully supported by our AI-driven price discovery engine.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative rounded-[32px] p-8 md:p-12 overflow-hidden flex flex-col justify-between border border-slate-800 bg-gradient-to-b from-[#05DF72]/10 to-slate-900 shadow-2xl">
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#05DF72]/10 rounded-full blur-[80px] pointer-events-none" />
                        <div className="space-y-8 relative z-10 my-auto">
                            <div className="w-12 h-12 rounded-full bg-[#05DF72]/15 flex items-center justify-center text-[#05DF72]">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-3xl font-bold text-white tracking-tight">Trust Framework</h3>
                            <blockquote className="text-slate-300 text-xl md:text-2xl font-light leading-relaxed italic border-l-2 border-[#05DF72] pl-6">
                                "This framework ensures every transaction takes place between credible, compliant organizations, creating a safe ecosystem for responsible e-waste trade across Africa."
                            </blockquote>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-[#05DF72] font-bold">
                                    ♻️
                                </div>
                                <span className="text-xs tracking-widest uppercase text-slate-400 font-bold">Verified Operations</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section id="trade" className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto bg-slate-900/50 border border-slate-850 rounded-[40px] mt-12 relative">
                <div className="absolute inset-0 bg-grid-white/[0.02] rounded-[40px] pointer-events-none" />
                <div className="max-w-7xl mx-auto space-y-16 relative z-10">
                    <div className="text-center space-y-4 flex flex-col items-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                            Listing Lifecycle
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#05DF72]"></div>
                            <p className="text-xs font-bold tracking-[0.2em] text-[#05DF72] uppercase">
                                From Material Upload to Market Visibility
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "Material Detail", icon: ClipboardList, desc: "Specify category (Lithium, Lead-acid, etc.), volume, and physical condition details." },
                            { title: "Quality Verification", icon: Camera, desc: "Upload clear photographs to confirm quality assessment and transparency." },
                            { title: "AI Price Discovery", icon: Zap, desc: "Our proprietary algorithm generates real-time market-linked value estimates." },
                            { title: "Market Launch", icon: Search, desc: "Upon swift review, listings are matched directly with our verified buyer pool." }
                        ].map((item, i) => (
                            <div key={i} className="group relative space-y-6 p-8 bg-slate-950/80 rounded-[24px] border border-slate-800 hover:border-[#05DF72]/40 transition-all duration-300 hover:-translate-y-1.5 shadow-xl">
                                <div className="text-[#05DF72] bg-[#05DF72]/5 border border-[#05DF72]/20 w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110">
                                    <item.icon size={22} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-bold text-white group-hover:text-[#05DF72] transition-colors flex items-center gap-2">
                                        <span className="text-xs text-slate-500 font-mono">0{i+1}.</span>
                                        {item.title}
                                    </h4>
                                    <p className="text-slate-400 font-light text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto">
                <div className="relative bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-[40px] p-12 lg:p-24 text-center overflow-hidden group">
                    <div className="absolute inset-0 bg-[#05DF72]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#05DF72]/10 rounded-full blur-[80px] pointer-events-none" />
                    
                    <div className="relative z-10 w-full flex flex-col items-center space-y-8">
                        <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight max-w-3xl leading-none">
                            Ready to unlock values from your inventory?
                        </h2>
                        <button
                            onClick={() => router.push('/signup?role=SELLER')}
                            className="group bg-[#05DF72] text-slate-950 px-8 py-4.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#05DF72]/20 hover:shadow-[#05DF72]/40 hover:-translate-y-0.5 transition-all flex items-center gap-3 mt-4"
                        >
                            Register as Seller 
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </button>
                        <button 
                            onClick={() => router.push('/payment-logistics')} 
                            className="mt-6 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-[#05DF72] transition-colors flex items-center gap-2"
                        >
                            Next: Payment & Collection Logistics <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default TradeProcessPage

