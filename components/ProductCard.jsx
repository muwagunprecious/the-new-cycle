'use client'
import { MapPin as MapPinIcon, ShieldCheck as ShieldCheckIcon, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

const ProductCard = ({ product, onQuickBuy }) => {
    const [selectedDate, setSelectedDate] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const { user } = useSelector(state => state.auth)
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

    // Pre-select first date for 1-minute checkout
    useEffect(() => {
        if (product && product.collectionDates && product.collectionDates.length > 0) {
            setSelectedDate(product.collectionDates[0])
        }
    }, [product])

    const router = useRouter()
    const currency = '₦'

    const getImageUrl = (image) => {
        if (!image) return '/placeholder-battery.jpg'
        if (typeof image === 'string') {
            if (image === '[object Object]') return '/placeholder-battery.jpg'
            return image
        }
        if (typeof image === 'object' && image.src) return image.src
        return '/placeholder-battery.jpg'
    }

    const isSold = product.status === 'sold' || product.inStock === false

    return (
        <div
            onClick={() => { if (!isSold) router.push(`/product/${product.id}`) }}
            className={`premium-card group ${isSold ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
        >
            {/* Same content as before, just fixing structure */}
            <div className='relative h-48 sm:h-64 overflow-hidden bg-slate-50 flex items-center justify-center p-4 sm:p-8'>
                <div className={`w-full h-full relative ${isSold ? 'grayscale italic' : ''}`}>
                    <Image
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        fill
                        className='object-contain group-hover:scale-110 transition-transform duration-700'
                        onError={(e) => { e.target.src = '/placeholder-battery.jpg' }}
                    />
                </div>

                {/* Condition Badge */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10">
                        {product.condition || 'SCRAP'}
                    </span>
                    {isSold && (
                        <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-red-400/50 shadow-lg shadow-red-500/20 animate-pulse">
                            BOUGHT / SOLD
                        </span>
                    )}
                </div>

                {/* Seller LGA Overlay */}
                <div className="absolute bottom-4 right-4 z-10 translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 flex items-center gap-1.5">
                        <MapPinIcon size={10} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-700">{product.lga || 'Lagos'}</span>
                    </div>
                </div>
            </div>

            <div className='p-4 sm:p-6'>
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-100">
                        {product.batteryType || 'BATTERY'}
                    </span>
                    {product.verified && !isSold && (
                        <div className="flex items-center gap-1 text-[8px] font-black text-blue-500 uppercase tracking-widest">
                            <ShieldCheckIcon size={10} /> Verified
                        </div>
                    )}
                </div>

                <h3 className={`text-sm sm:text-base font-bold text-slate-900 line-clamp-1 transition-colors ${isSold ? 'text-slate-400' : 'group-hover:text-emerald-600'}`}>{product.name}</h3>
                <p className='text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 font-medium'>
                    {isSold ? 'Status: Out of Market' : `Available: ${product.unitsAvailable || 1} units`}
                </p>

                <div className='flex flex-row items-center justify-between mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-50 gap-2'>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[7px] sm:text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Price</span>
                        <span className={`text-sm sm:text-xl font-black truncate ${isSold ? 'text-slate-300' : 'text-slate-900'}`}>{currency}{(product.price || 0).toLocaleString()}</span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isSold) return;
                            if (onQuickBuy) {
                                onQuickBuy();
                            } else {
                                router.push(`/product/${product.id}`);
                            }
                        }}
                        disabled={isSold}
                        className={`h-8 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1 sm:gap-2 shrink-0 ${
                            isSold 
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                            : isAdmin
                            ? 'bg-slate-50 text-slate-400 cursor-default border border-slate-100'
                            : 'bg-slate-900 text-white hover:bg-emerald-500 shadow-lg shadow-slate-900/10'
                        }`}
                    >
                        {isSold ? 'Sold' : isAdmin ? 'Admin Mode' : 'Buy Now'}
                        {!isSold && !isAdmin && <ChevronRightIcon size={12} className='sm:w-3.5 sm:h-3.5' />}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductCard
