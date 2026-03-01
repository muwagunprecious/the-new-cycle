'use client'
import { MapPinIcon, ShieldCheckIcon, ChevronRightIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'

const ProductCard = ({ product, onQuickBuy }) => {
    const [selectedDate, setSelectedDate] = useState(null)
    const [quantity, setQuantity] = useState(1)

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

    return (
        <div
            onClick={() => { router.push(`/product/${product.id}`); scrollTo(0, 0) }}
            className='premium-card group cursor-pointer'
        >
            <div className='relative h-64 overflow-hidden bg-slate-50 flex items-center justify-center p-8'>
                <Image
                    src={getImageUrl(product.images?.[0])}
                    alt={product.name}
                    width={300}
                    height={300}
                    className='object-contain w-full h-full group-hover:scale-110 transition-transform duration-700'
                    onError={(e) => { e.target.src = '/placeholder-battery.jpg' }}
                />

                {/* Condition Badge */}
                <div className="absolute top-4 left-4 z-10">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10">
                        {product.condition || 'SCRAP'}
                    </span>
                </div>

                {/* Seller LGA Overlay */}
                <div className="absolute bottom-4 right-4 z-10 translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 flex items-center gap-1.5">
                        <MapPinIcon size={10} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-700">{product.lga || 'Lagos'}</span>
                    </div>
                </div>
            </div>

            <div className='p-6'>
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-100">
                        {product.batteryType || 'BATTERY'}
                    </span>
                    {product.verified && (
                        <div className="flex items-center gap-1 text-[8px] font-black text-blue-500 uppercase tracking-widest">
                            <ShieldCheckIcon size={10} /> Verified
                        </div>
                    )}
                </div>

                <h3 className='text-base font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors'>{product.name}</h3>
                <p className='text-xs text-slate-400 mt-1 font-medium'>Available: {product.unitsAvailable || 1} units</p>

                <div className='flex items-center justify-between mt-5 pt-4 border-t border-slate-50'>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Price</span>
                        <span className='text-xl font-black text-slate-900'>{currency}{(product.price || 0).toLocaleString()}</span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onQuickBuy) onQuickBuy();
                        }}
                        className="h-10 px-4 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-2"
                    >
                        Buy Now
                        <ChevronRightIcon size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductCard
