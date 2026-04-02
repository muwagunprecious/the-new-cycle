'use client'
import { assets } from '@/assets/assets'
import { ArrowRight as ArrowRightIcon, ChevronRight as ChevronRightIcon, Leaf as LeafIcon, Recycle as RecycleIcon, Zap as ZapIcon, ShieldCheck as ShieldCheckIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'

const Hero = () => {
    const router = useRouter()

    return (
        <div className='bg-slate-950 pt-28 pb-20'>
            <div className='max-w-[1200px] mx-auto px-6'>
                {/* Hero Section Card */}
                <div className='relative overflow-hidden rounded-[24px] bg-white/[0.03] border border-white/[0.05] p-8 md:p-16 lg:p-24 shadow-[0_20px_50px_rgba(0,0,0,0.2)]'>

                    {/* Minimal Glow */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-[100px] -mr-40 -mt-40"></div>

                    <div className='relative z-10 flex flex-col lg:flex-row items-center gap-16'>

                        {/* Text Content */}
                        <div className='flex-1 space-y-10'>
                            <div className='inline-flex items-center gap-2.5 bg-white/[0.05] border border-white/[0.08] text-emerald-400 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm'>
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Africa’s e-waste market place
                            </div>

                            <div className='space-y-6'>
                                <h1 className='text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.9] tracking-tighter uppercase'>
                                    Powering Africa’s<br />
                                    <span className="text-emerald-500">Circular Economy</span>
                                </h1>
                                <p className='text-xl md:text-2xl text-slate-400 font-semibold tracking-tight uppercase'>
                                    One battery at a time
                                </p>
                            </div>

                            <p className='text-slate-400 text-lg md:text-xl max-w-lg font-normal leading-relaxed opacity-90'>
                                List your end-of-life batteries easily for quick liquidity, fast transactions, and secure payments via a verified marketplace.
                            </p>

                            <div className="flex flex-wrap gap-5 pt-4">
                                <button
                                    onClick={() => router.push('/signup?role=BUYER')}
                                    className='px-10 py-4 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-emerald-500/20 active:scale-95'
                                >
                                    Join as Buyer
                                </button>
                                <button
                                    onClick={() => router.push('/signup?role=SELLER')}
                                    className='px-10 py-4 bg-white/[0.05] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/[0.1] border border-white/[0.1] transition-all duration-300 active:scale-95'
                                >
                                    Join as Seller
                                </button>
                            </div>
                        </div>

                        {/* Visual Features */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:w-[350px] shrink-0'>
                            <div className='bg-white/[0.03] border border-white/[0.05] p-8 rounded-2xl shadow-sm hover:border-emerald-500/30 hover:-translate-y-1 transition-all group'>
                                <div className='w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors'>
                                    <ShieldCheckIcon className='text-emerald-400' size={24} />
                                </div>
                                <h3 className='text-white font-bold text-lg mb-2 uppercase tracking-tight'>Verified Buyers</h3>
                                <p className='text-slate-400 text-sm leading-relaxed'>Trade with confidence with pre-vetted recyclers across Africa.</p>
                            </div>

                            <div className='bg-white/[0.03] border border-white/[0.05] p-8 rounded-2xl shadow-sm hover:border-blue-500/30 hover:-translate-y-1 transition-all group'>
                                <div className='w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors'>
                                    <ZapIcon className='text-blue-400' size={24} />
                                </div>
                                <h3 className='text-white font-bold text-lg mb-2 uppercase tracking-tight'>Best Value</h3>
                                <p className='text-slate-400 text-sm leading-relaxed'>Advanced marketplace pricing for maximum asset liquidity.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mt-20'>
                    <div className='flex flex-col items-center gap-8'>
                        <span className='text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]'>Trusted by leading recyclers</span>
                        <div className='w-full'>
                            <CategoriesMarquee />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero
