'use client'
import React from 'react'
import Image from 'next/image'
import { assets } from '@/assets/assets'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

const MarketplaceOverview = () => {
    const router = useRouter()

    return (
        <section id="marketplace-overview" className='bg-slate-950 py-24 md:py-32 px-4 md:px-8'>
            {/* The Main "Card" Container matching the screenshot */}
            <div className='max-w-[1400px] mx-auto bg-[#F4F6F8] rounded-[40px] md:rounded-[60px] p-8 md:p-16 lg:p-24 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center overflow-hidden relative'>
                
                {/* Left Side: Text & CTA */}
                <div className='flex flex-col items-start space-y-12 z-10'>
                    
                    {/* Top Dot & Label */}
                    <div className='flex items-center gap-3'>
                        <div className='w-3 h-3 rounded-full bg-[#00D166]'></div>
                        <span className='text-[13px] font-bold uppercase tracking-[0.15em] text-[#00D166]'>
                            Marketplace Platform
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h2 className='text-4xl md:text-5xl lg:text-[56px] font-medium text-slate-900 leading-[1.1] tracking-[-0.02em]'>
                        A Specialized <span className='text-[#00D166]'>Trade Ecosystem.</span>
                    </h2>

                    {/* Content / Features */}
                    <div className='space-y-8 text-slate-600'>
                        <p className='text-xl leading-relaxed'>
                            Go-cycle Marketplace is the digital bridge connecting verified e-waste sellers with licensed material recovery specialists across Africa.
                        </p>

                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4'>
                            <div>
                                <h4 className='text-lg font-bold text-slate-900 mb-2'>Continental Reach</h4>
                                <p className='leading-relaxed'>Enabling seamless e-waste material recovery across key African borders.</p>
                            </div>
                            <div>
                                <h4 className='text-lg font-bold text-slate-900 mb-2'>Verified Only</h4>
                                <p className='leading-relaxed'>Stringent vetting for all recyclers, collectors, and corporate participants.</p>
                            </div>
                        </div>
                    </div>

                    {/* Wide CTA Button (matching screenshot) */}
                    <button
                        onClick={() => router.push('/marketplace')}
                        className='bg-[#00D166] hover:bg-[#00B859] text-white rounded-2xl w-full max-w-[480px] py-6 px-8 flex justify-between items-center text-xl font-bold transition-all duration-300 shadow-xl shadow-[#00D166]/20 group'
                    >
                        <span>Explore Marketplace</span>
                        <ArrowRight size={24} className='group-hover:translate-x-2 transition-transform duration-300' />
                    </button>
                </div>

                {/* Right Side: Image */}
                <div className='relative w-full aspect-square md:aspect-[4/3] lg:aspect-square z-10'>
                    <div className='absolute inset-0 flex items-center justify-center mix-blend-multiply opacity-90 hover:opacity-100 transition-opacity duration-500'>
                        <Image
                            src={assets.hero_product_img1}
                            alt="Go-cycle Marketplace Ecosystem"
                            fill
                            className='object-contain scale-110 drop-shadow-2xl'
                            priority
                        />
                    </div>
                </div>

            </div>
        </section>
    )
}

export default MarketplaceOverview

