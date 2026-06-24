'use client'
import React, { useState, useMemo, useEffect } from 'react'
import ProductCard from './ProductCard'
import { lagosLGAs } from '@/assets/assets'
import { MapPin as MapPinIcon, LayoutGrid, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

const LatestProducts = ({ initialProducts = [] }) => {
    const router = useRouter()
    const [products, setProducts] = useState(initialProducts)
    const [selectedLGA, setSelectedLGA] = useState('All')
    const [localBoughtIds, setLocalBoughtIds] = useState([])

    useEffect(() => {
        try {
            const bought = JSON.parse(localStorage.getItem('gocycle_bought_products') || '[]')
            setLocalBoughtIds(bought)
        } catch (e) {}
    }, [products])

    const filteredProducts = useMemo(() => {
        let list = [...products].filter(p => 
            p.status !== 'sold' && 
            p.inStock !== false &&
            !localBoughtIds.includes(p.id)
        )

        if (selectedLGA !== 'All') {
            return list.filter(p => p.lga === selectedLGA || (p.address && p.address.includes(selectedLGA)))
        }
        return list
    }, [products, selectedLGA, localBoughtIds])

    return (
        <section className='bg-slate-50/40 py-20 md:py-28 border-y border-slate-200/60'>
            <div className='max-container'>
                
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-12">
                    <div className="space-y-4 max-w-2xl">
                        <div className='inline-flex items-center gap-2 bg-[#05DF72]/10 border border-[#05DF72]/20 text-[#05DF72] px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider w-fit'>
                            <LayoutGrid size={12} />
                            Marketplace
                        </div>
                        <h2 className='text-2xl md:text-4xl font-bold tracking-tight text-slate-900'>
                            Latest <span className="text-[#05DF72]">Assets</span> in Market.
                        </h2>
                        <p className='text-slate-500 text-sm md:text-base leading-relaxed'>
                            Explore verified end-of-life batteries available for immediate trade and material recovery. Browse newest listings across Lagos.
                        </p>
                    </div>

                    {/* Premium Filter */}
                    <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-sm border border-slate-200 w-full lg:w-auto shadow-sm group focus-within:border-[#05DF72] transition-all">
                        <div className="flex items-center gap-2 text-slate-400 shrink-0 border-r border-slate-200 pr-3 mr-1">
                            <MapPinIcon size={16} className="group-focus-within:text-[#05DF72] transition-colors" />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Region</span>
                        </div>
                        <select
                            value={selectedLGA}
                            onChange={(e) => setSelectedLGA(e.target.value)}
                            className="bg-transparent text-xs font-semibold text-slate-800 uppercase tracking-wider outline-none w-full lg:min-w-[160px] cursor-pointer"
                        >
                            <option value="All">All Regions</option>
                            {lagosLGAs.sort().map(lga => (
                                <option key={lga} value={lga}>{lga}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8'>
                    {filteredProducts.slice(0, 8).map((product, index) => (
                        <ProductCard key={product.id || index} product={product} />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-sm border border-dashed border-slate-200 mt-12">
                        <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">No verified battery listings found in this region.</p>
                    </div>
                )}

                <div className="mt-16 flex justify-center">
                    <button 
                        onClick={() => router.push('/shop')}
                        className="group border border-slate-200 bg-white hover:bg-slate-50 text-slate-850 hover:text-slate-950 px-8 py-3.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2"
                    >
                        View All Listings <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    )
}

export default LatestProducts
