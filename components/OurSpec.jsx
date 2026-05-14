'use client'
import React from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { assets } from '@/assets/assets'

const OurSpecs = () => {
    return (
        <section className='bg-white py-12 md:py-24 px-4 md:px-8'>
            <div className='max-w-[1400px] mx-auto'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    
                    {/* Card 1: Asset Liquidation (Primary Color - Green instead of Blue) */}
                    <div className='relative bg-[#00D166] rounded-[32px] p-8 md:p-10 overflow-hidden flex flex-col justify-start min-h-[350px] lg:min-h-[400px] group'>
                        <div className='relative z-20 max-w-[380px] space-y-5'>
                            <div className='flex items-center gap-3'>
                                <div className='w-2.5 h-2.5 rounded-full bg-white'></div>
                                <span className='text-[12px] font-bold uppercase tracking-[0.15em] text-white'>
                                    to Instant Capital
                                </span>
                            </div>
                            <h3 className='text-3xl md:text-4xl lg:text-[40px] font-medium text-white leading-[1.1] tracking-[-0.02em]'>
                                Asset Liquidation
                            </h3>
                            <p className='text-white/90 text-lg leading-[1.6]'>
                                Transform hazardous, depreciating e-waste liabilities into immediate, transparent revenue for your business.
                            </p>
                        </div>

                        {/* Floating Arrow Button (Bottom Right) */}
                        <div className='absolute bottom-8 right-8 md:bottom-10 md:right-10 z-30'>
                            <button className='w-12 h-12 bg-white rounded-[16px] flex items-center justify-center text-[#00D166] shadow-xl group-hover:scale-105 transition-transform duration-300'>
                                <ArrowRight size={20} />
                            </button>
                        </div>

                        {/* Decorative Image */}
                        <div className='absolute bottom-0 right-0 w-[55%] h-[45%] md:w-[45%] md:h-[55%] z-10 translate-y-6 translate-x-6 group-hover:translate-y-4 group-hover:translate-x-4 transition-transform duration-700'>
                            <div className='relative w-full h-full'>
                                <Image src={assets.hero_product_img1} alt="Asset Liquidation" fill className='object-cover rounded-tl-[32px] shadow-2xl mix-blend-luminosity opacity-80' />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Secured Marketplace (Light Grey) */}
                    <div className='relative bg-[#F4F6F8] rounded-[32px] p-8 md:p-10 overflow-hidden flex flex-col justify-start min-h-[350px] lg:min-h-[400px] group'>
                        <div className='relative z-20 max-w-[380px] space-y-5'>
                            <div className='flex items-center gap-3'>
                                <div className='w-2.5 h-2.5 rounded-full bg-[#00D166]'></div>
                                <span className='text-[12px] font-bold uppercase tracking-[0.15em] text-[#00D166]'>
                                    Fully Verified
                                </span>
                            </div>
                            <h3 className='text-3xl md:text-4xl lg:text-[40px] font-medium text-slate-900 leading-[1.1] tracking-[-0.02em]'>
                                Secured Marketplace
                            </h3>
                            <p className='text-slate-600 text-lg leading-[1.6]'>
                                Every participant is strictly vetted and verified, ensuring a safe and compliant trading environment.
                            </p>
                        </div>

                        {/* Floating Arrow Button (Bottom Right) */}
                        <div className='absolute bottom-8 right-8 md:bottom-10 md:right-10 z-30'>
                            <button className='w-12 h-12 bg-white rounded-[16px] flex items-center justify-center text-[#00D166] shadow-md border border-slate-100 group-hover:scale-105 transition-transform duration-300'>
                                <ArrowRight size={20} />
                            </button>
                        </div>

                        {/* Decorative Image */}
                        <div className='absolute bottom-0 right-0 w-[55%] h-[45%] md:w-[45%] md:h-[55%] z-10 translate-y-6 translate-x-6 group-hover:translate-y-4 group-hover:translate-x-4 transition-transform duration-700'>
                             <div className='relative w-full h-full'>
                                <Image src={assets.product_img2} alt="Secured Marketplace" fill className='object-cover rounded-tl-[32px] shadow-2xl opacity-90 mix-blend-multiply' />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Digital First (Full Width Green) */}
                    <div className='relative bg-[#00D166] rounded-[32px] p-8 md:p-10 overflow-hidden flex flex-col lg:col-span-2 min-h-[300px] lg:min-h-[350px] group'>
                        <div className='relative z-20 max-w-[500px] space-y-5'>
                            <div className='flex items-center gap-3'>
                                <div className='w-2.5 h-2.5 rounded-full bg-white'></div>
                                <span className='text-[12px] font-bold uppercase tracking-[0.15em] text-white'>
                                    Anytime, Anywhere
                                </span>
                            </div>
                            <h3 className='text-3xl md:text-4xl lg:text-[40px] font-medium text-white leading-[1.1] tracking-[-0.02em]'>
                                Digital First
                            </h3>
                            <p className='text-white/90 text-lg leading-[1.6]'>
                                Manage your e-waste portfolio and execute trades digitally via our high-speed marketplace infrastructure.
                            </p>
                        </div>

                        {/* Floating Arrow Button (Bottom Right) */}
                        <div className='absolute bottom-8 right-8 md:bottom-10 md:right-10 z-30'>
                            <button className='w-12 h-12 bg-white rounded-[16px] flex items-center justify-center text-[#00D166] shadow-xl group-hover:scale-105 transition-transform duration-300'>
                                <ArrowRight size={20} />
                            </button>
                        </div>

                        {/* Decorative Image */}
                        <div className='absolute bottom-0 right-[15%] w-[45%] h-[55%] md:w-[35%] md:h-[65%] z-10 translate-y-8 group-hover:translate-y-6 transition-transform duration-700'>
                            <div className='relative w-full h-full'>
                                <Image src={assets.product_img3} alt="Digital First" fill className='object-cover rounded-t-[32px] shadow-2xl opacity-90 mix-blend-multiply' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default OurSpecs

