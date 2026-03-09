'use client'
import React from 'react'
import { Wallet, Truck, ShieldCheck, History, ArrowRight, Zap, Coins, Fingerprint } from 'lucide-react'
import { useRouter } from 'next/navigation'

const PaymentLogisticsPage = () => {
    const router = useRouter()

    return (
        <div className="bg-white min-h-screen text-slate-600">
            {/* Header */}
            <section className="relative py-24 px-6 lg:px-10 overflow-hidden bg-slate-950 border-b border-white/[0.08]">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-[120px] -mr-40 -mt-20"></div>
                <div className="max-w-[1200px] mx-auto relative z-10 space-y-6">
                    <h3 className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em]">Settlement & Ops</h3>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                        Payment & Collection <br /><span className="text-emerald-500">Logistics</span>
                    </h1>
                    <p className="text-xl font-bold text-slate-400 tracking-tight uppercase">
                        Secure Escrow & Professional Material Recovery
                    </p>
                </div>
            </section>

            {/* Escrow Mechanism */}
            <section className="py-24 px-6 lg:px-10">
                <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-slate-950 uppercase tracking-tight leading-tight">The Gocycle <br /><span className="text-emerald-500">Escrow System</span></h2>
                            <p className="text-lg leading-relaxed text-slate-500 font-medium italic">
                                "Our secure payment escrow and coordinated logistics system are designed to protect both buyers and sellers throughout the trading process."
                            </p>
                        </div>

                        <div className="space-y-8">
                            {[
                                { title: "Deposit and Lock", desc: "Buyer deposits full payment into a secure GoCycle-managed account. Listings enter 'Trade Locked' status immediately.", icon: Wallet },
                                { title: "Verification-Based Release", desc: "Escrowed funds are only released to the seller after the buyer has physically verified and accepted the materials.", icon: ShieldCheck }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-6 p-8 bg-white rounded-[24px] shadow-sm border border-black/[0.04] group hover:border-emerald-500/30 transition-all">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-500/10 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                        <step.icon size={24} />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-slate-950 uppercase tracking-wide">{step.title}</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-emerald-500/5 rounded-[3rem] blur-2xl"></div>
                        <div className="relative bg-white rounded-[32px] p-12 lg:p-16 border border-black/[0.06] shadow-premium space-y-10">
                            <h3 className="text-2xl font-bold text-slate-950 uppercase tracking-tighter">Trade Lock Status</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-500/20 rounded-xl">
                                    <p className="text-[10px] font-bold uppercase text-emerald-600 tracking-widest">Escrow Funding</p>
                                    <CheckCircle2 className="text-emerald-600" size={16} />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 border border-black/[0.04] rounded-xl opacity-60">
                                    <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Material Collection</p>
                                    <Zap size={16} className="text-slate-400" />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 border border-black/[0.04] rounded-xl opacity-60">
                                    <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Fund Disbursement</p>
                                    <Zap size={16} className="text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tokenized Logistics */}
            <section className="py-32 px-6 lg:px-10 bg-emerald-600 text-white relative overflow-hidden">
                <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                    <div className="space-y-8">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white border border-white/30">
                            <Fingerprint size={32} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase leading-[0.9]">The Token <br />Release System</h2>
                        <p className="text-lg font-medium text-emerald-50 leading-relaxed">
                            Upon arrival at the Seller’s location, the Buyer inspects the materials. Once satisfied, the Seller provides a unique Transaction Token to the Buyer. The input of this token into the Gocycle App serves as a digital signature, confirming transfer and authorizing immediate release of funds.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "No shadow trades outside oversight",
                                "Zero payment fraud risk",
                                "Instant bank or wallet settlement",
                                "Professional hazardous material handling"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-emerald-50">
                                    <CheckCircle2 size={16} className="text-white" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-12 bg-emerald-700/50 backdrop-blur-3xl rounded-[32px] border border-white/20 space-y-8 shadow-xl hover:-translate-y-1 transition-transform">
                        <Truck size={60} className="mx-auto text-emerald-100" />
                        <div className="text-center space-y-4">
                            <h3 className="text-3xl font-bold uppercase tracking-tighter text-white">Coordinated Logistics</h3>
                            <p className="text-emerald-50/80 text-sm leading-relaxed font-medium">
                                After escrow funding is confirmed, a pickup request is generated. The buyer retrieves the materials using their trained logistics infrastructure, ensuring environmental safety.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-6 lg:px-10">
                <div className="max-w-[1200px] mx-auto bg-slate-950 rounded-[32px] p-16 text-center space-y-8 shadow-2xl relative overflow-hidden border border-white/[0.08]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-[100px] -mt-40 pointer-events-none"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold text-white uppercase tracking-tighter mb-8">Ready to join the ecosystem?</h2>
                        <div className="flex flex-wrap justify-center gap-6">
                            <button
                                onClick={() => router.push('/signup?role=BUYER')}
                                className="px-12 py-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest active:scale-95 shadow-lg shadow-emerald-500/20 transition-all duration-300"
                            >
                                Become a Buyer
                            </button>
                            <button
                                onClick={() => router.push('/signup?role=SELLER')}
                                className="px-12 py-5 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest active:scale-95 transition-all duration-300"
                            >
                                Become a Seller
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default PaymentLogisticsPage
