'use client'
import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, Zap, ShieldCheck } from 'lucide-react'

const Hero = () => {
    const router = useRouter()

    return (
        <section className="relative min-h-screen bg-slate-950 overflow-hidden">
            
            {/* Background Image — Right Side (Circunomics Style) */}
            <div className="absolute inset-0">
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent z-10"></div>
                
                {/* The hero image — positioned to the right */}
                <div className="absolute top-0 right-0 w-full lg:w-[60%] h-full">
                    <Image
                        src="/slider/hero-premium.jpg"
                        alt="Battery Technology Infrastructure"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                    {/* Additional gradient blend into the dark side */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/20 to-transparent"></div>
                </div>

                {/* Subtle green ambient glow */}
                <div className="absolute bottom-[-20%] left-[10%] w-[500px] h-[500px] bg-[#00D166]/[0.04] rounded-full blur-[150px] pointer-events-none z-10"></div>
            </div>

            {/* Content */}
            <div className="max-container relative z-20 pt-40 md:pt-48 pb-20 md:pb-32 min-h-screen flex flex-col justify-between">
                
                {/* Trust Badge Row — top */}
                <div className="flex items-center gap-3 mb-8 md:mb-0">
                    <span className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">Trusted by:</span>
                    <div className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-full px-4 py-2">
                        <Zap size={14} className="text-[#00D166]" fill="currentColor" />
                        <span className="text-[11px] font-bold text-white/70 tracking-wide">Recyclers Association of Nigeria</span>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="flex-1 flex flex-col justify-center max-w-3xl">
                    
                    {/* Large Headline */}
                    <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-light text-white leading-[1.05] tracking-[-0.02em] mb-8">
                        E-waste Digital{' '}
                        <br className="hidden xl:block" />
                        <span className="text-[#00D166]">marketplace</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-white/50 font-normal leading-relaxed max-w-xl mb-12">
                        With smart price intelligence, AI enabled product verification, buyer matching and secure payments!
                    </p>
                </div>

                {/* Bottom Row — CTA Button (positioned bottom-right like Circunomics) */}
                <div className="flex items-end justify-between">
                    {/* Left: subtle trust indicators */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-2 text-white/30">
                            <ShieldCheck size={16} className="text-[#00D166]/60" />
                            <span className="text-[11px] font-semibold uppercase tracking-widest">Verified Sellers</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/30">
                            <Zap size={16} className="text-[#00D166]/60" />
                            <span className="text-[11px] font-semibold uppercase tracking-widest">Instant Matching</span>
                        </div>
                    </div>

                    {/* Right: Primary CTA */}
                    <button 
                        onClick={() => router.push('/signup')}
                        className="group flex items-center gap-3 bg-[#00D166] text-white px-10 py-5 rounded-full text-[15px] font-semibold hover:bg-[#00A350] transition-all duration-300 hover:shadow-2xl hover:shadow-[#00D166]/20 hover:-translate-y-0.5"
                    >
                        Sign Up <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    )
}

export default Hero
