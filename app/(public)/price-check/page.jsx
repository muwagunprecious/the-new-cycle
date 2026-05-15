'use client'
import { useState, useEffect } from 'react'
import { BatteryCharging, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PriceCheck() {
    const textToType = "Intelligent Price Checking Tool is Coming Soon..."
    const [typedText, setTypedText] = useState("")
    
    useEffect(() => {
        let currentText = ""
        let currentIndex = 0
        
        const interval = setInterval(() => {
            if (currentIndex < textToType.length) {
                currentText += textToType[currentIndex]
                setTypedText(currentText)
                currentIndex++
            } else {
                clearInterval(interval)
            }
        }, 100)
        
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 pt-32">
            <div className="max-w-3xl w-full bg-white rounded-[3rem] p-10 md:p-20 shadow-2xl shadow-slate-200/50 border border-slate-100 text-center relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#00D166]/10 rounded-full blur-[80px]"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-[#00D166]/10 rounded-[2rem] flex items-center justify-center mb-8 text-[#00D166] animate-pulse shadow-inner">
                        <BatteryCharging size={48} />
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight min-h-[4rem] md:min-h-[8rem] flex items-center justify-center leading-tight">
                        {typedText}<span className="animate-bounce ml-1 text-[#00D166]">|</span>
                    </h1>
                    
                    <p className="text-slate-500 text-lg md:text-xl font-medium mb-12 max-w-xl mx-auto leading-relaxed">
                        We are currently building an advanced algorithm to give you real-time market valuations for your scrap batteries based on current LME lead prices.
                    </p>
                    
                    <Link href="/shop" className="group inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-full font-bold hover:bg-[#00D166] transition-all duration-500 hover:shadow-xl hover:shadow-[#00D166]/30">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Marketplace
                    </Link>
                </div>
            </div>
        </div>
    )
}
