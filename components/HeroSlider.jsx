'use client'
import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, Zap, ShieldCheck } from 'lucide-react'

const Hero = () => {
    const router = useRouter()

    return (
        <section className="relative min-h-screen bg-[#080b11] overflow-hidden">
            
            {/* Background Image — Right Side (Circunomics Style) */}
            <div className="absolute inset-0">
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#080b11] via-[#080b11]/80 to-transparent z-10"></div>
                
                {/* The hero image — positioned to the right */}
                <div className="absolute top-0 right-0 w-full lg:w-[60%] h-full">
                    <Image
                        src="/slider/hero-premium.jpg"
                        alt="Battery Technology Infrastructure"
                        fill
                        className="object-cover object-center opacity-85"
                        priority
                    />
                    {/* Additional gradient blend into the dark side */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#080b11] via-[#080b11]/30 to-transparent"></div>
                </div>
            </div>

            {/* Content */}
            <div className="max-container relative z-20 pt-40 md:pt-48 pb-20 md:pb-32 min-h-screen flex flex-col justify-between">
                
                {/* Trust Badge Row — top */}
                <div className="flex items-center gap-3 mb-8 md:mb-0">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trusted by:</span>
                    <div className="flex items-center gap-2 bg-[#0c101b] border border-slate-800 rounded-sm px-3.5 py-1.5">
                        <Zap size={12} className="text-[#05DF72]" fill="currentColor" />
                        <span className="text-[10px] font-bold text-white tracking-wider uppercase">Recyclers Association of Nigeria</span>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="flex-1 flex flex-col justify-center max-w-3xl">
                    
                    {/* Large Headline */}
                    <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-light text-white leading-[1.05] tracking-[-0.02em] mb-8">
                        E-waste Digital{' '}
                        <br className="hidden xl:block" />
                        <span className="text-[#05DF72]">marketplace</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-slate-400 font-normal leading-relaxed max-w-xl mb-12">
                        With smart price intelligence, AI enabled product verification, buyer matching and secure payments!
                    </p>
                </div>

                {/* Bottom Row — CTA Button (positioned bottom-right like Circunomics) */}
                <div className="flex items-end justify-between">
                    {/* Left: subtle trust indicators */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-2 text-slate-500">
                            <ShieldCheck size={14} className="text-[#05DF72]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Verified Sellers</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                            <Zap size={14} className="text-[#05DF72]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Instant Matching</span>
                        </div>
                    </div>

                    {/* Right: Primary CTA */}
                    <button 
                        onClick={() => router.push('/signup')}
                        className="group flex items-center gap-2 bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] text-slate-950 px-8 py-3.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                    >
                        Sign Up <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    )
}

export default Hero
