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
            <div className="max-w-xl w-full bg-white rounded-sm p-8 md:p-12 border border-slate-200 shadow-sm relative overflow-hidden group/card hover:bg-[#05DF72] hover:border-[#05DF72] transition-all duration-500">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#05DF72]/5 rounded-full blur-[80px]"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]"></div>
                
                <div className="relative z-10 flex flex-col items-center w-full">
                    <div className="w-16 h-16 bg-[#05DF72]/10 border border-[#05DF72]/20 text-[#05DF72] rounded-sm flex items-center justify-center mb-6 transition-all duration-500 group-hover/card:bg-slate-950 group-hover/card:text-white group-hover/card:border-transparent">
                        <Calculator size={32} />
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight text-center transition-colors duration-500 group-hover/card:text-slate-950">
                        Intelligent <span className="text-[#05DF72] transition-colors duration-500 group-hover/card:text-slate-950">Price Check</span>
                    </h1>
                    
                    <p className="text-slate-500 text-sm md:text-base font-medium mb-8 max-w-md text-center leading-relaxed transition-colors duration-500 group-hover/card:text-slate-900">
                        Select your battery specifications below to get a real-time estimate of its value based on our pricing formula.
                    </p>
                    
                    <div className="w-full space-y-6 bg-slate-50 p-6 rounded-sm border border-slate-200 transition-all duration-500 group-hover/card:bg-white/20 group-hover/card:border-white/10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors duration-500 group-hover/card:text-slate-900">Battery Type</label>
                            <select
                                value={batteryType}
                                onChange={(e) => setBatteryType(e.target.value)}
                                className="w-full p-4 bg-white border border-slate-200 rounded-sm outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20 font-medium text-sm transition-all shadow-sm"
                            >
                                {BATTERY_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors duration-500 group-hover/card:text-slate-900">Size (Amps)</label>
                                <select
                                    value={amps}
                                    onChange={(e) => setAmps(e.target.value)}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-sm outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20 font-medium text-sm transition-all shadow-sm"
                                >
                                    <option value="">Select Size</option>
                                    {(BATTERY_SIZE_OPTIONS[batteryType] || []).map(size => (
                                        <option key={size} value={size}>{size} Ah</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors duration-500 group-hover/card:text-slate-900">Units</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={units}
                                    onChange={(e) => setUnits(e.target.value)}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-sm outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20 font-medium text-sm transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200 mt-6 flex flex-col items-center transition-all duration-500 group-hover/card:border-white/10">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 transition-colors duration-500 group-hover/card:text-slate-900">Estimated Value</span>
                            <div className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter transition-colors duration-500 group-hover/card:text-slate-950">
                                {estimatedPrice > 0 ? (
                                    <span className="text-[#05DF72] transition-colors duration-500 group-hover/card:text-slate-950">₦{estimatedPrice.toLocaleString()}</span>
                                ) : '---'}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full">
                        <Link href="/shop" className="w-full sm:w-1/2 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-4 rounded-sm font-bold hover:bg-slate-50 transition-all duration-500 shadow-sm group-hover/card:bg-slate-950 group-hover/card:text-white group-hover/card:border-transparent">
                            <ArrowLeft size={18} />
                            Marketplace
                        </Link>
                        <Link href="/seller" className="w-full sm:w-1/2 flex items-center justify-center gap-2 bg-[#05DF72] text-slate-950 px-6 py-4 rounded-sm font-bold hover:bg-[#04c764] transition-all duration-500 shadow-sm uppercase tracking-wider text-xs group-hover/card:bg-slate-950 group-hover/card:text-white group-hover/card:hover:bg-slate-800">
                            Sell Now
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
