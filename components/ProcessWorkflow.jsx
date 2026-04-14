'use client'
import React from 'react'
import { CheckCircle2, ClipboardList, ShieldCheck, Truck, Users, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

const ProcessWorkflow = () => {
    const router = useRouter()

    const steps = [
        {
            title: "Onboarding & Verification",
            description: "Mandatory KYC/KYB validation for all participants. Organizations undergo rigorous checks before being authorized to trade.",
            icon: Users,
            color: "emerald",
            link: "/trade-process#onboarding"
        },
        {
            title: "The Trade Process",
            description: "Sellers list materials with AI-driven pricing and photos. Verified buyers review and lock trades via secure escrow.",
            icon: ClipboardList,
            color: "blue",
            link: "/trade-process#trade"
        },
        {
            title: "Payment & Logistics",
            description: "Funds are secured in escrow. Materials are collected by verified logistics, and payment is released via a token system.",
            icon: Truck,
            color: "emerald",
            link: "/payment-logistics"
        }
    ]

    return (
        <section className='bg-white py-24'>
            <div className='max-w-[1200px] mx-auto px-6'>
                <div className='text-center space-y-6 mb-20'>
                    <div className='inline-flex items-center gap-3 bg-slate-50 border border-black/[0.04] text-emerald-600 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm mx-auto'>
                        <div className='w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse'></div>
                        Secure & Transparent
                    </div>
                    <h2 className='text-4xl md:text-6xl font-bold text-slate-950 tracking-tighter uppercase leading-tight max-w-4xl mx-auto'>
                        Structured Marketplace Workflow
                    </h2>
                    <p className='text-slate-500 font-semibold uppercase tracking-tight text-lg max-w-2xl mx-auto opacity-70'>
                        Designed to ensure trust, compliance, and transparency for all participants.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10'>
                    {steps.map((step, idx) => (
                        <div key={idx} className='group relative p-10 bg-white rounded-[24px] border border-black/[0.05] hover:border-emerald-500/20 hover:shadow-[0_15px_40px_rgba(0,0,0,0.03)] transition-all duration-300 flex flex-col items-center text-center space-y-8'>
                            <div className='w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-50 text-emerald-600 border border-black/[0.03] group-hover:bg-emerald-50 group-hover:scale-105 transition-all duration-300'>
                                <step.icon size={28} strokeWidth={1.5} />
                            </div>
                            <div className='space-y-4 flex-1'>
                                <h3 className='text-xl font-bold text-slate-950 tracking-tight uppercase leading-none'>
                                    {step.title}
                                </h3>
                                <p className='text-slate-500 text-sm font-normal leading-relaxed opacity-90'>
                                    {step.description}
                                </p>
                            </div>
                            <button
                                onClick={() => router.push(step.link)}
                                className='inline-flex items-center gap-2 text-slate-950 text-[10px] font-bold uppercase tracking-widest hover:text-emerald-600 transition-all group/btn'
                            >
                                <span>Learn More</span>
                                <CheckCircle2 size={12} className='opacity-40 group-hover/btn:opacity-100 transition-opacity' />
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}

export default ProcessWorkflow
