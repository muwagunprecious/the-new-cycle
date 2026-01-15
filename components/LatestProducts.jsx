'use client'
import React, { useState, useMemo, useEffect } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { lagosLGAs } from '@/assets/assets'
import { MapPinIcon, FilterIcon } from 'lucide-react'
import { getAllProducts } from '@/backend/actions/product'
import Loading from './Loading'

const LatestProducts = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedLGA, setSelectedLGA] = useState('All')

    useEffect(() => {
        const fetchProducts = async () => {
            const result = await getAllProducts()
            if (result.success) {
                setProducts(result.products)
            }
            setLoading(false)
        }
        fetchProducts()
    }, [])

    const filteredProducts = useMemo(() => {
        let list = [...products] // Already sorted by backend

        if (selectedLGA !== 'All') {
            // Check pickupAddress or store address? Using product.pickupAddress as mostly relevant
            return list.filter(p => p.pickupAddress && p.pickupAddress.includes(selectedLGA))
        }
        return list
    }, [products, selectedLGA])

    const displayQuantity = 8

    if (loading) return <div className="py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#05DF72] mx-auto"></div></div>

    return (
        <div className='px-6 my-32 max-w-7xl mx-auto'>
            <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
                <div className="flex-1">
                    <Title title='Marketplace <span className="text-[#05DF72]">Arrivals</span>' description="Browse our newest verified listings from trusted eco-vendors across Lagos." href='/shop' />
                </div>

                <div className="flex items-center gap-4 bg-white p-3 px-6 rounded-[2rem] shadow-sm border border-slate-100 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-slate-400 shrink-0 border-r border-slate-100 pr-4 mr-2">
                        <MapPinIcon size={18} />
                        <span className="text-sm font-bold text-slate-900">Lagos</span>
                    </div>
                    <div className="flex items-center gap-3 w-full">
                        <FilterIcon size={16} className="text-slate-400" />
                        <select
                            value={selectedLGA}
                            onChange={(e) => setSelectedLGA(e.target.value)}
                            className="bg-transparent text-sm font-medium text-slate-700 outline-none w-full min-w-[150px] cursor-pointer"
                        >
                            <option value="All">All Local Governments</option>
                            {lagosLGAs.sort().map(lga => (
                                <option key={lga} value={lga}>{lga}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
                {filteredProducts.slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={product.id || index} product={product} />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-3xl mt-12 border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No verified battery listings available yet.</p>
                </div>
            )}
        </div>
    )
}

export default LatestProducts
