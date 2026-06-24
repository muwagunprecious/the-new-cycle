'use client'
import React from 'react'
import { categories } from "@/assets/assets"

const CategoriesMarquee = () => {
    return (
        <div className="relative w-full overflow-hidden py-10 md:py-16 bg-white select-none group">
            {/* Gradient Fades for Smooth Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

            <div className="flex animate-[marqueeScroll_40s_linear_infinite] group-hover:[animation-play-state:paused] whitespace-nowrap gap-6 items-center">
                {[...categories, ...categories, ...categories, ...categories].map((cat, index) => (
                    <div 
                        key={index}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-sm text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:border-[#05DF72]/65 hover:text-[#05DF72] hover:bg-[#05DF72]/5 transition-all duration-500 cursor-default shadow-sm"
                    >
                        <div className="w-1.5 h-1.5 rounded-sm bg-[#05DF72]/45"></div>
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
