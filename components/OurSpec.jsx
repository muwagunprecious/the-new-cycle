'use client'
import React from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { assets } from '@/assets/assets'

const OurSpecs = () => {
    return (
        <section className='bg-white py-16 md:py-24 px-4 md:px-8 border-t border-slate-200/60'>
            <div className='max-w-[1400px] mx-auto'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    
                    {/* Card 1: Asset Liquidation */}
                    <div className='relative bg-white border border-slate-200 rounded-sm p-8 md:p-10 overflow-hidden flex flex-col justify-start min-h-[350px] lg:min-h-[400px] hover:border-[#05DF72]/65 hover:shadow-md transition-all duration-500 group'>
                        <div className='relative z-20 max-w-[380px] space-y-4'>
                            <div className="inline-flex items-center gap-2 bg-[#05DF72]/10 border border-[#05DF72]/20 text-[#05DF72] rounded-sm px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase w-fit">
                                <span>to Instant Capital</span>
                            </div>
                            <h3 className='text-2xl md:text-3xl font-bold text-slate-900 tracking-tight'>
                                Asset Liquidation
                            </h3>
                            <p className='text-slate-500 text-sm md:text-base leading-relaxed'>
                                Transform hazardous, depreciating e-waste liabilities into immediate, transparent revenue for your business.
                            </p>
                        </div>

                        {/* Floating Arrow Button (Bottom Right) */}
                        <div className='absolute bottom-8 right-8 md:bottom-10 md:right-10 z-30'>
                            <button className='w-10 h-10 border border-slate-200 bg-white rounded-sm flex items-center justify-center text-slate-500 hover:bg-[#05DF72] hover:border-[#05DF72] hover:text-slate-950 transition-colors shadow-sm'>
                                <ArrowRight size={16} />
                            </button>
                        </div>

                        {/* Decorative Image */}
                        <div className='absolute bottom-0 right-0 w-[50%] h-[40%] md:w-[40%] md:h-[50%] z-10 translate-y-4 translate-x-4 group-hover:translate-y-2 group-hover:translate-x-2 transition-transform duration-750'>
                            <div className='relative w-full h-full border border-slate-100/50 rounded-tl-md overflow-hidden'>
                                <Image src={assets.hero_product_img1} alt="Asset Liquidation" fill className='object-cover opacity-90' />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Secured Marketplace */}
                    <div className='relative bg-white border border-slate-200 rounded-sm p-8 md:p-10 overflow-hidden flex flex-col justify-start min-h-[350px] lg:min-h-[400px] hover:border-[#05DF72]/65 hover:shadow-md transition-all duration-500 group'>
                        <div className='relative z-20 max-w-[380px] space-y-4'>
                            <div className="inline-flex items-center gap-2 bg-[#05DF72]/10 border border-[#05DF72]/20 text-[#05DF72] rounded-sm px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase w-fit">
                                <span>Fully Verified</span>
                            </div>
                            <h3 className='text-2xl md:text-3xl font-bold text-slate-900 tracking-tight'>
                                Secured Marketplace
                            </h3>
                            <p className='text-slate-500 text-sm md:text-base leading-relaxed'>
                                Every participant is strictly vetted and verified, ensuring a safe and compliant trading environment.
                            </p>
                        </div>

                        {/* Floating Arrow Button (Bottom Right) */}
                        <div className='absolute bottom-8 right-8 md:bottom-10 md:right-10 z-30'>
                            <button className='w-10 h-10 border border-slate-200 bg-white rounded-sm flex items-center justify-center text-slate-500 hover:bg-[#05DF72] hover:border-[#05DF72] hover:text-slate-950 transition-colors shadow-sm'>
                                <ArrowRight size={16} />
                            </button>
                        </div>

                        {/* Decorative Image */}
                        <div className='absolute bottom-0 right-0 w-[50%] h-[40%] md:w-[40%] md:h-[50%] z-10 translate-y-4 translate-x-4 group-hover:translate-y-2 group-hover:translate-x-2 transition-transform duration-750'>
                             <div className='relative w-full h-full border border-slate-100/50 rounded-tl-md overflow-hidden'>
                                <Image src={assets.product_img2} alt="Secured Marketplace" fill className='object-cover opacity-90' />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Digital First */}
                    <div className='relative bg-white border border-slate-200 rounded-sm p-8 md:p-10 overflow-hidden flex flex-col lg:col-span-2 min-h-[300px] lg:min-h-[350px] hover:border-[#05DF72] hover:bg-[#05DF72] hover:shadow-lg transition-all duration-500 group'>
                        <div className='relative z-20 max-w-[500px] space-y-4'>
                            <div className="inline-flex items-center gap-2 bg-[#05DF72]/10 border border-[#05DF72]/20 text-[#05DF72] group-hover:bg-slate-950 group-hover:text-white group-hover:border-transparent rounded-sm px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase w-fit transition-all duration-500">
                                <span>Anytime, Anywhere</span>
                            </div>
                            <h3 className='text-2xl md:text-3xl font-bold text-slate-900 group-hover:text-slate-950 tracking-tight transition-colors duration-500'>
                                Digital First
                            </h3>
                            <p className='text-slate-500 group-hover:text-slate-900 text-sm md:text-base leading-relaxed transition-colors duration-500'>
                                Manage your e-waste portfolio and execute trades digitally via our high-speed marketplace infrastructure.
                            </p>
                        </div>

                        {/* Floating Arrow Button (Bottom Right) */}
                        <div className='absolute bottom-8 right-8 md:bottom-10 md:right-10 z-30'>
                            <button className='w-10 h-10 border border-slate-200 bg-white rounded-sm flex items-center justify-center text-slate-500 hover:bg-[#05DF72] group-hover:bg-slate-950 group-hover:border-transparent group-hover:text-white transition-all shadow-sm'>
                                <ArrowRight size={16} />
                            </button>
                        </div>

                        {/* Decorative Image */}
                        <div className='absolute bottom-0 right-[15%] w-[40%] h-[50%] md:w-[30%] md:h-[60%] z-10 translate-y-6 group-hover:translate-y-4 transition-transform duration-750'>
                            <div className='relative w-full h-full border border-slate-100/50 group-hover:border-slate-950/10 rounded-t-md overflow-hidden'>
                                <Image src={assets.product_img3} alt="Digital First" fill className='object-cover opacity-90' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default OurSpecs
