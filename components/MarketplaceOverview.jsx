'use client'
import React from 'react'
import Image from 'next/image'
import { assets } from '@/assets/assets'
import { ArrowRight, Globe, ShieldCheck, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

const MarketplaceOverview = () => {
    const router = useRouter()

    return (
        <section className='bg-white py-24'>
            <div className='max-w-[1200px] mx-auto px-6'>
                <div className='bg-white border border-black/[0.06] rounded-[24px] p-8 md:p-16 lg:p-24 shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative overflow-hidden group'>

                    {/* Subtle Background Detail */}
                    <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-emerald-500/[0.02] rounded-full blur-[80px] -ml-40 pointer-events-none"></div>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10'>

                        {/* Visual Side */}
                        <div className='relative'>
                            <div className='relative bg-slate-50 rounded-2xl p-3 border border-black/[0.04] overflow-hidden shadow-sm'>
                                <div className='relative rounded-xl overflow-hidden border border-black/[0.05]'>
                                    <Image
                                        src={assets.hero_product_img1}
                                        alt="Marketplace Screenshot"
                                        className='w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-700 ease-out'
                                    />
                                </div>

                                {/* Floating Badge */}
                                <div className='absolute bottom-6 right-6 bg-white p-4 rounded-xl shadow-xl border border-black/[0.05] flex items-center gap-3 animate-float'>
                                    <div className='w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600'>
                                        <Zap size={20} fill="currentColor" fillOpacity={0.2} />
                                    </div>
                                    <div className='space-y-1'>
                                        <p className='text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-600'>AI Insights</p>
                                        <p className='text-sm font-bold text-slate-900 leading-none'>Market-Ready</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Side */}
                        <div className='space-y-10'>
                            <div className='space-y-5'>
                                <div className='inline-flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.3em]'>
                                    <div className='w-6 h-[1.5px] bg-emerald-500/40'></div>
                                    Infrastructure
                                </div>
                                <div className='space-y-3'>
                                    <h2 className='text-4xl md:text-5xl font-bold text-slate-950 leading-tight uppercase tracking-tighter'>
                                        Gocycle Marketplace
                                    </h2>
                                    <p className='text-lg md:text-xl font-semibold text-slate-400 uppercase tracking-tight'>
                                        Secure digital e-waste trade
                                    </p>
                                </div>
                            </div>

                            <div className='space-y-6 text-slate-600 leading-relaxed font-normal text-lg opacity-90'>
                                <p>
                                    The Gocycle Marketplace is a digital trading platform that connects verified sellers of end-of-life batteries and electronic waste with collectors, licensed recyclers and material recovery companies.
                                </p>
                                <p>
                                    The platform ensures transparent pricing, secure escrow payments, verified market participants, and compliant recycling, enabling a trusted circular economy for e-waste across Africa.
                                </p>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-2'>
                                <div className='flex items-start gap-4 p-4 rounded-xl bg-slate-50/50 border border-black/[0.03] hover:border-emerald-500/20 transition-all group/item'>
                                    <div className='w-11 h-11 bg-white rounded-lg flex-shrink-0 flex items-center justify-center text-emerald-600 shadow-sm border border-black/[0.02]'>
                                        <Globe size={20} />
                                    </div>
                                    <div className='space-y-1.5'>
                                        <h4 className='font-bold text-slate-900 uppercase text-[10px] tracking-widest'>Across Africa</h4>
                                        <p className='text-[11px] text-slate-500 font-medium leading-relaxed'>Sustainable material recovery bridge.</p>
                                    </div>
                                </div>

                                <div className='flex items-start gap-4 p-4 rounded-xl bg-slate-50/50 border border-black/[0.03] hover:border-emerald-500/20 transition-all group/item'>
                                    <div className='w-11 h-11 bg-white rounded-lg flex-shrink-0 flex items-center justify-center text-emerald-600 shadow-sm border border-black/[0.02]'>
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div className='space-y-1.5'>
                                        <h4 className='font-bold text-slate-900 uppercase text-[10px] tracking-widest'>Licensed Only</h4>
                                        <p className='text-[11px] text-slate-500 font-medium leading-relaxed'>Verified specialists & collectors.</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/marketplace')}
                                className='group inline-flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all duration-300 shadow-xl shadow-slate-900/10'
                            >
                                Explore Marketplace <ArrowRight size={16} className='group-hover:translate-x-1 transition-transform' />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default MarketplaceOverview
