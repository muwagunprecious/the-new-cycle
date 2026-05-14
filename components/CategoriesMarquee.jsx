'use client'
import React from 'react'
import { categories } from "@/assets/assets"

const CategoriesMarquee = () => {
    return (
        <div className="relative w-full overflow-hidden py-10 md:py-20 bg-white select-none group">
            {/* Gradient Fades for Smooth Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

            <div className="flex animate-[marqueeScroll_40s_linear_infinite] group-hover:[animation-play-state:paused] whitespace-nowrap gap-6 items-center">
                {[...categories, ...categories, ...categories, ...categories].map((cat, index) => (
                    <div 
                        key={index}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-slate-50 border border-black/[0.03] rounded-full text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:border-[#00D166]/30 hover:text-[#00D166] hover:bg-[#00D166]/5 transition-all duration-500 cursor-default"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00D166]/40"></div>
                        {cat}
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @keyframes marqueeScroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    )
}

export default CategoriesMarquee

