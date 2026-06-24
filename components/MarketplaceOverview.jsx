'use client'
import React from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

const MarketplaceOverview = () => {
    const router = useRouter()

    return (
        <section id="marketplace-overview" className='bg-slate-50/40 py-16 md:py-24 px-4 md:px-8 border-t border-slate-200/60'>
            {/* The Main Card Container */}
            <div className='max-w-[1400px] mx-auto bg-white border border-slate-200 rounded-sm p-8 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center overflow-hidden relative shadow-sm'>
                
                {/* Left Side: Text & CTA */}
                <div className='flex flex-col items-start space-y-6 z-10 order-2 lg:order-1'>
                    
                    {/* Top Dot & Label */}
                    <div className="inline-flex items-center gap-2 bg-[#05DF72]/10 border border-[#05DF72]/20 text-[#05DF72] rounded-sm px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase w-fit">
                        <span>Marketplace Platform</span>
                    </div>

                    {/* Main Headline */}
                    <h2 className='text-2xl md:text-4xl font-bold text-slate-900 leading-[1.2] tracking-tight'>
                        A Specialized <span className='text-[#05DF72]'>Trade Ecosystem.</span>
                    </h2>

                    {/* Content / Features */}
                    <div className='space-y-6 text-slate-600'>
                        <p className='text-sm md:text-base leading-relaxed text-slate-500'>
                            Go-cycle Marketplace is the digital bridge connecting verified e-waste sellers with licensed material recovery specialists across Africa.
                        </p>

                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2'>
                            <div>
                                <h4 className='text-sm font-bold text-slate-900 mb-1.5'>Continental Reach</h4>
                                <p className='text-xs md:text-sm text-slate-500 leading-relaxed'>Enabling seamless e-waste material recovery across key African borders.</p>
                            </div>
                            <div>
                                <h4 className='text-sm font-bold text-slate-900 mb-1.5'>Verified Only</h4>
                                <p className='text-xs md:text-sm text-slate-500 leading-relaxed'>Stringent vetting for all recyclers, collectors, and corporate participants.</p>
                            </div>
                        </div>
                    </div>

                    {/* Wide CTA Button */}
                    <button
                        onClick={() => router.push('/marketplace')}
                        className='bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] text-slate-950 rounded-sm w-full max-w-[320px] py-3.5 px-6 flex justify-between items-center text-xs font-bold uppercase tracking-wider transition-colors shadow-sm group'
                    >
                        <span>Explore Marketplace</span>
                        <ArrowRight size={16} className='group-hover:translate-x-0.5 transition-transform duration-300' />
                    </button>
                </div>

                {/* Right Side: Image */}
                <div className='relative w-full aspect-square md:aspect-[4/3] lg:aspect-square z-10 order-1 lg:order-2'>
                    <div className='absolute inset-0 flex items-center justify-center transition-opacity duration-550'>
                        <Image
                            src="/images/marketplace-batteries.jpg"
                            alt="Go-cycle Marketplace Ecosystem"
                            fill
                            className='object-cover rounded-sm border border-slate-200/60 shadow-sm'
                            priority
                        />
                    </div>
                </div>

            </div>
        </section>
    )
}

export default MarketplaceOverview
