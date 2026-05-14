'use client'
import React, { useState, useEffect } from 'react'
import { MapPin as MapPinIcon, ShieldCheck as ShieldCheckIcon, ArrowRight, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useSelector } from 'react-redux'

const ProductCard = ({ product, onQuickBuy }) => {
    const router = useRouter()
    const { user } = useSelector(state => state.auth)
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
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
            className={`premium-card group bg-white ${isSold ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
        >
            {/* Image Container */}
            <div className='relative aspect-[4/3] overflow-hidden bg-slate-50 flex items-center justify-center p-8'>
                <Image
                    src={getImageUrl(product.images?.[0])}
                    alt={product.name}
                    fill
                    className={`object-contain transition-transform duration-700 ease-out ${!isSold && 'group-hover:scale-110'} ${isSold && 'grayscale contrast-75'}`}
                />
                
                {/* Condition & Status Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <div className="glass-pill px-3 py-1.5 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isSold ? 'bg-slate-300' : 'bg-[#00D166] animate-pulse'}`}></div>
                        <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">
                            {isSold ? 'Out of Market' : product.condition || 'SCRAP'}
                        </span>
                    </div>
                </div>

                {/* Region Overlay */}
                <div className="absolute top-4 right-4 z-10">
                    <div className="bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-sm border border-black/[0.04] flex items-center gap-1.5">
                        <MapPinIcon size={10} className="text-[#00D166]" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{product.lga || 'Lagos'}</span>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className='p-6 space-y-4'>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Zap size={12} className="text-[#00D166]" fill="currentColor" fillOpacity={0.2} />
                        <span className="text-[9px] font-black text-[#00D166] uppercase tracking-[0.2em]">
                            {product.batteryType || 'BATTERY'}
                        </span>
                        {product.verified && !isSold && (
                            <div className="flex items-center gap-1 text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] ml-2">
                                <ShieldCheckIcon size={10} /> Verified
                            </div>
                        )}
                    </div>
                    <h3 className={`text-base font-extrabold text-slate-950 transition-colors leading-tight line-clamp-1 ${!isSold && 'group-hover:text-[#00D166]'}`}>
                        {product.name}
                    </h3>
                </div>

                <div className='flex items-end justify-between pt-4 border-t border-slate-50'>
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Market Price</span>
                        <p className={`text-xl font-black ${isSold ? 'text-slate-300' : 'text-slate-950'}`}>
                            <span className="text-[#00D166]">₦</span>{(product.price || 0).toLocaleString()}
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
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                            isSold 
                            ? 'bg-slate-50 text-slate-200' 
                            : 'bg-slate-50 text-slate-400 group-hover:bg-[#00D166] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#00D166]/20'
                        }`}
                    >
                        {isNavigating ? (
                            <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
                        ) : (
                            <ArrowRight size={18} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductCard

