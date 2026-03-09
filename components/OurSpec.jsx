import React from 'react'
import Title from './Title'
import { Coins, ShieldCheck, Smartphone } from 'lucide-react'

const OurSpecs = () => {

    const specs = [
        {
            title: "Asset Liquidation",
            highlight: "to Instant Capital",
            description: "Transform hazardous, depreciating e-waste liabilities into immediate, transparent revenue.",
            icon: Coins
        },
        {
            title: "Secured marketplace",
            highlight: "Fully Verified",
            description: "All market participants are duly vetted and verified before onboarding for trade.",
            icon: ShieldCheck
        },
        {
            title: "Digital first approach",
            highlight: "Anytime, Anywhere",
            description: "Trade your e-waste digitally, anytime and anywhere via our digital marketplace.",
            icon: Smartphone
        }
    ]

    return (
        <section className='bg-white py-24'>
            <div className='max-w-[1200px] mx-auto px-6'>
                <div className="text-center mb-20 space-y-6">
                    <div className='inline-flex items-center gap-3 bg-slate-50 border border-black/[0.04] text-emerald-600 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm mx-auto'>
                        <div className='w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse'></div>
                        Value Focused
                    </div>
                    <h2 className='text-4xl md:text-6xl font-bold text-slate-950 tracking-tighter uppercase leading-tight max-w-4xl mx-auto'>
                        Why Choose Gocycle?
                    </h2>
                    <p className='text-slate-500 font-semibold uppercase tracking-tight text-lg max-w-2xl mx-auto opacity-70'>
                        Revolutionizing E-waste trade & recycling in Africa.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10'>
                    {specs.map((spec, index) => (
                        <div className='group relative p-12 bg-white rounded-[24px] border border-black/[0.05] hover:border-emerald-500/20 hover:shadow-[0_15px_40px_rgba(0,0,0,0.03)] transition-all duration-300 flex flex-col items-center text-center space-y-8 overflow-hidden' key={index}>
                            <div className='absolute inset-0 bg-emerald-500/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'></div>

                            <div className='w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-50 text-emerald-600 border border-black/[0.03] group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-105 transition-all duration-500'>
                                <spec.icon size={28} strokeWidth={1.5} />
                            </div>

                            <div className='space-y-4 relative z-10 flex-1'>
                                <h3 className='text-2xl font-bold text-slate-950 tracking-tight uppercase leading-none'>
                                    {spec.title}
                                </h3>
                                <div className='text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full inline-block mb-2'>
                                    {spec.highlight}
                                </div>
                                <p className='text-[14px] text-slate-500 font-normal leading-relaxed opacity-90'>
                                    {spec.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default OurSpecs
