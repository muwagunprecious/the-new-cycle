'use client'
import { ArrowRight, InfoIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const ProductDescription = ({ product }) => {
    const [selectedTab, setSelectedTab] = useState('Description')

    const tabs = ['Description', 'Specifications', 'Seller Notes']

    return (
        <div className="my-16">
            {/* Tab Bar */}
            <div className="flex items-center gap-12 border-b border-slate-100">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`pb-6 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${selectedTab === tab
                                ? 'text-slate-900 border-b-2 border-emerald-500'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        {tab}
                        {selectedTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Content Section */}
            <div className="mt-12 min-h-[200px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                {selectedTab === 'Description' && (
                    <div className="max-w-3xl">
                        <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-line font-medium">
                            {product.description || 'No detailed description available for this verified battery.'}
                        </p>
                    </div>
                )}

                {selectedTab === 'Specifications' && (
                    <div className="max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-8 bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
                        <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Model capacity</span>
                            <p className="font-black text-slate-900">{product.amps} Ah</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Battery Technology</span>
                            <p className="font-black text-slate-900">{product.batteryType}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Current Condition</span>
                            <p className="font-black text-slate-900 text-amber-600">{product.condition}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">GoCycle Verified</span>
                            <p className="font-black text-emerald-600">Yes</p>
                        </div>
                    </div>
                )}

                {selectedTab === 'Seller Notes' && (
                    <div className="max-w-3xl flex items-start gap-4 p-8 bg-amber-50 rounded-[2rem] border border-amber-100">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                            <InfoIcon className="text-amber-600" size={20} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">A Note from the Seller</h4>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                This battery has been inspected and verified by our logistics team. The seller confirms that the condition is {product.condition?.toLowerCase()} and meets the GoCycle quality guidelines.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductDescription