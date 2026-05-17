'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Calculator } from 'lucide-react'
import Link from 'next/link'
import { BATTERY_TYPES, BATTERY_SIZE_OPTIONS, DEFAULT_BATTERY_PRICES } from '@/lib/pricing'
import { getPricingConfig } from '@/backend-actions/actions/settings'

export default function PriceCheck() {
    const [batteryType, setBatteryType] = useState(BATTERY_TYPES[0])
    const [amps, setAmps] = useState('')
    const [units, setUnits] = useState(1)
    const [batteryPrices, setBatteryPrices] = useState(DEFAULT_BATTERY_PRICES)
    const [estimatedPrice, setEstimatedPrice] = useState(0)

    useEffect(() => {
        getPricingConfig().then(res => {
            if (res.success && res.data) setBatteryPrices(res.data)
        })
    }, [])

    useEffect(() => {
        // Reset amps when battery type changes if not valid
        if (batteryType && (!BATTERY_SIZE_OPTIONS[batteryType]?.includes(amps))) {
            setAmps('')
        }
    }, [batteryType, amps])

    useEffect(() => {
        if (batteryType && amps && units > 0) {
            const priceList = batteryPrices[batteryType]
            const suggestedPerUnit = priceList ? (priceList[amps] || 0) : 0
            setEstimatedPrice(suggestedPerUnit * parseInt(units))
        } else {
            setEstimatedPrice(0)
        }
    }, [batteryType, amps, units, batteryPrices])

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 pt-32">
            <div className="max-w-3xl w-full bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#00D166]/10 rounded-full blur-[80px]"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
                
                <div className="relative z-10 flex flex-col items-center w-full">
                    <div className="w-20 h-20 bg-[#00D166]/10 rounded-3xl flex items-center justify-center mb-6 text-[#00D166] shadow-inner">
                        <Calculator size={40} />
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight text-center">
                        Intelligent <span className="text-[#00D166]">Price Check</span>
                    </h1>
                    
                    <p className="text-slate-500 text-base md:text-lg font-medium mb-10 max-w-xl text-center leading-relaxed">
                        Select your battery specifications below to get a real-time estimate of its value based on our pricing formula.
                    </p>
                    
                    <div className="w-full max-w-lg space-y-6 bg-slate-50 p-8 rounded-3xl border border-slate-100">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Battery Type</label>
                            <select
                                value={batteryType}
                                onChange={(e) => setBatteryType(e.target.value)}
                                className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#00D166]/20 font-medium text-sm transition-all shadow-sm"
                            >
                                {BATTERY_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Size (Amps)</label>
                                <select
                                    value={amps}
                                    onChange={(e) => setAmps(e.target.value)}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#00D166]/20 font-medium text-sm transition-all shadow-sm"
                                >
                                    <option value="">Select Size</option>
                                    {(BATTERY_SIZE_OPTIONS[batteryType] || []).map(size => (
                                        <option key={size} value={size}>{size} Ah</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Units</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={units}
                                    onChange={(e) => setUnits(e.target.value)}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#00D166]/20 font-medium text-sm transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200 mt-6 flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Estimated Value</span>
                            <div className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                                {estimatedPrice > 0 ? `₦${estimatedPrice.toLocaleString()}` : '---'}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full max-w-lg">
                        <Link href="/shop" className="w-full sm:w-1/2 flex items-center justify-center gap-2 bg-slate-100 text-slate-600 px-6 py-4 rounded-full font-bold hover:bg-slate-200 transition-all duration-300">
                            <ArrowLeft size={18} />
                            Marketplace
                        </Link>
                        <Link href="/seller" className="w-full sm:w-1/2 flex items-center justify-center gap-2 bg-[#00D166] text-white px-6 py-4 rounded-full font-bold hover:bg-[#00A350] transition-all duration-300 shadow-lg shadow-[#00D166]/25">
                            Sell Now
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
