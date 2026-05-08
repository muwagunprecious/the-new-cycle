'use client'
import { Suspense, useState, useEffect, useMemo } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeft as MoveLeftIcon, MapPin, Filter as FilterIcon, ChevronDown, Battery as BatteryIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { ProductCardSkeleton } from "@/components/Skeleton"
import { lagosLGAs } from "@/assets/assets"
import { setProduct } from "@/lib/features/product/productSlice"
import CheckoutModal from "@/components/CheckoutModal"
import toast from "react-hot-toast"

function ShopClientContent({ initialProducts = [] }) {
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()
    const dispatch = useDispatch()

    const rawProducts = useSelector(state => state.product.list)
    const [localBoughtIds, setLocalBoughtIds] = useState([])
    const [activeLga, setActiveLga] = useState('All')
    const [activeType, setActiveType] = useState('All')
    
    useEffect(() => {
        // Sync SSR products to Redux on mount so cart/etc can rely on it if needed
        if (initialProducts?.length > 0) {
            dispatch(setProduct(initialProducts))
        }
    }, [initialProducts, dispatch])

    useEffect(() => {
        try {
            const bought = JSON.parse(localStorage.getItem('gocycle_bought_products') || '[]')
            setLocalBoughtIds(bought)
        } catch (e) {}
    }, [])

    // Quick Buy State
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const { isLoggedIn, user } = useSelector(state => state.auth)

    const handleQuickBuy = (product) => {
        if (!isLoggedIn) {
            toast.error("Please login to buy instantly")
            router.push('/login?redirect=/shop')
            return
        }

        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
            toast.error("Administrators are not permitted to make purchases.")
            return
        }

        if (!product.collectionDates || product.collectionDates.length === 0) {
            toast.error("This seller has no available collection dates")
            return
        }

        setSelectedProduct(product)
        setIsCheckoutOpen(true)
    }

    const batteryTypes = ["All", "Car Battery", "Inverter Battery", "Heavy Duty Battery"]

    // Use pure derived state (useMemo) instead of useEffect to filter, making it instantly responsive
    const filteredProducts = useMemo(() => {
        // Use Redux state if populated, else fallback to initialProducts
        let result = rawProducts?.length > 0 ? [...rawProducts] : [...initialProducts]

        if (search) {
            result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        }
        if (activeLga !== 'All') {
            result = result.filter(p => p.lga === activeLga || (p.pickupAddress && p.pickupAddress.includes(activeLga)))
        }
        if (activeType !== 'All') {
            result = result.filter(p => p.batteryType === activeType || p.category === activeType)
        }

        result = result.filter(p => 
            p.status !== 'sold' && 
            p.inStock !== false && 
            !localBoughtIds.includes(p.id)
        )

        result.sort((a, b) => {
            const aSold = a.status === 'sold' || a.inStock === false;
            const bSold = b.status === 'sold' || b.inStock === false;
            if (aSold && !bSold) return 1;
            if (!aSold && bSold) return -1;
            return 0;
        });

        return result
    }, [rawProducts, initialProducts, search, activeLga, activeType, localBoughtIds])

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto py-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 onClick={() => router.push('/shop')} className="text-4xl font-black text-slate-900 flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
                            {search && <MoveLeftIcon size={24} className="text-[#05DF72]" />}
                            Browse <span className="text-[#05DF72]">Marketplace</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">Showing verified battery listings across Lagos State.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-[#05DF72]/20 transition-all">
                            <BatteryIcon size={18} className="text-[#05DF72]" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Battery Type</span>
                                <select
                                    className="bg-transparent outline-none font-bold text-slate-700 text-sm appearance-none pr-6 cursor-pointer w-32"
                                    value={activeType}
                                    onChange={(e) => setActiveType(e.target.value)}
                                >
                                    {batteryTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <ChevronDown size={14} className="text-slate-400 -ml-4" />
                        </div>

                        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-[#05DF72]/20 transition-all">
                            <MapPin size={18} className="text-[#05DF72]" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Location</span>
                                <select
                                    className="bg-transparent outline-none font-bold text-slate-700 text-sm appearance-none pr-6 cursor-pointer w-32"
                                    value={activeLga}
                                    onChange={(e) => setActiveLga(e.target.value)}
                                >
                                    <option value="All">All Lagos</option>
                                    {lagosLGAs.sort().map(lga => (
                                        <option key={lga} value={lga}>{lga}</option>
                                    ))}
                                </select>
                            </div>
                            <ChevronDown size={14} className="text-slate-400 -ml-4" />
                        </div>
                    </div>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 mb-32">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onQuickBuy={() => handleQuickBuy(product)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 mb-32">
                        <div className="size-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <FilterIcon size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No batteries found</h3>
                        <p className="text-slate-500 font-medium mt-2">Try adjusting your filters or search terms.</p>
                        <button
                            onClick={() => { setActiveLga('All'); setActiveType('All'); router.push('/shop') }}
                            className="mt-8 text-[#05DF72] font-black uppercase tracking-widest text-[10px] hover:underline"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}
            </div>

            {selectedProduct && (
                <CheckoutModal
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    product={selectedProduct}
                    quantity={1}
                    selectedDate={selectedProduct.collectionDates[0]}
                />
            )}
        </div>
    )
}

export default function ShopClient({ initialProducts }) {
    return (
        <Suspense fallback={
            <div className="min-h-[70vh] max-w-7xl mx-auto py-20">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                    {Array(8).fill('').map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
            </div>
        }>
            <ShopClientContent initialProducts={initialProducts} />
        </Suspense>
    )
}
