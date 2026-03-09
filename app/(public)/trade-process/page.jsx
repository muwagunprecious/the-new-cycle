'use client'
import React from 'react'
import { ClipboardList, ShieldCheck, Zap, Camera, Search, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

const TradeProcessPage = () => {
    const router = useRouter()

    return (
        <div className="bg-white min-h-screen text-slate-600">
            {/* Header */}
            <section className="relative py-24 px-6 lg:px-10 overflow-hidden text-center bg-slate-950 border-b border-white/[0.08]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/[0.03] rounded-full blur-[120px] -mt-40"></div>
                <div className="max-w-4xl mx-auto relative z-10 space-y-6">
                    <h3 className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em]">Operations</h3>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                        The Gocycle <br /><span className="text-emerald-500">Trade Process</span>
                    </h1>
                </div>
            </section>

            {/* Onboarding Section */}
            <section id="onboarding" className="py-24 px-6 lg:px-10">
                <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                            <UserCheck size={32} />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-950 uppercase tracking-tighter">Onboarding & <br /><span className="text-emerald-500">Verification</span></h2>
                        <p className="text-lg leading-relaxed text-slate-500 font-medium">
                            Every organization joining the Gocycle Marketplace undergoes a mandatory onboarding and verification process before being allowed to trade.
                        </p>

                        <div className="space-y-6">
                            <div className="p-8 bg-white shadow-soft rounded-[24px] border border-black/[0.06] space-y-3">
                                <h4 className="font-bold text-slate-950 uppercase tracking-wide text-sm">Buyers & Collectors</h4>
                                <p className="text-sm text-slate-500">Onboarding begins with KYC of Business promoters and confirmation of operational readiness. Verified buyers gain full dashboard access for trading and pickup scheduling.</p>
                            </div>
                            <div className="p-8 bg-white shadow-soft rounded-[24px] border border-black/[0.06] space-y-3">
                                <h4 className="font-bold text-slate-950 uppercase tracking-wide text-sm">Sellers & End-Users</h4>
                                <p className="text-sm text-slate-500">A simpler onboarding process authorizing the listing of e-waste materials by size, location, and units, supported by AI price discovery.</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-emerald-600 rounded-[32px] p-12 md:p-20 relative overflow-hidden shadow-emerald-500/20 shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="space-y-8 relative z-10">
                            <h3 className="text-3xl font-bold text-white uppercase tracking-tighter">Trust Framework</h3>
                            <p className="text-emerald-50 font-medium leading-relaxed">
                                "This framework ensures every transaction takes place between credible, compliant organizations, creating a safe ecosystem for responsible e-waste trade across Africa." ♻️
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section id="trade" className="py-32 px-6 lg:px-10 bg-slate-50 border-y border-black/[0.04]">
                <div className="max-w-[1200px] mx-auto space-y-20">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-bold text-slate-950 uppercase tracking-tighter">Listing Lifecycle</h2>
                        <p className="text-slate-500 font-semibold tracking-tight uppercase">From Material Upload to Market Visibility</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: "Material Detail", icon: ClipboardList, desc: "Category (Lithium, Lead-acid), quantity, and physical condition." },
                            { title: "Quality Check", icon: Camera, desc: "Mandatory photographs to provide visibility into material handling." },
                            { title: "AI Price Discovery", icon: Zap, desc: "Proprietary algorithms suggest pricing based on real-time market data." },
                            { title: "Market Launch", icon: Search, desc: "Once approved, listings become visible to our verified buyer network." }
                        ].map((item, i) => (
                            <div key={i} className="space-y-6 p-8 bg-white rounded-[24px] border border-black/[0.06] shadow-soft hover:shadow-premium hover:-translate-y-1 hover:border-emerald-500/30 transition-all duration-300 group">
                                <div className="text-emerald-600 bg-emerald-50 w-14 h-14 flex items-center justify-center rounded-xl group-hover:bg-emerald-100 transition-colors"><item.icon size={26} /></div>
                                <h4 className="font-bold text-slate-950 uppercase tracking-tight">{item.title}</h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-24 px-6 lg:px-10">
                <div className="max-w-[1200px] mx-auto bg-slate-950 border border-white/[0.08] rounded-[32px] p-12 lg:p-20 text-center space-y-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/[0.03] rounded-full blur-[100px] -mr-40 -mt-20"></div>
                    <div className="relative z-10 w-full flex flex-col items-center">
                        <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-tighter mb-8">Ready to list your inventory?</h2>
                        <button
                            onClick={() => router.push('/signup?role=SELLER')}
                            className="px-10 py-5 bg-emerald-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest active:scale-95 flex items-center gap-3 mx-auto shadow-lg shadow-emerald-500/20 hover:-translate-y-1 hover:bg-emerald-400 transition-all duration-300"
                        >
                            Register as Seller <ArrowRight size={16} />
                        </button>
                        <p onClick={() => router.push('/payment-logistics')} className="mt-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                            Next: Payment & Collection Logistics →
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default TradeProcessPage
