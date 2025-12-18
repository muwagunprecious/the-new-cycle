'use client'
import { StarIcon, ShieldCheckIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useDispatch } from 'react-redux'
import { showLoader, hideLoader } from '@/lib/features/ui/uiSlice'

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

    // calculate the average rating of the product
    const rating = product.rating?.length > 0 ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length) : 0;

    return (
        <div onClick={handleViewDetails} className='group block cursor-pointer'>
            <div className='bg-slate-50 aspect-square rounded-[2rem] flex items-center justify-center relative overflow-hidden border border-slate-100 group-hover:border-[#05DF72]/30 transition-all duration-500'>
                <Image width={500} height={500} className='w-2/3 h-auto group-hover:scale-110 transition duration-700 relative z-10' src={product.images[0]} alt="" />
                <div className="absolute top-4 right-4 z-20">
                    <span className="bg-white/80 backdrop-blur-sm text-[#05DF72] p-1.5 rounded-full shadow-sm border border-slate-100 flex items-center justify-center">
                        <ShieldCheckIcon size={14} />
                    </span>
                </div>
                <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 w-32 h-32 bg-[#05DF72]/5 rounded-full blur-[40px]"></div>
            </div>

            <div className='mt-4 px-2'>
                <p className='text-[10px] font-black uppercase tracking-widest text-[#05DF72] mb-1'>{product.category}</p>
                <div className='flex justify-between items-start gap-4'>
                    <div>
                        <p className='font-bold text-slate-900 group-hover:text-[#05DF72] transition-colors line-clamp-1'>{product.name}</p>
                        <div className='flex items-center gap-0.5 mt-1.5'>
                            {Array(5).fill('').map((_, index) => (
                                <StarIcon key={index} size={10} fill={rating >= index + 1 ? "#05DF72" : "#E2E8F0"} stroke="none" />
                            ))}
                            <span className="text-[10px] text-slate-400 font-bold ml-1">({product.rating?.length || 0})</span>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                    <p className='font-black text-lg text-slate-900 leading-none'>{currency}{product.price.toLocaleString()}</p>
                    <span className="text-[10px] font-black text-slate-400 border border-slate-200 px-2 py-1 rounded-md group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all">VIEW</span>
                </div>
            </div>
        </div>
    )
}

export default ProductCard
