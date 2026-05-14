'use client'
import React from 'react'
import { ClipboardList, ShieldCheck, Zap, Camera, Search, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

const TradeProcessPage = () => {
    const router = useRouter()

    return (
        <div className="bg-white min-h-screen pt-24 pb-32">
            {/* Header */}
            <section className="relative py-24 px-4 md:px-8 max-w-[1400px] mx-auto text-center flex flex-col items-center border-b border-slate-100">
                <div className="max-w-4xl space-y-8 flex flex-col items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#00D166]"></div>
                        <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#00D166]">
                            Operations
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-medium text-slate-900 tracking-[-0.02em] leading-[1.1]">
                        The Gocycle <br /><span className="text-[#00D166]">Trade Process</span>
                    </h1>
                </div>
            </section>

            {/* Onboarding Section */}
            <section id="onboarding" className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-[#F4F6F8] rounded-[24px] flex items-center justify-center text-[#00D166] border border-slate-100 shadow-sm">
                                <UserCheck size={32} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-medium text-slate-900 tracking-[-0.02em] leading-[1.1]">Onboarding & <br /><span className="text-[#00D166]">Verification</span></h2>
                            <p className="text-xl leading-relaxed text-slate-600 font-medium">
                                Every organization joining the Gocycle Marketplace undergoes a mandatory onboarding and verification process before being allowed to trade.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="p-8 md:p-10 bg-white shadow-sm rounded-[32px] border border-slate-100 hover:shadow-md transition-shadow space-y-4">
                                <h4 className="font-bold text-slate-900 uppercase tracking-widest text-sm">Buyers & Collectors</h4>
                                <p className="text-slate-600 leading-relaxed font-medium">Onboarding begins with KYC of Business promoters and confirmation of operational readiness. Verified buyers gain full dashboard access for trading and pickup scheduling.</p>
                            </div>
                            <div className="p-8 md:p-10 bg-white shadow-sm rounded-[32px] border border-slate-100 hover:shadow-md transition-shadow space-y-4">
                                <h4 className="font-bold text-slate-900 uppercase tracking-widest text-sm">Sellers & End-Users</h4>
                                <p className="text-slate-600 leading-relaxed font-medium">A simpler onboarding process authorizing the listing of e-waste materials by size, location, and units, supported by AI price discovery.</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#00D166] rounded-[40px] p-10 md:p-16 relative overflow-hidden shadow-lg h-full flex flex-col justify-center">
                        <div className="space-y-8 relative z-10">
                            <h3 className="text-4xl font-medium text-white tracking-[-0.02em]">Trust Framework</h3>
                            <p className="text-white/90 text-2xl leading-relaxed font-medium">
                                "This framework ensures every transaction takes place between credible, compliant organizations, creating a safe ecosystem for responsible e-waste trade across Africa." ♻️
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section id="trade" className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto bg-[#F4F6F8] rounded-[40px] mt-12">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center space-y-6 flex flex-col items-center">
                        <h2 className="text-4xl md:text-5xl font-medium text-slate-900 tracking-[-0.02em]">Listing Lifecycle</h2>
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                            <p className="text-[12px] font-bold tracking-[0.15em] text-slate-500 uppercase">From Material Upload to Market Visibility</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {[
                            { title: "Material Detail", icon: ClipboardList, desc: "Category (Lithium, Lead-acid), quantity, and physical condition." },
                            { title: "Quality Check", icon: Camera, desc: "Mandatory photographs to provide visibility into material handling." },
                            { title: "AI Price Discovery", icon: Zap, desc: "Proprietary algorithms suggest pricing based on real-time market data." },
                            { title: "Market Launch", icon: Search, desc: "Once approved, listings become visible to our verified buyer network." }
                        ].map((item, i) => (
                            <div key={i} className="space-y-6 p-8 md:p-10 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                                <div className="text-[#00D166] bg-[#F4F6F8] w-14 h-14 flex items-center justify-center rounded-2xl"><item.icon size={26} /></div>
                                <h4 className="text-xl font-medium text-slate-900 tracking-[-0.01em]">{item.title}</h4>
                                <p className="text-slate-600 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto">
                <div className="bg-[#F4F6F8] border border-slate-200 rounded-[40px] p-12 lg:p-24 text-center space-y-10 relative overflow-hidden group">
                    <div className="relative z-10 w-full flex flex-col items-center">
                        <h2 className="text-4xl md:text-6xl font-medium text-slate-900 tracking-[-0.02em] mb-4">Ready to list your inventory?</h2>
                        <button
                            onClick={() => router.push('/signup?role=SELLER')}
                            className="bg-[#00D166] text-white px-10 py-5 rounded-[20px] text-[14px] font-bold uppercase tracking-widest shadow-xl hover:bg-[#00B859] hover:-translate-y-1 transition-all flex items-center gap-3 mt-6"
                        >
                            Register as Seller <ArrowRight size={20} />
                        </button>
                        <p onClick={() => router.push('/payment-logistics')} className="mt-10 text-[12px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-[#00D166] transition-colors">
                            Next: Payment & Collection Logistics →
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default TradeProcessPage
