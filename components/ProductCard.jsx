'use client'
import React, { useState } from 'react'
import { MapPin as MapPinIcon, ShieldCheck as ShieldCheckIcon, ArrowRight, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useSelector } from 'react-redux'

const ProductCard = ({ product, onQuickBuy }) => {
    const router = useRouter()
    const { user } = useSelector(state => state.auth)
    const isSold = product.status === 'sold' || product.inStock === false
    const [isNavigating, setIsNavigating] = useState(false)

    const getImageUrl = (image) => {
        if (!image) return '/placeholder-battery.jpg'
        if (typeof image === 'string') {
            if (image === '[object Object]') return '/placeholder-battery.jpg'
            return image
        }
        return image?.src || '/placeholder-battery.jpg'
    }

    return (
        <div
            onClick={() => { if (!isSold) router.push(`/product/${product.id}`) }}
            className={`bg-white border border-slate-200 rounded-sm overflow-hidden hover:border-[#05DF72]/65 hover:shadow-md transition-all duration-300 shadow-sm relative flex flex-col ${isSold ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} group`}
        >
            {/* Image Container */}
            <div className='relative aspect-[4/3] overflow-hidden bg-slate-50/50 flex items-center justify-center p-6 border-b border-slate-100'>
                <Image
                    src={getImageUrl(product.images?.[0])}
                    alt={product.name}
                    fill
                    className={`object-contain p-4 transition-transform duration-700 ease-out ${!isSold && 'group-hover:scale-105'} ${isSold && 'grayscale contrast-75'}`}
                />
                
                {/* Condition & Status Badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                    <div className="bg-white border border-slate-200 shadow-sm px-2 py-0.5 rounded-sm flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-sm ${isSold ? 'bg-slate-350' : 'bg-[#05DF72] animate-pulse'}`}></div>
                        <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wider">
                            {isSold ? 'Out of Market' : product.condition || 'SCRAP'}
                        </span>
                    </div>
                </div>

                {/* Region Overlay */}
                <div className="absolute top-3 right-3 z-10">
                    <div className="bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded-sm shadow-sm flex items-center gap-1.5">
                        <MapPinIcon size={10} className="text-[#05DF72]" />
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">{product.lga || 'Lagos'}</span>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className='p-5 space-y-3 flex-1 flex flex-col justify-between bg-white'>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <Zap size={11} className="text-[#05DF72]" fill="currentColor" fillOpacity={0.1} />
                        <span className="text-[9px] font-bold text-[#05DF72] uppercase tracking-wider">
                            {product.batteryType || 'BATTERY'}
                        </span>
                        {product.verified && !isSold && (
                            <div className="flex items-center gap-1 text-[9px] font-bold text-blue-600 uppercase tracking-wider ml-2">
                                <ShieldCheckIcon size={10} /> Verified
                            </div>
                        )}
                    </div>
                    <h3 className={`text-sm font-bold text-slate-900 transition-colors leading-tight line-clamp-1 group-hover:text-[#05DF72]`}>
                        {product.name}
                    </h3>
                </div>

                <div className='flex items-end justify-between pt-3 border-t border-slate-100/80'>
                    <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Market Price</span>
                        <p className={`text-base font-bold ${isSold ? 'text-slate-300' : 'text-slate-900'}`}>
                            <span className="text-[#05DF72] font-semibold">₦</span>{(product.price || 0).toLocaleString()}
                        </p>
                    </div>
                    
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isSold || isNavigating) return;
                            setIsNavigating(true);
                            if (onQuickBuy) {
                                onQuickBuy();
                                setIsNavigating(false);
                            } else {
                                router.push(`/product/${product.id}`);
                            }
                        }}
                        className={`w-9 h-9 rounded-sm border transition-colors flex items-center justify-center bg-white ${
                            isSold 
                            ? 'border-slate-100 text-slate-200' 
                            : 'border-slate-200 text-slate-500 hover:bg-[#05DF72] hover:border-[#05DF72] hover:text-slate-950 shadow-sm'
                        }`}
                    >
                        {isNavigating ? (
                            <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
                        ) : (
                            <ArrowRight size={14} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductCard
