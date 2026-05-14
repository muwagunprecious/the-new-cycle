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
        <section className='bg-slate-50/50 py-24 md:py-32 border-y border-slate-100'>
            <div className='max-container'>
                
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-12">
                    <div className="space-y-6 max-w-2xl">
                        <div className='inline-flex items-center gap-3 bg-white border border-black/[0.04] text-[#00D166] px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-sm'>
                            <LayoutGrid size={14} />
                            Marketplace
                        </div>
                        <h2 className='text-heading text-gradient'>
                            Latest <span className="text-[#00D166]">Assets</span> in Market.
                        </h2>
                        <p className='text-body'>
                            Explore verified end-of-life batteries available for immediate trade and material recovery. Browse newest listings across Lagos.
                        </p>
                    </div>

                    {/* Premium Filter */}
                    <div className="flex items-center gap-4 bg-white p-2.5 px-6 rounded-full border border-black/[0.04] w-full lg:w-auto shadow-premium group focus-within:ring-2 focus-within:ring-[#00D166]/10 transition-all">
                        <div className="flex items-center gap-2 text-slate-300 shrink-0 border-r border-slate-100 pr-4 mr-2">
                            <MapPinIcon size={18} className="group-focus-within:text-[#00D166] transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Region</span>
                        </div>
                        <select
                            value={selectedLGA}
                            onChange={(e) => setSelectedLGA(e.target.value)}
                            className="bg-transparent text-xs font-bold text-slate-900 uppercase tracking-widest outline-none w-full lg:min-w-[180px] cursor-pointer"
                        >
                            <option value="All">All Regions</option>
                            {lagosLGAs.sort().map(lga => (
                                <option key={lga} value={lga}>{lga}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10'>
                    {filteredProducts.slice(0, 8).map((product, index) => (
                        <ProductCard key={product.id || index} product={product} />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-slate-200 mt-12">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No verified battery listings found in this region.</p>
                    </div>
                )}

                <div className="mt-20 flex justify-center">
                    <button 
                        onClick={() => router.push('/shop')}
                        className="btn-secondary !px-12 group"
                    >
                        View All Listings <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    )
}

export default LatestProducts

