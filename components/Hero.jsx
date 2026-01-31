'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRightIcon, LeafIcon, RecycleIcon, ZapIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'

const Hero = () => {
    const router = useRouter()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

    return (
        <div className='mx-6'>
            <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-14'>
                <div className='relative flex-1 flex flex-col bg-[#05DF72]/10 border border-[#05DF72]/20 rounded-[2.5rem] xl:min-h-[500px] group overflow-hidden'>
                    <div className='p-8 sm:p-20 relative z-10'>
                        <div className='inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm text-[#05DF72] pr-5 p-1.5 rounded-full text-xs sm:text-sm font-bold shadow-sm border border-[#05DF72]/10'>
                            Nigeria's #1 Battery Marketplace <ChevronRightIcon className='group-hover:translate-x-1 transition-all' size={16} />
                        </div>
                        <h2 className='text-4xl sm:text-6xl leading-[1.1] my-8 font-black text-slate-900 max-w-md'>
                            Powering the <span className="text-[#05DF72]">Future</span>. Recycled.
                        </h2>
                        <p className='text-slate-500 text-lg max-w-sm mb-10 leading-relaxed font-medium'>
                            Buy and sell high-quality used batteries. Join the circular economy and save up to 60% on power costs.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button onClick={() => router.push('/shop')} className='bg-slate-900 text-white text-sm font-bold py-4 px-10 rounded-2xl hover:bg-[#05DF72] hover:scale-105 active:scale-95 transition-all shadow-xl'>BUY</button>
                            <button onClick={() => router.push('/seller')} className='bg-white text-slate-900 text-sm font-bold py-4 px-10 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all'>SELL</button>
                        </div>
                    </div>
                    {/* Abstract circular shapes for tech feel */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#05DF72]/5 rounded-full blur-[100px] -mr-40 -mt-20"></div>
                </div>

                <div className='flex flex-col md:flex-row xl:flex-col gap-6 w-full xl:max-w-sm'>
                    <div className='flex-1 flex flex-col justify-between bg-slate-900 rounded-[2.5rem] p-10 group relative overflow-hidden'>
                        <div className="relative z-10">
                            <ZapIcon className="text-[#05DF72] mb-4" size={32} />
                            <p className='text-2xl font-bold text-white'>Certified Sellers</p>
                            <p className='text-slate-400 text-sm mt-3 leading-relaxed'>All vendors are verified by GoCycle for quality assurance.</p>
                            <p className='flex items-center gap-2 mt-6 text-[#05DF72] font-bold text-sm'>Learn more <ArrowRightIcon className='group-hover:translate-x-1 transition-all' size={16} /> </p>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#05DF72]/20 blur-[60px]"></div>
                    </div>

                    <div className='flex-1 flex flex-col justify-between bg-white border border-slate-100 rounded-[2.5rem] p-10 group shadow-sm'>
                        <RecycleIcon className="text-blue-500 mb-4" size={32} />
                        <div>
                            <p className='text-2xl font-bold text-slate-900'>Scrap Rewards</p>
                            <p className='text-slate-500 text-sm mt-3 leading-relaxed'>Turn your old lead-acid batteries into instant cash credit.</p>
                            <p className='flex items-center gap-2 mt-6 text-blue-500 font-bold text-sm'>Check pricing <ArrowRightIcon className='group-hover:translate-x-1 transition-all' size={16} /> </p>
                        </div>
                    </div>
                </div>
            </div>
            <CategoriesMarquee />
        </div>
    )
}

export default Hero
