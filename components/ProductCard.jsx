'use client'
import { MapPinIcon, BatteryIcon, BoxIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useDispatch } from 'react-redux'
import { showLoader, hideLoader } from '@/lib/features/ui/uiSlice'

/**
 * ProductCard - Display battery product in marketplace grid
 * 
 * No discounts, ratings, reviews, or carbon metrics as per requirements
 */
const ProductCard = ({ product }) => {
    const router = useRouter()
    const dispatch = useDispatch()
    const currency = '₦'

    const handleViewDetails = (e) => {
        e.preventDefault()
        dispatch(showLoader("Loading product details..."))

        // Simulated delay
        setTimeout(() => {
            dispatch(hideLoader())
            router.push(`/product/${product.id}`)
        }, Math.random() * (1200 - 800) + 800)
    }

    return (
        <div onClick={handleViewDetails} className='group block cursor-pointer'>
            <div className='bg-slate-50 aspect-square rounded-[2rem] flex items-center justify-center relative overflow-hidden border border-slate-100 group-hover:border-[#05DF72]/30 transition-all duration-500'>
                <Image
                    width={500}
                    height={500}
                    className='w-2/3 h-auto group-hover:scale-110 transition duration-700 relative z-10'
                    src={product.images?.[0] || '/placeholder-battery.jpg'}
                    alt={product.name}
                />

                {/* Condition Badge */}
                <div className="absolute top-4 left-4 z-20">
                    <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-full">
                        {product.condition || 'SCRAP'}
                    </span>
                </div>

                {/* Battery Type Badge */}
                <div className="absolute top-4 right-4 z-20">
                    <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-[9px] font-bold px-2 py-1 rounded-full border border-slate-200">
                        {product.batteryType || product.category}
                    </span>
                </div>

                <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 w-32 h-32 bg-[#05DF72]/5 rounded-full blur-[40px]"></div>
            </div>

            <div className='mt-4 px-2'>
                {/* Location */}
                <div className='flex items-center gap-1 text-slate-500 mb-1'>
                    <MapPinIcon size={12} />
                    <span className='text-[10px] font-semibold'>{product.lga || 'Lagos'}</span>
                </div>

                {/* Name */}
                <p className='font-bold text-slate-900 group-hover:text-[#05DF72] transition-colors line-clamp-1'>
                    {product.name}
                </p>

                {/* Units Available */}
                <div className='flex items-center gap-1 mt-1.5 text-slate-400'>
                    <BoxIcon size={12} />
                    <span className='text-[10px] font-semibold'>
                        {product.unitsAvailable || 1} unit(s) available
                    </span>
                </div>

                {/* Price & View Button */}
                <div className="mt-4 flex items-center justify-between">
                    <p className='font-black text-lg text-slate-900 leading-none'>
                        {currency}{(product.price || 0).toLocaleString()}
                    </p>
                    <span className="text-[10px] font-black text-slate-400 border border-slate-200 px-2 py-1 rounded-md group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all">
                        VIEW
                    </span>
                </div>
            </div>
        </div>
    )
}

export default ProductCard
