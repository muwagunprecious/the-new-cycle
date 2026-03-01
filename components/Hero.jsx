'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRightIcon, LeafIcon, RecycleIcon, ZapIcon, ShieldCheckIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'

const Hero = () => {
    const router = useRouter()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

    return (
        <div className='px-6 lg:px-10 mt-6 mb-20'>
            <div className='max-w-7xl mx-auto'>
                {/* Hero Gradient Background Overlay */}
                <div className='relative overflow-hidden rounded-[3rem] bg-slate-950 border border-white/5 shadow-2xl'>

                    {/* Animated Glow Elements */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -ml-20 -mb-20"></div>

                    <div className='relative z-10 flex flex-col lg:flex-row items-center min-h-[500px] lg:min-h-[550px]'>

                        {/* Text Content Area */}
                        <div className='flex-1 p-10 md:p-16 lg:p-24 space-y-8'>
                            <div className='inline-flex items-center gap-3 bg-white/5 backdrop-blur-md text-emerald-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10'>
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></span>
                                Nigeria's Verified Battery Hub
                            </div>

                            <h1 className='text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter'>
                                Reliable Power.<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">
                                    Circular Future.
                                </span>
                            </h1>

                            <p className='text-slate-400 text-base md:text-lg max-w-md font-medium leading-relaxed'>
                                Buy, sell, and recycle used batteries with absolute trust. Save up to 60% on energy costs while protecting the planet.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <button
                                    onClick={() => router.push('/shop')}
                                    className='px-10 py-4 bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95'
                                >
                                    Explore Marketplace
                                </button>
                                <button
                                    onClick={() => router.push('/seller')}
                                    className='px-10 py-4 bg-white/5 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 border border-white/10 transition-all backdrop-blur-sm active:scale-95'
                                >
                                    Partner With Us
                                </button>
                            </div>
                        </div>

                        {/* Right Visual Side - Compact Features */}
                        <div className='lg:w-1/3 w-full bg-white/5 backdrop-blur-xl border-l border-white/10 p-10 md:p-16 flex flex-col justify-center gap-10'>
                            <div className='space-y-4 group'>
                                <div className='w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform'>
                                    <ShieldCheckIcon className='text-emerald-400' size={24} />
                                </div>
                                <h3 className='text-white font-black text-lg uppercase tracking-tight'>QC Verified</h3>
                                <p className='text-slate-400 text-xs font-medium leading-relaxed'>Every merchant passes a multi-step identity & quality audit.</p>
                            </div>

                            <div className='space-y-4 group'>
                                <div className='w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform'>
                                    <RecycleIcon className='text-blue-400' size={24} />
                                </div>
                                <h3 className='text-white font-black text-lg uppercase tracking-tight'>Eco-Credit</h3>
                                <p className='text-slate-400 text-xs font-medium leading-relaxed'>Trade in your scrap units for instant marketplace balance.</p>
                            </div>

                            <div className='flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest pt-6 border-t border-white/5'>
                                <ZapIcon size={14} /> 5k+ Batteries Recycled
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mt-12'>
                    <CategoriesMarquee />
                </div>
            </div>
        </div>
    )
}

export default Hero
