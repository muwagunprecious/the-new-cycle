'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, Moon, Sun } from 'lucide-react'

const slides = [
    {
        id: 1,
        badge: 'Explore the marketplace',
        title: 'AI powered e-waste market place',
        description: 'One Battery at a time!',
        primaryButton: 'Sell Battery',
        primaryLink: '/signup?role=SELLER',
        image: '/slider/hero-premium.png',
        darkBg: 'bg-slate-950',
        lightBg: 'bg-[#f8f9fa]'
    },
    {
        id: 2,
        badge: 'Explore the marketplace',
        title: 'E-Waste is Not Waste, It’s Value!',
        description: 'Turning Old Batteries into New Opportunities',
        primaryButton: 'Sell Battery',
        primaryLink: '/signup?role=SELLER',
        image: '/slider/battery2.png',
        darkBg: 'bg-black',
        lightBg: 'bg-[#f4f6f8]'
    }
]

const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isDark, setIsDark] = useState(true)
    const router = useRouter()

    // Auto-glide effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
        }, 6000) // Slide every 6 seconds
        return () => clearInterval(timer)
    }, [])

    return (
        <div className={`pt-[100px] mb-8 transition-colors duration-500 ${isDark ? 'bg-slate-950' : 'bg-[#f4f6f8]'}`}>
            {/* Toggle Button */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 flex justify-end">
                <button 
                    onClick={() => setIsDark(!isDark)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm border ${
                        isDark 
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    {isDark ? <Sun size={14} /> : <Moon size={14} />}
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
            </div>

            <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-10 overflow-hidden h-[500px] md:h-[450px]">
                {/* Slider Container */}
                <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-sm border transition-colors duration-500 flex ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 w-full h-full p-8 md:p-14 flex flex-col-reverse md:flex-row items-center justify-between transition-all duration-1000 ease-in-out ${isDark ? slide.darkBg : slide.lightBg} ${
                            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                    >
                        {/* Text Side */}
                        <div className="w-full md:w-1/2 flex flex-col space-y-6 z-20">
                            {slide.badge && (
                                <span className="text-emerald-500 font-bold text-sm md:text-base tracking-wide">
                                    {slide.badge}
                                </span>
                            )}
                            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-black leading-tight transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {slide.title}
                            </h1>
                            <p className={`text-sm md:text-base font-medium max-w-md hidden sm:block transition-colors duration-500 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                                {slide.description}
                            </p>
                            
                            <div className="flex items-center gap-4 pt-2">
                                <button
                                    onClick={() => router.push(slide.primaryLink)}
                                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold transition-all shadow-md active:scale-95"
                                >
                                    {slide.primaryButton}
                                </button>
                                {slide.secondaryButton && (
                                    <button
                                        onClick={() => router.push(slide.secondaryLink)}
                                        className={`flex items-center gap-2 px-4 py-3 font-bold transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
                                    >
                                        {slide.secondaryButton} <ArrowRight size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Image Side */}
                        <div className="w-full md:w-1/2 h-48 md:h-full relative flex items-center justify-center mb-6 md:mb-0">
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                className="object-contain drop-shadow-xl"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority={index === 0}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`transition-all duration-300 rounded-full ${
                            index === currentSlide 
                            ? 'w-6 h-2 bg-emerald-500' 
                            : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
            </div>
        </div>
    )
}

export default HeroSlider
