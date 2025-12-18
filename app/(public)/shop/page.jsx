'use client'
import { Suspense, useState, useEffect } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon, MapPin, FilterIcon, ChevronDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"
import { ProductCardSkeleton } from "@/components/Skeleton"

const LAGOS_LGAS = [
    "Alimosho", "Ajeromi-Ifelodun", "Kosofe", "Mushin", "Oshodi-Isolo",
    "Ojo", "Ikorodu", "Surulere", "Agege", "Ifako-Ijaiye",
    "Somolu", "Amuwo-Odofin", "Lagos Island", "Lagos Mainland", "Ikeja",
    "Eti-Osa", "Badagry", "Apapa", "Epe", "Ibeju-Lekki"
]

function ShopContent() {
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()
    const products = useSelector(state => state.product.list)

    const [loading, setLoading] = useState(false)
    const [activeLga, setActiveLga] = useState('All')
    const [filteredProducts, setFilteredProducts] = useState(products)

    useEffect(() => {
        let result = products
        if (search) {
            result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        }
        if (activeLga !== 'All') {
            // Simulated per-LGA filtering
            // Note: in a real app products would have an LGA field
            result = result.filter((_, i) => (i + activeLga.length) % 2 === 0)
        }
        setFilteredProducts(result)
    }, [search, activeLga, products])

    const handleLgaChange = (lga) => {
        setLoading(true)
        setActiveLga(lga)
        setTimeout(() => {
            setLoading(false)
        }, 800)
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 onClick={() => router.push('/shop')} className="text-4xl font-black text-slate-900 flex items-center gap-4 cursor-pointer">
                            {search && <MoveLeftIcon size={24} className="text-[#05DF72]" />}
                            Browse <span className="text-[#05DF72]">Marketplace</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">Showing verified battery listings across Lagos State.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-[#05DF72]/20 transition-all">
                            <MapPin size={18} className="text-[#05DF72]" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Lagos State</span>
                                <select
                                    className="bg-transparent outline-none font-bold text-slate-700 text-sm appearance-none pr-6 cursor-pointer"
                                    value={activeLga}
                                    onChange={(e) => handleLgaChange(e.target.value)}
                                >
                                    <option value="All">All LGAs</option>
                                    {LAGOS_LGAS.sort().map(lga => (
                                        <option key={lga} value={lga}>{lga}</option>
                                    ))}
                                </select>
                            </div>
                            <ChevronDown size={14} className="text-slate-400 -ml-4" />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 mb-32">
                        {Array(8).fill('').map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                ) : (
                    <>
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 mb-32">
                                {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 mb-32">
                                <div className="size-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <FilterIcon size={32} className="text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">No products found</h3>
                                <p className="text-slate-500 font-medium mt-2">Try adjusting your filters or search terms.</p>
                                <button onClick={() => { setActiveLga('All'); router.push('/shop') }} className="mt-8 text-[#05DF72] font-black uppercase tracking-widest text-[10px] hover:underline">Reset All Filters</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}


export default function Shop() {
    return (
        <Suspense fallback={<div>Loading shop...</div>}>
            <ShopContent />
        </Suspense>
    );
}