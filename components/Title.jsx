'use client'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Title = ({ title, description, visibleButton = true, href = '' }) => {

    return (
        <div className='flex flex-col items-center space-y-4'>
            <h2 className='text-4xl md:text-5xl font-black text-slate-900 tracking-tight text-center leading-[1.1]' dangerouslySetInnerHTML={{ __html: title }}></h2>
            <div className='flex flex-col md:flex-row items-center gap-6'>
                <p className='max-w-2xl text-center text-sm md:text-base font-medium text-slate-500 leading-relaxed'>{description}</p>
                {visibleButton && (
                    <Link href={href} className='flex items-center gap-2 group text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500 bg-emerald-50 px-6 py-2.5 rounded-full hover:bg-emerald-500 hover:text-white transition-all shadow-sm'>
                        Explore Collection
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}
            </div>
            <div className="w-20 h-1.5 bg-emerald-500 rounded-full mt-4"></div>
        </div>
    )
}

export default Title
